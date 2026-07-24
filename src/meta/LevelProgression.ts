import type { LevelGroupDefinition } from '../data/levelGroupTypes';

export type LevelCompletionMap = Readonly<Record<number, boolean>>;
export type RestorationCompletionMap = Readonly<Record<string, boolean>>;

export type LevelGroupState = Readonly<{
  unlocked: boolean;
  completedCount: number;
  totalCount: number;
  requiredCount: number;
  sourceGroupId: string | null;
  requiredTaskId: string | null;
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
  completedRestorationTasks: RestorationCompletionMap = {},
): LevelGroupState {
  const completedCount = getCompletedLevelCount(group, completedLevels);
  if (group.unlock.type === 'always') {
    return {
      unlocked: true,
      completedCount,
      totalCount: group.levelIds.length,
      requiredCount: 0,
      sourceGroupId: null,
      requiredTaskId: null,
    };
  }

  if (group.unlock.type === 'restoration-task') {
    return {
      // Saves created before FEATURE-050 may already contain wins in this group.
      // Keep those groups replayable instead of taking content away during migration.
      unlocked: Boolean(completedRestorationTasks[group.unlock.taskId]) || completedCount > 0,
      completedCount,
      totalCount: group.levelIds.length,
      requiredCount: 1,
      sourceGroupId: null,
      requiredTaskId: group.unlock.taskId,
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
    requiredTaskId: null,
  };
}

export function isLevelUnlocked(
  levelId: number,
  groups: readonly LevelGroupDefinition[],
  completedLevels: LevelCompletionMap,
  completedRestorationTasks: RestorationCompletionMap = {},
): boolean {
  const group = groups.find((candidate) => candidate.levelIds.includes(levelId));
  if (!group) throw new Error(`Level ${levelId} is not assigned to a progression group.`);
  return getLevelGroupState(
    group,
    groups,
    completedLevels,
    completedRestorationTasks,
  ).unlocked;
}

/**
 * Returns the next unlocked, not-yet-completed level in catalog order.
 * Search starts after the current level and wraps once. Restoration gates are
 * respected, so the result becomes null when the player should return to the
 * manor before continuing into the next group.
 */
export function getNextPlayableLevelId(
  currentLevelId: number,
  levelIds: readonly number[],
  groups: readonly LevelGroupDefinition[],
  completedLevels: LevelCompletionMap,
  completedRestorationTasks: RestorationCompletionMap = {},
): number | null {
  const currentIndex = levelIds.indexOf(currentLevelId);
  const orderedCandidates = currentIndex >= 0
    ? [...levelIds.slice(currentIndex + 1), ...levelIds.slice(0, currentIndex)]
    : [...levelIds];

  return orderedCandidates.find((levelId) => (
    !completedLevels[levelId]
    && isLevelUnlocked(levelId, groups, completedLevels, completedRestorationTasks)
  )) ?? null;
}
