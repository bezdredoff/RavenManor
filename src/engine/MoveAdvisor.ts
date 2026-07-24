import { Match3Engine, type Move } from './Match3Engine';

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
}>;

/**
 * Evaluates every legal move using only information already visible on the
 * board. Random refill tiles are deliberately excluded, while deterministic
 * cascades caused by the current board are included.
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
  const simulation = Match3Engine.fromBoard(engine.board, engine.tileTypeCount);
  simulation.swap(move[0], move[1]);

  let objectiveTilesRemoved = 0;
  let totalRemoved = 0;
  let largestCombination = 0;
  let groups = simulation.findMatchGroups();

  while (groups.length > 0) {
    largestCombination = Math.max(
      largestCombination,
      ...groups.map((group) => group.length),
    );
    const matches = simulation.findMatches();
    const removed = simulation.clearMatches(matches);
    objectiveTilesRemoved += removed.filter((tile) => tile === objective.tileType).length;
    totalRemoved += removed.length;
    simulation.collapse(false);
    groups = simulation.findMatchGroups();
  }

  const remaining = Math.max(0, objective.remaining);
  return {
    move,
    completesObjective: remaining > 0 && objectiveTilesRemoved >= remaining,
    objectiveProgress: Math.min(objectiveTilesRemoved, remaining),
    totalRemoved,
    largestCombination,
    followUpMoves: simulation.findPossibleMoves().length,
  };
}

/**
 * Lower sort value means a better hint.
 *
 * Priority: finish level → objective progress → total clear → largest merged
 * combination → deterministic follow-up mobility → stable board order.
 */
export function compareMoveEvaluations(
  first: MoveEvaluation,
  second: MoveEvaluation,
): number {
  const rankedDifferences = [
    Number(second.completesObjective) - Number(first.completesObjective),
    second.objectiveProgress - first.objectiveProgress,
    second.totalRemoved - first.totalRemoved,
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
