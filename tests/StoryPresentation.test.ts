import { describe, expect, it } from 'vitest';
import { storyScenes } from '../src/data/storyScenes';
import { getStoryScenePresentation } from '../src/ui/storyPresentation';

describe('story presentation', () => {
  it('defines one unique authored scene for every prototype level', () => {
    expect(storyScenes).toHaveLength(10);
    expect(new Set(storyScenes.map((scene) => scene.id)).size).toBe(10);
    expect(storyScenes.map((scene) => scene.afterLevelId)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
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

  it('keeps story titles, copy, and speaker labels non-empty', () => {
    expect(
      storyScenes.every(
        (scene) => (
          scene.title.trim().length > 0
          && scene.beats.every(
            (beat) => beat.speaker.trim().length > 0 && beat.text.trim().length > 0,
          )
        ),
      ),
    ).toBe(true);
  });
});
