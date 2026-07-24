# Raven Manor Roadmap

## Completed foundation

- FEATURE-001 — dead-board reshuffle;
- FEATURE-006/007 — objective abstraction and collect objective;
- FEATURE-011/012 — JSON levels and runtime validation;
- FEATURE-013/014/015 — restoration tasks, visual stages, and star economy;
- FEATURE-028/029/030 — tests, CI, and GitHub Pages;
- FEATURE-036 — scalable level groups and initial balance;
- FEATURE-037 — optional first-session guidance;
- FEATURE-038 — visual audit and locked Romantic Gothic Restoration direction.

## Current phase — Visual Quality

### FEATURE-039 — UI design system

_Status: implemented, pending project verification._

- implement documented colour, typography, spacing, radius, elevation, and
  motion tokens;
- add a consistent icon system with fallbacks;
- create reusable button, card, top-bar, modal, wallet, badge, and setting-row
  components/styles;
- redesign Home, Settings, Level Selection, and generic modal shells;
- remove player-facing prototype/developer language;
- preserve all progression and save behaviour.

### FEATURE-040 — Match-3 board visual overhaul

_Status: implemented, pending project verification._

- integrate six authored tile slots and fallback assets;
- redesign board frame, cells, objective HUD, moves, and star threshold display;
- add clear selected, invalid-swap, match, fall, cascade, and hint states;
- prepare visual conventions for future special tiles;
- verify silhouette and contrast accessibility.

### FEATURE-041 — Manor, rooms, and narrative presentation

_Status: implemented, pending project verification._

- twenty authored room-state scenes integrated through stable `assetKey` values;
- room thumbnails and room-detail artwork reflect restoration progress;
- locked-room and completed-room presentation added without emoji placeholders;
- four visual-novel scenes use independent backdrop and portrait slots;
- story data is separated from asset resolution;
- restoration reveal motion remains scheduled for FEATURE-042.

### FEATURE-042 — Motion and VFX polish

_Status: implemented, pending project verification._

- visible swap and invalid-return travel;
- clear, settle, cascade, reshuffle, and hint polish;
- bounded gold, tile-colour, mist, and unlock particles;
- win/loss, screen, modal, restoration, room-unlock, and story motion;
- named timing policy and automatic reduced-motion behaviour;
- motion-policy tests and mobile acceptance checklist.

### FEATURE-043 — Audio and final UX polish

- music and SFX hooks;
- music/SFX settings and persistence;
- final responsive regression and device-specific safe-area pass;
- accessibility and contrast pass;
- loading/error/fallback states;
- public-test readiness checklist.

## Recommended visual production order

1. Produce/approve the six tile concepts and UI icon family while FEATURE-039 is
   implemented.
2. Integrate the UI system and asset resolver.
3. Integrate tile set and gameplay feedback in FEATURE-040.
4. Produce Hall stages first as the room-art quality benchmark.
5. Expand approved environment approach to Library, Garden, Crypt, and Tower.
6. Add character portraits and narrative presentation.
7. Complete motion, VFX, audio, and accessibility polish.

## Later gameplay expansion

- special tiles and combinations;
- blockers and new objective types;
- content tooling for hundreds of levels;
- analytics-assisted balancing;
- additional chapters, rooms, story scenes, and live content.
