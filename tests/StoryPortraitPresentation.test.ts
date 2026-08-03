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

  it('uses one Adrian base and crossfading placed expression overlays', () => {
    const neutral = resolveStoryPortrait(beat({
      speaker: 'Лорд Адриан',
      text: 'Я присматривал за поместьем, пока оно ждало свою хозяйку.',
      portraitKey: 'adrian',
      portraitSide: 'right',
      portraitExpression: 'neutral',
    }));
    const stern = resolveStoryPortrait(beat({
      speaker: 'Лорд Адриан',
      text: 'Не открывайте башню, пока печать не восстановлена.',
      portraitKey: 'adrian',
      portraitSide: 'right',
    }));

    expect(neutral.layers.map((layer) => layer.slot)).toEqual(['base', 'face']);
    expect(stern.expression).toBe('stern');
    expect(stern.layers.map((layer) => layer.slot)).toEqual(['base', 'face']);
    expect(neutral.layers[0]?.asset).toBe(stern.layers[0]?.asset);
    expect(stern.layers[1]?.asset).toBeDefined();
    expect(stern.layers[1]?.transition).toBe('crossfade');
    expect(stern.layers[1]?.placement).toBeDefined();
  });

  it('always uses the one neutral Raven portrait', () => {
    const neutral = resolveStoryPortrait(beat({
      speaker: 'Ворон',
      text: 'Я наблюдаю.',
      portraitKey: 'raven',
      portraitSide: 'right',
      portraitExpression: 'neutral',
    }));
    const speakingText = resolveStoryPortrait(beat({
      speaker: 'Ворон',
      text: 'Кар-р… Ты опоздала на двенадцать лет, наследница.',
      portraitKey: 'raven',
      portraitSide: 'right',
    }));
    const surprisedText = resolveStoryPortrait(beat({
      speaker: 'Ворон',
      text: 'Что?!',
      portraitKey: 'raven',
      portraitSide: 'right',
      portraitExpression: 'surprised',
    }));

    expect(neutral.expression).toBe('neutral');
    expect(speakingText.expression).toBe('neutral');
    expect(surprisedText.expression).toBe('neutral');
    expect(neutral.layers).toHaveLength(1);
    expect(speakingText.layers).toHaveLength(1);
    expect(surprisedText.layers).toHaveLength(1);
    expect(neutral.layers[0]?.slot).toBe('base');
    expect(neutral.layers[0]?.asset).toBe(speakingText.layers[0]?.asset);
    expect(neutral.layers[0]?.asset).toBe(surprisedText.layers[0]?.asset);
  });

  it('keeps the remaining legacy characters on the generic single-layer contract', () => {
    const silhouette = resolveStoryPortrait(beat({
      speaker: 'Тень',
      portraitKey: 'silhouette',
      portraitSide: 'right',
    }));
    expect(silhouette.layers).toHaveLength(1);
    expect(silhouette.layers[0]?.slot).toBe('base');
  });

  it('preloads the base, expression layers, and legacy portraits', () => {
    expect(storyPortraitAssets.length).toBeGreaterThanOrEqual(13);
  });
});
