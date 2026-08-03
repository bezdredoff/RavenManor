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

describe('story portrait presentation', () => {
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

  it('uses refreshed full-body single-asset expressions for Adrian', () => {
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
    const speaking = resolveStoryPortrait(beat({
      speaker: 'Лорд Адриан',
      text: 'Я произнесу это вслух.',
      portraitKey: 'adrian',
      portraitSide: 'right',
      portraitExpression: 'speaking',
    }));
    const surprised = resolveStoryPortrait(beat({
      speaker: 'Лорд Адриан',
      text: 'Невозможно?!',
      portraitKey: 'adrian',
      portraitSide: 'right',
    }));

    expect(neutral.layers).toHaveLength(1);
    expect(stern.expression).toBe('stern');
    expect(stern.layers).toHaveLength(1);
    expect(speaking.layers).toHaveLength(1);
    expect(surprised.layers).toHaveLength(1);
    expect(neutral.layers[0]?.slot).toBe('base');
    expect(stern.layers[0]?.slot).toBe('base');
    expect(speaking.layers[0]?.asset).not.toBe(neutral.layers[0]?.asset);
    expect(surprised.layers[0]?.asset).not.toBe(neutral.layers[0]?.asset);
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

  it('uses the refreshed neutral Silhouette portrait on the single-layer contract', () => {
    const neutral = resolveStoryPortrait(beat({
      speaker: 'Тень',
      portraitKey: 'silhouette',
      portraitSide: 'right',
    }));
    const explicitExpression = resolveStoryPortrait(beat({
      speaker: 'Тень',
      portraitKey: 'silhouette',
      portraitSide: 'right',
      portraitExpression: 'surprised',
    }));

    expect(neutral.aspectRatio).toBe(2 / 3);
    expect(neutral.layers).toHaveLength(1);
    expect(neutral.layers[0]?.slot).toBe('base');
    expect(neutral.layers[0]?.asset).toBe(explicitExpression.layers[0]?.asset);
  });

  it('uses refreshed single-asset expressions for Lucian', () => {
    const neutral = resolveStoryPortrait(beat({
      speaker: 'Люциан',
      text: 'Я ждал достаточно долго.',
      portraitKey: 'lucian',
      portraitSide: 'right',
      portraitExpression: 'neutral',
    }));
    const speaking = resolveStoryPortrait(beat({
      speaker: 'Люциан',
      text: 'Нам нужно поговорить до того, как дом проснётся.',
      portraitKey: 'lucian',
      portraitSide: 'right',
      portraitExpression: 'speaking',
    }));
    const surprised = resolveStoryPortrait(beat({
      speaker: 'Люциан',
      text: 'Что?!',
      portraitKey: 'lucian',
      portraitSide: 'right',
    }));

    expect(neutral.layers).toHaveLength(1);
    expect(speaking.layers).toHaveLength(1);
    expect(surprised.layers).toHaveLength(1);
    expect(neutral.layers[0]?.slot).toBe('base');
    expect(speaking.expression).toBe('speaking');
    expect(speaking.layers[0]?.asset).not.toBe(neutral.layers[0]?.asset);
    expect(surprised.expression).toBe('surprised');
  });

  it('preloads the base, expression layers, and legacy portraits', () => {
    expect(storyPortraitAssets.length).toBeGreaterThanOrEqual(12);
  });
});
