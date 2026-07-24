import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
const topbar = css.match(/\.topbar\s*\{([^}]*)\}/)?.[1] ?? '';

describe('top header layout', () => {
  it('scrolls with content instead of covering it', () => {
    expect(topbar).toContain('position: relative');
    expect(topbar).not.toMatch(/position:\s*(sticky|fixed)/);
    expect(topbar).not.toContain('backdrop-filter');
  });
});
