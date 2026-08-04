import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const appSource = readFileSync(new URL('../src/ui/GameApp.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');

describe('FEATURE-068B journal book visual contract', () => {
  it('renders a cover, five-room index, selected folio, and semantic entry hooks', () => {
    expect(appSource).toContain('journal-book');
    expect(appSource).toContain('data-journal-room-tab=');
    expect(appSource).toContain('journal-page');
    expect(appSource).toContain('journal-entry-grid');
    expect(appSource).toContain('data-journal-entry-id=');
    expect(appSource).toContain('data-journal-status=');
    expect(appSource).toContain('data-journal-importance=');
    expect(appSource).toContain('data-journal-room=');
    expect(appSource).toContain('journal-entry-action');
  });

  it('selects the unread room by default and switches folios without replaying the open cue', () => {
    expect(appSource).toContain('private selectedJournalRoomId: string | null = null;');
    expect(appSource).toContain('?? nextStoryScene?.roomId');
    expect(appSource).toContain('this.showStoryJournal(false)');
    expect(appSource).toContain("if (playOpenCue) this.audio.play('journalOpen')");
  });

  it('keeps the room-context source and story replay flow intact', () => {
    expect(appSource).toContain('getLatestUnlockedStoryScene');
    expect(appSource).toContain('getStoryBackgroundAsset');
    expect(appSource).toContain("this.showStory(levelId, undefined, 'journal')");
  });

  it('defines a materially different two-column folio and preserves the portrait hotfix order', () => {
    const featureStart = styles.indexOf('FEATURE-068B: rejected card-stack pass replaced by a book, chapter index, and selected folio.');
    const hotfixStart = styles.indexOf('HOTFIX-066A — smaller story portraits');

    expect(featureStart).toBeGreaterThan(-1);
    expect(styles).toContain('.journal-book-cover');
    expect(styles).toContain('.journal-room-tabs');
    expect(styles).toContain('.journal-room-tab--selected');
    expect(styles).toContain('.journal-page-header');
    expect(styles).toContain('grid-template-columns: repeat(2, minmax(0,1fr));');
    expect(styles).toContain('.journal-entry--new');
    expect(styles).toContain('.journal-entry--locked');
    expect(styles).toContain('.journal-entry--major');
    expect(styles).toContain('.journal-entry-action');
    expect(hotfixStart).toBeGreaterThan(featureStart);
  });
});
