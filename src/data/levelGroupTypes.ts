export const LEVEL_GROUP_SCHEMA_VERSION = 1 as const;

export type LevelGroupUnlockRule =
  | Readonly<{ type: 'always' }>
  | Readonly<{
      type: 'complete-in-group';
      groupId: string;
      count: number;
    }>
  | Readonly<{
      type: 'restoration-task';
      taskId: string;
    }>;

export type LevelGroupDefinition = Readonly<{
  schemaVersion: typeof LEVEL_GROUP_SCHEMA_VERSION;
  id: string;
  title: string;
  description: string;
  levelIds: readonly number[];
  unlock: LevelGroupUnlockRule;
}>;
