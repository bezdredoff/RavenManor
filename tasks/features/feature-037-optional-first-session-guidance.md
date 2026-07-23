# FEATURE-037 — Optional first-session guidance

## Status

In Review

## Goal

Give new players two short match-3 hints without forcing experienced players
through a dedicated tutorial level.

## Scope

- first-level choice to show or skip guidance;
- two contextual, non-blocking tutorial cards;
- automatic advancement after the first valid move;
- skip controls on every tutorial surface;
- Settings screen with restart and disable actions;
- persisted tutorial state;
- V2/V3 save migration;
- unit tests and documentation.

## Out of Scope

- fixed tutorial board;
- hand-pointer animation;
- tutorials for blockers, boosters, or special tiles;
- audio narration;
- analytics funnels.

## Acceptance Criteria

- a fresh save is offered optional guidance when any available level starts;
- choosing skip immediately removes all guidance;
- choosing guidance keeps the normal board playable;
- a valid first move advances step 1;
- completing or skipping guidance persists after reload;
- guidance can be restarted from Settings;
- existing players with progress are not interrupted after migration;
- `npm test` and `npm run build` pass.

## Manual Test

1. Reset progress and start level 1, 2, or 3.
2. Confirm the optional choice appears.
3. Choose **Play without tutorial** and confirm the level is immediately usable.
4. Reset, start a level again, and choose **Show tips**.
5. Confirm the first card appears without blocking tile clicks.
6. Make one valid match and confirm the second card appears.
7. Finish the card, reload, and confirm it does not return.
8. Open Settings, choose **Show again**, and start any level.
9. Confirm the first contextual card returns.
10. Disable it from Settings and confirm it remains disabled after reload.
