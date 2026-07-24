# Booster runtime

## Inventory

The persistent `ProgressState.boosters` object stores integer counts for:

```ts
{ hammer: number; shuffle: number }
```

It remains inside the existing `ravenManorStateV4` save. No storage key
migration is required. Saves created before FEATURE-050 have no booster field;
on first load they receive the rewards associated with restoration tasks they
had already completed.

## Unlocks and rewards

`RestorationTaskDefinition` may define:

- `rewards`: booster quantities granted exactly once when the task completes;
- `unlocks`: booster, level-group, or mechanic announcements;
- `optional`: task is skipped by active progression guidance;
- `roomCompletionReward`: labels a full-room reward.

The completed restoration task remains the source of truth. Separate reward
claim flags are unnecessary because a task cannot complete twice.

## Silver Hammer

The hammer targets one active cell and does not consume a move.

- ordinary tile: removes the tile and any special on it;
- chain/fog: removes one layer and keeps the covered tile;
- rubble: removes one layer; a cleared cell becomes available to gravity.

The resulting tile and obstacle events update normal objectives. Collapse and
natural cascades then resolve through the same special-tile runtime as a move.

## Shuffle

Shuffle calls the existing special-aware `Match3Engine.reshuffle()`.

- no move is consumed;
- obstacles and board masks remain fixed;
- ordinary and special tiles move together;
- the result contains no immediate match and at least one legal move;
- the inventory is spent only after a successful reshuffle.

## Save compatibility

Completed levels inside a newly restoration-gated group grandfather that group
as unlocked. This prevents FEATURE-050 from taking replayable content away from
existing playtest saves.
