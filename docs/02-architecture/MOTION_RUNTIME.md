# Motion Runtime

## Purpose

FEATURE-042 adds presentation timing without moving gameplay rules into CSS or
animation callbacks. Match resolution, objectives, progress, and persistence
remain authoritative in TypeScript.

## Runtime policy

`src/ui/motionPolicy.ts` owns named durations and bounded particle budgets.
`GameApp` requests a named delay rather than scattering numeric timings through
match, modal, and restoration flows.

The runtime asks the operating system for:

```text
(prefers-reduced-motion: reduce)
```

When active:

- decorative movement delays resolve immediately;
- short text readability holds remain active for combo and invalid-move messages;
- generated decorative particle lists are empty;
- CSS removes travel, zoom, pulse, and cinematic camera movement;
- final selected, matched, restored, unlocked, win, and loss states remain
  visible.

## Match-3 sequence

A player move uses this order:

1. update the board model with the requested adjacent swap;
2. render both destination cells with inverse start offsets;
3. animate the pieces into their model positions;
4. detect matches;
5. if invalid, show rejection feedback and animate the model back;
6. if valid, show match particles, clear, collapse, and settle;
7. repeat the clear/settle loop for cascades;
8. reshuffle when no possible move remains;
9. open win or loss presentation.

Input remains locked while this sequence is running.

## Restoration sequence

Before spending a star, the UI records:

- the previous room-stage asset;
- which rooms were unlocked;
- the restoration task title.

After the transaction it resolves the new stage and newly unlocked room. The
new room image is authoritative immediately, while the old image is temporarily
layered above it and fades away through the reveal. This means animation cannot
leave progress in an intermediate state.

A newly unlocked room is highlighted the next time the player opens the Manor.
This flag is runtime-only; unlock truth still comes from restoration data.

## Modal and screen transitions

A screen transition is only applied when `ScreenMode` changes. Re-rendering the
same Match-3 screen for tile states does not replay the whole-screen entrance.

Modal close is visual-only and makes the overlay non-interactive immediately.
Opening a replacement modal cancels the pending cleanup safely.

## Performance constraints

- no canvas or WebGL dependency;
- CSS transforms and opacity are preferred;
- particle budgets are bounded to at most 22 elements for a single effect;
- normal matches create only two particles per matched cell;
- particles are not persisted in state;
- no animation may enable document-level scrolling;
- board pointer handling remains unchanged.
