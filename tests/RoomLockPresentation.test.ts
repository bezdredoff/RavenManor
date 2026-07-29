import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string): string => readFileSync(
  new URL(relativePath, import.meta.url),
  'utf8',
);

describe('locked room presentation', () => {
  it('uses one authored SVG instead of a split CSS padlock', () => {
    const gameApp = read('../src/ui/GameApp.ts');
    const style = read('../src/style.css');

    expect(gameApp).toContain("room-lock.svg?url");
    expect(gameApp).toContain('room-card-lock-icon');
    expect(gameApp).not.toContain('<div class="room-card-lock"><span></span></div>');
    expect(style).not.toContain('.room-card-lock::before');
    expect(style).not.toContain('.room-card-lock::after');
  });

  it('keeps the lock asset font-independent and structurally complete', () => {
    const svg = read('../src/assets/ui/room-lock.svg');

    expect(svg).toContain('viewBox="0 0 64 64"');
    expect(svg).toContain('<rect');
    expect(svg).toContain('M20 29V21');
    expect(svg).not.toContain('<text');
  });
});
