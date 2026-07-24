import { describe, expect, it } from 'vitest';
import { Match3Engine } from '../src/engine/Match3Engine';
import {
  applySpecialCreations,
  planDirectSpecialResolution,
  planMatchedResolution,
} from '../src/engine/SpecialTileResolver';

const filler5 = [
  [0, 1, 2, 3, 4],
  [1, 2, 3, 4, 5],
  [2, 3, 4, 5, 0],
  [3, 4, 5, 0, 1],
  [4, 5, 0, 1, 2],
];

function engineFrom(board: number[][]): Match3Engine {
  return Match3Engine.fromBoard(board, 6);
}

describe('special tile creation and activation', () => {
  it('creates a horizontal rocket from a line of four', () => {
    const engine = engineFrom([
      [0, 0, 0, 0, 1],
      ...filler5.slice(1),
    ]);

    const plan = planMatchedResolution(
      engine,
      [{ row: 0, col: 4 }, { row: 0, col: 3 }],
      0,
      true,
    );

    expect(plan.creations).toHaveLength(1);
    expect(plan.creations[0].special).toMatchObject({ kind: 'rocket', direction: 'row' });
    expect(plan.clearPositions).toHaveLength(3);
  });

  it('creates a lunar prism from a line of five', () => {
    const engine = engineFrom([
      [0, 0, 0, 0, 0],
      ...filler5.slice(1),
    ]);

    const plan = planMatchedResolution(
      engine,
      [{ row: 0, col: 4 }, { row: 0, col: 3 }],
      0,
      true,
    );

    expect(plan.creations[0].special.kind).toBe('prism');
    expect(plan.clearPositions).toHaveLength(4);
  });

  it('creates a raven from a 2x2 square', () => {
    const engine = engineFrom([
      [0, 0, 2, 3, 4],
      [0, 0, 3, 4, 5],
      ...filler5.slice(2),
    ]);

    const plan = planMatchedResolution(
      engine,
      [{ row: 1, col: 1 }, { row: 1, col: 0 }],
      0,
      true,
    );

    expect(plan.creations[0].special.kind).toBe('raven');
    expect(plan.clearPositions).toHaveLength(3);
  });

  it('creates a bomb from a T-shaped match', () => {
    const engine = engineFrom([
      [1, 0, 2, 3, 4],
      [0, 0, 0, 4, 5],
      [2, 0, 3, 5, 1],
      [3, 4, 5, 1, 2],
      [4, 5, 1, 2, 3],
    ]);

    const plan = planMatchedResolution(
      engine,
      [{ row: 1, col: 0 }, { row: 1, col: 1 }],
      0,
      true,
    );

    expect(plan.creations[0]).toMatchObject({
      position: { row: 1, col: 1 },
      special: { kind: 'bomb' },
    });
    expect(plan.clearPositions).toHaveLength(4);
  });

  it('activates a matched rocket and clears its whole row', () => {
    const engine = engineFrom([
      [0, 0, 0, 3, 4],
      ...filler5.slice(1),
    ]);
    engine.setSpecial({ row: 0, col: 1 }, { kind: 'rocket', direction: 'row', baseTile: 0 });

    const plan = planMatchedResolution(engine, null, 0, false);

    expect(plan.activations.map(({ special }) => special.kind)).toContain('rocket');
    expect(plan.clearPositions.filter(({ row }) => row === 0)).toHaveLength(5);
  });

  it('makes a raven prefer the current objective tile', () => {
    const engine = engineFrom([
      [0, 0, 0, 2, 4],
      [1, 2, 3, 4, 5],
      [2, 3, 4, 5, 1],
      [3, 4, 5, 1, 2],
      [4, 5, 1, 2, 3],
    ]);
    engine.setSpecial({ row: 0, col: 1 }, { kind: 'raven', baseTile: 0 });

    const plan = planMatchedResolution(engine, null, 5, false);

    expect(plan.clearPositions).toContainEqual({ row: 1, col: 4 });
  });

  it('combines two rockets into a row-and-column cross', () => {
    const engine = engineFrom(filler5.map((row) => [...row]));
    engine.setSpecial({ row: 2, col: 2 }, { kind: 'rocket', direction: 'row', baseTile: 4 });
    engine.setSpecial({ row: 2, col: 3 }, { kind: 'rocket', direction: 'column', baseTile: 5 });
    const combo = engine.getDirectSpecialCombo({ row: 2, col: 2 }, { row: 2, col: 3 });
    expect(combo).toBe('rocket-rocket');
    engine.swap({ row: 2, col: 2 }, { row: 2, col: 3 });

    const plan = planDirectSpecialResolution(
      engine,
      { row: 2, col: 2 },
      { row: 2, col: 3 },
      combo!,
      0,
    );

    expect(plan.clearPositions.filter(({ row }) => row === 2)).toHaveLength(5);
    expect(plan.clearPositions.filter(({ col }) => col === 3)).toHaveLength(5);
  });

  it('combines a prism with a normal tile and clears that colour', () => {
    const engine = engineFrom([
      [0, 1, 2, 3, 1],
      [1, 2, 3, 4, 5],
      [2, 3, 4, 5, 0],
      [3, 4, 5, 0, 1],
      [4, 5, 0, 1, 2],
    ]);
    engine.setSpecial({ row: 0, col: 0 }, { kind: 'prism', baseTile: 0 });
    const combo = engine.getDirectSpecialCombo({ row: 0, col: 0 }, { row: 0, col: 1 });
    engine.swap({ row: 0, col: 0 }, { row: 0, col: 1 });

    const plan = planDirectSpecialResolution(
      engine,
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      combo!,
      0,
    );

    const clearedOnes = plan.clearPositions.filter(
      (position) => engine.board[position.row][position.col] === 1,
    );
    expect(clearedOnes).toHaveLength(5);
  });

  it('keeps a created special on the board after clearing its source match', () => {
    const engine = engineFrom([
      [0, 0, 0, 0, 1],
      ...filler5.slice(1),
    ]);
    const plan = planMatchedResolution(
      engine,
      [{ row: 0, col: 4 }, { row: 0, col: 3 }],
      0,
      true,
    );

    engine.clearMatches(plan.clearPositions);
    applySpecialCreations(engine, plan.creations);
    engine.collapse(false);

    expect(engine.specials.flat().filter(Boolean)).toHaveLength(1);
  });
});
