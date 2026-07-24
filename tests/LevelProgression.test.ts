import { describe, expect, it } from 'vitest';
import { levelGroups, levels } from '../src/data/gameData';
import {
  getLevelGroupState,
  getNextPlayableLevelId,
  isLevelUnlocked,
} from '../src/meta/LevelProgression';

const levelIds = levels.map((level) => level.id);

describe('thirty-level restoration progression', () => {
  it('unlocks only levels 1–3 for a new save', () => {
    for (const levelId of [1, 2, 3]) {
      expect(isLevelUnlocked(levelId, levelGroups, {}, {})).toBe(true);
    }
    expect(isLevelUnlocked(4, levelGroups, {}, {})).toBe(false);
  });

  it('keeps a previously entered group replayable during migration', () => {
    expect(getLevelGroupState(levelGroups[5], levelGroups, { 17: true }, {}).unlocked)
      .toBe(true);
  });

  it('unlocks each room beat from its authored restoration task', () => {
    const restored: Record<string, boolean> = {};
    const gates = [
      [4, 'hall-light-chandelier'],
      [7, 'library-open-shutters'],
      [10, 'library-repair-shelves'],
      [13, 'garden-clear-vines'],
      [16, 'garden-repair-fountain'],
      [19, 'crypt-clear-stairs'],
      [22, 'crypt-restore-seals'],
      [25, 'tower-repair-steps'],
      [28, 'tower-open-observatory'],
    ] as const;

    for (const [levelId, taskId] of gates) {
      expect(isLevelUnlocked(levelId, levelGroups, {}, restored)).toBe(false);
      restored[taskId] = true;
      expect(isLevelUnlocked(levelId, levelGroups, {}, restored)).toBe(true);
    }
  });

  it('stops at the first restoration gate after levels 1–3', () => {
    const completed = { 1: true, 2: true, 3: true };
    expect(getNextPlayableLevelId(3, levelIds, levelGroups, completed, {})).toBeNull();
  });

  it('continues through level 30 when every required repair is complete', () => {
    const restored = {
      'hall-light-chandelier': true,
      'library-open-shutters': true,
      'library-repair-shelves': true,
      'garden-clear-vines': true,
      'garden-repair-fountain': true,
      'crypt-clear-stairs': true,
      'crypt-restore-seals': true,
      'tower-repair-steps': true,
      'tower-open-observatory': true,
    };
    const completed = Object.fromEntries(
      Array.from({ length: 29 }, (_, index) => [index + 1, true]),
    );
    expect(getNextPlayableLevelId(29, levelIds, levelGroups, completed, restored)).toBe(30);
  });
});
