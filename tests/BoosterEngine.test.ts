import { describe, expect, it } from 'vitest';
import { Match3Engine } from '../src/engine/Match3Engine';

const board = Array.from({ length: 8 }, (_, row) => (
  Array.from({ length: 8 }, (_, col) => (row * 2 + col) % 6)
));

describe('booster board effects', () => {
  it('hammer removes one ordinary tile without affecting neighbors', () => {
    const engine = Match3Engine.fromBoard(board, 6);
    const result = engine.hitCell({ row: 3, col: 3 });

    expect(result.removedTileTypes).toEqual([board[3][3]]);
    expect(engine.board[3][3]).toBe(-1);
    expect(engine.board[3][2]).toBe(board[3][2]);
    expect(engine.board[3][4]).toBe(board[3][4]);
  });

  it('hammer removes one obstacle layer and keeps the covered tile', () => {
    const obstacles = Array.from({ length: 8 }, () => Array(8).fill(null));
    obstacles[2][2] = { kind: 'chain' as const, layers: 2 as const };
    const engine = Match3Engine.fromBoard(board, 6, undefined, undefined, obstacles);

    const result = engine.hitCell({ row: 2, col: 2 });
    expect(result.obstacleDamage[0]).toMatchObject({
      kind: 'chain',
      remainingLayers: 1,
      cleared: false,
    });
    expect(engine.getObstacle({ row: 2, col: 2 })).toEqual({ kind: 'chain', layers: 1 });
    expect(engine.board[2][2]).toBe(board[2][2]);
  });

  it('clears rubble and opens the cell for the next collapse', () => {
    const rubbleBoard = board.map((row) => [...row]);
    rubbleBoard[4][4] = -1;
    const obstacles = Array.from({ length: 8 }, () => Array(8).fill(null));
    obstacles[4][4] = { kind: 'rubble' as const, layers: 1 as const };
    const engine = Match3Engine.fromBoard(rubbleBoard, 6, undefined, undefined, obstacles);

    const result = engine.hitCell({ row: 4, col: 4 });
    expect(result.clearedObstacleKinds).toEqual(['rubble']);
    expect(engine.getObstacle({ row: 4, col: 4 })).toBeNull();
    expect(engine.board[4][4]).toBe(-1);
  });
});
