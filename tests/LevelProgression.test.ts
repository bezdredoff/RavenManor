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
      expect(isLevelUnlocked(levelId, levelGroups, {}, {})).toBe(true);
    }
    expect(isLevelUnlocked(4, levelGroups, {}, {})).toBe(false);
  });

  it('does not unlock an untouched next group from victories in the previous group', () => {
    const completed = { 1: true, 2: true, 3: true };
    expect(getLevelGroupState(levelGroups[1], levelGroups, completed, {}).unlocked).toBe(false);
  });

  it('keeps a previously entered group replayable during save migration', () => {
    const completed = { 4: true };
    expect(getLevelGroupState(levelGroups[1], levelGroups, completed, {}).unlocked).toBe(true);
  });

  it('unlocks levels 4–6 after the chandelier restoration', () => {
    const restored = { 'hall-light-chandelier': true };
    expect(isLevelUnlocked(4, levelGroups, {}, restored)).toBe(true);
    expect(isLevelUnlocked(7, levelGroups, {}, restored)).toBe(false);
  });

  it('unlocks levels 7–9 after repairing the library shelves', () => {
    const restored = {
      'hall-light-chandelier': true,
      'library-repair-shelves': true,
    };
    expect(isLevelUnlocked(7, levelGroups, {}, restored)).toBe(true);
    expect(isLevelUnlocked(10, levelGroups, {}, restored)).toBe(false);
  });

  it('unlocks the finale after repairing the garden fountain', () => {
    const restored = {
      'hall-light-chandelier': true,
      'library-repair-shelves': true,
      'garden-repair-fountain': true,
    };
    expect(isLevelUnlocked(10, levelGroups, {}, restored)).toBe(true);
  });

  it('returns another unfinished level in the current unlocked group', () => {
    const completed = { 1: true, 2: true };
    expect(getNextPlayableLevelId(
      2,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      levelGroups,
      completed,
      {},
    )).toBe(3);
  });

  it('stops at a restoration gate after the current group is complete', () => {
    const completed = { 1: true, 2: true, 3: true };
    expect(getNextPlayableLevelId(
      3,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      levelGroups,
      completed,
      {},
    )).toBeNull();
  });

  it('continues into the next group once its repair is complete', () => {
    const completed = { 1: true, 2: true, 3: true };
    expect(getNextPlayableLevelId(
      3,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      levelGroups,
      completed,
      { 'hall-light-chandelier': true },
    )).toBe(4);
  });
});
