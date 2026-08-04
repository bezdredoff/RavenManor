import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const designSystem = readFileSync(new URL('../src/ui/design-system.css', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
  const version = readFileSync(new URL('../src/appVersion.ts', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/ui/GameApp.ts', import.meta.url), 'utf8');

describe('FEATURE-069 unified UI kit', () => {
  it('extends the existing token source instead of adding another stylesheet', () => {
    expect(designSystem).toContain('--control-surface:');
    expect(designSystem).toContain('--control-selected:');
    expect(designSystem).toContain('--control-disabled:');
    expect(designSystem).toContain('--touch-target: 44px');
    expect(designSystem).toMatch(/\.compact\s*\{[^}]*min-height:\s*var\(--touch-target\)/s);
  });

  it('defines shared pressed, selected, disabled and icon treatment', () => {
    expect(designSystem).toContain("button[aria-pressed='true']");
    expect(designSystem).toContain("button[aria-selected='true']");
    expect(designSystem).toContain('button:disabled');
    expect(designSystem).toContain('.icon-button > img');
  });

  it('aligns tabs, modals, toast and locked states without touching screen data', () => {
    expect(styles).toContain('FEATURE-069');
    expect(styles).toContain(".journal-room-tab[aria-selected='true']");
    expect(styles).toContain('.modal-card:not(.modal-card--story)::before');
    expect(styles).toContain('.toast::after');
    expect(styles).toContain('.booster-button.locked');
    expect(app).toContain('role="tablist"');
    expect(app).toContain('aria-selected="${isSelected}"');
    expect(app).toContain('role="tabpanel"');
  });

  it('publishes the FEATURE-069 build label', () => {
    expect(version).toContain('0.10.4-playtest.069-unified-ui-kit');
    expect(version).toContain('FEATURE-069 · Unified UI kit');
  });
});
