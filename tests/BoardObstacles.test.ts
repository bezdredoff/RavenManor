import { describe, expect, it } from 'vitest';
import { Match3Engine } from '../src/engine/Match3Engine';
import { planMatchedResolution } from '../src/engine/SpecialTileResolver';

const fullMask = ['1111','1111','1111','1111'];

function createEngine(obstacles: Array<{ row: number; col: number; kind: 'chain' | 'rubble' | 'fog'; layers: 1 | 2 }> = []) {
  return new Match3Engine(4, 4, false, { mask: fullMask, obstacles });
}

describe('board masks and blockers', () => {
  it('keeps inactive mask cells outside gameplay', () => {
    const engine = Match3Engine.fromSetup({
      mask: ['0110','1111','1111','0110'],
      obstacles: [],
    }, 4);

    expect(engine.board[0][0]).toBe(-2);
    expect(engine.isActive({ row: 0, col: 0 })).toBe(false);
    expect(engine.findMatches()).toEqual([]);
    expect(engine.findPossibleMove()).not.toBeNull();
  });

  it('prevents chained and fogged tiles from being swapped', () => {
    const engine = Match3Engine.fromSetup({
      mask: fullMask,
      obstacles: [
        { row: 1, col: 1, kind: 'chain', layers: 1 },
        { row: 2, col: 2, kind: 'fog', layers: 1 },
      ],
    }, 4);

    expect(engine.canSwap({ row: 1, col: 1 })).toBe(false);
    expect(engine.canSwap({ row: 2, col: 2 })).toBe(false);
    expect(engine.canSwap({ row: 0, col: 0 })).toBe(true);
  });

  it('breaks one chain layer while preserving the tile underneath', () => {
    const engine = createEngine([{ row: 0, col: 1, kind: 'chain', layers: 2 }]);
    engine.board = [
      [0, 0, 0, 1],
      [1, 2, 3, 0],
      [2, 3, 1, 2],
      [3, 1, 2, 3],
    ];

    const first = engine.resolveClear(engine.findMatches());
    expect(first.removedTileTypes).toEqual([0, 0]);
    expect(engine.board[0][1]).toBe(0);
    expect(engine.getObstacle({ row: 0, col: 1 })).toEqual({ kind: 'chain', layers: 1 });
    expect(first.clearedObstacleKinds).toEqual([]);

    const second = engine.resolveClear([{ row: 0, col: 1 }]);
    expect(engine.getObstacle({ row: 0, col: 1 })).toBeNull();
    expect(engine.board[0][1]).toBe(0);
    expect(second.clearedObstacleKinds).toEqual(['chain']);
  });

  it('damages adjacent rubble once per resolution and refills after it clears', () => {
    const engine = createEngine([{ row: 1, col: 1, kind: 'rubble', layers: 1 }]);
    engine.board = [
      [0, 1, 2, 3],
      [0, -1, 1, 2],
      [0, 2, 3, 1],
      [1, 3, 2, 0],
    ];

    const result = engine.resolveClear([{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }]);
    expect(result.clearedObstacleKinds).toEqual(['rubble']);
    expect(engine.getObstacle({ row: 1, col: 1 })).toBeNull();
    engine.collapse();
    expect(engine.board[1][1]).toBeGreaterThanOrEqual(0);
  });

  it('clears adjacent fog without removing its hidden tile', () => {
    const engine = createEngine([{ row: 1, col: 1, kind: 'fog', layers: 1 }]);
    engine.board = [
      [0, 1, 2, 3],
      [0, 2, 1, 2],
      [0, 3, 2, 1],
      [1, 2, 3, 0],
    ];
    const hiddenTile = engine.board[1][1];

    const result = engine.resolveClear([{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }]);
    expect(result.clearedObstacleKinds).toEqual(['fog']);
    expect(engine.board[1][1]).toBe(hiddenTile);
  });

  it('lets line specials hit rubble cells inside shaped boards', () => {
    const engine = Match3Engine.fromSetup({
      mask: ['11111','11111','11111','11111','11111'],
      obstacles: [{ row: 2, col: 4, kind: 'rubble', layers: 1 }],
    }, 5);
    engine.board = [
      [0,1,2,3,4],
      [1,2,3,4,0],
      [2,2,2,3,-1],
      [3,4,0,1,2],
      [4,0,1,2,3],
    ];
    engine.setSpecial({ row: 2, col: 1 }, { kind: 'rocket', direction: 'row', baseTile: 2 });
    const plan = planMatchedResolution(engine, null, { tileType: 2, remaining: 1 }, false);
    const result = engine.resolveClear(plan.clearPositions);

    expect(result.clearedObstacleKinds).toContain('rubble');
  });
});
