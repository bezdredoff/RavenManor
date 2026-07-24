import { describe, expect, it } from 'vitest';
import { ClearObstacleObjective } from '../src/objectives/ClearObstacleObjective';
import { ObjectiveTracker } from '../src/objectives/ObjectiveTracker';
import { CollectObjective } from '../src/objectives/CollectObjective';

it('counts only cleared obstacles of the configured kind', () => {
  const objective = new ClearObstacleObjective({ id: 'fog', obstacleKind: 'fog', target: 2 });
  objective.handle({ type: 'obstacles-cleared', obstacleKinds: ['rubble', 'fog'] });
  expect(objective.getSnapshot()).toMatchObject({ current: 1, complete: false });
  objective.handle({ type: 'obstacles-cleared', obstacleKinds: ['fog', 'fog'] });
  expect(objective.getSnapshot()).toMatchObject({ current: 2, complete: true });
});

describe('mixed objective tracker', () => {
  it('requires both collection and obstacle cleanup', () => {
    const tracker = new ObjectiveTracker([
      new CollectObjective({ id: 'roses', tileType: 0, target: 2 }),
      new ClearObstacleObjective({ id: 'chains', obstacleKind: 'chain', target: 1 }),
    ]);
    tracker.handle({ type: 'tiles-removed', tileTypes: [0, 0] });
    expect(tracker.isComplete).toBe(false);
    tracker.handle({ type: 'obstacles-cleared', obstacleKinds: ['chain'] });
    expect(tracker.isComplete).toBe(true);
  });
});
