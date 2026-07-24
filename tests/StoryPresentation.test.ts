import { describe, expect, it } from 'vitest';
import { storyScenes } from '../src/data/storyScenes';
import { getStoryScenePresentation } from '../src/ui/storyPresentation';

describe('story presentation during level expansion', () => {
  it('keeps ten authored scenes as chapter milestones until FEATURE-052', () => {
    expect(storyScenes).toHaveLength(10);
    expect(new Set(storyScenes.map((scene) => scene.id)).size).toBe(10);
    expect([...storyScenes].sort((a, b) => a.afterLevelId - b.afterLevelId)
      .map((scene) => scene.afterLevelId))
      .toEqual([1, 3, 6, 9, 12, 15, 21, 24, 27, 30]);
  });

  it('uses multi-beat scenes with substantial dialogue', () => {
    for (const scene of storyScenes) {
      expect(scene.beats.length).toBeGreaterThanOrEqual(4);
      expect(scene.beats.reduce((total, beat) => total + beat.text.length, 0))
        .toBeGreaterThan(300);
    }
  });

  it('resolves a portrait and background for every dialogue beat', () => {
    for (const scene of storyScenes) {
      for (const beat of scene.beats) {
        const presentation = getStoryScenePresentation(scene, beat);
        expect(presentation.portraitAsset.length).toBeGreaterThan(0);
        expect(presentation.backgroundAsset.length).toBeGreaterThan(0);
      }
    }
  });
});
