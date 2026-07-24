import { describe, expect, it } from 'vitest';
import {
  RAVEN_MANOR_THEME,
  getMusicLoopDurationSeconds,
  validateMusicTheme,
} from '../src/audio/MusicTheme';

describe('Raven Manor background theme', () => {
  it('defines a valid audible loop with melody and harmony', () => {
    expect(validateMusicTheme(RAVEN_MANOR_THEME)).toEqual([]);
    expect(RAVEN_MANOR_THEME.melody.length).toBeGreaterThanOrEqual(8);
    expect(RAVEN_MANOR_THEME.harmony.length).toBeGreaterThanOrEqual(4);
    expect(getMusicLoopDurationSeconds(RAVEN_MANOR_THEME)).toBeGreaterThan(10);
    expect(getMusicLoopDurationSeconds(RAVEN_MANOR_THEME)).toBeLessThan(20);
  });
});
