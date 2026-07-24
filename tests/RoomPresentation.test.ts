import { describe, expect, it } from 'vitest';
import { roomVisuals } from '../src/data/roomVisuals';
import { getRoomSceneAsset, roomSceneAssets } from '../src/ui/roomPresentation';

describe('room scene presentation', () => {
  it('resolves every restoration-stage asset key', () => {
    const keys = roomVisuals.flatMap((room) => room.stages.map((stage) => stage.assetKey));

    expect(keys).toHaveLength(20);
    expect(new Set(keys).size).toBe(20);
    expect(keys.every((key) => getRoomSceneAsset(key).length > 0)).toBe(true);
  });

  it('does not expose orphaned scene assets', () => {
    const dataKeys = new Set(
      roomVisuals.flatMap((room) => room.stages.map((stage) => stage.assetKey)),
    );

    expect(Object.keys(roomSceneAssets).every((key) => dataKeys.has(key))).toBe(true);
  });

  it('fails clearly for an unknown room scene key', () => {
    expect(() => getRoomSceneAsset('rooms/unknown/stage-0')).toThrow(
      'Missing room scene asset',
    );
  });
});
