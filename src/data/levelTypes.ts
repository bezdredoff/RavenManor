import type { ObstacleKind, ObstacleLayerCount } from '../engine/ObstacleTypes';

export const LEVEL_SCHEMA_VERSION = 3 as const;
export const BOARD_SIZE = 8 as const;

export type LevelDifficulty = 'easy' | 'normal' | 'hard' | 'finale';

export type StarThresholds = Readonly<{
  twoStarsMovesLeft: number;
  threeStarsMovesLeft: number;
}>;

export type CollectObjectiveDefinition = Readonly<{
  id: string;
  type: 'collect';
  tileType: number;
  target: number;
}>;

export type ClearObstacleObjectiveDefinition = Readonly<{
  id: string;
  type: 'clear-obstacle';
  obstacleKind: ObstacleKind;
  target: number;
}>;

export type LevelObjectiveDefinition =
  | CollectObjectiveDefinition
  | ClearObstacleObjectiveDefinition;

export type LevelObstacleDefinition = Readonly<{
  row: number;
  col: number;
  kind: ObstacleKind;
  layers: ObstacleLayerCount;
}>;

export type LevelBoardDefinition = Readonly<{
  mask: readonly string[];
  obstacles: readonly LevelObstacleDefinition[];
}>;

export type LevelDefinition = Readonly<{
  schemaVersion: typeof LEVEL_SCHEMA_VERSION;
  id: number;
  title: string;
  difficulty: LevelDifficulty;
  moves: number;
  starThresholds: StarThresholds;
  board: LevelBoardDefinition;
  objectives: readonly LevelObjectiveDefinition[];
}>;
