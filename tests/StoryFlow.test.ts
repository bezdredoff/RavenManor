import { describe, expect, it } from 'vitest';
import {
  getStoryContinueLabel,
  resolveStoryContinuation,
} from '../src/ui/storyFlow';

describe('story continuation', () => {
  it('simply closes a story opened from Home', () => {
    expect(resolveStoryContinuation()).toEqual({ kind: 'close' });
    expect(getStoryContinueLabel()).toBe('Продолжить');
  });

  it('starts the next level after a post-win scene', () => {
    expect(resolveStoryContinuation(4)).toEqual({ kind: 'level', levelId: 4 });
    expect(getStoryContinueLabel(4)).toBe('Следующий уровень');
  });

  it('returns to the level map after the final available level', () => {
    expect(resolveStoryContinuation(null)).toEqual({ kind: 'level-map' });
    expect(getStoryContinueLabel(null)).toBe('К уровням');
  });
});
