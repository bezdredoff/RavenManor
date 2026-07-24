import { describe, expect, it } from 'vitest';
import { getSpecialPresentation, specialAssets } from '../src/ui/specialPresentation';

const specials = [
  { kind: 'rocket', direction: 'row', baseTile: 0 } as const,
  { kind: 'rocket', direction: 'column', baseTile: 0 } as const,
  { kind: 'bomb', baseTile: 1 } as const,
  { kind: 'raven', baseTile: 2 } as const,
  { kind: 'prism', baseTile: 3 } as const,
];

describe('special tile presentation', () => {
  it('provides authored assets for every special type', () => {
    expect(specialAssets).toHaveLength(4);
    expect(specialAssets.every((asset) => typeof asset === 'string' && asset.length > 0)).toBe(true);
    for (const special of specials) {
      const presentation = getSpecialPresentation(special);
      expect(presentation.name.length).toBeGreaterThan(0);
      expect(presentation.assetPath.length).toBeGreaterThan(0);
      expect(presentation.cssClass).toContain('special--');
    }
  });
});
