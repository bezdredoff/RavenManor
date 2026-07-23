export type ScreenMode = 'home' | 'manor' | 'levels' | 'room' | 'game' | 'settings';

export type ScreenScrollPolicy = 'locked' | 'contained';

export const MOBILE_VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
] as const;

export const MIN_TOUCH_TARGET_PX = 44;

const CONTAINED_SCROLL_SCREENS = new Set<ScreenMode>([
  'manor',
  'levels',
  'room',
  'settings',
]);

export function getScreenScrollPolicy(mode: ScreenMode): ScreenScrollPolicy {
  return CONTAINED_SCROLL_SCREENS.has(mode) ? 'contained' : 'locked';
}

export function getScreenClassName(mode: ScreenMode): string {
  return `screen screen-${mode} scroll-${getScreenScrollPolicy(mode)}`;
}
