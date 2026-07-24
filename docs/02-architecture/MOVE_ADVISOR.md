# Move Advisor

## Purpose

The Hint button must recommend the move that best helps the player win the
current level. It must not simply return the first legal swap found during a
board scan.

The implementation lives in:

```text
src/engine/MoveAdvisor.ts
```

The match engine remains responsible for legal swaps, match groups, clearing,
and collapse rules. `GameApp` supplies the current collect objective and only
renders the returned move.

## Ranking contract

Every legal move is evaluated and compared lexicographically:

1. completes the current objective immediately;
2. removes more still-needed objective tiles;
3. removes more tiles in total;
4. creates a larger merged combination;
5. leaves more deterministic follow-up moves;
6. appears earlier in stable row/column board order.

Objective progress is clamped to the number of tiles still required. Removing
four roses when only one rose remains therefore contributes `+1` objective
progress, while the excess clear can still win later tie-breakers.

## Guaranteed cascade policy

The advisor includes cascades caused by tiles already visible on the board.
After each clear it collapses surviving tiles without generating random refill
tiles, then resolves any new guaranteed match.

Random future tiles are not scored because they would make the same board
produce inconsistent recommendations and would be difficult for players to
understand or for tests to reproduce.

## Match shapes

The advisor uses the same rules as normal gameplay:

- horizontal line of three or more;
- vertical line of three or more;
- square `2×2` of four identical tiles.

Overlapping shapes are merged. A tile is removed, scored, and counted toward an
objective only once.

## Performance

The board contains at most 112 adjacent swaps on an `8×8` grid. The advisor
simulates only legal swaps and creates no animation, DOM nodes, save changes, or
random refills. Evaluation runs only after the player explicitly presses Hint.
