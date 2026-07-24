# Board masks and obstacle runtime

## Data layers

`Match3Engine` keeps four square matrices with identical dimensions:

1. `activeMask` — permanent playable geometry;
2. `board` — base tile type (`-1` empty, `-2` inactive);
3. `specials` — rocket, bomb, raven, or prism overlay;
4. `obstacles` — chain, rubble, or fog overlay.

This separation allows future mechanics to evolve independently. A tile can
carry a chain now and later support other cell layers without changing the
base tile representation.

## Clear pipeline

`resolveClear()` replaces obstacle-aware use of `clearMatches()` and returns:

- removed tile types;
- obstacle damage records;
- cleared obstacle kinds.

For backwards-compatible unit tests and utility code, `clearMatches()` remains
as a wrapper returning only removed tile types.

Every obstacle cell may be damaged at most once per resolution. This prevents
a single three-tile match beside a double blocker from removing both layers.

## Gravity

Inactive mask cells are skipped. Rubble, chain, and fog are gravity barriers.
Each column is collapsed in independent movable segments between barriers.
When rubble clears, its cell is empty and participates in the next collapse.

## Move search and reshuffle

- Blocked cells cannot be swap endpoints.
- Chains may still participate in matches created around them.
- Fog cells are excluded from match detection.
- Reshuffle moves only unblocked normal/special tiles.
- Mask, blockers, hidden tiles, and blocker layers remain fixed.

## Special tiles

Special effects include active obstacle cells in their clear plans. Resolver
output is applied through `resolveClear()`, so rockets, bombs, ravens, and
prisms use the same blocker damage rules as normal matches.

The raven receives an objective-priority structure. It prefers an unfinished
obstacle objective, then an unfinished tile objective, then another special,
then deterministic board order.

## Objectives

`ObjectiveTracker` receives two event types:

```text
tiles-removed
obstacles-cleared
```

Concrete objectives own their own counters. `ObjectiveFactory` converts JSON
definitions into runtime objective objects, keeping `GameApp` independent from
individual objective implementations.
