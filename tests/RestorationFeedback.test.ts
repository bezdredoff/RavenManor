import { describe, expect, it } from 'vitest';
import type { RestorationTaskDefinition } from '../src/data/restorationTasks';
import { getRestorationBlockedMessage } from '../src/ui/restorationFeedback';

const task: RestorationTaskDefinition = {
  id: 'hall-1',
  roomId: 'hall',
  title: 'Расчистить вход',
  description: 'Убрать обломки',
  starCost: 2,
  order: 1,
};

describe('restoration feedback', () => {
  it('explains how many stars are missing', () => {
    expect(getRestorationBlockedMessage('insufficient-stars', task, 0))
      .toContain('ещё 2 ★');
    expect(getRestorationBlockedMessage('insufficient-stars', task, 1))
      .toContain('ещё 1 ★');
  });

  it('does not show an insufficient-stars message for other statuses', () => {
    expect(getRestorationBlockedMessage('available', task, 2)).toBeNull();
    expect(getRestorationBlockedMessage('locked', task, 2)).toBeNull();
    expect(getRestorationBlockedMessage('completed', task, 2)).toBeNull();
  });
});
