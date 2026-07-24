import { describe, expect, it } from 'vitest';
import { levelGroups, levels } from '../src/data/gameData';

describe('FEATURE-051 level campaign', () => {
  it('defines thirty levels and assigns every level once', () => {
    expect(levels).toHaveLength(30);
    expect(levelGroups).toHaveLength(10);
    expect(levelGroups.flatMap((group) => group.levelIds)).toEqual(
      Array.from({ length: 30 }, (_, index) => index + 1),
    );
  });

  it('keeps schema version three and valid 8x8 masks', () => {
    for (const level of levels) {
      expect(level.schemaVersion).toBe(3);
      expect(level.board.mask).toHaveLength(8);
      expect(level.board.mask.every((row) => /^[01]{8}$/.test(row))).toBe(true);
    }
  });

  it('uses two three-level gameplay beats for each room', () => {
    expect(levelGroups.map((group) => group.levelIds)).toEqual([
      [1, 2, 3], [4, 5, 6],
      [7, 8, 9], [10, 11, 12],
      [13, 14, 15], [16, 17, 18],
      [19, 20, 21], [22, 23, 24],
      [25, 26, 27], [28, 29, 30],
    ]);
  });

  it('places a finale at the end of every room arc', () => {
    expect([6, 12, 18, 24, 30].map((levelId) => levels[levelId - 1].difficulty))
      .toEqual(['finale', 'finale', 'finale', 'finale', 'finale']);
  });

  it('uses all obstacle types throughout the chapter', () => {
    const kinds = new Set(
      levels.flatMap((level) => level.board.obstacles.map((obstacle) => obstacle.kind)),
    );
    expect(kinds).toEqual(new Set(['chain', 'rubble', 'fog']));
  });

  it('ends with a complete mixed-mechanics challenge', () => {
    const finale = levels[29];
    expect(finale.id).toBe(30);
    expect(new Set(finale.board.obstacles.map((obstacle) => obstacle.kind)))
      .toEqual(new Set(['chain', 'rubble', 'fog']));
    expect(finale.objectives).toHaveLength(4);
    expect(finale.moves).toBeGreaterThanOrEqual(30);
  });
});
