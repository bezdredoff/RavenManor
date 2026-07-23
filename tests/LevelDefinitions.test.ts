import { describe, expect, it } from 'vitest';
import { levels } from '../src/data/gameData';

/**
 * Migration-parity tests only. Full malformed-data validation is FEATURE-012.
 */
describe('level JSON definitions', () => {
  it('loads the ten existing levels in stable id order', () => {
    expect(levels).toHaveLength(10);
    expect(levels.map((level) => level.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('preserves the first level parameters', () => {
    expect(levels[0]).toEqual({
      schemaVersion: 1,
      id: 1,
      title: 'Уровень 1',
      moves: 18,
      requiredStars: 0,
      objectives: [
        { id: 'primary', type: 'collect', tileType: 0, target: 12 },
      ],
    });
  });

  it('preserves the final level parameters', () => {
    expect(levels[9]).toEqual({
      schemaVersion: 1,
      id: 10,
      title: 'Уровень 10',
      moves: 22,
      requiredStars: 17,
      objectives: [
        { id: 'primary', type: 'collect', tileType: 3, target: 30 },
      ],
    });
  });

  it('uses JSON objective definitions instead of legacy target fields', () => {
    for (const level of levels) {
      expect(level.objectives).toHaveLength(1);
      expect(level.objectives[0].type).toBe('collect');
      expect('targetTile' in level).toBe(false);
      expect('targetCount' in level).toBe(false);
    }
  });
});
