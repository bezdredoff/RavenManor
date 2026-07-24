# Star Economy

## Core invariant

```text
earned stars - spent stars = available stars
```

`ProgressState.starBalance` persists all three values. Level replays award only
improvement over the previous best result, and restoration tasks spend their
configured cost exactly once.

## Default UI

The persistent top-right counter shows only available stars:

```text
★ 4
```

The detailed `Заработано / Потрачено / Доступно` wallet is hidden by default.
Pressing the counter toggles a compact popover. This avoids repeating the same
information on Level, Manor, and Room screens while keeping the full accounting
available on demand.

Room task headings do not render another available-star counter. The top-right
control is the single persistent source of wallet information.

## Insufficient-star interaction

The next sequential restoration task remains pressable when it is unlocked but
unaffordable. Pressing it:

1. spends nothing;
2. leaves progression unchanged;
3. plays the invalid-action cue;
4. shows a temporary notification with the missing amount;
5. suggests completing or improving a level.

Locked future tasks and completed tasks remain disabled.

## Files

```text
src/meta/StarEconomy.ts          Pure wallet operations and migration
src/engine/ProgressStore.ts      Persistent rewards and spending
src/meta/RoomRestoration.ts      Sequence and affordability status
src/ui/restorationFeedback.ts    Player-facing blocked-spend message
src/ui/GameApp.ts                Counter, popover, tasks, and notification
```

## Save compatibility

The star balance remains in `ravenManorStateV4`. FEATURE-046 adds story-view
metadata to the same state but does not change star values or require a new
storage key.
