import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const app = readFileSync(new URL('../src/ui/GameApp.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
const version = readFileSync(new URL('../src/appVersion.ts', import.meta.url), 'utf8');

describe('FEATURE-070 meta screens refresh', () => {
  it('makes Home art-first while retaining all primary routes', () => {
    expect(app).toContain('home-manor-hero');
    expect(app).toContain("this.renderRoomCardArt('hall'");
    expect(app).toContain('home-progress-ribbon');
    expect(app).toContain('data-action="play"');
    expect(app).toContain('data-action="manor"');
    expect(app).toContain('data-action="journal"');
  });

  it('uses route and journey composition for Manor and Levels', () => {
    expect(app).toContain('manor-room-map');
    expect(app).toContain('manor-room-node--${index % 2 === 0');
    expect(app).toContain('level-continuation-card');
    expect(app).toContain('level-node-button');
    expect(styles).toContain('grid-template-columns: repeat(3, minmax(0,1fr))');
  });

  it('keeps room art primary and moves destructive progress reset to Settings', () => {
    expect(app.indexOf('${roomVisual}')).toBeLessThan(app.indexOf('room-detail-summary'));
    expect(app).toContain('settings-ledger');
    expect(app).toContain('settings-danger-zone');
    expect(app).toContain('data-action="progress-reset"');

    const manorStart = app.indexOf('private showManor');
    const levelsStart = app.indexOf('private getLevelMapFocusTarget', manorStart);
    expect(app.slice(manorStart, levelsStart)).not.toContain('data-action="reset"');
  });

  it('keeps the FEATURE-070 composition contract in successor builds', () => {
    expect(version).toContain("export const APP_VERSION = '0.10.");
    expect(styles).toContain('FEATURE-070');
  });
});
