import { describe, expect, it } from 'vitest';
import {
  getStoryContinueLabel,
  resolveStoryContinuation,
} from '../src/ui/storyFlow';

describe('story continuation', () => {
  it('returns a story opened from Home back to Home', () => {
    expect(resolveStoryContinuation()).toEqual({ kind: 'home' });
    expect(getStoryContinueLabel()).toBe('Продолжить');
  });

  it('returns a replay opened from the journal back to the journal', () => {
    expect(resolveStoryContinuation(undefined, 'journal')).toEqual({ kind: 'journal' });
    expect(getStoryContinueLabel(undefined, 'journal')).toBe('Вернуться в дневник');
  });

  it('starts the next level after a post-win scene', () => {
    expect(resolveStoryContinuation(4, 'journal')).toEqual({ kind: 'level', levelId: 4 });
    expect(getStoryContinueLabel(4, 'journal')).toBe('Следующий уровень');
  });

  it('returns to the level map after the final available level', () => {
    expect(resolveStoryContinuation(null)).toEqual({ kind: 'level-map' });
    expect(getStoryContinueLabel(null)).toBe('К уровням');
  });
});
