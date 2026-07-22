import { describe, expect, it } from 'vitest';
import { CollectObjective } from '../src/objectives/CollectObjective';
import { ObjectiveTracker } from '../src/objectives/ObjectiveTracker';

describe('CollectObjective', () => {
  it('starts with zero progress', () => {
    const objective = new CollectObjective({
      id: 'collect-roses',
      tileType: 0,
      target: 5,
    });

    expect(objective.getSnapshot()).toEqual({
      id: 'collect-roses',
      kind: 'collect',
      tileType: 0,
      current: 0,
      target: 5,
      complete: false,
    });
  });

  it('counts only removed tiles of the configured type', () => {
    const objective = new CollectObjective({
      id: 'collect-candles',
      tileType: 1,
      target: 4,
    });

    objective.handle({
      type: 'tiles-removed',
      tileTypes: [1, 3, 1, 4, 1],
    });

    expect(objective.getSnapshot().current).toBe(3);
    expect(objective.getSnapshot().complete).toBe(false);
  });

  it('accumulates progress across cascades and clamps at the target', () => {
    const objective = new CollectObjective({
      id: 'collect-keys',
      tileType: 2,
      target: 5,
    });

    objective.handle({ type: 'tiles-removed', tileTypes: [2, 2, 0] });
    objective.handle({ type: 'tiles-removed', tileTypes: [2, 2, 2, 2] });

    expect(objective.getSnapshot().current).toBe(5);
    expect(objective.getSnapshot().complete).toBe(true);
  });

  it('works through ObjectiveTracker completion state', () => {
    const objective = new CollectObjective({
      id: 'collect-bats',
      tileType: 4,
      target: 3,
    });
    const tracker = new ObjectiveTracker([objective]);

    tracker.handle({ type: 'tiles-removed', tileTypes: [4, 1, 4] });
    expect(tracker.isComplete).toBe(false);

    tracker.handle({ type: 'tiles-removed', tileTypes: [4] });
    expect(tracker.isComplete).toBe(true);
  });

  it('resets collected progress', () => {
    const objective = new CollectObjective({
      id: 'collect-scrolls',
      tileType: 5,
      target: 2,
    });

    objective.handle({ type: 'tiles-removed', tileTypes: [5, 5] });
    expect(objective.getSnapshot().complete).toBe(true);

    objective.reset();

    expect(objective.getSnapshot().current).toBe(0);
    expect(objective.getSnapshot().complete).toBe(false);
  });

  it('rejects invalid configuration', () => {
    expect(() => new CollectObjective({
      id: 'invalid-tile',
      tileType: -1,
      target: 3,
    })).toThrow(/tileType/);

    expect(() => new CollectObjective({
      id: 'invalid-target',
      tileType: 0,
      target: 0,
    })).toThrow(/target/);
  });
});
