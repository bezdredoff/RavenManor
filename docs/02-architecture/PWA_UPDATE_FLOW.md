# PWA update flow

## Problem fixed in FEATURE-047B

The former update button called `ServiceWorkerRegistration.update()` and then
immediately inspected `registration.waiting`. That is not a reliable update
signal:

- the new worker may still be installing;
- Raven Manor workers call `skipWaiting()`, so the worker may activate without
  remaining in `waiting`;
- the page JavaScript can still be the old bundle until a reload.

This caused false `latest version` messages on installed iOS builds.

## Build manifest

Every production build creates `dist/version.json` with:

- `appVersion`;
- `buildLabel`;
- content-derived `buildId`;
- build timestamp.

The file is generated from `src/appVersion.ts`. It must not be edited manually.

## Update check

The installed app:

1. fetches `version.json` with a cache-busting query and `cache: no-store`;
2. compares its compiled `APP_VERSION` with the deployed version;
3. calls `registration.update()` only when they differ;
4. waits for worker activation or `controllerchange` when a candidate worker is
   present;
5. reloads the page so the new JavaScript and CSS become authoritative.

The service worker treats `version.json` as network-only during update checks.
It must never answer that request from the offline app cache.

## Cache version

The production build injects a content-derived cache name into `sw.js`:

```text
raven-manor-<app-version>-<build-id>
```

This ensures a new production build gets a new cache and old Raven Manor caches
are removed during activation.

## Transitional limitation

Builds before FEATURE-047B contain the broken update button. They cannot gain
the fixed behaviour retroactively. A tester must perform one online full restart
of the installed app after FEATURE-047B deployment, or export the save and
reinstall the Home Screen app if iOS keeps the older bundle.
