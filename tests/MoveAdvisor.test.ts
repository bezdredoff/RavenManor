import { describe, expect, it } from 'vitest';
import { Match3Engine } from '../src/engine/Match3Engine';
import {
  compareMoveEvaluations,
  findBestMove,
  type MoveEvaluation,
} from '../src/engine/MoveAdvisor';

const objectiveBoard = [
  [1, 1, 3, 3, 1],
  [0, 0, 3, 0, 0],
  [2, 0, 0, 1, 1],
  [3, 2, 0, 1, 2],
  [0, 2, 2, 0, 2],
];

describe('best-move advisor', () => {
  it('prefers objective progress over a larger unrelated clear', () => {
    const engine = new Match3Engine(5, 4);
    engine.board = objectiveBoard.map((row) => [...row]);
    const before = engine.board.map((row) => [...row]);

    const best = findBestMove(engine, { tileType: 2, remaining: 5 });

    expect(best?.move).toEqual([
      { row: 4, col: 3 },
      { row: 4, col: 4 },
    ]);
    expect(best?.objectiveProgress).toBe(3);
    expect(best?.totalRemoved).toBe(3);
    expect(engine.board).toEqual(before);
  });

  it('marks a move as best when it immediately completes the objective', () => {
    const engine = new Match3Engine(5, 4);
    engine.board = objectiveBoard.map((row) => [...row]);

    const best = findBestMove(engine, { tileType: 2, remaining: 2 });

    expect(best?.completesObjective).toBe(true);
    expect(best?.objectiveProgress).toBe(2);
  });

  it('uses total clear, largest combination, and mobility as tie-breakers', () => {
    const moveA = [{ row: 0, col: 0 }, { row: 0, col: 1 }] as const;
    const moveB = [{ row: 0, col: 1 }, { row: 0, col: 2 }] as const;
    const baseline: MoveEvaluation = {
      move: moveA,
      completesObjective: false,
      objectiveProgress: 2,
      totalRemoved: 3,
      largestCombination: 3,
      followUpMoves: 1,
    };

    expect(compareMoveEvaluations(
      { ...baseline, move: moveB, totalRemoved: 4 },
      baseline,
    )).toBeLessThan(0);
    expect(compareMoveEvaluations(
      { ...baseline, move: moveB, largestCombination: 4 },
      baseline,
    )).toBeLessThan(0);
    expect(compareMoveEvaluations(
      { ...baseline, move: moveB, followUpMoves: 2 },
      baseline,
    )).toBeLessThan(0);
  });
});
