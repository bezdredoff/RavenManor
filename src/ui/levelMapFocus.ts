export type LevelGroupFocusState = Readonly<{
  id: string;
  unlocked: boolean;
  completedCount: number;
  totalCount: number;
}>;

export function getLevelMapFocusGroupId(
  groupStates: readonly LevelGroupFocusState[],
): string | null {
  let lastUnlocked: LevelGroupFocusState | null = null;
  let lastUnlockedIncomplete: LevelGroupFocusState | null = null;

  for (const state of groupStates) {
    if (!state.unlocked) continue;
    lastUnlocked = state;
    if (state.completedCount < state.totalCount) lastUnlockedIncomplete = state;
  }

  return lastUnlockedIncomplete?.id ?? lastUnlocked?.id ?? null;
}
