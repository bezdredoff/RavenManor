# FEATURE-047 — Playtest infrastructure, local analytics, and PWA

## Goal

Make the completed ten-level vertical slice safe and convenient to distribute to
a wider real-device test group without adding speculative gameplay features.

## Acceptance criteria

- malformed saves no longer create a repeated startup failure;
- saves can be exported and imported as versioned JSON;
- last runtime errors can be voluntarily exported with diagnostics;
- rapid duplicate navigation/restoration actions are guarded;
- local analytics captures attempts, outcomes, time, moves, hints, restoration,
  story, and navigation events;
- analytics is never uploaded automatically and can be reset independently;
- production build includes a valid manifest, icons, service worker, portrait
  orientation, install status, and offline reload after one online session;
- existing V4 progress and audio settings load unchanged;
- Home and Match-3 retain no document scroll at 320 × 568;
- TypeScript, production build, and complete Vitest suite pass.
