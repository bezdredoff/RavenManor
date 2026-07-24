# PWA Delivery

FEATURE-047 turns the published Raven Manor build into a portrait-first
Progressive Web App.

## Files

- `public/manifest.webmanifest` — name, theme, orientation, icons, standalone
  display;
- `public/sw.js` — app-shell and runtime cache;
- `public/icons/` — 192 px, 512 px, and maskable icons;
- `src/pwa/PwaManager.ts` — registration, install prompt, status, update check.

Vite copies `public/` to the production root. All URLs are scope-relative so the
same build works on a GitHub Pages repository subpath.

## Runtime policy

The service worker is registered only in a production build. `npm run dev` does
not install a cache that could interfere with development. Use:

```bash
npm run build
npm run preview
```

to verify PWA behaviour locally.

After the first successful online load, navigations and fetched same-origin
assets are cached. Navigation requests use network-first with an app-shell
offline fallback. Static assets use cache-first with background refresh.

## Installation

Where `beforeinstallprompt` is supported, Settings shows `Установить
приложение`. iOS/Safari and browsers that do not expose the prompt receive a
status instructing the tester to use the browser menu and `Добавить на главный
экран`.

The app declares portrait orientation, but it must still retain controls when a
device is briefly rotated.

## Updates

Every infrastructure release changes the cache version. Activation removes old
Raven Manor caches. Settings can request a service-worker update check; a found
waiting worker is applied after the next restart.
