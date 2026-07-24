import { describe, expect, it } from 'vitest';
import {
  AudioSettingsStore,
  clampVolume,
  restoreAudioSettings,
  type AudioSettingsStorage,
} from '../src/audio/AudioSettings';

class MemoryStorage implements AudioSettingsStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe('audio settings', () => {
  it('clamps invalid volume values into the supported range', () => {
    expect(clampVolume(-2)).toBe(0);
    expect(clampVolume(.45)).toBe(.45);
    expect(clampVolume(8)).toBe(1);
    expect(clampVolume(Number.NaN)).toBe(0);
  });

  it('restores partial or malformed settings safely', () => {
    expect(restoreAudioSettings({
      muted: true,
      musicVolume: 4,
      effectsVolume: -.4,
    })).toEqual({
      muted: true,
      musicVolume: 1,
      effectsVolume: 0,
    });
  });

  it('persists independent music and effects volume', () => {
    const storage = new MemoryStorage();
    const store = new AudioSettingsStore(storage);
    store.update({ musicVolume: .2, effectsVolume: .8, muted: true });

    expect(new AudioSettingsStore(storage).settings).toEqual({
      musicVolume: .2,
      effectsVolume: .8,
      muted: true,
    });
  });
});
