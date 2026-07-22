import type {
  LevelObjective,
  ObjectiveEvent,
  ObjectiveSnapshot,
} from './LevelObjective';

export type CollectObjectiveConfig = Readonly<{
  id: string;
  tileType: number;
  target: number;
}>;

export type CollectObjectiveSnapshot = ObjectiveSnapshot & Readonly<{
  kind: 'collect';
  tileType: number;
}>;

/**
 * Counts removed tiles of one configured type.
 *
 * Progress is clamped to the target so UI and completion state stay stable
 * when a cascade removes more tiles than the level still requires.
 */
export class CollectObjective implements LevelObjective {
  readonly kind = 'collect';
  readonly id: string;
  readonly tileType: number;

  private readonly target: number;
  private current = 0;

  constructor(config: CollectObjectiveConfig) {
    if (!Number.isInteger(config.tileType) || config.tileType < 0) {
      throw new Error('CollectObjective tileType must be a non-negative integer.');
    }

    if (!Number.isInteger(config.target) || config.target <= 0) {
      throw new Error('CollectObjective target must be a positive integer.');
    }

    if (config.id.trim().length === 0) {
      throw new Error('CollectObjective id must not be empty.');
    }

    this.id = config.id;
    this.tileType = config.tileType;
    this.target = config.target;
  }

  handle(event: ObjectiveEvent): void {
    if (event.type !== 'tiles-removed' || this.current >= this.target) return;

    const collected = event.tileTypes.reduce(
      (count, tileType) => count + Number(tileType === this.tileType),
      0,
    );

    this.current = Math.min(this.target, this.current + collected);
  }

  getSnapshot(): CollectObjectiveSnapshot {
    return {
      id: this.id,
      kind: this.kind,
      tileType: this.tileType,
      current: this.current,
      target: this.target,
      complete: this.current >= this.target,
    };
  }

  reset(): void {
    this.current = 0;
  }
}
