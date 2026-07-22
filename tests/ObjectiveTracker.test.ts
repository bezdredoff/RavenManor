import { describe, expect, it } from 'vitest';
import {
  type LevelObjective,
  type ObjectiveEvent,
  type ObjectiveSnapshot,
} from '../src/objectives/LevelObjective';
import { ObjectiveTracker } from '../src/objectives/ObjectiveTracker';

class CountingObjective implements LevelObjective {
  readonly kind = 'test-count';
  private current = 0;

  constructor(
    readonly id: string,
    private readonly target: number,
    private readonly trackedTile: number,
  ) {}

  handle(event: ObjectiveEvent): void {
    if (event.type !== 'tiles-removed') return;

    this.current = Math.min(
      this.target,
      this.current + event.tileTypes.filter((tile) => tile === this.trackedTile).length,
    );
  }

  getSnapshot(): ObjectiveSnapshot {
    return {
      id: this.id,
      kind: this.kind,
      current: this.current,
      target: this.target,
      complete: this.current >= this.target,
    };
  }

  reset(): void {
    this.current = 0;
  }
}

describe('ObjectiveTracker', () => {
  it('starts incomplete and exposes immutable progress snapshots', () => {
    const tracker = new ObjectiveTracker([
      new CountingObjective('roses', 3, 0),
    ]);

    expect(tracker.isComplete).toBe(false);
    expect(tracker.snapshots).toEqual([
      {
        id: 'roses',
        kind: 'test-count',
        current: 0,
        target: 3,
        complete: false,
      },
    ]);
  });

  it('forwards gameplay events to every objective', () => {
    const tracker = new ObjectiveTracker([
      new CountingObjective('roses', 2, 0),
      new CountingObjective('candles', 1, 1),
    ]);

    tracker.handle({
      type: 'tiles-removed',
      tileTypes: [0, 1, 0, 4],
    });

    expect(tracker.snapshots).toEqual([
      {
        id: 'roses',
        kind: 'test-count',
        current: 2,
        target: 2,
        complete: true,
      },
      {
        id: 'candles',
        kind: 'test-count',
        current: 1,
        target: 1,
        complete: true,
      },
    ]);
    expect(tracker.isComplete).toBe(true);
  });

  it('requires every objective to be complete', () => {
    const tracker = new ObjectiveTracker([
      new CountingObjective('roses', 1, 0),
      new CountingObjective('candles', 2, 1),
    ]);

    tracker.handle({
      type: 'tiles-removed',
      tileTypes: [0, 1],
    });

    expect(tracker.snapshots[0].complete).toBe(true);
    expect(tracker.snapshots[1].complete).toBe(false);
    expect(tracker.isComplete).toBe(false);
  });

  it('resets every objective', () => {
    const tracker = new ObjectiveTracker([
      new CountingObjective('roses', 1, 0),
      new CountingObjective('candles', 1, 1),
    ]);

    tracker.handle({
      type: 'tiles-removed',
      tileTypes: [0, 1],
    });
    expect(tracker.isComplete).toBe(true);

    tracker.reset();

    expect(tracker.isComplete).toBe(false);
    expect(tracker.snapshots.map((snapshot) => snapshot.current)).toEqual([0, 0]);
  });

  it('does not consider an empty objective list complete', () => {
    const tracker = new ObjectiveTracker([]);

    expect(tracker.snapshots).toEqual([]);
    expect(tracker.isComplete).toBe(false);
  });
});
