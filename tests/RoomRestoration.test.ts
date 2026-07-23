import { describe, expect, it } from 'vitest';
import type { RestorationTaskDefinition } from '../src/data/restorationTasks';
import {
  completeRestorationTask,
  getAvailableStars,
  getRestorationTaskStatus,
  getRoomRestorationTasks,
  getSpentStars,
} from '../src/meta/RoomRestoration';

const tasks: RestorationTaskDefinition[] = [
  {
    id: 'hall-1',
    roomId: 'hall',
    title: 'First',
    description: 'First task',
    starCost: 1,
    order: 1,
  },
  {
    id: 'hall-2',
    roomId: 'hall',
    title: 'Second',
    description: 'Second task',
    starCost: 2,
    order: 2,
  },
  {
    id: 'library-1',
    roomId: 'library',
    title: 'Library',
    description: 'Library task',
    starCost: 1,
    order: 1,
  },
];

describe('RoomRestoration', () => {
  it('returns room tasks in their configured order', () => {
    expect(getRoomRestorationTasks([...tasks].reverse(), 'hall').map((task) => task.id))
      .toEqual(['hall-1', 'hall-2']);
  });

  it('subtracts completed task costs from available stars', () => {
    const completed = { 'hall-1': true };

    expect(getSpentStars(tasks, completed)).toBe(1);
    expect(getAvailableStars(3, tasks, completed)).toBe(2);
  });

  it('locks later tasks until previous room tasks are complete', () => {
    const hallTasks = getRoomRestorationTasks(tasks, 'hall');

    expect(getRestorationTaskStatus(hallTasks[0], hallTasks, {}, 1)).toBe('available');
    expect(getRestorationTaskStatus(hallTasks[1], hallTasks, {}, 3)).toBe('locked');
  });

  it('reports insufficient stars for the next unlocked task', () => {
    const completed = { 'hall-1': true };
    const hallTasks = getRoomRestorationTasks(tasks, 'hall');

    expect(getRestorationTaskStatus(hallTasks[1], hallTasks, completed, 1))
      .toBe('insufficient-stars');
  });

  it('completes an available task without mutating the previous state', () => {
    const completed = {};
    const updated = completeRestorationTask('hall-1', tasks, completed, 1);

    expect(completed).toEqual({});
    expect(updated).toEqual({ 'hall-1': true });
  });

  it('rejects locked or unaffordable tasks', () => {
    expect(() => completeRestorationTask('hall-2', tasks, {}, 3)).toThrow(/locked/);
    expect(() => completeRestorationTask('hall-1', tasks, {}, 0)).toThrow(/insufficient-stars/);
  });
});
