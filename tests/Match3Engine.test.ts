import { describe, expect, it } from 'vitest';
import { Match3Engine, type Position } from '../src/engine/Match3Engine';

function cloneBoard(board: number[][]): number[][] {
  return board.map((row) => [...row]);
}

function countTiles(board: number[][]): Map<number, number> {
  const counts = new Map<number, number>();

  for (const tile of board.flat()) {
    counts.set(tile, (counts.get(tile) ?? 0) + 1);
  }

  return counts;
}

function sortPositions(positions: Position[]): string[] {
  return positions.map(({ row, col }) => `${row},${col}`).sort();
}

function createDeadBoard(size = 8): number[][] {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => (row + col) % 3),
  );
}

describe('Match3Engine', () => {
  it('generates a playable board without immediate matches', () => {
    const engine = new Match3Engine(8, 6);

    expect(engine.board).toHaveLength(8);
    expect(engine.board.every((row) => row.length === 8)).toBe(true);
    expect(engine.board.flat().every((tile) => tile >= 0 && tile < 6)).toBe(true);
    expect(engine.findMatches()).toEqual([]);
    expect(engine.findPossibleMove()).not.toBeNull();
  });

  it('recognizes adjacent and non-adjacent positions', () => {
    const engine = new Match3Engine(3, 3);

    expect(engine.areAdjacent({ row: 1, col: 1 }, { row: 1, col: 2 })).toBe(true);
    expect(engine.areAdjacent({ row: 1, col: 1 }, { row: 2, col: 1 })).toBe(true);
    expect(engine.areAdjacent({ row: 1, col: 1 }, { row: 2, col: 2 })).toBe(false);
    expect(engine.areAdjacent({ row: 1, col: 1 }, { row: 1, col: 1 })).toBe(false);
  });

  it('swaps two tiles', () => {
    const engine = new Match3Engine(3, 3);
    engine.board = [
      [0, 1, 2],
      [1, 2, 0],
      [2, 0, 1],
    ];

    engine.swap({ row: 0, col: 0 }, { row: 0, col: 1 });

    expect(engine.board[0]).toEqual([1, 0, 2]);
  });

  it('finds horizontal matches', () => {
    const engine = new Match3Engine(3, 3);
    engine.board = [
      [0, 0, 0],
      [1, 2, 1],
      [2, 1, 2],
    ];

    expect(sortPositions(engine.findMatches())).toEqual(['0,0', '0,1', '0,2']);
  });

  it('finds vertical matches', () => {
    const engine = new Match3Engine(3, 3);
    engine.board = [
      [0, 1, 2],
      [0, 2, 1],
      [0, 1, 2],
    ];

    expect(sortPositions(engine.findMatches())).toEqual(['0,0', '1,0', '2,0']);
  });

  it('clears matched positions and returns removed tile types', () => {
    const engine = new Match3Engine(3, 3);
    engine.board = [
      [0, 0, 0],
      [1, 2, 1],
      [2, 1, 2],
    ];
    const matches = engine.findMatches();

    const removed = engine.clearMatches(matches);

    expect(removed).toEqual([0, 0, 0]);
    expect(engine.board[0]).toEqual([-1, -1, -1]);
  });

  it('collapses columns while preserving the order of surviving tiles', () => {
    const engine = new Match3Engine(4, 4);
    engine.board = [
      [0, 1, 2, 3],
      [1, -1, 3, 0],
      [2, 2, -1, 1],
      [3, 3, 1, 2],
    ];

    engine.collapse();

    expect(engine.board[1][1]).toBe(1);
    expect(engine.board[2][1]).toBe(2);
    expect(engine.board[3][1]).toBe(3);
    expect(engine.board[1][2]).toBe(2);
    expect(engine.board[2][2]).toBe(3);
    expect(engine.board[3][2]).toBe(1);
    expect(engine.board.flat().every((tile) => tile >= 0 && tile < 4)).toBe(true);
  });

  it('finds a legal move without modifying the board', () => {
    const engine = new Match3Engine(3, 3);
    engine.board = [
      [0, 1, 0],
      [2, 0, 2],
      [1, 0, 1],
    ];
    const before = cloneBoard(engine.board);

    expect(engine.findPossibleMove()).not.toBeNull();
    expect(engine.board).toEqual(before);
  });

  it('recognizes a board with no legal moves', () => {
    const engine = new Match3Engine(8, 6);
    engine.board = createDeadBoard();

    expect(engine.findMatches()).toEqual([]);
    expect(engine.findPossibleMove()).toBeNull();
  });

  it('reshuffles a dead board while preserving its tile distribution', () => {
    const engine = new Match3Engine(8, 6);
    engine.board = createDeadBoard();
    const countsBefore = countTiles(engine.board);

    const reshuffled = engine.reshuffle();

    expect(reshuffled).toBe(true);
    expect(countTiles(engine.board)).toEqual(countsBefore);
    expect(engine.findMatches()).toEqual([]);
    expect(engine.findPossibleMove()).not.toBeNull();
  });

  it('rejects an invalid board and restores it unchanged', () => {
    const engine = new Match3Engine(3, 3);
    engine.board = [
      [0, 1, 2],
      [1, -1, 0],
      [2, 0, 1],
    ];
    const before = cloneBoard(engine.board);

    expect(engine.reshuffle()).toBe(false);
    expect(engine.board).toEqual(before);
  });

  it('finds a 2x2 square as a four-tile match', () => {
    const engine = new Match3Engine(4, 3);
    engine.board = [
      [0, 0, 1, 2],
      [0, 0, 2, 1],
      [1, 2, 1, 2],
      [2, 1, 2, 1],
    ];

    expect(sortPositions(engine.findMatches())).toEqual([
      '0,0',
      '0,1',
      '1,0',
      '1,1',
    ]);
  });

  it('merges overlapping line and square matches without double-counting tiles', () => {
    const engine = new Match3Engine(3, 3);
    engine.board = [
      [0, 0, 0],
      [0, 0, 1],
      [1, 2, 1],
    ];

    expect(sortPositions(engine.findMatches())).toEqual([
      '0,0',
      '0,1',
      '0,2',
      '1,0',
      '1,1',
    ]);
    expect(engine.findMatchGroups()).toHaveLength(1);
    expect(engine.findMatchGroups()[0]).toHaveLength(5);
  });

  it('recognizes a move that creates only a 2x2 square', () => {
    const engine = new Match3Engine(3, 3);
    engine.board = [
      [0, 1, 0],
      [0, 0, 2],
      [1, 2, 1],
    ];

    const squareMove = engine.findPossibleMoves().find(([first, second]) => (
      first.row === 0
      && first.col === 1
      && second.row === 0
      && second.col === 2
    ));

    expect(squareMove).toBeDefined();
  });

  it('generates boards without immediate line or square matches', () => {
    for (let attempt = 0; attempt < 20; attempt++) {
      const engine = new Match3Engine(8, 6);
      expect(engine.findMatches()).toEqual([]);
    }
  });
});
