import type { StoryDialogueBeat } from '../data/storyScenes';

export type StoryUiMode = 'dialogue' | 'monologue' | 'narrator';

export type StoryDialogueMarkupOptions = Readonly<{
  beat: StoryDialogueBeat;
  beatIndex: number;
  beatCount: number;
  continueLabel: string;
}>;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getStoryUiMode(beat: StoryDialogueBeat): StoryUiMode {
  if (beat.speaker.trim().toLowerCase() === 'рассказчик') return 'narrator';

  if (
    beat.portraitKey === 'evelyn'
    && /(казалось|повторяла себе|подумала|вспомнила|не могла отделаться от мысли)/i.test(beat.text)
  ) {
    return 'monologue';
  }

  return 'dialogue';
}

export function renderStoryDialogueContent({
  beat,
  beatIndex,
  beatCount,
  continueLabel,
}: StoryDialogueMarkupOptions): string {
  const progressDots = Array.from({ length: beatCount }, (_, index) => (
    `<span class="${index <= beatIndex ? 'active' : ''}" aria-hidden="true"></span>`
  )).join('');

  const lineNumber = beatIndex + 1;

  return `
    <div class="story-dialogue-copy" aria-live="polite" aria-atomic="true">
      <div class="story-dialogue-meta">
        <div class="story-beat-progress" aria-label="Реплика ${lineNumber} из ${beatCount}">${progressDots}</div>
        <span class="story-beat-counter" aria-hidden="true">${lineNumber}/${beatCount}</span>
      </div>
      <p data-story-text>${escapeHtml(beat.text)}</p>
    </div>
    <div class="story-dialogue-controls" aria-label="Управление сюжетной сценой">
      <button
        type="button"
        class="story-tool-button"
        disabled
        title="Скоро"
        aria-label="История диалога пока недоступна"
      ><span aria-hidden="true">↶</span><span>История</span></button>
      <button
        type="button"
        class="story-tool-button"
        disabled
        title="Скоро"
        aria-label="Автоматическое продолжение пока недоступно"
      ><span aria-hidden="true">▶</span><span>Авто</span></button>
      <button
        type="button"
        class="story-tool-button story-tool-button--skip"
        data-action="story-skip"
        aria-label="Пропустить сцену"
      ><span aria-hidden="true">⇥</span><span>Пропустить</span></button>
      <button
        type="button"
        class="story-continue-button"
        data-action="continue"
        aria-label="Продолжить сцену"
      ><span>${escapeHtml(continueLabel)}</span><span class="story-continue-chevron" aria-hidden="true">›</span></button>
    </div>
  `;
}
