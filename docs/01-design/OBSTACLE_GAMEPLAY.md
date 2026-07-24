# Obstacle gameplay — FEATURE-049

## Purpose

FEATURE-049 adds level variety without changing the core swap-and-match loop.
The first three levels remain familiar. Levels 4–10 introduce shaped boards,
multiple simultaneous objectives, and three blocker families.

## Board shapes

Levels use an 8×8 mask stored in JSON. `1` is an active cell and `0` is an
intentional gap. Four prototype layouts are used:

1. full rectangle;
2. clipped corners;
3. hourglass;
4. corridor / bridge layouts.

Inactive cells never contain tiles, blockers, matches, or input targets.
Gravity skips visual holes and fills the next active slot below.

## Chains

- Overlay a normal tile.
- The tile cannot be swapped while chained.
- The tile can still become part of a match formed by neighbouring tiles.
- A direct clear or a match containing the tile removes one chain layer.
- The tile underneath survives that resolution.
- Chains split gravity until their last layer is removed.

## Rubble

- Occupies a cell without a normal tile.
- Cannot be swapped or matched.
- Blocks gravity.
- A match or special effect on an orthogonally adjacent cell removes one layer.
- A special effect crossing the rubble cell also removes one layer.
- After the final layer is removed, the next collapse fills the cell.

## Fog

- Covers and locks a normal tile.
- The hidden tile cannot be swapped or matched.
- Adjacent matches and special effects remove one layer.
- The hidden tile survives when the fog clears.
- Fog blocks gravity until its last layer is removed.

## Layers

One-layer obstacles require one resolution. Two-layer obstacles require two
separate resolutions. Several tiles from the same match cannot remove both
layers at once.

## Objectives

A level may contain any mix of:

- multiple `collect` objectives;
- `clear-obstacle` objectives for chain, rubble, or fog.

Obstacle targets count cleared blocker cells, not removed layers.

## Content rollout

- Levels 1–3: familiar single collection goals.
- Level 4: shaped board and two collection goals.
- Level 5: chains.
- Level 6: rubble.
- Level 7: fog.
- Level 8: hourglass, double chains, three goals.
- Level 9: corridor mask with rubble and fog.
- Level 10: mixed prototype finale with all blockers.
