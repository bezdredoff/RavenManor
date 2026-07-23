# Board Presentation Architecture

## Boundaries

`Match3Engine` remains responsible only for board state and match rules.
Presentation lives in data/UI layers:

```text
src/data/tileTypes.ts          tile identity and asset metadata
src/ui/tilePresentation.ts     pure class/key helpers
src/ui/GameApp.ts              transient interaction state and timing
src/style.css                  board materials, feedback, and motion
src/assets/tiles/*.svg         authored fallback tile artwork
```

The engine still stores integer tile indices. This keeps gameplay tests and
future level generation independent from artwork.

## Transient state

The UI derives temporary sets for:

- selected tile;
- hinted tiles;
- invalid-swap tiles;
- matched tiles;
- settling board;
- reshuffling board.

None of these are persisted. Reopening or restarting a level reconstructs them
from a clean state.

## Pointer contract

Pointer down records a starting tile. Pointer up resolves the final tile using
`document.elementFromPoint`, which supports touch devices with implicit pointer
capture. Adjacent start/end positions attempt a swipe swap. Same-position
input behaves as a tap. Keyboard clicks use the existing button semantics.

## Asset replacement

SVG imports use Vite `?url`, so the build produces base-path-safe URLs for
GitHub Pages. Final approved artwork can replace each SVG without changing
level JSON, engine state, objective logic, or save data.
