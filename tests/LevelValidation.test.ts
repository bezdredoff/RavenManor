import { describe, expect, it } from 'vitest';
import {
  LevelValidationError,
  validateLevelCatalog,
} from '../src/data/levelValidation';

const validLevel = {
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
};

function getValidationError(value: unknown): LevelValidationError {
  try {
    validateLevelCatalog(value, { tileTypeCount: 6 });
  } catch (error) {
    expect(error).toBeInstanceOf(LevelValidationError);
    return error as LevelValidationError;
  }
  throw new Error('Expected level validation to fail');
}

describe('level runtime validation', () => {
  it('returns validated copies for a valid catalog', () => {
    const input = [validLevel];
    const result = validateLevelCatalog(input, { tileTypeCount: 6 });
    expect(result).toEqual(input);
    expect(result).not.toBe(input);
    expect(result[0]).not.toBe(input[0]);
  });

  it('rejects invalid level fields with JSON paths', () => {
    const error = getValidationError([{
      ...validLevel,
      schemaVersion: 1,
      difficulty: 'impossible',
      moves: 0,
      debugOnly: true,
    }]);
    expect(error.message).toContain('levels[0].schemaVersion: must equal 2');
    expect(error.message).toContain('levels[0].difficulty');
    expect(error.message).toContain('levels[0].moves: must be greater than or equal to 1');
    expect(error.message).toContain('levels[0].debugOnly: is not allowed');
  });

  it('requires valid ordered star thresholds', () => {
    const error = getValidationError([{
      ...validLevel,
      starThresholds: {
        twoStarsMovesLeft: 10,
        threeStarsMovesLeft: 8,
      },
    }]);
    expect(error.message).toContain(
      'levels[0].starThresholds.threeStarsMovesLeft: must be greater than twoStarsMovesLeft',
    );
  });

  it('does not allow a three-star threshold equal to the move limit', () => {
    const error = getValidationError([{
      ...validLevel,
      starThresholds: {
        twoStarsMovesLeft: 4,
        threeStarsMovesLeft: 18,
      },
    }]);
    expect(error.message).toContain('must be less than the level move limit 18');
  });

  it('rejects duplicate ids and invalid objectives', () => {
    const error = getValidationError([
      validLevel,
      {
        ...validLevel,
        objectives: [
          { id: 'primary', type: 'collect', tileType: 6, target: 0 },
        ],
      },
    ]);
    expect(error.message).toContain('levels[1].id: duplicate level id 1');
    expect(error.message).toContain('levels[1].objectives[0].tileType: must be between 0 and 5');
    expect(error.message).toContain('levels[1].objectives[0].target: must be greater than or equal to 1');
  });
});
