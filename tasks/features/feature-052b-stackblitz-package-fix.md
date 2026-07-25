# FEATURE-052B — StackBlitz-safe story journal package

## Goal

Repackage FEATURE-052 without an outer archive directory so `src`, `tests`,
`docs`, and `tasks` can be dragged into the repository root without losing
their relative paths.

## Included

- all FEATURE-052 code, story text, SVG assets, tests, and documentation;
- FEATURE-052A level-8 balance correction;
- build version `0.7.2-playtest.052b`.

## Acceptance

- archive root contains `src`, `tests`, `docs`, and `tasks`;
- `src/data/storyScenes.ts` remains nested after upload;
- no feature files appear as loose files in the repository root;
- `npm test` and `npm run build` pass.
