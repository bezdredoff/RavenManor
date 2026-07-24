# FEATURE-047A — iOS offline cache and scrolling header hotfix

## Problem

The first installed iPhone launch registered the service worker but did not
precache the hashed JavaScript/CSS bundle. Offline launch succeeded only after a
second online run populated the runtime cache. The sticky top header also
covered content while contained screens scrolled.

## Scope

- generate an exact production precache manifest at Vite build time;
- install only after all generated resources are cached;
- expose verified cached/total counts to the application;
- add a manual offline-readiness check in Settings;
- retain cached `index.html` navigation fallback;
- make `.topbar` non-sticky and non-overlaying;
- update PWA/mobile QA documentation.

## Acceptance criteria

- `dist/sw.js` contains the hashed JS and CSS filenames from the same build;
- every final production file except `sw.js` and source maps appears in the
  injected precache list;
- offline readiness is false when only the worker is active;
- the app reports ready only after all listed files are cached;
- an iPhone Home Screen app works offline after one complete online launch;
- no second online launch is required;
- on Levels, Manor, Room, and Settings, the header scrolls away with content;
- the header never overlaps cards or settings sections;
- Home and Match-3 retain their no-document-scroll behaviour;
- V4 progress, audio settings, analytics, and diagnostics remain compatible.
