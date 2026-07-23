import { describe, expect, it } from 'vitest';
import { levelGroups, levels } from '../src/data/gameData';

describe('balanced level definitions', () => {
  it('loads ten levels and assigns every level to one progression group', () => {
    expect(levels).toHaveLength(10);
    expect(levels.map((level) => level.id)).toEqual([1,2,3,4,5,6,7,8,9,10]);
    expect(levelGroups.flatMap((group) => group.levelIds)).toEqual([1,2,3,4,5,6,7,8,9,10]);
  });

  it('starts with three selectable levels', () => {
    expect(levelGroups[0].levelIds).toEqual([1, 2, 3]);
    expect(levelGroups[0].unlock).toEqual({ type: 'always' });
  });

  it('stores explicit star thresholds per level', () => {
    for (const level of levels) {
      expect(level.starThresholds.threeStarsMovesLeft)
        .toBeGreaterThan(level.starThresholds.twoStarsMovesLeft);
      expect(level.starThresholds.threeStarsMovesLeft).toBeLessThan(level.moves);
      expect('requiredStars' in level).toBe(false);
    }
  });

  it('defines the first level as a soft entry point', () => {
    expect(levels[0]).toEqual({
      schemaVersion: 2,
      id: 1,
      title: 'Первые розы',
      difficulty: 'easy',
      moves: 18,
      starThresholds: {
        twoStarsMovesLeft: 4,
        threeStarsMovesLeft: 10,
      },
      objectives: [
        { id: 'primary', type: 'collect', tileType: 0, target: 15 },
      ],
    });
  });

  it('defines level ten as the prototype finale', () => {
    expect(levels[9]).toEqual({
      schemaVersion: 2,
      id: 10,
      title: 'Сердце поместья',
      difficulty: 'finale',
      moves: 22,
      starThresholds: {
        twoStarsMovesLeft: 2,
        threeStarsMovesLeft: 6,
      },
      objectives: [
        { id: 'primary', type: 'collect', tileType: 3, target: 34 },
      ],
    });
  });
});
