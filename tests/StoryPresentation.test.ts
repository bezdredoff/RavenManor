import { describe, expect, it } from 'vitest';
import { storyScenes } from '../src/data/storyScenes';
import { getStoryScenePresentation } from '../src/ui/storyPresentation';

describe('story presentation', () => {
  it('defines a unique authored scene for every vertical-slice story step', () => {
    expect(storyScenes).toHaveLength(4);
    expect(new Set(storyScenes.map((scene) => scene.id)).size).toBe(storyScenes.length);
  });

  it('resolves a portrait and background for every scene', () => {
    for (const scene of storyScenes) {
      const presentation = getStoryScenePresentation(scene);
      expect(presentation.portraitAsset.length).toBeGreaterThan(0);
      expect(presentation.backgroundAsset.length).toBeGreaterThan(0);
    }
  });

  it('keeps story copy and speaker labels non-empty', () => {
    expect(
      storyScenes.every(
        (scene) => scene.speaker.trim().length > 0 && scene.text.trim().length > 0,
      ),
    ).toBe(true);
  });
});
