import type { RestorationTaskDefinition } from '../data/restorationTasks';

export type CompletedRestorationTasks = Record<string, boolean>;

export type RestorationTaskStatus =
  | 'completed'
  | 'available'
  | 'insufficient-stars'
  | 'locked';

export function getRoomRestorationTasks(
  tasks: readonly RestorationTaskDefinition[],
  roomId: string,
): RestorationTaskDefinition[] {
  return tasks
    .filter((task) => task.roomId === roomId)
    .sort((left, right) => left.order - right.order);
}

export function getRestorationTaskStatus(
  task: RestorationTaskDefinition,
  roomTasks: readonly RestorationTaskDefinition[],
  completedTasks: CompletedRestorationTasks,
  availableStars: number,
): RestorationTaskStatus {
  if (completedTasks[task.id]) return 'completed';

  const previousIncomplete = roomTasks.some(
    (candidate) => candidate.order < task.order && !completedTasks[candidate.id],
  );

  if (previousIncomplete) return 'locked';
  if (availableStars < task.starCost) return 'insufficient-stars';
  return 'available';
}

export function completeRestorationTask(
  taskId: string,
  tasks: readonly RestorationTaskDefinition[],
  completedTasks: CompletedRestorationTasks,
  availableStars: number,
): CompletedRestorationTasks {
  const task = tasks.find((candidate) => candidate.id === taskId);
  if (!task) throw new Error(`Unknown restoration task: ${taskId}`);

  const roomTasks = getRoomRestorationTasks(tasks, task.roomId);
  const status = getRestorationTaskStatus(
    task,
    roomTasks,
    completedTasks,
    availableStars,
  );

  if (status === 'completed') return { ...completedTasks };
  if (status !== 'available') {
    throw new Error(`Restoration task ${taskId} cannot be completed while status is ${status}.`);
  }

  return {
    ...completedTasks,
    [task.id]: true,
  };
}
