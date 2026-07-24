export const BOOSTER_KINDS = ['hammer', 'shuffle'] as const;

export type BoosterKind = typeof BOOSTER_KINDS[number];

export type BoosterInventory = Record<BoosterKind, number>;

export type BoosterReward = Readonly<{
  kind: BoosterKind;
  amount: number;
}>;

export const createBoosterInventory = (): BoosterInventory => ({
  hammer: 0,
  shuffle: 0,
});

export function normalizeBoosterInventory(value: unknown): BoosterInventory {
  const source = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Partial<Record<BoosterKind, unknown>>
    : {};
  return {
    hammer: normalizeCount(source.hammer),
    shuffle: normalizeCount(source.shuffle),
  };
}

export function addBoosterRewards(
  inventory: BoosterInventory,
  rewards: readonly BoosterReward[],
): BoosterInventory {
  const next = { ...inventory };
  for (const reward of rewards) {
    next[reward.kind] += Math.max(0, Math.floor(reward.amount));
  }
  return next;
}

export function spendBooster(
  inventory: BoosterInventory,
  kind: BoosterKind,
): BoosterInventory | null {
  if (inventory[kind] <= 0) return null;
  return {
    ...inventory,
    [kind]: inventory[kind] - 1,
  };
}

export function formatBoosterReward(reward: BoosterReward): string {
  const label = reward.kind === 'hammer' ? 'Серебряный молот' : 'Перемешивание';
  return `${label} ×${reward.amount}`;
}

function normalizeCount(value: unknown): number {
  const count = Number(value);
  return Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
}
