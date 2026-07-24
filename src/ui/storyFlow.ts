export type StoryContinuation =
  | Readonly<{ kind: 'close' }>
  | Readonly<{ kind: 'level-map' }>
  | Readonly<{ kind: 'level'; levelId: number }>;

/**
 * `undefined` means the story was opened from Home and should simply close.
 * `null` means the story followed the final available level and should return
 * to the level map. A number starts that unlocked unfinished level.
 */
export function resolveStoryContinuation(nextLevelId?: number | null): StoryContinuation {
  if (nextLevelId === undefined) return { kind: 'close' };
  if (nextLevelId === null) return { kind: 'level-map' };
  return { kind: 'level', levelId: nextLevelId };
}

export function getStoryContinueLabel(nextLevelId?: number | null): string {
  const continuation = resolveStoryContinuation(nextLevelId);
  if (continuation.kind === 'level') return 'Следующий уровень';
  if (continuation.kind === 'level-map') return 'К уровням';
  return 'Продолжить';
}
