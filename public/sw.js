const CACHE_VERSION = '__RAVEN_MANOR_CACHE_VERSION__';
const SCOPE = self.registration.scope;
const PRECACHE_PATHS = '__RAVEN_MANOR_PRECACHE_MANIFEST__';
const FALLBACK_PATHS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

const paths = Array.isArray(PRECACHE_PATHS) ? PRECACHE_PATHS : FALLBACK_PATHS;
const PRECACHE_URLS = [...new Set(paths.map((path) => new URL(path, SCOPE).href))];
const INDEX_URL = new URL('./index.html', SCOPE).href;
const ROOT_URL = new URL('./', SCOPE).href;
const VERSION_URL = new URL('./version.json', SCOPE).href;

const openCache = () => caches.open(CACHE_VERSION);

const precacheProductionBuild = async () => {
  const cache = await openCache();

  await Promise.all(PRECACHE_URLS.map(async (url) => {
    const request = new Request(url, { cache: 'reload', credentials: 'same-origin' });
    const response = await fetch(request);
    if (!response.ok) {
      throw new Error(`Failed to precache ${url}: ${response.status}`);
    }
    await cache.put(url, response);
  }));
};

const getOfflineStatus = async () => {
  const cache = await openCache();
  const matches = await Promise.all(PRECACHE_URLS.map((url) => cache.match(url)));
  const cachedAssets = matches.filter(Boolean).length;
  return {
    ready: cachedAssets === PRECACHE_URLS.length && PRECACHE_URLS.length > 0,
    cachedAssets,
    totalAssets: PRECACHE_URLS.length,
    cacheVersion: CACHE_VERSION,
  };
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    precacheProductionBuild().then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('raven-manor-') && key !== CACHE_VERSION)
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'GET_OFFLINE_STATUS') {
    event.waitUntil(
      getOfflineStatus()
        .then((status) => event.ports[0]?.postMessage(status))
        .catch(() => event.ports[0]?.postMessage({
          ready: false,
          cachedAssets: 0,
          totalAssets: PRECACHE_URLS.length,
          cacheVersion: CACHE_VERSION,
        })),
    );
    return;
  }

  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Update checks must never be answered from the app cache. Otherwise an old
  // installed bundle can compare itself with its own cached version manifest
  // and falsely report that it is current.
  if (url.href === VERSION_URL || url.pathname.endsWith('/version.json')) {
    event.respondWith(fetch(new Request(request, {
      cache: 'no-store',
      credentials: 'same-origin',
    })));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await openCache();
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        const cache = await openCache();
        return (
          await cache.match(request, { ignoreSearch: true })
          || await cache.match(ROOT_URL)
          || await cache.match(INDEX_URL)
          || Response.error()
        );
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await openCache();
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch {
      return Response.error();
    }
  })());
});
