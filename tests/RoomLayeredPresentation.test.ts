import { describe, expect, it } from 'vitest';
import {
  getLayeredRoomSceneMarkup,
  isLayeredRoom,
  layeredRoomAssets,
} from '../src/ui/roomLayeredPresentation';

describe('layered room presentation', () => {
  it('uses layered art for the first two manor rooms', () => {
    expect(isLayeredRoom('hall')).toBe(true);
    expect(isLayeredRoom('library')).toBe(true);
    expect(isLayeredRoom('garden')).toBe(false);
  });

  it('preloads both five-layer room kits', () => {
    expect(layeredRoomAssets).toHaveLength(10);
    expect(new Set(layeredRoomAssets).size).toBe(layeredRoomAssets.length);
    expect(layeredRoomAssets.every((asset) => asset.includes('.png'))).toBe(true);
  });

  it('keeps the hall progression contract', () => {
    const ruined = getLayeredRoomSceneMarkup('hall', 0, 'detail');
    expect(ruined).toContain('task1-debris.png');
    expect(ruined).not.toContain('task2-chandelier-on.png');

    const restored = getLayeredRoomSceneMarkup('hall', 3, 'card');
    expect(restored).toContain('task2-chandelier-on.png');
    expect(restored).toContain('task3-decor-on.png');
    expect(restored).toContain('ambient-restored-glow.png');
  });

  it('progressively opens and restores the library', () => {
    const sealed = getLayeredRoomSceneMarkup('library', 0, 'detail');
    expect(sealed).toContain('base.png');
    expect(sealed).not.toContain('task1-shutters-open.png');

    const moonlit = getLayeredRoomSceneMarkup('library', 1, 'detail');
    expect(moonlit).toContain('task1-shutters-open.png');
    expect(moonlit).not.toContain('task2-shelves-restored.png');

    const shelves = getLayeredRoomSceneMarkup('library', 2, 'detail');
    expect(shelves).toContain('task2-shelves-restored.png');
    expect(shelves).not.toContain('task3-desk-open.png');

    const restored = getLayeredRoomSceneMarkup('library', 3, 'card');
    expect(restored).toContain('task3-desk-open.png');
    expect(restored).toContain('ambient-restored-glow.png');
  });
});
