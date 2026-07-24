import { describe, expect, it } from 'vitest';
import { LevelValidationError, validateLevelCatalog } from '../src/data/levelValidation';

const validLevel = {
  schemaVersion: 3,
  id: 1,
  title: 'Тестовый зал',
  difficulty: 'easy',
  moves: 18,
  starThresholds: { twoStarsMovesLeft: 4, threeStarsMovesLeft: 10 },
  board: {
    mask: ['11111111','11111111','11111111','11111111','11111111','11111111','11111111','11111111'],
    obstacles: [{ row: 2, col: 2, kind: 'chain', layers: 1 }],
  },
  objectives: [
    { id: 'roses', type: 'collect', tileType: 0, target: 10 },
    { id: 'chains', type: 'clear-obstacle', obstacleKind: 'chain', target: 1 },
  ],
};

function getError(value: unknown): LevelValidationError {
  try { validateLevelCatalog(value, { tileTypeCount: 6 }); }
  catch (error) { expect(error).toBeInstanceOf(LevelValidationError); return error as LevelValidationError; }
  throw new Error('Expected validation failure');
}

describe('level schema v3 validation', () => {
  it('accepts board masks, obstacles, and mixed objectives', () => {
    expect(validateLevelCatalog([validLevel], { tileTypeCount: 6 })).toEqual([validLevel]);
  });

  it('rejects old schema versions and malformed masks', () => {
    const error = getError([{ ...validLevel, schemaVersion: 2, board: { ...validLevel.board, mask: ['111'] } }]);
    expect(error.message).toContain('schemaVersion: must equal 3');
    expect(error.message).toContain('board.mask');
  });

  it('rejects obstacles on inactive cells and duplicate positions', () => {
    const error = getError([{ ...validLevel, board: {
      mask: ['01111111','11111111','11111111','11111111','11111111','11111111','11111111','11111111'],
      obstacles: [
        { row: 0, col: 0, kind: 'fog', layers: 1 },
        { row: 0, col: 0, kind: 'chain', layers: 1 },
      ],
    } }]);
    expect(error.message).toContain('must be placed on an active mask cell');
    expect(error.message).toContain('duplicates obstacle position 0,0');
  });

  it('requires obstacle objectives to have a matching blocker', () => {
    const error = getError([{ ...validLevel, objectives: [
      { id: 'fog', type: 'clear-obstacle', obstacleKind: 'fog', target: 1 },
    ] }]);
    expect(error.message).toContain('requires at least one fog obstacle');
  });
});
