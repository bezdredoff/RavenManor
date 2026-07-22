# Level Objectives Architecture

## Purpose

Level objectives are runtime objects separated from `GameApp` and from the
match-3 board implementation.

## Contract

`LevelObjective` receives gameplay events and exposes immutable
`ObjectiveSnapshot` values:

- `id` — unique objective instance identifier;
- `kind` — objective implementation type;
- `current` — current progress;
- `target` — required progress;
- `complete` — completion state.

`ObjectiveTracker` owns the objectives of the current level, forwards gameplay
events to them and reports whether every objective is complete.

## Dependency direction

```text
Match3 result → ObjectiveEvent → ObjectiveTracker → LevelObjective
                                            ↓
                                  ObjectiveSnapshot → UI
```

The objective layer must not depend on DOM, navigation, CSS or localStorage.

## Gameplay events

The current objective system supports:

- `tiles-removed` — contains the tile type identifiers removed by one match or
  cascade step.

Each cascade step sends its own event. Objective implementations decide which
removed tiles contribute to their progress.

## Collect objective

`CollectObjective` counts removed tiles of one configured type:

```ts
new CollectObjective({
  id: 'level-1-collect',
  tileType: 0,
  target: 12,
});
```

Its snapshot additionally exposes `tileType`, allowing the UI to resolve the
appropriate icon and name without reading mutable objective state.

Progress is clamped at the configured target. Removing more tiles than required
does not produce values such as `14 / 12`.

## Current integration

`GameApp` creates one `CollectObjective` from the existing level fields:

- `targetTile`;
- `targetCount`.

After every call to `clearMatches`, the removed tile identifiers are sent to
`ObjectiveTracker`. The level is won when `ObjectiveTracker.isComplete` becomes
true.

The visible behaviour of the existing ten levels remains unchanged.

## Extension

Future objective types may add events for blockers, score, item drops or board
cells without moving those rules into `GameApp`.
