export type StoryReturnTarget = 'home' | 'journal';

export type StoryContinuation =
  | Readonly<{ kind: 'home' }>
  | Readonly<{ kind: 'journal' }>
  | Readonly<{ kind: 'level-map' }>
  | Readonly<{ kind: 'level'; levelId: number }>;

/**
 * `undefined` means the story was opened outside a level result and returns to
 * its explicit source. `null` means the story followed the final available
 * level and should return to the level map. A number starts that unlocked
 * unfinished level.
 */
export function resolveStoryContinuation(
  nextLevelId?: number | null,
  returnTarget: StoryReturnTarget = 'home',
): StoryContinuation {
  if (nextLevelId === undefined) {
    return returnTarget === 'journal' ? { kind: 'journal' } : { kind: 'home' };
  }
  if (nextLevelId === null) return { kind: 'level-map' };
  return { kind: 'level', levelId: nextLevelId };
}

export function getStoryContinueLabel(
  nextLevelId?: number | null,
  returnTarget: StoryReturnTarget = 'home',
): string {
  const continuation = resolveStoryContinuation(nextLevelId, returnTarget);
  if (continuation.kind === 'level') return 'Следующий уровень';
  if (continuation.kind === 'level-map') return 'К уровням';
  if (continuation.kind === 'journal') return 'Вернуться в дневник';
  return 'Продолжить';
}
