import { describe, expect, it } from 'vitest';
import {
  MOTION_DURATIONS_MS,
  createParticleIndexes,
  getMotionDuration,
  getVfxParticleBudget,
} from '../src/ui/motionPolicy';

describe('motion policy', () => {
  it('defines short interaction timings and a longer restoration reveal', () => {
    expect(MOTION_DURATIONS_MS.swap).toBeLessThan(200);
    expect(MOTION_DURATIONS_MS.clear).toBeLessThan(300);
    expect(MOTION_DURATIONS_MS.invalidHold).toBeGreaterThanOrEqual(600);
    expect(MOTION_DURATIONS_MS.feedbackHold).toBeGreaterThanOrEqual(400);
    expect(MOTION_DURATIONS_MS.restorationReveal).toBeGreaterThan(900);
  });

  it('disables decorative motion and particles for reduced motion', () => {
    expect(getMotionDuration('swap', true)).toBe(0);
    expect(getMotionDuration('invalidHold', true)).toBe(MOTION_DURATIONS_MS.invalidHold);
    expect(getMotionDuration('feedbackHold', true)).toBe(MOTION_DURATIONS_MS.feedbackHold);
    expect(getVfxParticleBudget('win', true)).toBe(0);
    expect(createParticleIndexes('restoration', true)).toEqual([]);
  });

  it('keeps VFX budgets bounded for mobile rendering', () => {
    expect(getVfxParticleBudget('match')).toBe(2);
    expect(getVfxParticleBudget('win')).toBeLessThanOrEqual(24);
    expect(createParticleIndexes('unlock')).toHaveLength(14);
  });
});
