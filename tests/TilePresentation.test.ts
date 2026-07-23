import { describe, expect, it } from 'vitest';
import { tileTypes } from '../src/data/tileTypes';
import { getTileClassName, getTileKey } from '../src/ui/tilePresentation';

describe('gothic tile presentation', () => {
  it('defines six visually distinct tile types', () => {
    expect(tileTypes).toHaveLength(6);
    expect(new Set(tileTypes.map((tile) => tile.id)).size).toBe(6);
    expect(new Set(tileTypes.map((tile) => tile.cssClass)).size).toBe(6);
    // Vite/Vitest may transform an SVG import into a hashed URL or data URL.
    // The presentation contract only requires a non-empty runtime asset reference.
    expect(tileTypes.every((tile) => typeof tile.assetPath === 'string' && tile.assetPath.length > 0)).toBe(true);
  });

  it('builds stable board coordinates', () => {
    expect(getTileKey(0, 0)).toBe('0,0');
    expect(getTileKey(7, 7)).toBe('7,7');
  });

  it('combines base type and transient feedback classes', () => {
    expect(getTileClassName(0, {
      selected: true,
      hinted: true,
      invalid: true,
      matched: true,
      settling: true,
    })).toBe('tile tile--rose selected hint invalid matched settling');
  });

  it('keeps an unknown tile renderable as a neutral cell', () => {
    expect(getTileClassName(-1)).toBe('tile');
  });
});
