# FEATURE-047B — Reliable PWA update detection

## Goal

Make the installed iOS/Android PWA reliably detect and apply a newly deployed
production build without falsely reporting that the current version is latest.

## Acceptance criteria

- each production build emits `version.json`;
- update checks bypass service-worker and HTTP app caches;
- current and deployed app versions are compared explicitly;
- an update is not inferred only from `registration.waiting`;
- an installing/activating worker is allowed to finish;
- the app reloads once after a different version is ready;
- offline checks show a connection warning;
- the current exact version is shown when no update exists;
- a new cache name is generated for every content build;
- progress, audio settings, and analytics are not cleared.
