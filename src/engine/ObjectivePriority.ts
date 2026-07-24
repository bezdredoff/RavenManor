import type { ObstacleKind } from './ObstacleTypes';

export type CollectPriority = Readonly<{
  tileType: number;
  remaining: number;
}>;

export type ObstaclePriority = Readonly<{
  kind: ObstacleKind;
  remaining: number;
}>;

export type ObjectivePriority = Readonly<{
  collects: readonly CollectPriority[];
  obstacles: readonly ObstaclePriority[];
}>;

export type LegacyObjectivePriority = Readonly<{
  tileType: number;
  remaining: number;
}>;

export type ObjectivePriorityInput = ObjectivePriority | LegacyObjectivePriority | number;

export function normalizeObjectivePriority(
  priority: ObjectivePriorityInput,
): ObjectivePriority {
  if (typeof priority === 'number') {
    return { collects: [{ tileType: priority, remaining: Number.MAX_SAFE_INTEGER }], obstacles: [] };
  }
  if ('collects' in priority) return priority;
  return {
    collects: [{ tileType: priority.tileType, remaining: priority.remaining }],
    obstacles: [],
  };
}
