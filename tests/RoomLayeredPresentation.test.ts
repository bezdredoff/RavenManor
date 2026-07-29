import { describe, expect, it } from 'vitest';
import {
  getLayeredRoomSceneMarkup,
  isLayeredRoom,
  layeredRoomAssets,
} from '../src/ui/roomLayeredPresentation';

const roomIds = ['hall', 'library', 'garden', 'crypt', 'tower'] as const;

describe('layered room presentation', () => {
  it('uses layered art for all five chapter-one rooms', () => {
    roomIds.forEach((roomId) => expect(isLayeredRoom(roomId)).toBe(true));
    expect(isLayeredRoom('unknown')).toBe(false);
  });

  it('preloads five assets for each room kit', () => {
    expect(layeredRoomAssets).toHaveLength(25);
    expect(new Set(layeredRoomAssets).size).toBe(layeredRoomAssets.length);
    expect(layeredRoomAssets.every((asset) => asset.includes('.png'))).toBe(true);
  });

  it('keeps the hall and library progression contracts', () => {
    expect(getLayeredRoomSceneMarkup('hall', 0, 'detail')).toContain('task1-debris.png');
    expect(getLayeredRoomSceneMarkup('hall', 3, 'card')).toContain('task3-decor-on.png');

    expect(getLayeredRoomSceneMarkup('library', 1, 'detail')).toContain('task1-shutters-open.png');
    expect(getLayeredRoomSceneMarkup('library', 3, 'card')).toContain('task3-desk-open.png');
  });

  it('progressively clears and restores the Winter Garden', () => {
    const overgrown = getLayeredRoomSceneMarkup('garden', 0, 'detail');
    expect(overgrown).toContain('task1-vines-overgrown.png');
    expect(overgrown).not.toContain('task2-fountain-on.png');

    const cleared = getLayeredRoomSceneMarkup('garden', 1, 'detail');
    expect(cleared).not.toContain('task1-vines-overgrown.png');

    const fountain = getLayeredRoomSceneMarkup('garden', 2, 'detail');
    expect(fountain).toContain('task2-fountain-on.png');
    expect(fountain).not.toContain('task3-roses-bloom.png');

    const restored = getLayeredRoomSceneMarkup('garden', 3, 'card');
    expect(restored).toContain('task3-roses-bloom.png');
    expect(restored).toContain('ambient-restored-glow.png');
  });

  it('progressively opens and illuminates the Family Crypt', () => {
    const buried = getLayeredRoomSceneMarkup('crypt', 0, 'detail');
    expect(buried).toContain('task1-stair-rubble.png');

    const stairs = getLayeredRoomSceneMarkup('crypt', 1, 'detail');
    expect(stairs).not.toContain('task1-stair-rubble.png');

    const seals = getLayeredRoomSceneMarkup('crypt', 2, 'detail');
    expect(seals).toContain('task2-seals-restored.png');
    expect(seals).not.toContain('task3-braziers-on.png');

    const restored = getLayeredRoomSceneMarkup('crypt', 3, 'card');
    expect(restored).toContain('task3-braziers-on.png');
    expect(restored).toContain('ambient-restored-glow.png');
  });

  it('progressively restores the Raven Tower', () => {
    const broken = getLayeredRoomSceneMarkup('tower', 0, 'detail');
    expect(broken).toContain('task1-broken-steps.png');

    const stairs = getLayeredRoomSceneMarkup('tower', 1, 'detail');
    expect(stairs).not.toContain('task1-broken-steps.png');

    const observatory = getLayeredRoomSceneMarkup('tower', 2, 'detail');
    expect(observatory).toContain('task2-observatory-open.png');
    expect(observatory).not.toContain('task3-raven-clock-on.png');

    const restored = getLayeredRoomSceneMarkup('tower', 3, 'card');
    expect(restored).toContain('task3-raven-clock-on.png');
    expect(restored).toContain('ambient-restored-glow.png');
  });
});
