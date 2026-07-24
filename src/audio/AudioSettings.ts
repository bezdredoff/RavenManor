export type AudioSettings = Readonly<{
  muted: boolean;
  musicVolume: number;
  effectsVolume: number;
}>;

export type AudioSettingsStorage = Pick<Storage, 'getItem' | 'setItem'>;

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  muted: false,
  musicVolume: 0.28,
  effectsVolume: 0.72,
};

const STORAGE_KEY = 'ravenManorAudioV1';

export function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function restoreAudioSettings(value: unknown): AudioSettings {
  if (!value || typeof value !== 'object') return DEFAULT_AUDIO_SETTINGS;
  const candidate = value as Partial<AudioSettings>;
  return {
    muted: typeof candidate.muted === 'boolean'
      ? candidate.muted
      : DEFAULT_AUDIO_SETTINGS.muted,
    musicVolume: typeof candidate.musicVolume === 'number'
      ? clampVolume(candidate.musicVolume)
      : DEFAULT_AUDIO_SETTINGS.musicVolume,
    effectsVolume: typeof candidate.effectsVolume === 'number'
      ? clampVolume(candidate.effectsVolume)
      : DEFAULT_AUDIO_SETTINGS.effectsVolume,
  };
}

export class AudioSettingsStore {
  settings: AudioSettings;

  constructor(private readonly storage: AudioSettingsStorage = localStorage) {
    this.settings = this.load();
  }

  update(patch: Partial<AudioSettings>): AudioSettings {
    this.settings = restoreAudioSettings({ ...this.settings, ...patch });
    this.persist();
    return this.settings;
  }

  private load(): AudioSettings {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AUDIO_SETTINGS;
    try {
      return restoreAudioSettings(JSON.parse(raw));
    } catch {
      return DEFAULT_AUDIO_SETTINGS;
    }
  }

  private persist(): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
  }
}
