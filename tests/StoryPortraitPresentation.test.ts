import { describe, expect, it } from 'vitest';
import type { StoryDialogueBeat } from '../src/data/storyScenes';
import {
  resolveStoryPortrait,
  storyPortraitAssets,
} from '../src/ui/storyPortraitPresentation';

function beat(overrides: Partial<StoryDialogueBeat> = {}): StoryDialogueBeat {
  return {
    speaker: 'Эвелин',
    text: 'Я должна понять, что здесь произошло.',
    portraitKey: 'evelyn',
    portraitSide: 'left',
    ...overrides,
  };
}

describe('layered story portrait presentation', () => {
  it('keeps one shared Evelyn base and adds only the selected expression layer', () => {
    const neutral = resolveStoryPortrait(beat({ portraitExpression: 'neutral' }));
    const smile = resolveStoryPortrait(beat({ portraitExpression: 'smile' }));
    const speaking = resolveStoryPortrait(beat({ portraitExpression: 'speaking' }));
    const surprised = resolveStoryPortrait(beat({ portraitExpression: 'surprised' }));

    expect(neutral.layers.map((layer) => layer.slot)).toEqual(['base']);
    expect(smile.layers.map((layer) => layer.slot)).toEqual(['base', 'face']);
    expect(speaking.layers.map((layer) => layer.slot)).toEqual(['base', 'face']);
    expect(surprised.layers.map((layer) => layer.slot)).toEqual(['base', 'face']);
    expect(new Set([
      smile.layers[0]?.asset,
      speaking.layers[0]?.asset,
      surprised.layers[0]?.asset,
    ]).size).toBe(1);
  });

  it('supports explicit expression authoring and a deterministic fallback', () => {
    expect(resolveStoryPortrait(beat({ portraitExpression: 'smile' })).expression).toBe('smile');
    expect(resolveStoryPortrait(beat({ text: 'Подожди, что это?!' })).expression).toBe('surprised');
    expect(resolveStoryPortrait(beat({ text: 'Я продолжу искать ответ.' })).expression).toBe('speaking');
  });

  it('keeps legacy characters on the same generic layer contract', () => {
    const adrian = resolveStoryPortrait(beat({
      speaker: 'Лорд Адриан',
      portraitKey: 'adrian',
      portraitSide: 'right',
    }));
    expect(adrian.layers).toHaveLength(1);
    expect(adrian.layers[0]?.slot).toBe('base');
    expect(adrian.layers[0]?.asset.length).toBeGreaterThan(0);
  });

  it('preloads the base, expression layers, and legacy portraits', () => {
    expect(storyPortraitAssets.length).toBeGreaterThanOrEqual(8);
  });
});
