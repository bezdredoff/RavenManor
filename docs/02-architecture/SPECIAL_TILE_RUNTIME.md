# Special Tile Runtime

## State model

The engine keeps two parallel matrices:

```text
board[row][col]     base tile type
specials[row][col]  optional special metadata
```

A special is not encoded as another base tile index. This separation is needed
for future cell masks, chains, fog, crates, and other overlays.

`SpecialTile` is a discriminated union:

```text
rocket(row|column), bomb, raven, prism
```

Rockets, bombs, and ravens remain coloured and can participate in ordinary
matches. A prism is colourless for match detection.

## Resolution pipeline

`src/engine/SpecialTileResolver.ts` is the shared deterministic rule layer used
by gameplay and Hint simulation.

For a normal valid move:

1. find raw lines/squares and merged groups;
2. plan at most one special per qualifying group;
3. protect creation cells from clearing;
4. expand existing special effects recursively;
5. clear unique cells and report base tile types;
6. install planned specials;
7. collapse/refill the board;
8. resolve later cascades without creating more specials.

For a direct special combination the resolver skips shape creation and emits the
combination's clear area immediately.

## Chain safety

Each activated cell key is added to a set. A special may therefore be hit by
several effects but activates only once during the current resolution.

## Reshuffle and clone

`Match3Engine.swap`, `collapse`, `fromBoard`, and `reshuffle` move the base tile
and special metadata together. MoveAdvisor can clone the complete state without
mutating the live board.

## Extensibility

Future blockers should be represented by additional matrices rather than by
adding magic integer values to `board`. Special effects already resolve a set of
positions, which allows a blocker layer to observe the same effect in
FEATURE-049.
