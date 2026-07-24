import { describe, expect, it } from 'vitest';
import { levels } from '../src/data/gameData';

const roomArcs = [
  levels.slice(0, 6),
  levels.slice(6, 12),
  levels.slice(12, 18),
  levels.slice(18, 24),
  levels.slice(24, 30),
];

describe('first chapter balance envelope', () => {
  it('keeps every level inside the prototype move envelope', () => {
    for (const level of levels) {
      expect(level.moves).toBeGreaterThanOrEqual(18);
      expect(level.moves).toBeLessThanOrEqual(34);
      expect(level.starThresholds.twoStarsMovesLeft)
        .toBeLessThan(level.starThresholds.threeStarsMovesLeft);
      expect(level.starThresholds.threeStarsMovesLeft).toBeLessThan(level.moves);
    }
  });

  it('resets difficulty at the start of each new room and ends with a finale', () => {
    for (const arc of roomArcs) {
      expect(arc[0].difficulty).toBe('easy');
      expect(arc[5].difficulty).toBe('finale');
    }
  });

  it('limits objective density before late-room challenges', () => {
    for (const arc of roomArcs) {
      expect(arc[0].objectives.length).toBeLessThanOrEqual(2);
      expect(arc[1].objectives.length).toBeLessThanOrEqual(2);
      expect(arc[5].objectives.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('keeps obstacle placements on active, unique cells', () => {
    for (const level of levels) {
      const positions = new Set<string>();
      for (const obstacle of level.board.obstacles) {
        expect(level.board.mask[obstacle.row][obstacle.col]).toBe('1');
        const key = `${obstacle.row},${obstacle.col}`;
        expect(positions.has(key)).toBe(false);
        positions.add(key);
      }
    }
  });
});
