# FEATURE-049 — Board shapes, obstacles, and mixed objectives

## Goal

Increase match-3 variety while keeping the engine data-driven and compatible
with FEATURE-048 special tiles.

## Included

- 8×8 JSON board masks;
- inactive cells and shaped gravity;
- chain, rubble, and fog blockers;
- one/two blocker layers;
- blocker-aware clear, collapse, hint, reshuffle, and special effects;
- multiple collection objectives;
- clear-obstacle objectives;
- obstacle SVG assets and procedural cues;
- revised levels 4–10;
- settings reference guide;
- unit tests and playtest documentation.

## Excluded

- spreading fog;
- falling ingredient objectives;
- pre-level boosters;
- booster inventory and rewards;
- expansion beyond ten levels;
- final production art/audio.

## Acceptance

- every configured level generates without immediate matches and with a legal move;
- blocked cells cannot be swapped;
- each obstacle loses at most one layer per resolution;
- mixed objectives must all complete before level victory;
- special tiles can damage blockers;
- reshuffle preserves masks, blockers, layers, and locked tiles;
- the first three levels remain mechanically familiar.
