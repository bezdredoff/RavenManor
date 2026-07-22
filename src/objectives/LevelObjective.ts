export type TilesRemovedEvent = Readonly<{
  type: 'tiles-removed';
  tileTypes: readonly number[];
}>;

export type ObjectiveEvent = TilesRemovedEvent;

export type ObjectiveSnapshot = Readonly<{
  id: string;
  kind: string;
  current: number;
  target: number;
  complete: boolean;
}>;

/**
 * Runtime contract for a single level objective.
 *
 * Concrete objective types own their progress rules. The match-3 engine and UI
 * communicate with them only through events and immutable snapshots.
 */
export interface LevelObjective {
  readonly id: string;
  readonly kind: string;

  handle(event: ObjectiveEvent): void;
  getSnapshot(): ObjectiveSnapshot;
  reset(): void;
}
