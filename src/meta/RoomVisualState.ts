import type { RestorationTaskDefinition } from '../data/restorationTasks';
import type {
  RoomVisualDefinition,
  RoomVisualStageDefinition,
} from '../data/roomVisuals';
import type { CompletedRestorationTasks } from './RoomRestoration';
import { getRoomRestorationTasks } from './RoomRestoration';

export type RoomVisualState = {
  definition: RoomVisualDefinition;
  stage: RoomVisualStageDefinition;
  completedTaskCount: number;
  totalTaskCount: number;
  isComplete: boolean;
};

export function getRoomVisualState(
  roomId: string,
  visualDefinitions: readonly RoomVisualDefinition[],
  restorationTasks: readonly RestorationTaskDefinition[],
  completedTasks: CompletedRestorationTasks,
): RoomVisualState {
  const definition = visualDefinitions.find((candidate) => candidate.roomId === roomId);
  if (!definition) throw new Error(`Missing visual definition for room: ${roomId}`);

  const roomTasks = getRoomRestorationTasks(restorationTasks, roomId);
  const completedTaskCount = roomTasks.filter((task) => completedTasks[task.id]).length;
  const totalTaskCount = roomTasks.length;

  if (definition.stages.length !== totalTaskCount + 1) {
    throw new Error(
      `Room ${roomId} must define ${totalTaskCount + 1} visual stages, `
      + `but defines ${definition.stages.length}.`,
    );
  }

  const stage = definition.stages.find(
    (candidate) => candidate.completedTasks === completedTaskCount,
  );

  if (!stage) {
    throw new Error(
      `Room ${roomId} does not define a visual stage for ${completedTaskCount} completed tasks.`,
    );
  }

  return {
    definition,
    stage,
    completedTaskCount,
    totalTaskCount,
    isComplete: totalTaskCount > 0 && completedTaskCount === totalTaskCount,
  };
}
