import { describe, expect, it } from 'vitest';
import { rooms } from '../src/data/gameData';
import { storyScenes } from '../src/data/storyScenes';
import {
  getNextUnviewedStoryScene,
  getStoryJournalGroups,
  getStoryJournalProgress,
  getStorySceneForLevel,
  getStorySceneStatus,
} from '../src/meta/StoryProgression';

describe('story progression and journal', () => {
  it('associates one authored scene with every chapter level', () => {
    expect(storyScenes).toHaveLength(30);
    for (let levelId = 1; levelId <= 30; levelId += 1) {
      expect(getStorySceneForLevel(storyScenes, levelId)?.afterLevelId).toBe(levelId);
    }
  });

  it('offers the earliest completed and unviewed scene', () => {
    const completed = { 1: true, 2: true, 3: true };

    expect(getNextUnviewedStoryScene(storyScenes, completed, {})?.afterLevelId).toBe(1);
    expect(getNextUnviewedStoryScene(storyScenes, completed, { 1: true })?.afterLevelId).toBe(2);
    expect(getNextUnviewedStoryScene(storyScenes, completed, { 1: true, 2: true, 3: true }))
      .toBeNull();
  });

  it('distinguishes locked, new, and viewed entries', () => {
    const scene = storyScenes[0];
    expect(getStorySceneStatus(scene, {}, {})).toBe('locked');
    expect(getStorySceneStatus(scene, { 1: true }, {})).toBe('new');
    expect(getStorySceneStatus(scene, { 1: true }, { 1: true })).toBe('viewed');
  });

  it('groups six scenes under each of the five rooms', () => {
    const groups = getStoryJournalGroups(storyScenes, rooms, {}, {});
    expect(groups).toHaveLength(5);
    expect(groups.map((group) => group.entries.length)).toEqual([6, 6, 6, 6, 6]);
    expect(groups.flatMap((group) => group.entries.map((entry) => entry.scene.afterLevelId)))
      .toEqual(Array.from({ length: 30 }, (_, index) => index + 1));
  });

  it('summarises journal progress without unlocking future scenes', () => {
    const completed = Object.fromEntries(Array.from({ length: 5 }, (_, index) => [index + 1, true]));
    const viewed = { 1: true, 2: true, 3: true };
    expect(getStoryJournalProgress(storyScenes, completed, viewed)).toEqual({
      unlocked: 5,
      viewed: 3,
      total: 30,
      newCount: 2,
    });
  });
});
