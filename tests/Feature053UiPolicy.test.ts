import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const appSource = readFileSync(new URL('../src/ui/GameApp.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');

describe('FEATURE-053 navigation and notification policy', () => {
  it('uses the journal as the only home story entry and displays an unread badge', () => {
    const homeStart = appSource.indexOf('showHome(): void');
    const journalStart = appSource.indexOf('private showStoryJournal', homeStart);
    const homeSource = appSource.slice(homeStart, journalStart);

    expect(homeSource).toContain('journal-home-button--new');
    expect(homeSource).toContain('journal-new-bubble');
    expect(homeSource).not.toContain('Продолжить историю');
    expect(homeSource).not.toContain('data-action="story"');
  });

  it('puts audio first and the contextual mechanics note after board guides', () => {
    const settingsStart = appSource.indexOf('private showSettings');
    const settingsEnd = appSource.indexOf('private exportSave', settingsStart);
    const settingsSource = appSource.slice(settingsStart, settingsEnd);

    expect(settingsSource.indexOf('Музыка и звуки')).toBeLessThan(settingsSource.indexOf('Язык интерфейса и сюжета'));
    expect(settingsSource.indexOf('Язык интерфейса и сюжета')).toBeLessThan(settingsSource.indexOf('Подсказки и обучение'));
    expect(settingsSource.indexOf('Подсказки и обучение')).toBeLessThan(settingsSource.indexOf('Сильные комбинации'));
    expect(settingsSource.indexOf('Сильные комбинации')).toBeLessThan(settingsSource.indexOf('Новые механики позднее'));
  });

  it('adds a global settings action and disables journal animation for reduced motion', () => {
    expect(appSource).toContain('data-action="settings-global"');
    expect(appSource).toContain("case 'game': return () => this.renderGame()");
    expect(styles).toContain('@keyframes journalAttention');
    expect(styles).toContain('.journal-home-button--new { animation: none; }');
  });
});
