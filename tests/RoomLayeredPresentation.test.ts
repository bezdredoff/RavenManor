import { describe, expect, it } from 'vitest';
import {
  getLayeredRoomSceneMarkup,
  isLayeredRoom,
  layeredRoomAssets,
} from '../src/ui/roomLayeredPresentation';

describe('layered hall room presentation', () => {
  it('uses layered art only for the vestibule in feature 054', () => {
    expect(isLayeredRoom('hall')).toBe(true);
    expect(isLayeredRoom('library')).toBe(false);
  });

  it('exports concrete PNG assets for hall preloading', () => {
    expect(layeredRoomAssets).toHaveLength(5);
    expect(new Set(layeredRoomAssets).size).toBe(layeredRoomAssets.length);
    expect(layeredRoomAssets.every((asset) => asset.includes('.png'))).toBe(true);
  });

  it('progressively adds the expected hall overlays by restoration stage', () => {
    const ruined = getLayeredRoomSceneMarkup('hall', 0, 'detail');
    expect(ruined).toContain('base.png');
    expect(ruined).toContain('task1-debris.png');
    expect(ruined).not.toContain('task2-chandelier-on.png');

    const lit = getLayeredRoomSceneMarkup('hall', 2, 'detail');
    expect(lit).toContain('task2-chandelier-on.png');
    expect(lit).not.toContain('task3-decor-on.png');

    const restored = getLayeredRoomSceneMarkup('hall', 3, 'card');
    expect(restored).toContain('task3-decor-on.png');
    expect(restored).toContain('ambient-restored-glow.png');
  });
});
