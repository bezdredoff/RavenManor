import { describe, expect, it } from 'vitest';
import { getPwaStatusLabel, type PwaStatus } from '../src/pwa/PwaManager';

const status = (patch: Partial<PwaStatus>): PwaStatus => ({
  productionEnabled: true,
  installed: false,
  installAvailable: false,
  online: true,
  serviceWorkerReady: false,
  ...patch,
});

describe('PWA status policy', () => {
  it('prioritises installed and installable states', () => {
    expect(getPwaStatusLabel(status({ installed: true }))).toContain('Установлено');
    expect(getPwaStatusLabel(status({ installAvailable: true }))).toContain('Можно установить');
  });

  it('reports offline readiness after the service worker is active', () => {
    expect(getPwaStatusLabel(status({ serviceWorkerReady: true, online: false }))).toContain('Офлайн');
  });

  it('explains that development mode cannot install the PWA', () => {
    expect(getPwaStatusLabel(status({ productionEnabled: false }))).toContain('production');
  });
});
