import { describe, expect, it } from 'vitest';
import { resolveSettingsCallerMode } from '../src/ui/settingsNavigation';

describe('global settings return navigation', () => {
  it('returns to every primary caller screen', () => {
    for (const mode of ['home', 'levels', 'manor', 'room', 'game', 'journal'] as const) {
      expect(resolveSettingsCallerMode(mode)).toBe(mode);
    }
  });

  it('falls back to home when settings is already the caller', () => {
    expect(resolveSettingsCallerMode('settings')).toBe('home');
  });
});
