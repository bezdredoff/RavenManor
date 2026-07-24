import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const serviceWorker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const viteConfig = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8');

describe('PWA production precache', () => {
  it('injects the generated production file list into the service worker', () => {
    expect(serviceWorker).toContain('__RAVEN_MANOR_PRECACHE_MANIFEST__');
    expect(viteConfig).toContain('raven-manor-precache-manifest');
    expect(viteConfig).toContain('generatedFiles');
  });

  it('verifies every precached URL before reporting offline readiness', () => {
    expect(serviceWorker).toContain('GET_OFFLINE_STATUS');
    expect(serviceWorker).toContain('cachedAssets === PRECACHE_URLS.length');
    expect(serviceWorker).toContain("cache: 'reload'");
  });

  it('keeps a cached index fallback for offline navigation', () => {
    expect(serviceWorker).toContain('cache.match(INDEX_URL)');
    expect(serviceWorker).toContain("request.mode === 'navigate'");
  });
});
