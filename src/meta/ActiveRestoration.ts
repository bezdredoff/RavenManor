import type { RoomDefinition } from '../data/roomTypes';
import type { RestorationTaskDefinition } from '../data/restorationTasks';
import {
  getRoomRestorationTasks,
  getRestorationTaskStatus,
  type RestorationTaskStatus,
} from './RoomRestoration';
import { getRoomUnlockState } from './RoomProgression';

export type ActiveRestoration = Readonly<{
  task: RestorationTaskDefinition;
  room: RoomDefinition;
  status: RestorationTaskStatus;
  starsMissing: number;
}>;

export function getActiveRestoration(
  rooms: readonly RoomDefinition[],
  tasks: readonly RestorationTaskDefinition[],
  completedTasks: Readonly<Record<string, boolean>>,
  availableStars: number,
): ActiveRestoration | null {
  return findCandidate(false) ?? findCandidate(true);

  function findCandidate(includeOptional: boolean): ActiveRestoration | null {
    for (const room of rooms) {
      if (!getRoomUnlockState(room, tasks, completedTasks).unlocked) continue;
      const roomTasks = getRoomRestorationTasks(tasks, room.id);
      const task = roomTasks.find((candidate) => (
        !completedTasks[candidate.id]
        && (includeOptional || !candidate.optional)
      ));
      if (!task) continue;
      const status = getRestorationTaskStatus(
        task,
        roomTasks,
        completedTasks,
        availableStars,
      );
      if (status === 'locked') continue;
      return {
        task,
        room,
        status,
        starsMissing: Math.max(0, task.starCost - availableStars),
      };
    }
    return null;
  }
}
