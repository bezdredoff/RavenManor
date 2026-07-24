import { describe, expect, it } from 'vitest';
import { rooms } from '../src/data/gameData';
import { restorationTasks } from '../src/data/restorationTasks';
import { getRoomUnlockState } from '../src/meta/RoomProgression';

function room(id: string) {
  const result = rooms.find((candidate) => candidate.id === id);
  if (!result) throw new Error(`Unknown room ${id}`);
  return result;
}

describe('room progression', () => {
  it('keeps the hall open from the start', () => {
    expect(getRoomUnlockState(room('hall'), restorationTasks, {}).unlocked).toBe(true);
  });

  it('opens the library after two hall restoration tasks', () => {
    const oneTask = { 'hall-clear-debris': true };
    const twoTasks = {
      'hall-clear-debris': true,
      'hall-light-chandelier': true,
    };
    expect(getRoomUnlockState(room('library'), restorationTasks, oneTask).unlocked).toBe(false);
    expect(getRoomUnlockState(room('library'), restorationTasks, twoTasks).unlocked).toBe(true);
  });

  it('does not count tasks completed in unrelated rooms', () => {
    const completed = {
      'hall-clear-debris': true,
      'library-open-shutters': true,
    };
    expect(getRoomUnlockState(room('library'), restorationTasks, completed).current).toBe(1);
  });

  it('opens the final tower after two crypt restoration tasks', () => {
    const oneTask = { 'crypt-clear-stairs': true };
    const twoTasks = {
      'crypt-clear-stairs': true,
      'crypt-restore-seals': true,
    };
    expect(getRoomUnlockState(room('tower'), restorationTasks, oneTask).unlocked).toBe(false);
    expect(getRoomUnlockState(room('tower'), restorationTasks, twoTasks).unlocked).toBe(true);
  });
});
