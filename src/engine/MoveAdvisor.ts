import { Match3Engine, type Move } from './Match3Engine';
import {
  applySpecialCreations,
  planDirectSpecialResolution,
  planMatchedResolution,
} from './SpecialTileResolver';

export type HintObjective = Readonly<{
  tileType: number;
  remaining: number;
}>;

export type MoveEvaluation = Readonly<{
  move: Move;
  completesObjective: boolean;
  objectiveProgress: number;
  totalRemoved: number;
  largestCombination: number;
  followUpMoves: number;
  specialPower?: number;
}>;

/**
 * Evaluates every legal move using only information already visible on the
 * board. Random refill tiles are deliberately excluded, while deterministic
 * cascades and special-tile effects are included.
 */
export function findBestMove(
  engine: Match3Engine,
  objective: HintObjective,
): MoveEvaluation | null {
  const evaluations = engine.findPossibleMoves().map((move) => (
    evaluateMove(engine, move, objective)
  ));

  return evaluations.sort(compareMoveEvaluations)[0] ?? null;
}

export function evaluateMove(
  engine: Match3Engine,
  move: Move,
  objective: HintObjective,
): MoveEvaluation {
  const simulation = Match3Engine.fromBoard(
    engine.board,
    engine.tileTypeCount,
    engine.specials,
  );
  const directCombo = simulation.getDirectSpecialCombo(move[0], move[1]);
  simulation.swap(move[0], move[1]);

  let objectiveTilesRemoved = 0;
  let totalRemoved = 0;
  let largestCombination = 0;
  let specialPower = 0;
  let firstResolution = true;

  if (directCombo) {
    const plan = planDirectSpecialResolution(
      simulation,
      move[0],
      move[1],
      directCombo,
      objective.tileType,
    );
    const removed = simulation.clearMatches(plan.clearPositions);
    objectiveTilesRemoved += removed.filter((tile) => tile === objective.tileType).length;
    totalRemoved += removed.length;
    largestCombination = Math.max(largestCombination, plan.clearPositions.length);
    specialPower += plan.specialPower;
    simulation.collapse(false);
    firstResolution = false;
  }

  let groups = simulation.findMatchGroups();
  while (groups.length > 0) {
    largestCombination = Math.max(
      largestCombination,
      ...groups.map((group) => group.length),
    );
    const plan = planMatchedResolution(
      simulation,
      firstResolution ? move : null,
      objective.tileType,
      firstResolution,
    );
    const removed = simulation.clearMatches(plan.clearPositions);
    objectiveTilesRemoved += removed.filter((tile) => tile === objective.tileType).length;
    totalRemoved += removed.length;
    specialPower += plan.specialPower;
    applySpecialCreations(simulation, plan.creations);
    simulation.collapse(false);
    groups = simulation.findMatchGroups();
    firstResolution = false;
  }

  const remaining = Math.max(0, objective.remaining);
  return {
    move,
    completesObjective: remaining > 0 && objectiveTilesRemoved >= remaining,
    objectiveProgress: Math.min(objectiveTilesRemoved, remaining),
    totalRemoved,
    largestCombination,
    followUpMoves: simulation.findPossibleMoves().length,
    specialPower,
  };
}

/**
 * Lower sort value means a better hint.
 *
 * Priority: finish level → objective progress → immediate clear → special
 * reward/activation → largest combination → deterministic follow-up mobility
 * → stable board order.
 */
export function compareMoveEvaluations(
  first: MoveEvaluation,
  second: MoveEvaluation,
): number {
  const rankedDifferences = [
    Number(second.completesObjective) - Number(first.completesObjective),
    second.objectiveProgress - first.objectiveProgress,
    second.totalRemoved - first.totalRemoved,
    (second.specialPower ?? 0) - (first.specialPower ?? 0),
    second.largestCombination - first.largestCombination,
    second.followUpMoves - first.followUpMoves,
  ];

  for (const difference of rankedDifferences) {
    if (difference !== 0) return difference;
  }

  return compareMovesByBoardOrder(first.move, second.move);
}

function compareMovesByBoardOrder(first: Move, second: Move): number {
  return first[0].row - second[0].row
    || first[0].col - second[0].col
    || first[1].row - second[1].row
    || first[1].col - second[1].col;
}
