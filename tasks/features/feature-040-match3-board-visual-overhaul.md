# FEATURE-040 — Match-3 board visual overhaul

## Status

In Review

## Goal

Replace emoji-style match-3 presentation with an authored, mobile-readable
gothic tile set and clear visual feedback for every existing board action.

## Scope

- six vector tile assets with unique silhouettes;
- tile metadata independent from the engine;
- ornate board frame, cells, and subtle sigil;
- objective and level cards use the same tile assets;
- tap-to-select and swipe-to-swap touch input;
- selected, hint, invalid, match, settle, cascade, and reshuffle states;
- accessible labels and keyboard click support;
- reduced-motion fallback;
- documentation and unit tests.

## Out of Scope

- special-tile gameplay;
- particle-system VFX;
- physics-based falling animation;
- audio;
- final outsourced/AI-painted tile replacements;
- changes to level balance or save format.

## Acceptance Criteria

- no basic match-3 tile is rendered as an emoji;
- all six tiles remain distinguishable by silhouette;
- the objective HUD and level cards reuse the authored tile image;
- tapping two adjacent tiles still swaps them;
- swiping between adjacent cells attempts the same swap;
- invalid swaps visibly return to their original positions;
- matches and cascades provide readable feedback;
- hints mark exactly the two suggested cells;
- reshuffle feedback is visible;
- board gestures never scroll the page;
- 8×8 board remains fully visible at 320 × 568;
- `prefers-reduced-motion` disables non-essential motion;
- existing engine, progression, tutorial, and save tests remain green;
- `npm run build` passes.
