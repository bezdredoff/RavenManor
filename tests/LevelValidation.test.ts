import { describe, expect, it } from 'vitest';
import {
  LevelValidationError,
  validateLevelCatalog,
} from '../src/data/levelValidation';

const validLevel = {
  schemaVersion: 1,
  id: 1,
  title: 'Уровень 1',
  moves: 18,
  requiredStars: 0,
  objectives: [
    {
      id: 'primary',
      type: 'collect',
      tileType: 0,
      target: 12,
    },
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
    expect(result[0].objectives).not.toBe(input[0].objectives);
  });

  it('rejects a non-array or empty catalog', () => {
    expect(getValidationError({}).message).toContain(
      'levels: must be a non-empty array',
    );
    expect(getValidationError([]).message).toContain(
      'levels: must contain at least one level',
    );
  });

  it('reports invalid level fields with their JSON paths', () => {
    const error = getValidationError([
      {
        ...validLevel,
        schemaVersion: 2,
        title: '   ',
        moves: 0,
        requiredStars: -1,
        debugOnly: true,
      },
    ]);

    expect(error.message).toContain('levels[0].schemaVersion: must equal 1');
    expect(error.message).toContain('levels[0].title: must be a non-empty string');
    expect(error.message).toContain(
      'levels[0].moves: must be greater than or equal to 1',
    );
    expect(error.message).toContain(
      'levels[0].requiredStars: must be greater than or equal to 0',
    );
    expect(error.message).toContain(
      'levels[0].debugOnly: is not allowed by the current schema',
    );
  });

  it('rejects duplicate level ids', () => {
    const error = getValidationError([
      validLevel,
      { ...validLevel, title: 'Уровень-дубликат' },
    ]);

    expect(error.message).toContain('levels[1].id: duplicate level id 1');
  });

  it('requires at least one objective', () => {
    const error = getValidationError([
      { ...validLevel, objectives: [] },
    ]);

    expect(error.message).toContain(
      'levels[0].objectives: must contain at least one objective',
    );
  });

  it('rejects duplicate objective ids within one level', () => {
    const duplicateObjective = {
      ...validLevel.objectives[0],
      tileType: 1,
    };
    const error = getValidationError([
      {
        ...validLevel,
        objectives: [validLevel.objectives[0], duplicateObjective],
      },
    ]);

    expect(error.message).toContain(
      'levels[0].objectives[1].id: duplicate objective id "primary" within level',
    );
  });

  it('rejects unsupported objective types and invalid collect values', () => {
    const error = getValidationError([
      {
        ...validLevel,
        objectives: [
          {
            id: 'unsupported',
            type: 'score',
            target: 100,
          },
          {
            id: 'collect',
            type: 'collect',
            tileType: 6,
            target: 0,
          },
        ],
      },
    ]);

    expect(error.message).toContain(
      'levels[0].objectives[0].type: must be the supported objective type "collect"',
    );
    expect(error.message).toContain(
      'levels[0].objectives[1].tileType: must be between 0 and 5',
    );
    expect(error.message).toContain(
      'levels[0].objectives[1].target: must be greater than or equal to 1',
    );
  });

  it('rejects an invalid tile type count supplied by application code', () => {
    expect(() =>
      validateLevelCatalog([validLevel], { tileTypeCount: 0 }),
    ).toThrow('tileTypeCount must be a positive integer');
  });
});
