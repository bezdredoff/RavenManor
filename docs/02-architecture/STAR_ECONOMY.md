# Star Economy

## Purpose

The star wallet separates three values that previously had to be reconstructed
from level results and restoration task definitions:

```text
earned stars - spent stars = available stars
```

The wallet is persisted in `ProgressState.starBalance` and rendered in the
manor and room screens.

## Files

```text
src/meta/StarEconomy.ts       Pure wallet operations and legacy migration
src/engine/ProgressStore.ts   Persistent level rewards and restoration spending
src/meta/RoomRestoration.ts   Sequential task and affordability rules
src/ui/GameApp.ts             Wallet presentation and reward feedback
```

## Balance contract

```ts
type StarBalance = {
  earned: number;
  spent: number;
  available: number;
};
```

All values are non-negative integers. `available` is recalculated whenever a
save is loaded, so the invariant cannot be broken by stale saved data.

## Earning rules

A level stores the best star result earned for that level. Replaying a level
awards only the improvement over the previous best result:

```text
first result: 1 star  -> +1 earned
improve to 3 stars   -> +2 earned
replay with 2 stars  -> +0 earned
```

Room and level unlock thresholds use `earned`, not `available`. Spending stars
therefore never relocks content already reached by the player.

## Spending rules

A restoration task spends its configured `starCost` exactly once. The task is
marked complete and the wallet is updated in the same `ProgressStore` action.
A completed task cannot spend again, and a cost greater than `available` is
rejected.

## Save migration

FEATURE-015 writes `ravenManorStateV3`. When only the previous V2 save exists:

- `earned` is reconstructed from best level-star results;
- `spent` is reconstructed from completed restoration tasks and their costs;
- `available` is calculated as `earned - spent`;
- the migrated state is immediately persisted as V3.

The reset action clears legacy V2 data and writes a fresh V3 state.

## Extension rules

Future sources of stars must call the wallet award operation instead of editing
balance fields directly. Future star sinks must use the spending operation.
UI code may read the three values but must not recalculate or mutate them.
