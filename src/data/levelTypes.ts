export const LEVEL_SCHEMA_VERSION = 2 as const;

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

/**
 * JSON-compatible objective definitions supported by the current prototype.
 * New objective types extend this union instead of adding fields to GameApp.
 */
export type LevelObjectiveDefinition = CollectObjectiveDefinition;

export type LevelDefinition = Readonly<{
  schemaVersion: typeof LEVEL_SCHEMA_VERSION;
  id: number;
  title: string;
  difficulty: LevelDifficulty;
  moves: number;
  starThresholds: StarThresholds;
  objectives: readonly LevelObjectiveDefinition[];
}>;
