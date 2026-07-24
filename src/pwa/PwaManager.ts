import { APP_VERSION } from '../appVersion';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type OfflineStatusMessage = Readonly<{
  ready: boolean;
  cachedAssets: number;
  totalAssets: number;
}>;

type RemoteBuildManifest = Readonly<{
  appVersion: string;
  buildLabel: string;
  buildId: string;
  generatedAt: string;
}>;

export type PwaUpdateResult = Readonly<{
  status: 'current' | 'update-ready' | 'offline' | 'unavailable';
  currentVersion: string;
  remoteVersion?: string;
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
const UPDATE_ACTIVATION_TIMEOUT_MS = 12_000;

const isStandalone = (): boolean => (
  window.matchMedia?.('(display-mode: standalone)').matches
  || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
);

const waitForWorkerActivation = async (registration: ServiceWorkerRegistration): Promise<void> => {
  const worker = registration.installing ?? registration.waiting;
  if (!worker || worker.state === 'activated') return;

  await new Promise<void>((resolve) => {
    const timer = window.setTimeout(resolve, UPDATE_ACTIVATION_TIMEOUT_MS);
    const onStateChange = (): void => {
      if (worker.state !== 'activated' && worker.state !== 'redundant') return;
      window.clearTimeout(timer);
      worker.removeEventListener('statechange', onStateChange);
      resolve();
    };
    worker.addEventListener('statechange', onStateChange);
  });
};

const waitForControllerChange = (): Promise<void> => new Promise((resolve) => {
  let settled = false;
  const finish = (): void => {
    if (settled) return;
    settled = true;
    window.clearTimeout(timer);
    navigator.serviceWorker.removeEventListener('controllerchange', finish);
    resolve();
  };
  const timer = window.setTimeout(finish, UPDATE_ACTIVATION_TIMEOUT_MS);
  navigator.serviceWorker.addEventListener('controllerchange', finish);
});

export const isRemoteBuildDifferent = (
  currentVersion: string,
  remoteManifest: Pick<RemoteBuildManifest, 'appVersion'>,
): boolean => remoteManifest.appVersion !== currentVersion;

const fetchRemoteBuildManifest = async (): Promise<RemoteBuildManifest> => {
  const url = new URL('./version.json', document.baseURI);
  url.searchParams.set('updateCheck', Date.now().toString());
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'same-origin',
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (!response.ok) {
    throw new Error(`Version check failed with HTTP ${response.status}`);
  }
  const manifest = await response.json() as Partial<RemoteBuildManifest>;
  if (
    typeof manifest.appVersion !== 'string'
    || typeof manifest.buildLabel !== 'string'
    || typeof manifest.buildId !== 'string'
    || typeof manifest.generatedAt !== 'string'
  ) {
    throw new Error('Invalid remote build manifest');
  }
  return manifest as RemoteBuildManifest;
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
      this.registration = await navigator.serviceWorker.register('./sw.js', {
        scope: './',
        updateViaCache: 'none',
      });
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

  async checkForUpdate(): Promise<PwaUpdateResult> {
    if (!this.enabled || !this.registration) {
      return { status: 'unavailable', currentVersion: APP_VERSION };
    }
    if (!navigator.onLine) {
      return { status: 'offline', currentVersion: APP_VERSION };
    }

    const remote = await fetchRemoteBuildManifest();
    if (!isRemoteBuildDifferent(APP_VERSION, remote)) {
      return {
        status: 'current',
        currentVersion: APP_VERSION,
        remoteVersion: remote.appVersion,
      };
    }

    const previousController = navigator.serviceWorker.controller;
    await this.registration.update();

    if (this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }

    const candidate = this.registration.installing ?? this.registration.waiting;
    if (candidate && navigator.serviceWorker.controller === previousController) {
      // FEATURE-047 workers call skipWaiting(), so the useful signals are either
      // worker activation or controllerchange. waiting alone is not reliable.
      await Promise.race([
        waitForWorkerActivation(this.registration),
        waitForControllerChange(),
        new Promise<void>((resolve) => window.setTimeout(resolve, UPDATE_ACTIVATION_TIMEOUT_MS)),
      ]);
      if (
        candidate.state !== 'activated'
        && navigator.serviceWorker.controller === previousController
      ) {
        throw new Error('The new service worker did not activate in time');
      }
    }

    return {
      status: 'update-ready',
      currentVersion: APP_VERSION,
      remoteVersion: remote.appVersion,
    };
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
