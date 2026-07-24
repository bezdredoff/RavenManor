interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export type PwaStatus = Readonly<{
  productionEnabled: boolean;
  installed: boolean;
  installAvailable: boolean;
  online: boolean;
  serviceWorkerReady: boolean;
}>;

const isStandalone = (): boolean => (
  window.matchMedia?.('(display-mode: standalone)').matches
  || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
);

export class PwaManager {
  private installPrompt: InstallPromptEvent | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private ready = false;
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
      await navigator.serviceWorker.ready;
      this.ready = true;
    } catch {
      this.ready = false;
    }
  }

  get status(): PwaStatus {
    return {
      productionEnabled: this.enabled,
      installed: isStandalone(),
      installAvailable: Boolean(this.installPrompt),
      online: navigator.onLine,
      serviceWorkerReady: this.ready,
    };
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

export const getPwaStatusLabel = (status: PwaStatus): string => {
  if (status.installed) return 'Установлено как приложение';
  if (!status.productionEnabled) return 'Доступно в production-сборке';
  if (status.installAvailable) return 'Можно установить на устройство';
  if (status.serviceWorkerReady) return status.online ? 'Готово к работе офлайн' : 'Офлайн-режим активен';
  return 'Используйте меню браузера «Добавить на главный экран»';
};
