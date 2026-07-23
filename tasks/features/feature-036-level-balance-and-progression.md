# FEATURE-036 — Balance and scalable level progression

## Status

In Review

## Goal

Balance the first ten levels as a vertical slice while replacing the strict
one-level-at-a-time chain with scalable selectable groups.

## Product Decisions

- ten levels are not a product-size limit;
- three levels are available immediately;
- players choose order inside a group;
- two distinct victories unlock the next group;
- match-3 progression is separate from room restoration;
- rooms open from restoration milestones;
- onboarding remains optional and is implemented in FEATURE-037.

## Scope

- level schema version 2;
- per-level difficulty metadata;
- per-level star thresholds;
- initial balance values for levels 1-10;
- validated level-group catalog;
- global level selection screen;
- three starting levels;
- group unlock logic based on distinct wins;
- room unlock rules based on restoration progress;
- removal of fixed room-to-level ownership;
- automated tests and architecture documentation.

## Out of Scope

- final production balance;
- special tiles and blockers;
- telemetry backend;
- mandatory tutorial;
- final art, animation, audio, and polish;
- loading thousands of levels over a network.

## Acceptance Criteria

- levels 1, 2, and 3 are playable after reset;
- level 4 remains locked until any two of levels 1-3 are complete;
- levels 7-9 require any two wins from levels 4-6;
- level 10 requires any two wins from levels 7-9;
- one-star wins count toward unlocking;
- replaying the same completed level does not count twice;
- star results use JSON thresholds, not a global percentage;
- rooms do not contain fixed level lists;
- the library opens after two hall restoration tasks;
- all ten levels are assigned to exactly one validated group;
- `npm test` and `npm run build` pass.

## Manual Test

1. Reset progress.
2. Open **Играть** and confirm levels 1-3 are enabled.
3. Confirm levels 4-10 are visible but locked by group.
4. Complete levels 1 and 3 with any star result.
5. Confirm levels 4-6 unlock while levels 7-10 remain locked.
6. Replay level 1 and confirm this does not unlock the next group.
7. Complete any two of levels 4-6 and confirm levels 7-9 unlock.
8. Complete any two of levels 7-9 and confirm level 10 unlocks.
9. Spend two stars on the first two hall tasks and confirm the library opens.
10. Confirm unspent or spent star totals do not change level-group access.
