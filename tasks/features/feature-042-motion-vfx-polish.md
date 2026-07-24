# FEATURE-042 — Motion and VFX polish

## Goal

Add readable, touch-safe motion and Romantic Gothic effects to gameplay,
restoration, results, navigation, and story scenes without changing rules,
balance, saves, or layout policy.

## Included

- named motion policy and mobile particle budgets;
- screen and modal transitions;
- visible adjacent tile travel and invalid return;
- match sparks, clear, settle, cascade, hint, and reshuffle polish;
- win glints and loss mist;
- room restoration before/after reveal;
- newly unlocked room highlight;
- restrained visual-novel camera and portrait entrances;
- automatic system reduced-motion support;
- settings status for the active motion mode;
- unit tests for timing and particle policy.

## Acceptance criteria

- gameplay input is locked only during an active board sequence;
- an invalid move returns to exactly the original board;
- board gestures never scroll the page;
- restoration state is persisted before its reveal starts;
- the restored image remains correct after refresh;
- a newly opened room is clearly announced and highlighted;
- win/loss buttons are available immediately;
- particle counts remain bounded on mobile;
- reduced motion generates zero decorative particles and zero runtime delays;
- Home and Match-3 still fit at 320 × 568 without document scrolling;
- existing progression and V4 saves remain compatible.

## Out of scope

- audio playback and volume persistence;
- haptic APIs;
- special-tile mechanics;
- replacement of current room/story source illustrations;
- device-specific performance analytics.
