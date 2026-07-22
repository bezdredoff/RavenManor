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

## Current event

FEATURE-006 introduces one event required by the existing prototype:

- `tiles-removed` with the removed tile type identifiers.

FEATURE-007 will add the concrete collect objective and connect the current game
flow to this contract.

## Extension

Future objective types may add events for blockers, score, item drops or board
cells without moving those rules into `GameApp`.
