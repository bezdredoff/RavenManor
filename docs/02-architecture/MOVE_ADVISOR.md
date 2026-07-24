# Move Advisor

## Purpose

The Hint button recommends the move that best helps the current objective. It
evaluates every legal swap, including direct special combinations.

Implementation:

```text
src/engine/MoveAdvisor.ts
src/engine/SpecialTileResolver.ts
```

## Ranking contract

Moves are compared lexicographically:

1. immediately completes the objective;
2. removes more still-needed objective tiles;
3. removes more tiles immediately;
4. creates or activates more valuable special power;
5. creates a larger merged source combination;
6. leaves more deterministic follow-up moves;
7. stable board scan order.

Objective progress remains more important than a visually larger unrelated
special effect.

## Guaranteed simulation

The advisor uses exactly the same special resolver as live gameplay. It includes:

- direct special combinations;
- activation chains;
- a Raven's deterministic objective-first target;
- specials created by the player's initial match;
- cascades caused by already visible tiles.

It excludes random future refill tiles. Surviving tiles collapse into empty
space, making repeated Hint presses deterministic.

## Dead-board contract

A board is playable when it has either:

- a swap that creates a normal line/square match; or
- a supported direct special combination.

Reshuffle moves base tiles and special metadata together.
