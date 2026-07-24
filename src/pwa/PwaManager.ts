interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type OfflineStatusMessage = Readonly<{
  ready: boolean;
  cachedAssets: number;
  totalAssets: number;
}>;

export type PwaStatus = Readonly<{
  productionEnabled: boolean;
  installed: boolean;
  installAvailable: boolean;
  online: boolean;
  serviceWorkerReady: boolean;
  offlineReady: boolean;
  cachedAssets: number;
  totalAssets: number;
}>;

const OFFLINE_STATUS_TIMEOUT_MS = 4_000;

const isStandalone = (): boolean => (
  window.matchMedia?.('(display-mode: standalone)').matches
  || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
);

const waitForWorkerActivation = async (registration: ServiceWorkerRegistration): Promise<void> => {
  const worker = registration.installing ?? registration.waiting;
  if (!worker || worker.state === 'activated') return;

  await new Promise<void>((resolve) => {
    const timer = window.setTimeout(resolve, 15_000);
    const onStateChange = (): void => {
      if (worker.state !== 'activated' && worker.state !== 'redundant') return;
      window.clearTimeout(timer);
      worker.removeEventListener('statechange', onStateChange);
      resolve();
    };
    worker.addEventListener('statechange', onStateChange);
  });
};

export class PwaManager {
  private installPrompt: InstallPromptEvent | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private ready = false;
  private offlineReady = false;
  private cachedAssets = 0;
  private totalAssets = 0;
  private readonly enabled = import.meta.env.PROD;

  constructor() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installPrompt = event as InstallPromptEvent;
    });
    window.addEventListener('appinstalled', () => {
      this.installPrompt = null;
    });
  }

  async register(): Promise<void> {
    if (!this.enabled || !('serviceWorker' in navigator)) return;
    try {
      this.registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      await waitForWorkerActivation(this.registration);
      this.registration = await navigator.serviceWorker.ready;
      this.ready = true;
      await this.refreshOfflineStatus();
    } catch {
      this.ready = false;
      this.offlineReady = false;
    }
  }

  get status(): PwaStatus {
    return {
      productionEnabled: this.enabled,
      installed: isStandalone(),
      installAvailable: Boolean(this.installPrompt),
      online: navigator.onLine,
      serviceWorkerReady: this.ready,
      offlineReady: this.offlineReady,
      cachedAssets: this.cachedAssets,
      totalAssets: this.totalAssets,
    };
  }

  async refreshOfflineStatus(): Promise<PwaStatus> {
    if (!this.registration) return this.status;
    const worker = this.registration.active ?? navigator.serviceWorker.controller;
    if (!worker) return this.status;

    try {
      const result = await new Promise<OfflineStatusMessage>((resolve, reject) => {
        const channel = new MessageChannel();
        const timer = window.setTimeout(() => reject(new Error('Offline status timed out')), OFFLINE_STATUS_TIMEOUT_MS);
        channel.port1.onmessage = (event: MessageEvent<OfflineStatusMessage>) => {
          window.clearTimeout(timer);
          resolve(event.data);
        };
        worker.postMessage({ type: 'GET_OFFLINE_STATUS' }, [channel.port2]);
      });
      this.offlineReady = result.ready;
      this.cachedAssets = result.cachedAssets;
      this.totalAssets = result.totalAssets;
    } catch {
      this.offlineReady = false;
    }

    return this.status;
  }

  async install(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!this.installPrompt) return 'unavailable';
    const prompt = this.installPrompt;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === 'accepted') this.installPrompt = null;
    return choice.outcome;
  }

  async checkForUpdate(): Promise<boolean> {
    if (!this.registration) return false;
    await this.registration.update();
    return Boolean(this.registration.waiting);
  }
}

const progressLabel = (status: PwaStatus): string => {
  if (status.totalAssets > 0) {
    return `Подготовка офлайн: ${status.cachedAssets}/${status.totalAssets}`;
  }
  return 'Подготовка офлайн-версии';
};

export const getPwaStatusLabel = (status: PwaStatus): string => {
  if (!status.productionEnabled) return 'Доступно в production-сборке';

  if (status.installed) {
    if (status.offlineReady) return status.online ? 'Установлено · офлайн готов' : 'Установлено · офлайн-режим активен';
    return `Установлено · ${progressLabel(status)}`;
  }

  if (status.installAvailable) return 'Можно установить на устройство';
  if (status.offlineReady) return status.online ? 'Готово к работе офлайн' : 'Офлайн-режим активен';
  if (status.serviceWorkerReady) return progressLabel(status);
  return 'Используйте меню браузера «Добавить на главный экран»';
};
