export const LEVEL_SCHEMA_VERSION = 1 as const;

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
  moves: number;
  requiredStars: number;
  objectives: readonly LevelObjectiveDefinition[];
}>;
