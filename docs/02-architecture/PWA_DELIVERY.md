# PWA Delivery

FEATURE-047 turns the published Raven Manor build into a portrait-first
Progressive Web App. FEATURE-047A hardens the first offline launch on iOS.

## Files

- `public/manifest.webmanifest` — name, theme, orientation, icons, standalone
  display;
- `public/sw.js` — production precache, navigation fallback, runtime cache, and
  offline-readiness reporting;
- `vite.config.ts` — injects the exact generated build file list into `sw.js`;
- `public/icons/` — 192 px, 512 px, and maskable icons;
- `src/pwa/PwaManager.ts` — registration, install prompt, verified offline
  status, and update check.

All URLs are scope-relative so the same build works on a GitHub Pages repository
subpath.

## Production precache

The service worker source contains a build placeholder. During `vite build`, the
custom Vite plugin scans the final `dist/` directory and replaces the placeholder
with every generated production resource:

- hashed JavaScript;
- hashed CSS;
- emitted room/story SVG assets;
- manifest;
- PWA icons;
- `index.html` and the application root.

The service-worker installation succeeds only after every listed resource has
been fetched and stored. A failed resource keeps the new worker from activating
rather than incorrectly claiming that the app is ready offline.

This removes the previous iOS behaviour where the Home Screen app needed a
second online launch before the runtime cache happened to contain the main
bundle.

## Verified readiness

An active service worker is not by itself proof that the application works
offline. `PwaManager` requests `GET_OFFLINE_STATUS` through a `MessageChannel`.
The worker checks every precache key and reports:

```text
cachedAssets / totalAssets
```

Settings shows `Готово к работе офлайн` only when the two values are equal. A
manual `Проверить офлайн-готовность` action repeats the verification.

## Runtime policy

The service worker is registered only in a production build. `npm run dev` does
not install a cache that could interfere with development. Use:

```bash
npm run build
npm run preview
```

to verify PWA behaviour locally.

Navigation uses network-first while online and falls back to cached root or
`index.html` offline. Hashed/static same-origin resources use cache-first. The
full production bundle is already available before runtime caching is needed.

## Installation

Where `beforeinstallprompt` is supported, Settings shows `Установить
приложение`. iOS/Safari and browsers that do not expose the prompt use the
browser menu and `Добавить на экран «Домой»`.

One successful online launch is still required to install the service worker.
The tester should wait until Settings reports verified offline readiness before
intentionally going offline. A second online launch is no longer part of the
expected process.

## Updates

Every infrastructure release changes the cache version. Installation of the new
worker fills the new cache first. Activation then removes only older Raven Manor
caches. Failed updates therefore leave the previous working worker and cache in
place.
