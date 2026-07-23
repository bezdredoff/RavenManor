import { describe, expect, it } from 'vitest';
import { levels } from '../src/data/gameData';
import {
  LevelGroupValidationError,
  validateLevelGroups,
} from '../src/data/levelGroupValidation';

function errorFor(value: unknown): LevelGroupValidationError {
  try {
    validateLevelGroups(value, levels);
  } catch (error) {
    expect(error).toBeInstanceOf(LevelGroupValidationError);
    return error as LevelGroupValidationError;
  }
  throw new Error('Expected validation to fail');
}

describe('level group validation', () => {
  it('rejects duplicate assignment of one level', () => {
    const error = errorFor([
      {
        schemaVersion: 1,
        id: 'one',
        title: 'One',
        description: 'One',
        levelIds: [1],
        unlock: { type: 'always' },
      },
      {
        schemaVersion: 1,
        id: 'two',
        title: 'Two',
        description: 'Two',
        levelIds: [1],
        unlock: { type: 'complete-in-group', groupId: 'one', count: 1 },
      },
    ]);
    expect(error.message).toContain('level 1 is assigned to more than one group');
  });

  it('requires unlock rules to reference an earlier group', () => {
    const error = errorFor([
      {
        schemaVersion: 1,
        id: 'one',
        title: 'One',
        description: 'One',
        levelIds: [1],
        unlock: { type: 'complete-in-group', groupId: 'missing', count: 1 },
      },
    ]);
    expect(error.message).toContain('must reference an earlier group');
  });
});
