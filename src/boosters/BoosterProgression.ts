import type { RestorationTaskDefinition } from '../data/restorationTasks';
import type { BoosterKind } from './BoosterTypes';

export function isBoosterUnlocked(
  kind: BoosterKind,
  tasks: readonly RestorationTaskDefinition[],
  completedTasks: Readonly<Record<string, boolean>>,
): boolean {
  return tasks.some((task) => (
    Boolean(completedTasks[task.id])
    && task.unlocks?.some((unlock) => unlock.type === 'booster' && unlock.booster === kind)
  ));
}

export function getBoosterUnlockTask(
  kind: BoosterKind,
  tasks: readonly RestorationTaskDefinition[],
): RestorationTaskDefinition | null {
  return tasks.find((task) => task.unlocks?.some((unlock) => (
    unlock.type === 'booster' && unlock.booster === kind
  ))) ?? null;
}
