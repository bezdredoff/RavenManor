import { describe, expect, it } from 'vitest';
import type { RestorationTaskDefinition } from '../src/data/restorationTasks';
import {
  awardStars,
  createStarBalance,
  restoreStarBalance,
  spendStars,
} from '../src/meta/StarEconomy';

const tasks: RestorationTaskDefinition[] = [
  {
    id: 'hall-1',
    roomId: 'hall',
    title: 'First',
    description: 'First task',
    starCost: 1,
    order: 1,
  },
  {
    id: 'hall-2',
    roomId: 'hall',
    title: 'Second',
    description: 'Second task',
    starCost: 2,
    order: 2,
  },
];

describe('StarEconomy', () => {
  it('keeps earned, spent, and available stars explicit', () => {
    expect(createStarBalance(5, 2)).toEqual({
      earned: 5,
      spent: 2,
      available: 3,
    });
  });

  it('awards and spends stars without mutating the previous balance', () => {
    const initial = createStarBalance(2, 0);
    const awarded = awardStars(initial, 2);
    const spent = spendStars(awarded, 1);

    expect(initial).toEqual({ earned: 2, spent: 0, available: 2 });
    expect(awarded).toEqual({ earned: 4, spent: 0, available: 4 });
    expect(spent).toEqual({ earned: 4, spent: 1, available: 3 });
  });

  it('rejects overspending', () => {
    expect(() => spendStars(createStarBalance(1, 0), 2)).toThrow(/Not enough stars/);
  });

  it('recalculates stale available stars from stored earned and spent values', () => {
    expect(restoreStarBalance(
      { earned: 5, spent: 2, available: 99 },
      {},
      tasks,
      {},
    )).toEqual({ earned: 5, spent: 2, available: 3 });
  });

  it('migrates legacy saves from level results and completed tasks', () => {
    expect(restoreStarBalance(
      undefined,
      { 1: 3, 2: 1 },
      tasks,
      { 'hall-1': true },
    )).toEqual({ earned: 4, spent: 1, available: 3 });
  });
});
