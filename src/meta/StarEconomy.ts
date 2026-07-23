import type { RestorationTaskDefinition } from '../data/restorationTasks';

export type StarBalance = {
  earned: number;
  spent: number;
  available: number;
};

export type StoredStarBalance = Partial<StarBalance> | null | undefined;

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function assertNonNegativeInteger(value: number, label: string): void {
  if (!isNonNegativeInteger(value)) {
    throw new Error(`${label} must be a non-negative integer.`);
  }
}

export function createStarBalance(earned = 0, spent = 0): StarBalance {
  assertNonNegativeInteger(earned, 'Earned stars');
  assertNonNegativeInteger(spent, 'Spent stars');

  if (spent > earned) {
    throw new Error('Spent stars cannot exceed earned stars.');
  }

  return {
    earned,
    spent,
    available: earned - spent,
  };
}

export function awardStars(balance: StarBalance, amount: number): StarBalance {
  assertNonNegativeInteger(amount, 'Awarded stars');
  return createStarBalance(balance.earned + amount, balance.spent);
}

export function spendStars(balance: StarBalance, cost: number): StarBalance {
  assertNonNegativeInteger(cost, 'Star cost');

  if (cost > balance.available) {
    throw new Error(
      `Not enough stars: ${cost} required, ${balance.available} available.`,
    );
  }

  return createStarBalance(balance.earned, balance.spent + cost);
}

export function getEarnedStarsFromLevels(
  levelStars: Record<number, number>,
): number {
  return Object.values(levelStars).reduce((total, stars) => {
    return total + (isNonNegativeInteger(stars) ? stars : 0);
  }, 0);
}

export function getSpentStarsFromCompletedTasks(
  tasks: readonly RestorationTaskDefinition[],
  completedTasks: Record<string, boolean>,
): number {
  return tasks.reduce((total, task) => {
    return total + (completedTasks[task.id] ? task.starCost : 0);
  }, 0);
}

export function restoreStarBalance(
  stored: StoredStarBalance,
  levelStars: Record<number, number>,
  tasks: readonly RestorationTaskDefinition[],
  completedTasks: Record<string, boolean>,
): StarBalance {
  if (
    stored
    && isNonNegativeInteger(stored.earned)
    && isNonNegativeInteger(stored.spent)
    && stored.spent <= stored.earned
  ) {
    // `available` is deliberately recalculated instead of trusted so a stale
    // or manually edited save cannot break the wallet invariant.
    return createStarBalance(stored.earned, stored.spent);
  }

  const earned = getEarnedStarsFromLevels(levelStars);
  const legacySpent = getSpentStarsFromCompletedTasks(tasks, completedTasks);

  return createStarBalance(earned, Math.min(legacySpent, earned));
}
