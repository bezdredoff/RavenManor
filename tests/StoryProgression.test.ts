import { describe, expect, it } from 'vitest';
import { storyScenes } from '../src/data/storyScenes';
import {
  getNextUnviewedStoryScene,
  getStorySceneForLevel,
} from '../src/meta/StoryProgression';

describe('story progression', () => {
  it('associates every prototype level with its own scene', () => {
    expect(getStorySceneForLevel(storyScenes, 1)?.id).toBe('return-to-the-gates');
    expect(getStorySceneForLevel(storyScenes, 10)?.id).toBe('the-raven-tower-opens');
    expect(getStorySceneForLevel(storyScenes, 11)).toBeNull();
  });

  it('offers only completed and unviewed scenes from Home', () => {
    const completed = { 1: true, 2: true, 3: false };

    expect(getNextUnviewedStoryScene(storyScenes, completed, {})?.afterLevelId).toBe(1);
    expect(getNextUnviewedStoryScene(storyScenes, completed, { 1: true })?.afterLevelId).toBe(2);
    expect(getNextUnviewedStoryScene(storyScenes, completed, { 1: true, 2: true }))
      .toBeNull();
  });

  it('does not cycle back to an already viewed scene', () => {
    const completed = Object.fromEntries(storyScenes.map((scene) => [scene.afterLevelId, true]));
    const viewed = Object.fromEntries(storyScenes.map((scene) => [scene.afterLevelId, true]));

    expect(getNextUnviewedStoryScene(storyScenes, completed, viewed)).toBeNull();
  });
});
