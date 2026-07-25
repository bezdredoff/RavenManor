# FEATURE-052A — Campaign balance hotfix

## Problem

`CampaignBalance.test.ts` requires the first two levels of every six-level room
arc to contain no more than two objectives. Level 8 contained three objectives.

## Resolution

- keep the double-chain objective;
- keep one candle collection objective;
- remove the key collection objective;
- raise the candle target from 18 to 22;
- retain 24 moves and existing star thresholds.

## Acceptance criteria

- the full campaign balance suite passes;
- level 8 contains exactly two objectives;
- all 30 levels remain schema-valid;
- no save migration is introduced.
