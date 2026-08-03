import { describe, expect, it } from 'vitest';
import type { StoryDialogueBeat } from '../src/data/storyScenes';
import {
  getStoryUiMode,
  renderStoryDialogueContent,
} from '../src/ui/storyUiPresentation';

function beat(overrides: Partial<StoryDialogueBeat> = {}): StoryDialogueBeat {
  return {
    speaker: 'Лорд Адриан',
    text: 'Дом запомнил шаги каждого, кто пытался открыть эту дверь.',
    portraitKey: 'adrian',
    portraitSide: 'right',
    ...overrides,
  };
}

describe('FEATURE-066 story UI presentation', () => {
  it('renders the progress, story controls, skip action, and continue action', () => {
    const markup = renderStoryDialogueContent({
      beat: beat(),
      beatIndex: 1,
      beatCount: 4,
      continueLabel: 'Далее',
    });

    expect(markup).toContain('aria-label="Реплика 2 из 4"');
    expect(markup).toContain('data-action="story-skip"');
    expect(markup).toContain('data-action="continue"');
    expect(markup).toContain('История');
    expect(markup).toContain('Авто');
    expect(markup).toContain('Пропустить');
    expect(markup).toContain('Далее');
    expect(markup.match(/class="active"/g)).toHaveLength(2);
  });

  it('escapes dialogue copy before adding it to the story markup', () => {
    const markup = renderStoryDialogueContent({
      beat: beat({ text: '<script>alert("Raven")</script>' }),
      beatIndex: 0,
      beatCount: 1,
      continueLabel: 'Закрыть',
    });

    expect(markup).not.toContain('<script>');
    expect(markup).toContain('&lt;script&gt;');
  });

  it('supports dialogue, Evelyn monologue, and narrator visual modes', () => {
    expect(getStoryUiMode(beat())).toBe('dialogue');
    expect(getStoryUiMode(beat({
      speaker: 'Эвелин',
      portraitKey: 'evelyn',
      portraitSide: 'left',
      text: 'Мне казалось, дом узнал меня раньше, чем я увидела его.',
    }))).toBe('monologue');
    expect(getStoryUiMode(beat({
      speaker: 'Рассказчик',
      portraitKey: 'silhouette',
      text: 'Ночь опустилась на поместье.',
    }))).toBe('narrator');
  });
});
