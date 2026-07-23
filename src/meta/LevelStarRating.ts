import type { LevelDefinition } from '../data/levelTypes';

export type LevelStarRating = 1 | 2 | 3;

export function calculateLevelStars(
  level: Pick<LevelDefinition, 'starThresholds'>,
  movesLeft: number,
): LevelStarRating {
  if (movesLeft >= level.starThresholds.threeStarsMovesLeft) return 3;
  if (movesLeft >= level.starThresholds.twoStarsMovesLeft) return 2;
  return 1;
}
