import { describe, expect, it } from 'vitest';
import {
  getViewportProfile,
  RESPONSIVE_REGRESSION_VIEWPORTS,
} from '../src/ui/responsivePolicy';

describe('responsive regression policy', () => {
  it('keeps the required mobile device matrix explicit', () => {
    expect(RESPONSIVE_REGRESSION_VIEWPORTS.map(({ width, height }) => `${width}x${height}`))
      .toEqual(['320x568', '360x800', '390x844', '430x932']);
  });

  it('uses the compact profile for narrow or short viewports', () => {
    expect(getViewportProfile(320, 568)).toBe('compact');
    expect(getViewportProfile(390, 620)).toBe('compact');
    expect(getViewportProfile(390, 844)).toBe('standard');
  });
});
