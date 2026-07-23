# Room Restoration

## Purpose

Restoration tasks connect match-3 rewards to visible meta-game progress. Each
room owns an ordered list of small repairs. Players earn stars in levels and
use available stars to complete those repairs.

## Files

```text
src/data/restorationTasks.ts       Task content and costs
src/meta/RoomRestoration.ts        Pure progression and affordability rules
src/engine/ProgressStore.ts        Persistent completed-task IDs
src/ui/GameApp.ts                  Task list and completion interaction
```

## Rules

- tasks are grouped by `roomId` and sorted by `order`;
- tasks in one room must be completed sequentially;
- a task can be completed when all previous room tasks are complete and enough
  available stars remain;
- completed tasks persist in `completedRestorationTasks`;
- available stars are currently derived as earned stars minus the costs of all
  completed tasks;
- room and level unlocks continue to use total earned stars, so spending cannot
  relock already reached content.

## Current vertical-slice economy

Each of the five rooms has three tasks. The first room costs three stars in
total, giving the player one visible restoration action after a one-star level
win and allowing the full room to be restored after stronger results.

This is intentionally a lightweight prototype economy. FEATURE-015 will make
earned, spent, and available stars explicit in the save model instead of
reconstructing spending from completed task definitions.

## Extension rules

New restoration content belongs in `restorationTasks.ts`. New task effects or
visual room changes must be implemented separately; FEATURE-014 owns room
visual states.
