import type { RoomDefinition } from '../data/gameData';
import type { RestorationTaskDefinition } from '../data/restorationTasks';

export type RoomUnlockState = Readonly<{
  unlocked: boolean;
  current: number;
  required: number;
  sourceRoomId: string | null;
}>;

export function getCompletedRestorationCount(
  roomId: string,
  restorationTasks: readonly RestorationTaskDefinition[],
  completedTasks: Readonly<Record<string, boolean>>,
): number {
  return restorationTasks.filter(
    (task) => task.roomId === roomId && completedTasks[task.id],
  ).length;
}

export function getRoomUnlockState(
  room: RoomDefinition,
  restorationTasks: readonly RestorationTaskDefinition[],
  completedTasks: Readonly<Record<string, boolean>>,
): RoomUnlockState {
  if (room.unlock.type === 'always') {
    return { unlocked: true, current: 0, required: 0, sourceRoomId: null };
  }

  const current = getCompletedRestorationCount(
    room.unlock.roomId,
    restorationTasks,
    completedTasks,
  );
  return {
    unlocked: current >= room.unlock.completedTasks,
    current,
    required: room.unlock.completedTasks,
    sourceRoomId: room.unlock.roomId,
  };
}
