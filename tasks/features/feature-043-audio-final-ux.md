# FEATURE-043 — Audio and final UX polish

## Goal

Make the vertical slice ready for a small external device playtest by adding
persistent audio controls, semantic sound feedback, deterministic compact layout
behaviour, asset fallback, and a final regression checklist.

## Acceptance criteria

- Web Audio activates only after a player gesture.
- Music and effects have independent persisted volume controls.
- Master mute is persisted separately from gameplay progress.
- Semantic cues cover UI, board, result, restoration, unlock, and story events.
- The game remains fully playable when Web Audio is unsupported.
- The 320 × 568 viewport uses the compact profile.
- Home and Match-3 do not document-scroll.
- Settings and other content-heavy screens use contained scroll.
- Missing images show a branded fallback.
- Main home/tutorial emoji placeholders are replaced by the Raven mark.
- TypeScript, tests, build, and the public-test checklist are verified.

## Out of scope

- final mastered music tracks;
- voice acting;
- downloadable audio asset pipeline;
- analytics SDK;
- new Match-3 mechanics;
- level rebalance based on uncollected playtest data.
