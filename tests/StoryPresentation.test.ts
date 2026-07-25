import { describe, expect, it } from 'vitest';
import { storyScenes } from '../src/data/storyScenes';
import { getStoryScenePresentation, storyAssets } from '../src/ui/storyPresentation';

describe('complete first-chapter story presentation', () => {
  it('contains thirty unique scenes split into ten major and twenty interludes', () => {
    expect(storyScenes).toHaveLength(30);
    expect(new Set(storyScenes.map((scene) => scene.id)).size).toBe(30);
    expect(storyScenes.filter((scene) => scene.importance === 'major')).toHaveLength(10);
    expect(storyScenes.filter((scene) => scene.importance === 'interlude')).toHaveLength(20);
    expect(storyScenes.map((scene) => scene.afterLevelId)).toEqual(
      Array.from({ length: 30 }, (_, index) => index + 1),
    );
  });

  it('keeps key scenes longer than interludes', () => {
    for (const scene of storyScenes) {
      if (scene.importance === 'major') expect(scene.beats.length).toBeGreaterThanOrEqual(5);
      else expect(scene.beats.length).toBeGreaterThanOrEqual(3);
      expect(scene.summary.length).toBeGreaterThan(35);
      expect(scene.beats.every((beat) => beat.text.length > 45)).toBe(true);
    }
  });

  it('resolves a portrait and background for every dialogue beat', () => {
    expect(storyAssets.length).toBeGreaterThanOrEqual(12);
    for (const scene of storyScenes) {
      for (const beat of scene.beats) {
        const presentation = getStoryScenePresentation(scene, beat);
        expect(presentation.portraitAsset.length).toBeGreaterThan(0);
        expect(presentation.backgroundAsset.length).toBeGreaterThan(0);
      }
    }
  });

  it('reveals Lucian only in the final authored scene', () => {
    const lucianScenes = storyScenes.filter((scene) => scene.beats.some((beat) => beat.portraitKey === 'lucian'));
    expect(lucianScenes.map((scene) => scene.afterLevelId)).toEqual([30]);
  });
});
