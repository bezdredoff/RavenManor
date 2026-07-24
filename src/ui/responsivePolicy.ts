export type ViewportProfile = 'compact' | 'standard';

export const RESPONSIVE_REGRESSION_VIEWPORTS = [
  { width: 320, height: 568, profile: 'compact' },
  { width: 360, height: 800, profile: 'standard' },
  { width: 390, height: 844, profile: 'standard' },
  { width: 430, height: 932, profile: 'standard' },
] as const;

export function getViewportProfile(width: number, height: number): ViewportProfile {
  return width <= 340 || height <= 650 ? 'compact' : 'standard';
}
