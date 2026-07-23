# FEATURE-040A — Tile art and asset-test hotfix

## Status

Ready for Review

## Goal

Correct the first device-review issues in the FEATURE-040 tile set without
changing tile indices, gameplay rules, saves, or level data.

## Scope

- redraw the rose as a recognisable layered top-down blossom;
- optically centre the antique key;
- replace the scroll checkmark-like mark with an ornamental wax seal;
- remove embedded filters from the corrected SVGs;
- make the asset-reference unit test compatible with Vite/Vitest URL transforms;
- document SVG production rules.

## Acceptance criteria

- all three SVG files parse and build;
- the key reads as centred in its cell;
- the rose reads as a rose at mobile tile size;
- the scroll contains no checkbox/checkmark symbol;
- all six tile runtime asset references remain non-empty;
- `npm test` and `npm run build` pass;
- tile IDs, indices, names, and CSS classes remain unchanged.

## Out of scope

- changing the other three basic tiles;
- special match-4 or match-5 tiles;
- final painted production art;
- gameplay or balance changes.
