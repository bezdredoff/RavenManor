import type { LevelGroupDefinition } from '../data/levelGroupTypes';

export type LevelCompletionMap = Readonly<Record<number, boolean>>;

export type LevelGroupState = Readonly<{
  unlocked: boolean;
  completedCount: number;
  totalCount: number;
  requiredCount: number;
  sourceGroupId: string | null;
}>;

export function getCompletedLevelCount(
  group: LevelGroupDefinition,
  completedLevels: LevelCompletionMap,
): number {
  return group.levelIds.filter((levelId) => Boolean(completedLevels[levelId])).length;
}

export function getLevelGroupState(
  group: LevelGroupDefinition,
  groups: readonly LevelGroupDefinition[],
  completedLevels: LevelCompletionMap,
): LevelGroupState {
  const completedCount = getCompletedLevelCount(group, completedLevels);
  if (group.unlock.type === 'always') {
    return {
      unlocked: true,
      completedCount,
      totalCount: group.levelIds.length,
      requiredCount: 0,
      sourceGroupId: null,
    };
  }

  const unlock = group.unlock;
  const sourceGroup = groups.find((candidate) => candidate.id === unlock.groupId);
  if (!sourceGroup) {
    throw new Error(`Unknown source level group: ${unlock.groupId}`);
  }
  const sourceCompletedCount = getCompletedLevelCount(sourceGroup, completedLevels);
  return {
    unlocked: sourceCompletedCount >= unlock.count,
    completedCount,
    totalCount: group.levelIds.length,
    requiredCount: unlock.count,
    sourceGroupId: sourceGroup.id,
  };
}

export function isLevelUnlocked(
  levelId: number,
  groups: readonly LevelGroupDefinition[],
  completedLevels: LevelCompletionMap,
): boolean {
  const group = groups.find((candidate) => candidate.levelIds.includes(levelId));
  if (!group) throw new Error(`Level ${levelId} is not assigned to a progression group.`);
  return getLevelGroupState(group, groups, completedLevels).unlocked;
}
