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

_Status: implemented, pending device verification._

- semantic Web Audio cues and a simple scheduled Romantic Gothic theme;
- independently persisted music/effects volume and master mute;
- compact runtime profile for narrow or short mobile viewports;
- branded missing-image fallback and replacement of remaining hero/tutorial emoji;
- final responsive, safe-area, touch, keyboard, and accessibility regression;
- public-test readiness checklist.

## Current phase — Evidence-driven playtest iteration

### FEATURE-044 — Playtest gameplay and navigation patch

_Status: implemented, pending project verification._

- add `2×2` square matches without special-tile creation;
- rank every Hint move using objective-first deterministic evaluation;
- extend combo and invalid-move message readability;
- continue directly to the next unlocked unfinished level after a win;
- preserve saves, balance, touch layout, and reduced-motion accessibility.

### FEATURE-045 — Story continuation and audible background music

_Status: implemented, pending project verification._

- preserve next-level context when a victory opens a story scene;
- continue from that scene directly to the next playable level or level map;
- replace near-static ambience with a simple audible D-minor background theme;
- add independent music preview and music-theme tests;
- preserve existing saves, progression, effects, and mobile layout.

### FEATURE-046 — Story depth and star-wallet UX

_Status: implemented, pending project verification._

- add one multi-beat story scene for every prototype level;
- stop viewed scenes from cycling back to the beginning;
- let Home surface completed but unviewed scenes;
- hide the detailed star wallet behind the top-right available-star counter;
- remove the duplicate room-task star counter;
- notify the player when an unlocked restoration task is unaffordable.

### FEATURE-047 — Playtest infrastructure, local analytics, and PWA

_Status: implemented, pending production/device verification._

- recover from malformed or unavailable local storage without a blank screen;
- export/import versioned saves and voluntary diagnostics;
- collect bounded local-only playtest analytics with JSON export;
- show build/version and technical status in Settings;
- add short duplicate-action guards and idle asset warm-up;
- publish a portrait standalone PWA with install prompt, icons, and offline cache;
- preserve V4 gameplay progress, audio preferences, balance, and game rules.

### FEATURE-047A — iOS offline cache and scrolling header hotfix

_Status: implemented, pending iPhone production verification._

- inject the exact final Vite bundle into the service-worker precache list;
- cache all hashed JS, CSS, emitted SVG, manifest, and icons during install;
- verify every cached production file before claiming offline readiness;
- remove the second-online-launch requirement observed on iPhone;
- make the page header scroll with contained content instead of overlaying it;
- preserve saves, analytics, gameplay, and PWA installation behaviour.

### Next — evidence-driven fixes only

- distribute the installable build to a wider device set;
- analyse exported reports and repeated level runs;
- fix confirmed defects or balance outliers;
- postpone special tiles, blockers, boosters, and content expansion until the
  vertical-slice retention and comprehension questions have evidence.

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

## FEATURE-047B — reliable PWA update detection

Status: patch prepared.

- generated network-only `version.json`;
- version comparison independent of service-worker `waiting` state;
- activation/controller-change handling followed by one reload;
- content-derived service-worker cache version;
- migration instructions for already installed pre-047B builds.


## Wave 2 — Gameplay depth and chapter expansion

### FEATURE-048 — Special tiles and power combinations

_Status: implemented, pending project/device verification._

- line-4 row/column rockets;
- T/L explosive rune;
- `2×2` objective-aware ghost raven;
- line-5 lunar prism;
- four bounded direct special combinations;
- chain activation, collapse, reshuffle, Hint, analytics, SVG, sound, and tests;
- no save migration or level-data change.

### FEATURE-049 — Board shapes, blockers, and objective types

_Status: implemented, pending project/device verification._

- board masks and non-rectangular playable shapes;
- chains, debris/crates, and non-spreading fog;
- multi-collect and blocker-clear objectives;
- special effects damage blockers through the shared position resolver.

### FEATURE-050 — Meta integration and boosters

_Status: implemented, pending project/device verification._

- active restoration task on the level map and win result;
- restoration milestones unlock mechanics and level groups;
- Silver Hammer and Shuffle inventory;
- restoration-completion rewards.

### FEATURE-051 — Expansion to 30 levels

_Status: implemented, pending project/device verification._

- twenty new levels across five room arcs;
- ten restoration-gated three-level groups;
- room finales at levels 6, 12, 18, 24, and 30;
- progressive mechanic recombination and wave-shaped balance;
- milestone story redistribution until FEATURE-052;
- catalog validation and repeated generation/cascade smoke testing.

### FEATURE-052 — Story journal and chapter expansion

_Status: implemented, pending project/device verification._

- one authored story scene after every level 1–30;
- ten major scenes and twenty shorter interludes;
- replayable journal grouped into five room arcs;
- locked/new/viewed states with spoiler-safe locked entries;
- Home and Manor journal access plus earliest-unread continuation;
- separate Lucian reveal portrait, journal SVG, procedural journal cue, and tests.

## Completed — FEATURE-049

- data-driven 8×8 board masks;
- chains, rubble, and fog with one/two layers;
- multiple collection and blocker-clear objectives;
- special-tile, hint, gravity, and reshuffle integration;
- obstacle art, procedural audio, guide text, and revised levels 4–10.

## Completed — FEATURE-050

- restoration-task level-group gates with legacy replay protection;
- active repair guidance on the level map and victory result;
- Silver Hammer and Shuffle inventory, rewards, migration, UI, SVG, and sound;
- optional full-room completion rewards.

Completed FEATURE-051: 30-level first chapter. Next planned: FEATURE-052 story journal and twenty additional narrative events.

## FEATURE-052A — Campaign balance hotfix

- level 8 now follows the two-objective opening envelope;
- removed the secondary key collection objective;
- increased the candle target from 18 to 22 to retain normal difficulty;
- no save migration or runtime-system changes.
