import { describe, expect, it } from 'vitest';
import { rooms } from '../src/data/gameData';
import { restorationTasks } from '../src/data/restorationTasks';
import { getActiveRestoration } from '../src/meta/ActiveRestoration';

describe('active restoration objective', () => {
  it('points to the first hall task for a new player', () => {
    const active = getActiveRestoration(rooms, restorationTasks, {}, 0);
    expect(active?.task.id).toBe('hall-clear-debris');
    expect(active?.starsMissing).toBe(1);
  });

  it('moves to the library after the hall gate is complete', () => {
    const completed = {
      'hall-clear-debris': true,
      'hall-light-chandelier': true,
      'hall-restore-portrait': true,
    };
    const active = getActiveRestoration(rooms, restorationTasks, completed, 1);
    expect(active?.room.id).toBe('library');
    expect(active?.task.id).toBe('library-open-shutters');
    expect(active?.status).toBe('available');
  });
});
