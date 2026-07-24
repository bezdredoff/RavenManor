import { describe, expect, it } from 'vitest';
import { levelGroups, levels } from '../src/data/gameData';

describe('FEATURE-049 level definitions', () => {
  it('keeps ten levels and assigns every level to progression', () => {
    expect(levels).toHaveLength(10);
    expect(levelGroups.flatMap((group) => group.levelIds)).toEqual([1,2,3,4,5,6,7,8,9,10]);
  });

  it('uses schema version three and valid 8x8 masks', () => {
    for (const level of levels) {
      expect(level.schemaVersion).toBe(3);
      expect(level.board.mask).toHaveLength(8);
      expect(level.board.mask.every((row) => /^[01]{8}$/.test(row))).toBe(true);
    }
  });

  it('introduces multi-target gameplay on level four', () => {
    expect(levels[3].objectives).toHaveLength(2);
    expect(levels[3].board.mask[0]).toBe('01111110');
  });

  it('introduces chains, rubble, and fog before the finale', () => {
    const kinds = new Set(levels.flatMap((level) => level.board.obstacles.map((obstacle) => obstacle.kind)));
    expect(kinds).toEqual(new Set(['chain', 'rubble', 'fog']));
  });

  it('combines all obstacle types in level ten', () => {
    expect(new Set(levels[9].board.obstacles.map((obstacle) => obstacle.kind)))
      .toEqual(new Set(['chain', 'rubble', 'fog']));
    expect(levels[9].objectives).toHaveLength(4);
  });
});
