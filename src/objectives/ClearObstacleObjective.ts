import type { ObstacleKind } from '../engine/ObstacleTypes';
import type {
  LevelObjective,
  ObjectiveEvent,
  ObjectiveSnapshot,
} from './LevelObjective';

export type ClearObstacleObjectiveConfig = Readonly<{
  id: string;
  obstacleKind: ObstacleKind;
  target: number;
}>;

export type ClearObstacleObjectiveSnapshot = ObjectiveSnapshot & Readonly<{
  kind: 'clear-obstacle';
  obstacleKind: ObstacleKind;
}>;

export class ClearObstacleObjective implements LevelObjective {
  readonly kind = 'clear-obstacle';
  readonly id: string;
  readonly obstacleKind: ObstacleKind;

  private readonly target: number;
  private current = 0;

  constructor(config: ClearObstacleObjectiveConfig) {
    if (config.id.trim().length === 0) {
      throw new Error('ClearObstacleObjective id must not be empty.');
    }
    if (!Number.isInteger(config.target) || config.target <= 0) {
      throw new Error('ClearObstacleObjective target must be a positive integer.');
    }

    this.id = config.id;
    this.obstacleKind = config.obstacleKind;
    this.target = config.target;
  }

  handle(event: ObjectiveEvent): void {
    if (event.type !== 'obstacles-cleared' || this.current >= this.target) return;
    const cleared = event.obstacleKinds.reduce(
      (count, kind) => count + Number(kind === this.obstacleKind),
      0,
    );
    this.current = Math.min(this.target, this.current + cleared);
  }

  getSnapshot(): ClearObstacleObjectiveSnapshot {
    return {
      id: this.id,
      kind: this.kind,
      obstacleKind: this.obstacleKind,
      current: this.current,
      target: this.target,
      complete: this.current >= this.target,
    };
  }

  reset(): void {
    this.current = 0;
  }
}
