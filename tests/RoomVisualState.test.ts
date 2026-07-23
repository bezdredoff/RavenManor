import { describe, expect, it } from 'vitest';
import { restorationTasks } from '../src/data/restorationTasks';
import { roomVisuals } from '../src/data/roomVisuals';
import { getRoomVisualState } from '../src/meta/RoomVisualState';

function getHallState(completedTasks: Record<string, boolean> = {}) {
  return getRoomVisualState(
    'hall',
    roomVisuals,
    restorationTasks,
    completedTasks,
  );
}

describe('Room visual state', () => {
  it('starts at stage zero for an untouched room', () => {
    const state = getHallState();

    expect(state.completedTaskCount).toBe(0);
    expect(state.totalTaskCount).toBe(3);
    expect(state.stage.completedTasks).toBe(0);
    expect(state.stage.assetKey).toBe('rooms/hall/stage-0-ruined');
    expect(state.isComplete).toBe(false);
  });

  it('advances one visual stage for each completed room task', () => {
    const state = getHallState({
      'hall-clear-debris': true,
      'hall-light-chandelier': true,
    });

    expect(state.completedTaskCount).toBe(2);
    expect(state.stage.completedTasks).toBe(2);
    expect(state.stage.assetKey).toBe('rooms/hall/stage-2-lit');
  });

  it('marks the room complete after its final restoration task', () => {
    const state = getHallState({
      'hall-clear-debris': true,
      'hall-light-chandelier': true,
      'hall-restore-portrait': true,
    });

    expect(state.stage.completedTasks).toBe(3);
    expect(state.isComplete).toBe(true);
  });

  it('ignores completed tasks from other rooms', () => {
    const state = getHallState({
      'library-open-shutters': true,
    });

    expect(state.completedTaskCount).toBe(0);
    expect(state.stage.completedTasks).toBe(0);
  });

  it('defines exactly one visual stage per restoration state for every room', () => {
    for (const visual of roomVisuals) {
      const taskCount = restorationTasks.filter((task) => task.roomId === visual.roomId).length;
      expect(visual.stages).toHaveLength(taskCount + 1);
      expect(visual.stages.map((stage) => stage.completedTasks)).toEqual(
        Array.from({ length: taskCount + 1 }, (_, index) => index),
      );
    }
  });
});
