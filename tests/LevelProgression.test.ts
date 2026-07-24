import { describe, expect, it } from 'vitest';
import { levelGroups } from '../src/data/gameData';
import {
  getLevelGroupState,
  getNextPlayableLevelId,
  isLevelUnlocked,
} from '../src/meta/LevelProgression';

describe('level group progression', () => {
  it('unlocks the first three levels immediately', () => {
    expect(levelGroups[0].levelIds).toEqual([1, 2, 3]);
    for (const levelId of [1, 2, 3]) {
      expect(isLevelUnlocked(levelId, levelGroups, {})).toBe(true);
    }
    expect(isLevelUnlocked(4, levelGroups, {})).toBe(false);
  });

  it('unlocks the next group after any two victories in the current group', () => {
    const completed = { 1: true, 3: true };
    expect(getLevelGroupState(levelGroups[1], levelGroups, completed).unlocked).toBe(true);
    expect(isLevelUnlocked(4, levelGroups, completed)).toBe(true);
    expect(isLevelUnlocked(7, levelGroups, completed)).toBe(false);
  });

  it('requires victories in the configured source group', () => {
    const completed = { 1: true, 2: true, 4: true, 7: true };
    expect(getLevelGroupState(levelGroups[2], levelGroups, completed).unlocked).toBe(false);
  });

  it('allows the finale after two victories in the third group', () => {
    const completed = {
      1: true,
      2: true,
      4: true,
      5: true,
      7: true,
      9: true,
    };
    expect(isLevelUnlocked(10, levelGroups, completed)).toBe(true);
  });

  it('returns the next unlocked unfinished level after a victory', () => {
    const completed = { 1: true, 2: true };

    expect(getNextPlayableLevelId(
      2,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      levelGroups,
      completed,
    )).toBe(3);
  });

  it('can continue directly into a newly unlocked group', () => {
    const completed = { 1: true, 3: true };

    expect(getNextPlayableLevelId(
      3,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      levelGroups,
      completed,
    )).toBe(4);
  });

  it('returns null when every currently unlocked level is complete', () => {
    const completed = Object.fromEntries(
      Array.from({ length: 10 }, (_, index) => [index + 1, true]),
    );

    expect(getNextPlayableLevelId(
      3,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      levelGroups,
      completed,
    )).toBeNull();
  });

});
