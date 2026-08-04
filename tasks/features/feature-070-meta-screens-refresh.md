# FEATURE-070 — Meta Screens Refresh

## Goal

Turn the Home, Manor, Level Map, Room and Settings surfaces into a coherent
art-first meta-game flow while preserving the accepted FEATURE-069 UI kit and
all existing progression behaviour.

## Scope

- make the current Hall restoration art the focal Home hero;
- turn Manor into a five-room route instead of identical stacked cards;
- turn the Level Map into grouped three-node chapter steps with one clear
  continuation card;
- keep Room detail art above its supporting copy and restoration tasks;
- group Settings into a readable ledger and move progress reset into its
  separated destructive-action area;
- refine the existing restoration/unlock message so it does not cover the
  centre of the room art.

## Out of Scope

- new room, portrait, tile or icon assets;
- changes to room unlocking, star economy, saves, level definitions or story;
- win/fail and transition composition (FEATURE-071);
- Match-3 HUD, board or booster layout (FEATURE-072);
- a second design token or component system.

## Acceptance Criteria

1. Home uses the current saved Hall stage and retains Play, Manor, Journal,
   Settings and star-wallet navigation.
2. Manor shows all five rooms as a connected route with distinct unlocked,
   locked, restored and recently-unlocked states.
3. Locked Manor rooms do not reveal readable future room art.
4. The first three playable level nodes are visible in the first Level Map
   viewport at 390 × 844 and remain directly playable.
5. Level cards are compact and the current continuation card owns the objective
   preview instead of repeating dense objective copy on every node.
6. Room detail keeps the restoration image as the primary surface and every
   task remains actionable with a touch-safe control.
7. Settings groups remain in their established order and progress reset is
   available only inside the separated danger zone.
8. Existing story, journal, result and Match-3 composition contracts remain
   unchanged.
9. RU, EN and BE localization remains complete.
10. TypeScript, all tests, production build and the FEATURE-070 verifier pass.

## Manual Check

1. Open a fresh save at 320 × 568, 390 × 844 and 430 × 932.
2. Verify Home is viewport-locked and the Hall art remains visible behind the
   brand and progress ribbon.
3. Open Manor and inspect all five route nodes, including four locked nodes.
4. Open Hall, use the Level Map shortcut, and confirm the first three playable
   nodes are visible together.
5. Open Settings from Home, Manor, Levels and Room and confirm Back returns to
   the correct caller.
6. Give the save enough stars, complete the second Hall task, and confirm the
   room-unlock message appears at the bottom of the art.
7. Switch to EN and BE and revisit Home, Manor, Levels and Settings.
