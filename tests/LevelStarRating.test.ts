import { describe, expect, it } from 'vitest';
import { levels } from '../src/data/gameData';
import { calculateLevelStars } from '../src/meta/LevelStarRating';

describe('per-level star rating', () => {
  const level = levels[0];

  it('awards three stars at the level-specific upper threshold', () => {
    expect(calculateLevelStars(level, 10)).toBe(3);
  });

  it('awards two stars between thresholds', () => {
    expect(calculateLevelStars(level, 4)).toBe(2);
    expect(calculateLevelStars(level, 9)).toBe(2);
  });

  it('always awards one star for a completed level below the lower threshold', () => {
    expect(calculateLevelStars(level, 0)).toBe(1);
    expect(calculateLevelStars(level, 3)).toBe(1);
  });
});
