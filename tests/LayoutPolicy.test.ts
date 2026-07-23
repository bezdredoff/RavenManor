import { describe, expect, it } from 'vitest';
import {
  getScreenClassName,
  getScreenScrollPolicy,
  MIN_TOUCH_TARGET_PX,
  MOBILE_VIEWPORTS,
} from '../src/ui/layoutPolicy';

describe('mobile layout policy', () => {
  it('locks the two primary no-scroll screens', () => {
    expect(getScreenScrollPolicy('home')).toBe('locked');
    expect(getScreenScrollPolicy('game')).toBe('locked');
  });

  it('contains scroll inside content-heavy screens', () => {
    expect(getScreenScrollPolicy('manor')).toBe('contained');
    expect(getScreenScrollPolicy('levels')).toBe('contained');
    expect(getScreenScrollPolicy('room')).toBe('contained');
    expect(getScreenScrollPolicy('settings')).toBe('contained');
  });

  it('keeps minimum control targets and required QA viewports explicit', () => {
    expect(MIN_TOUCH_TARGET_PX).toBeGreaterThanOrEqual(44);
    expect(MOBILE_VIEWPORTS).toContainEqual({ width: 320, height: 568 });
    expect(MOBILE_VIEWPORTS).toContainEqual({ width: 430, height: 932 });
  });

  it('produces stable CSS classes for the screen shell', () => {
    expect(getScreenClassName('game')).toBe('screen screen-game scroll-locked');
    expect(getScreenClassName('levels')).toBe('screen screen-levels scroll-contained');
  });
});
