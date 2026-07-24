import { Match3Engine, type Move } from './Match3Engine';
import {
  normalizeObjectivePriority,
  type LegacyObjectivePriority,
  type ObjectivePriority,
} from './ObjectivePriority';
import {
  applySpecialCreations,
  planDirectSpecialResolution,
  planMatchedResolution,
} from './SpecialTileResolver';

export type HintObjective = ObjectivePriority | LegacyObjectivePriority;

export type MoveEvaluation = Readonly<{
  move: Move;
  completesObjective: boolean;
  objectiveProgress: number;
  totalRemoved: number;
  obstaclesCleared?: number;
  largestCombination: number;
  followUpMoves: number;
  specialPower?: number;
}>;

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
  objectiveInput: HintObjective,
): MoveEvaluation {
  const objective = normalizeObjectivePriority(objectiveInput);
  const simulation = Match3Engine.fromBoard(
    engine.board,
    engine.tileTypeCount,
    engine.specials,
    engine.activeMask,
    engine.obstacles,
  );
  const directCombo = simulation.getDirectSpecialCombo(move[0], move[1]);
  simulation.swap(move[0], move[1]);

  const collectProgress = new Map(objective.collects.map((target) => [target.tileType, 0]));
  const obstacleProgress = new Map(objective.obstacles.map((target) => [target.kind, 0]));
  let totalRemoved = 0;
  let obstaclesCleared = 0;
  let largestCombination = 0;
  let specialPower = 0;
  let firstResolution = true;

  const applyResult = (positions: readonly { row: number; col: number }[]): void => {
    const result = simulation.resolveClear(positions);
    totalRemoved += result.removedTileTypes.length;
    obstaclesCleared += result.clearedObstacleKinds.length;
    for (const tileType of result.removedTileTypes) {
      if (collectProgress.has(tileType)) {
        collectProgress.set(tileType, (collectProgress.get(tileType) ?? 0) + 1);
      }
    }
    for (const kind of result.clearedObstacleKinds) {
      if (obstacleProgress.has(kind)) {
        obstacleProgress.set(kind, (obstacleProgress.get(kind) ?? 0) + 1);
      }
    }
  };

  if (directCombo) {
    const plan = planDirectSpecialResolution(
      simulation,
      move[0],
      move[1],
      directCombo,
      objective,
    );
    applyResult(plan.clearPositions);
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
      objective,
      firstResolution,
    );
    applyResult(plan.clearPositions);
    specialPower += plan.specialPower;
    applySpecialCreations(simulation, plan.creations);
    simulation.collapse(false);
    groups = simulation.findMatchGroups();
    firstResolution = false;
  }

  const collectUnits = objective.collects.reduce((sum, target) => (
    sum + Math.min(Math.max(0, target.remaining), collectProgress.get(target.tileType) ?? 0)
  ), 0);
  const obstacleUnits = objective.obstacles.reduce((sum, target) => (
    sum + Math.min(Math.max(0, target.remaining), obstacleProgress.get(target.kind) ?? 0)
  ), 0);
  const completesObjective = objective.collects.every((target) => (
    (collectProgress.get(target.tileType) ?? 0) >= Math.max(0, target.remaining)
  )) && objective.obstacles.every((target) => (
    (obstacleProgress.get(target.kind) ?? 0) >= Math.max(0, target.remaining)
  ));

  return {
    move,
    completesObjective,
    objectiveProgress: collectUnits + obstacleUnits,
    totalRemoved,
    obstaclesCleared,
    largestCombination,
    followUpMoves: simulation.findPossibleMoves().length,
    specialPower,
  };
}

export function compareMoveEvaluations(
  first: MoveEvaluation,
  second: MoveEvaluation,
): number {
  const rankedDifferences = [
    Number(second.completesObjective) - Number(first.completesObjective),
    second.objectiveProgress - first.objectiveProgress,
    (second.obstaclesCleared ?? 0) - (first.obstaclesCleared ?? 0),
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
