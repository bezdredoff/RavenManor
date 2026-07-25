import type { ScreenMode } from './layoutPolicy';

export type SettingsCallerMode = Exclude<ScreenMode, 'settings'>;

export function resolveSettingsCallerMode(mode: ScreenMode | null): SettingsCallerMode {
  return mode === null || mode === 'settings' ? 'home' : mode;
}
