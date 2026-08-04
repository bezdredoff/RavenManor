# FEATURE-071 — Win, Fail and Level Transitions

## Goal

Turn victory and defeat from generic modal cards into a clear cinematic bridge
between Match-3, story and room restoration without changing gameplay rules.

## Scope

- use the current restored stage of the level's room as the result backdrop;
- present earned stars, available balance and booster stock as a compact reward
  ledger;
- give every victory one clear primary continuation, prioritising a new story
  scene, then an affordable restoration, then the next level;
- keep replay, restoration, next-level, level-map and Manor routes available;
- show unfinished objectives after defeat and keep Retry as the primary action;
- preserve reduced-motion and image-fallback behaviour.

## Out of Scope

- Match-3 HUD, board, boosters or tutorial composition (FEATURE-072);
- star thresholds, rewards, saves, level unlock rules or restoration economy;
- story content, story continuation rules, room art or portrait assets;
- new libraries or a parallel UI component system.

## Acceptance Criteria

1. Win and loss use the current level room and saved restoration stage.
2. A new unviewed story scene is the victory primary action.
3. Without a new story scene, an affordable restoration is primary; otherwise
   the next unlocked playable level is primary.
4. Victory retains Story, Repair, Next Level, Level Map and Manor routes when
   each route is eligible.
5. Loss shows current/target progress for every objective and Retry is primary.
6. No result content changes stars, boosters, progress or story rewards beyond
   the pre-existing actions.
7. RU, EN and BE remain complete.
8. The result layout has no horizontal overflow at 320 × 568, 390 × 844,
   430 × 932 or desktop.
9. TypeScript, tests, production build and the FEATURE-071 verifier pass.

## Manual Check

1. Complete level 1 with a new story scene and confirm Story is primary.
2. Replay a completed level with an affordable restoration and confirm Repair
   becomes primary.
3. Complete a level without an affordable restoration and continue directly to
   the next level.
4. Lose a level with one and with two objectives; confirm remaining progress and
   Retry.
5. Repeat at 320 × 568, 390 × 844, 430 × 932 and desktop in RU, EN and BE.

