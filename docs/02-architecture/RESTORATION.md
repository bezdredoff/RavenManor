# Room Restoration

## Purpose

Restoration tasks connect match-3 rewards to visible meta-game progress. Each
room owns an ordered list of repairs. Players earn stars in levels, spend
available stars on tasks, and immediately see the room advance to a new visual
stage.

## Files

```text
src/data/restorationTasks.ts       Task content and costs
src/data/roomVisuals.ts            Data-driven visual stages and future asset keys
src/meta/RoomRestoration.ts        Pure progression and affordability rules
src/meta/RoomVisualState.ts        Maps completed tasks to the current room stage
src/engine/ProgressStore.ts        Persistent completed-task IDs
src/ui/GameApp.ts                  Task interaction and room-stage rendering
```

## Restoration rules

- tasks are grouped by `roomId` and sorted by `order`;
- tasks in one room must be completed sequentially;
- a task can be completed when all previous room tasks are complete and enough
  available stars remain;
- completed tasks persist in `completedRestorationTasks`;
- available stars are currently derived as earned stars minus the costs of all
  completed tasks;
- room and level unlocks continue to use total earned stars, so spending cannot
  relock already reached content.

## Visual-state rules

Every room has exactly one visual stage for each possible completed-task count:

```text
0 completed tasks → ruined state
1 completed task  → first improvement
2 completed tasks → second improvement
3 completed tasks → fully restored state
```

`RoomVisualState` calculates the stage from persisted task completion. Visual
state therefore survives refreshes without adding a second save value that
could drift out of sync.

Each stage defines an `assetKey`, placeholder icon, title, and description. The
prototype renders CSS and emoji placeholders. Final generated artwork can later
replace the placeholder using the same stable `assetKey`, without changing the
restoration economy or save format.

## Current vertical-slice economy

Each of the five rooms has three tasks. The first room costs three stars in
total, giving the player one visible restoration action after a one-star level
win and allowing the full room to be restored after stronger results.

This is intentionally a lightweight prototype economy. FEATURE-015 will make
earned, spent, and available stars explicit in the save model instead of
reconstructing spending from completed task definitions.

## Extension rules

- new restoration tasks belong in `restorationTasks.ts`;
- each added task requires one additional visual stage in `roomVisuals.ts`;
- final room art should use the existing stage `assetKey` values;
- visual state must remain derived from completed tasks rather than saved
  independently;
- tests must verify that every room defines `taskCount + 1` ordered stages.
