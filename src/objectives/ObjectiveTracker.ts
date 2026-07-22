import {
  type LevelObjective,
  type ObjectiveEvent,
  type ObjectiveSnapshot,
} from './LevelObjective';

/**
 * Coordinates all objectives belonging to one level.
 *
 * It does not know the rules of collect, blocker, score, or future objective
 * types. It only forwards gameplay events and aggregates completion state.
 */
export class ObjectiveTracker {
  private readonly objectives: LevelObjective[];

  constructor(objectives: readonly LevelObjective[]) {
    this.objectives = [...objectives];
  }

  handle(event: ObjectiveEvent): readonly ObjectiveSnapshot[] {
    for (const objective of this.objectives) {
      objective.handle(event);
    }

    return this.snapshots;
  }

  get snapshots(): readonly ObjectiveSnapshot[] {
    return this.objectives.map((objective) => objective.getSnapshot());
  }

  get isComplete(): boolean {
    return this.objectives.length > 0
      && this.objectives.every((objective) => objective.getSnapshot().complete);
  }

  reset(): void {
    for (const objective of this.objectives) {
      objective.reset();
    }
  }
}
