import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const app = readFileSync(new URL('../src/ui/GameApp.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
const translations = readFileSync(new URL('../src/localization/uiTranslations.ts', import.meta.url), 'utf8');
const version = readFileSync(new URL('../src/appVersion.ts', import.meta.url), 'utf8');

describe('FEATURE-071 result transitions', () => {
  it('uses the canonical current room stage for win and loss scenes', () => {
    expect(app).toContain('private renderResultScene');
    expect(app).toContain('getRoomVisualState(');
    expect(app).toContain('this.renderRoomSceneArt(room.id, sceneAsset');
    expect(app).toContain('data-result-room="${room.id}"');
    expect(app).toContain("this.renderResultScene(resultRoomId, completedLevelId, 'win')");
    expect(app).toContain("this.renderResultScene(resultRoomId, this.currentLevel.id, 'loss')");
  });

  it('prioritises story, restoration and next level without changing handlers', () => {
    expect(app).toContain('const storyPending = Boolean');
    expect(app).toContain('const primaryAction: ResultAction = storyPending');
    expect(app).toContain('?? nextLevelAction');
    expect(app).toContain('data-action="${primaryAction.action}"');
    expect(app).toContain("this.bindModal('repair-now'");
    expect(app).toContain("this.bindModal('next-level'");
    expect(app).toContain("this.bindModal('story'");
    expect(app).toContain('this.progress.state.stars[completedLevelId] ?? stars');
  });

  it('shows attempt objective progress after defeat', () => {
    expect(app).toContain('private renderResultObjectiveRows');
    expect(app).toContain('result-objective-summary');
    expect(app).toContain('result-objective-row');
    expect(app).toContain('data-action="retry"');
  });

  it('defines a contained responsive result sheet and complete locales', () => {
    expect(styles).toContain('FEATURE-071');
    expect(styles).toContain('grid-template-rows: minmax(190px, 38dvh) minmax(0, 1fr)');
    expect(styles).toContain('overflow-y: auto');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(translations).toContain("{ ru: 'Сюжет ждёт', en: 'Story awaits'");
    expect(translations).toContain("{ ru: 'Осталось выполнить', en: 'Still to complete'");
  });

  it('publishes the FEATURE-071 build label', () => {
    expect(version).toContain('0.10.6-playtest.071-result-transitions');
    expect(version).toContain('FEATURE-071 · Win, fail and transitions');
  });
});
