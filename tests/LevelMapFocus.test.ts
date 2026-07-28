import { describe, expect, it } from 'vitest';
import { getLevelMapFocusGroupId } from '../src/ui/levelMapFocus';

describe('level map focus target', () => {
  it('chooses the last unlocked group that still contains unfinished levels', () => {
    expect(getLevelMapFocusGroupId([
      { id: 'hall-1', unlocked: true, completedCount: 3, totalCount: 3 },
      { id: 'hall-2', unlocked: true, completedCount: 2, totalCount: 3 },
      { id: 'library-1', unlocked: true, completedCount: 0, totalCount: 3 },
      { id: 'library-2', unlocked: false, completedCount: 0, totalCount: 3 },
    ])).toBe('library-1');
  });

  it('falls back to the last unlocked group when all unlocked groups are complete', () => {
    expect(getLevelMapFocusGroupId([
      { id: 'hall-1', unlocked: true, completedCount: 3, totalCount: 3 },
      { id: 'hall-2', unlocked: true, completedCount: 3, totalCount: 3 },
      { id: 'library-1', unlocked: false, completedCount: 0, totalCount: 3 },
    ])).toBe('hall-2');
  });

  it('returns null when no level group is unlocked', () => {
    expect(getLevelMapFocusGroupId([
      { id: 'hall-1', unlocked: false, completedCount: 0, totalCount: 3 },
    ])).toBeNull();
  });
});
