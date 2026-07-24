export const MOTION_DURATIONS_MS = {
  screenEnter: 240,
  modalEnter: 220,
  modalExit: 150,
  swap: 150,
  invalidHold: 190,
  clear: 230,
  settle: 170,
  reshuffle: 460,
  restorationReveal: 1180,
  roomUnlock: 900,
} as const;

export type MotionDurationName = keyof typeof MOTION_DURATIONS_MS;
export type VfxKind = 'match' | 'cascade' | 'win' | 'loss' | 'restoration' | 'unlock';

const VFX_PARTICLE_BUDGETS: Readonly<Record<VfxKind, number>> = {
  match: 2,
  cascade: 12,
  win: 22,
  loss: 8,
  restoration: 18,
  unlock: 14,
};

export function getMotionDuration(
  name: MotionDurationName,
  reducedMotion = false,
): number {
  return reducedMotion ? 0 : MOTION_DURATIONS_MS[name];
}

export function getVfxParticleBudget(
  kind: VfxKind,
  reducedMotion = false,
): number {
  return reducedMotion ? 0 : VFX_PARTICLE_BUDGETS[kind];
}

export function createParticleIndexes(
  kind: VfxKind,
  reducedMotion = false,
): readonly number[] {
  return Array.from(
    { length: getVfxParticleBudget(kind, reducedMotion) },
    (_, index) => index,
  );
}
