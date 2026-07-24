import type { RestorationTaskDefinition } from '../data/restorationTasks';
import type { RestorationTaskStatus } from '../meta/RoomRestoration';

export function getRestorationBlockedMessage(
  status: RestorationTaskStatus,
  task: RestorationTaskDefinition,
  availableStars: number,
): string | null {
  if (status !== 'insufficient-stars') return null;

  const missing = Math.max(0, task.starCost - availableStars);
  return `Недостаточно звёзд. Нужно ещё ${missing} ★ — пройдите или улучшите результат уровня.`;
}
