import { describe, expect, it } from 'vitest';
import { getPwaStatusLabel, type PwaStatus } from '../src/pwa/PwaManager';

const status = (patch: Partial<PwaStatus>): PwaStatus => ({
  productionEnabled: true,
  installed: false,
  installAvailable: false,
  online: true,
  serviceWorkerReady: false,
  offlineReady: false,
  cachedAssets: 0,
  totalAssets: 0,
  ...patch,
});

describe('PWA status policy', () => {
  it('prioritises installed and installable states', () => {
    expect(getPwaStatusLabel(status({ installed: true, offlineReady: true }))).toContain('Установлено');
    expect(getPwaStatusLabel(status({ installAvailable: true }))).toContain('Можно установить');
  });

  it('does not claim offline readiness merely because a worker is active', () => {
    expect(getPwaStatusLabel(status({
      serviceWorkerReady: true,
      cachedAssets: 12,
      totalAssets: 20,
    }))).toContain('12/20');
  });

  it('reports offline readiness only after every production asset is cached', () => {
    expect(getPwaStatusLabel(status({
      serviceWorkerReady: true,
      offlineReady: true,
      cachedAssets: 20,
      totalAssets: 20,
      online: false,
    }))).toContain('Офлайн');
  });

  it('explains that development mode cannot install the PWA', () => {
    expect(getPwaStatusLabel(status({ productionEnabled: false }))).toContain('production');
  });
});
