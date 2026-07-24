# Special Tiles — FEATURE-048

## Purpose

Special tiles make strong board-reading decisions feel rewarded before blockers
and boosters are introduced. They are available in the current ten-level slice
without changing level JSON or save data.

## Creation rules

Only the first player-created resolution of a move can create a special tile.
Automatic cascades may activate existing specials but do not create new ones.
This keeps results readable and prevents uncontrolled chains during the first
implementation.

Priority for overlapping shapes:

1. line of five or more → Lunar Prism;
2. T/L overlap → Explosive Rune;
3. square `2×2` → Ghost Raven;
4. line of four → Rocket.

One source tile remains on the board and becomes the special. Other unique
matched tiles are removed and count toward objectives.

## Special effects

### Rocket

- horizontal line of four → row rocket;
- vertical line of four → column rocket;
- activation clears the entire indicated row or column.

### Explosive Rune

- created by a T/L match;
- activation clears a `3×3` area.

### Ghost Raven

- created by a `2×2` square;
- activation clears its orthogonal neighbours;
- then targets one useful tile elsewhere;
- collect-objective tiles have first priority.

### Lunar Prism

- created by a line of five or more;
- it is colourless for future normal matches;
- swapping it with a normal tile clears every tile of that normal tile's type.

## Direct combinations in this version

- Rocket + Rocket → one row-and-column cross;
- Rocket + Rune → three rows plus three columns;
- Rune + Rune → `5×5` area;
- Prism + normal tile → all tiles of the selected type.

Raven combinations, Prism + special, and every possible pair are deliberately
postponed. Unsupported pairs still work when the swap itself creates a normal
match; otherwise the swap is rejected.

## Objective and move rules

- a special-producing move spends one move;
- a direct special combination spends one move;
- every ordinary coloured tile removed by an effect counts toward collect goals;
- the colourless prism itself does not add an extra tile to a collect goal;
- chain activations count each board cell once.
