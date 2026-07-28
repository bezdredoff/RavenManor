import ravenMark from '../assets/ui/raven-mark.svg?url';
import storyJournalIcon from '../assets/ui/story-journal.svg?url';
import settingsGearIcon from '../assets/ui/settings-gear.svg?url';
import { APP_VERSION, BUILD_LABEL } from '../appVersion';
import { PlaytestAnalytics } from '../analytics/PlaytestAnalytics';
import { formatBoosterReward, type BoosterKind } from '../boosters/BoosterTypes';
import { getBoosterUnlockTask, isBoosterUnlocked } from '../boosters/BoosterProgression';
import { AudioManager } from '../audio/AudioManager';
import {
  levelGroups,
  levels,
  rooms,
  tileTypes,
  type LevelObjectiveDefinition,
  type LevelDefinition,
  type LevelDifficulty,
} from '../data/gameData';
import {
  restorationTasks,
  type RestorationTaskDefinition,
} from '../data/restorationTasks';
import { roomVisuals } from '../data/roomVisuals';
import { storyScenes } from '../data/storyScenes';
import { Match3Engine, type ObstacleDamage, type Position } from '../engine/Match3Engine';
import {
  applySpecialCreations,
  findCreatedSpecialPositions,
  planDirectSpecialResolution,
  planMatchedResolution,
  type SpecialResolutionPlan,
} from '../engine/SpecialTileResolver';
import { findBestMove } from '../engine/MoveAdvisor';
import { ProgressStore } from '../engine/ProgressStore';
import {
  getLevelGroupState,
  getNextPlayableLevelId,
} from '../meta/LevelProgression';
import { calculateLevelStars } from '../meta/LevelStarRating';
import {
  completeRestorationTask,
  getRestorationTaskStatus,
  getRoomRestorationTasks,
} from '../meta/RoomRestoration';
import { getRoomUnlockState } from '../meta/RoomProgression';
import {
  getNextUnviewedStoryScene,
  getStoryJournalGroups,
  getStoryJournalProgress,
  getStorySceneForLevel,
} from '../meta/StoryProgression';
import { getRoomVisualState } from '../meta/RoomVisualState';
import { getActiveRestoration } from '../meta/ActiveRestoration';
import {
  shouldOfferTutorial,
  shouldShowTutorial,
  type TutorialPreference,
} from '../meta/TutorialState';
import { createLevelObjectives } from '../objectives/ObjectiveFactory';
import type { ObjectiveSnapshot } from '../objectives/LevelObjective';
import { ObjectiveTracker } from '../objectives/ObjectiveTracker';
import { getObstacleLabel, type ObstacleKind } from '../engine/ObstacleTypes';
import { getScreenClassName, type ScreenMode } from './layoutPolicy';
import { resolveSettingsCallerMode } from './settingsNavigation';
import { getLevelMapFocusGroupId } from './levelMapFocus';
import { getViewportProfile } from './responsivePolicy';
import {
  createParticleIndexes,
  getMotionDuration,
  type MotionDurationName,
  type VfxKind,
} from './motionPolicy';
import { getTileClassName, getTileKey } from './tilePresentation';
import { getSpecialPresentation, specialAssets } from './specialPresentation';
import { getObstaclePresentation, obstacleAssets } from './obstaclePresentation';
import { getBoosterPresentation, boosterAssets } from './boosterPresentation';
import { getRoomSceneAsset } from './roomPresentation';
import { getLayeredRoomSceneMarkup, isLayeredRoom, layeredRoomAssets } from './roomLayeredPresentation';
import { getStoryScenePresentation, storyAssets } from './storyPresentation';
import { getRestorationBlockedMessage } from './restorationFeedback';
import {
  getStoryContinueLabel,
  resolveStoryContinuation,
  type StoryReturnTarget,
} from './storyFlow';
import { downloadJson } from '../platform/Download';
import { preloadImageAssets } from '../platform/AssetPreloader';
import { ErrorLog } from '../platform/ErrorLog';
import { PwaManager, getPwaStatusLabel } from '../pwa/PwaManager';
import { LocalizationManager, LOCALE_OPTIONS, type AppLocale } from '../localization/Localization';

type SwapOffset = Readonly<{ x: number; y: number }>;

type RoomReveal = Readonly<{
  roomId: string;
  previousAsset: string;
  taskTitle: string;
  unlockedRoomTitle?: string;
  rewardMessage?: string;
  unlockMessage?: string;
}>;

const DIFFICULTY_LABELS: Record<LevelDifficulty, string> = {
  easy: 'Легко',
  normal: 'Обычно',
  hard: 'Сложно',
  finale: 'Финал',
};

export class GameApp {
  private readonly root: HTMLElement;
  private readonly progress = new ProgressStore(restorationTasks);
  private readonly audio = new AudioManager();
  private readonly analytics = new PlaytestAnalytics();
  private readonly pwa = new PwaManager();
  private readonly localization = new LocalizationManager();
  private readonly errors: ErrorLog;
  private engine = new Match3Engine();

  private currentRoomId = 'hall';
  private currentLevel: LevelDefinition | null = null;
  private selected: Position | null = null;
  private objectiveTracker: ObjectiveTracker | null = null;
  private movesLeft = 0;
  private busy = false;
  private readonly matchedTiles = new Set<string>();
  private readonly invalidTiles = new Set<string>();
  private readonly hintedTiles = new Set<string>();
  private readonly createdSpecialTiles = new Set<string>();
  private boardSettling = false;
  private boardReshuffling = false;
  private boardMessage = '';
  private cascadeLevel = 0;
  private readonly swapOffsets = new Map<string, SwapOffset>();
  private currentScreenMode: ScreenMode | null = null;
  private pendingRoomReveal: RoomReveal | null = null;
  private recentlyUnlockedRoomId: string | null = null;
  private modalCloseTimer: number | null = null;
  private toastTimer: number | null = null;
  private starWalletExpanded = false;
  private activeBooster: BoosterKind | null = null;
  private settingsReturnAction: (() => void) | null = null;

  constructor(root: HTMLElement, errors: ErrorLog = new ErrorLog()) {
    this.root = root;
    this.errors = errors;
    this.audio.arm();
    void this.pwa.register();
    preloadImageAssets([ravenMark, storyJournalIcon, settingsGearIcon, ...tileTypes.map((tile) => tile.assetPath), ...specialAssets, ...obstacleAssets, ...boosterAssets, ...storyAssets, ...layeredRoomAssets]);
    this.renderShell();
    this.syncViewportProfile();
    window.addEventListener('resize', () => this.syncViewportProfile());
    window.visualViewport?.addEventListener('resize', () => this.syncViewportProfile());
    this.showHome();
    if (this.progress.recoveryNotice) {
      window.setTimeout(() => this.showToast(this.progress.recoveryNotice!, 'warning'), 0);
    }
  }

  private renderShell(): void {
    this.root.innerHTML = `
      <main class="app-shell">
        <section id="screen"></section>
        <div id="modal" class="modal"></div>
        <div id="toast" class="toast" role="status" aria-live="polite" aria-atomic="true"></div>
      </main>
    `;
  }

  private syncViewportProfile(): void {
    const viewport = window.visualViewport;
    const width = viewport?.width ?? window.innerWidth;
    const height = viewport?.height ?? window.innerHeight;
    const shell = this.root.querySelector<HTMLElement>('.app-shell');
    if (shell) shell.dataset.layoutProfile = getViewportProfile(width, height);
  }

  private get screen(): HTMLElement {
    return this.root.querySelector('#screen') as HTMLElement;
  }

  private get modal(): HTMLElement {
    return this.root.querySelector('#modal') as HTMLElement;
  }

  private get toast(): HTMLElement {
    return this.root.querySelector('#toast') as HTMLElement;
  }

  private renderScreen(mode: ScreenMode, content: string): void {
    const isNavigation = this.currentScreenMode !== mode;
    if (isNavigation) this.starWalletExpanded = false;
    this.currentScreenMode = mode;
    if (isNavigation) this.analytics.recordScreen(mode);
    this.screen.className = `${getScreenClassName(mode)}${isNavigation ? ' screen-enter' : ''}`;
    this.screen.innerHTML = content;
    this.bindImageStates(this.screen);
    this.localization.translateElement(this.screen);
    this.bindStarWalletToggle();
    this.bindGlobalSettings();
  }

  private topbar(title: string, back?: () => void, showSettings = true): string {
    return `
      <header class="topbar">
        ${back
          ? '<button class="icon-button" data-action="back" aria-label="Назад"><span aria-hidden="true">‹</span></button>'
          : '<div class="topbar-spacer" aria-hidden="true"></div>'}
        <div class="brand" title="${title}">${title}</div>
        <div class="topbar-actions">
          ${showSettings ? `
            <button type="button" class="icon-button settings-gear-button" data-action="settings-global" aria-label="Открыть настройки" title="Настройки">
              <img src="${settingsGearIcon}" alt="" draggable="false" />
            </button>
          ` : ''}
          <div class="star-wallet-control">
            <button
              type="button"
              class="resource"
              data-action="star-wallet-toggle"
              aria-expanded="${this.starWalletExpanded}"
              aria-controls="star-wallet-popover"
              title="Показать баланс звёзд"
              aria-label="Доступно звёзд: ${this.availableStars}. Показать подробный баланс"
            >
              <span aria-hidden="true">★</span><strong>${this.availableStars}</strong>
            </button>
            ${this.renderStarWallet()}
          </div>
        </div>
      </header>
    `;
  }

  private bindGlobalSettings(): void {
    const button = this.screen.querySelector<HTMLElement>('[data-action="settings-global"]');
    button?.addEventListener('click', () => {
      this.audio.play('ui');
      this.openSettingsFromCurrentScreen();
    });
  }

  private openSettingsFromCurrentScreen(): void {
    if (this.currentScreenMode === 'settings') return;
    const returnAction = this.getCurrentScreenReturnAction();
    this.showSettings(returnAction);
  }

  private getCurrentScreenReturnAction(): () => void {
    switch (resolveSettingsCallerMode(this.currentScreenMode)) {
      case 'journal': return () => this.showStoryJournal();
      case 'manor': return () => this.showManor();
      case 'levels': return () => this.showLevelMap();
      case 'room': return () => this.showRoom(this.currentRoomId);
      case 'game': return () => this.renderGame();
      case 'home':
      default: return () => this.showHome();
    }
  }

  private returnFromSettings(): void {
    const action = this.settingsReturnAction ?? (() => this.showHome());
    this.settingsReturnAction = null;
    action();
  }

  private get availableStars(): number {
    return this.progress.availableStars;
  }

  private renderStarWallet(): string {
    return `
      <section
        id="star-wallet-popover"
        class="star-wallet star-wallet-popover"
        aria-label="Баланс звёзд"
        ${this.starWalletExpanded ? '' : 'hidden'}
      >
        <div>
          <span>Заработано</span>
          <strong>★ ${this.progress.earnedStars}</strong>
        </div>
        <div>
          <span>Потрачено</span>
          <strong>★ ${this.progress.spentStars}</strong>
        </div>
        <div class="available">
          <span>Доступно</span>
          <strong>★ ${this.progress.availableStars}</strong>
        </div>
      </section>
    `;
  }

  private renderActiveRestorationCard(compact = false): string {
    const active = getActiveRestoration(
      rooms,
      restorationTasks,
      this.progress.state.completedRestorationTasks,
      this.progress.availableStars,
    );
    if (!active) {
      return `
        <section class="meta-link-card meta-link-card--complete ${compact ? 'compact' : ''}">
          <div class="meta-link-icon" aria-hidden="true">✓</div>
          <div>
            <div class="chapter">Текущий ремонт</div>
            <strong>Все доступные задачи выполнены</strong>
            <p>Продолжайте кампанию или пересмотрите восстановленные комнаты.</p>
          </div>
        </section>
      `;
    }

    const affordable = active.status === 'available';
    const statusText = affordable
      ? `Можно выполнить сейчас за ${active.task.starCost} ★`
      : `Нужно ещё ${active.starsMissing} ★`;
    const outcome = this.renderTaskOutcome(active.task, true);
    return `
      <section class="meta-link-card ${affordable ? 'ready' : ''} ${compact ? 'compact' : ''}">
        <div class="meta-link-icon" aria-hidden="true">⌂</div>
        <div class="meta-link-copy">
          <div class="chapter">Текущий ремонт · ${active.room.title}</div>
          <strong>${active.task.title}</strong>
          <p>${active.task.description}</p>
          ${outcome}
          <small>${statusText} · Доступно ${this.progress.availableStars} ★</small>
        </div>
        <button class="${affordable ? 'primary' : 'secondary'} compact" data-action="active-restoration" data-room-id="${active.room.id}">
          ${affordable ? 'Выполнить ремонт' : 'Открыть комнату'}
        </button>
      </section>
    `;
  }

  private renderTaskOutcome(task: RestorationTaskDefinition, compact = false): string {
    const parts: string[] = [];
    if (task.rewards?.length) {
      parts.push(`${task.roomCompletionReward ? 'Награда за комнату' : 'Награда'}: ${task.rewards.map(formatBoosterReward).join(' · ')}`);
    }
    if (task.unlocks?.length) {
      parts.push(task.unlocks.map((unlock) => unlock.title).join(' · '));
    }
    if (parts.length === 0) return '';
    return `<div class="restoration-outcome ${compact ? 'compact' : ''}">${parts.join('<br>')}</div>`;
  }

  private getTaskUnlockMessage(task: RestorationTaskDefinition): string | undefined {
    return task.unlocks?.map((unlock) => unlock.title).join(' · ');
  }

  private getTaskRewardMessage(task: RestorationTaskDefinition): string | undefined {
    return task.rewards?.length
      ? task.rewards.map(formatBoosterReward).join(' · ')
      : undefined;
  }

  showHome(): void {
    const storyProgress = getStoryJournalProgress(
      storyScenes,
      this.progress.state.completed,
      this.progress.state.viewedStoryScenes,
    );
    const hasNewStory = storyProgress.newCount > 0;
    this.renderScreen('home', `
      ${this.topbar('Raven Manor')}
      <section class="hero">
        <div class="raven-mark"><img src="${ravenMark}" alt="" draggable="false" /></div>
        <h1>Raven Manor</h1>
        <p class="subtitle">Проходите match-3 уровни, восстанавливайте поместье и раскрывайте тайну семьи Блэквуд.</p>
      </section>
      <div class="stack home-actions">
        <button class="primary" data-action="play">Играть</button>
        <button class="secondary" data-action="manor">Поместье</button>
        <button class="ghost journal-home-button ${hasNewStory ? 'journal-home-button--new' : ''}" data-action="journal">
          <img src="${storyJournalIcon}" alt="" draggable="false" />
          <span>Дневник · ${storyProgress.viewed}/${storyProgress.total}</span>
          ${hasNewStory ? '<span class="journal-new-bubble">Новое</span>' : ''}
        </button>
      </div>
      <p class="footer-note">Глава I · Возвращение в Raven Manor · ${APP_VERSION}</p>
    `);

    this.bind('play', () => this.showLevelMap());
    this.bind('manor', () => this.showManor());
    this.bind('journal', () => this.showStoryJournal());
  }

  private showStoryJournal(): void {
    const groups = getStoryJournalGroups(
      storyScenes,
      rooms,
      this.progress.state.completed,
      this.progress.state.viewedStoryScenes,
    );
    const progress = getStoryJournalProgress(
      storyScenes,
      this.progress.state.completed,
      this.progress.state.viewedStoryScenes,
    );
    const nextStoryScene = getNextUnviewedStoryScene(
      storyScenes,
      this.progress.state.completed,
      this.progress.state.viewedStoryScenes,
    );

    const groupCards = groups.map((group) => {
      const entries = group.entries.map((entry) => {
        const locked = entry.status === 'locked';
        const isNew = entry.status === 'new';
        const title = locked ? `Запись после уровня ${entry.scene.afterLevelId}` : entry.scene.title;
        const summary = locked
          ? `Пройдите уровень ${entry.scene.afterLevelId}, чтобы открыть эту запись.`
          : entry.scene.summary;
        const statusLabel = locked ? 'Закрыто' : isNew ? 'Новое' : 'Просмотрено';
        return `
          <article class="journal-entry journal-entry--${entry.status} ${entry.scene.importance === 'major' ? 'journal-entry--major' : ''}">
            <div class="journal-entry-number" aria-hidden="true">${String(entry.scene.afterLevelId).padStart(2, '0')}</div>
            <div class="journal-entry-copy">
              <div class="journal-entry-meta">
                <span>После уровня ${entry.scene.afterLevelId}</span>
                ${entry.scene.importance === 'major' && !locked ? '<span class="journal-major-badge">Ключевая сцена</span>' : ''}
                <span class="journal-status journal-status--${entry.status}">${statusLabel}</span>
              </div>
              <strong>${title}</strong>
              <p>${summary}</p>
            </div>
            ${locked
              ? '<div class="journal-lock" aria-hidden="true">◆</div>'
              : `<button class="${isNew ? 'primary' : 'secondary'} compact" data-story-level="${entry.scene.afterLevelId}">${isNew ? 'Смотреть' : 'Пересмотреть'}</button>`}
          </article>
        `;
      }).join('');

      return `
        <section class="journal-group" aria-label="${group.room.title}">
          <header class="journal-group-heading">
            <div>
              <div class="chapter">${group.room.title}</div>
              <h2>${group.entries[0]?.scene.chapter ?? group.room.title}</h2>
            </div>
            <strong>${group.viewedCount}/${group.entries.length}</strong>
          </header>
          <div class="journal-entry-list">${entries}</div>
        </section>
      `;
    }).join('');

    this.audio.play('journalOpen');
    this.renderScreen('journal', `
      ${this.topbar('Дневник', () => this.showHome())}
      <section class="journal-hero">
        <img src="${storyJournalIcon}" alt="" draggable="false" />
        <div>
          <div class="chapter">Архив воспоминаний</div>
          <h1>Дневник Raven Manor</h1>
          <p>Здесь сохраняются все открытые сюжетные эпизоды. Повторный просмотр не изменяет прогресс.</p>
        </div>
      </section>
      <section class="journal-progress-card">
        <div><span>Открыто</span><strong>${progress.unlocked}/${progress.total}</strong></div>
        <div><span>Просмотрено</span><strong>${progress.viewed}/${progress.total}</strong></div>
        <div><span>Новых</span><strong>${progress.newCount}</strong></div>
      </section>
      ${nextStoryScene
        ? `<button class="primary wide-action" data-action="journal-continue">Продолжить: ${nextStoryScene.title}</button>`
        : '<div class="journal-complete-note">Все открытые сцены просмотрены.</div>'}
      <div class="journal-group-list">${groupCards}</div>
    `);

    this.bind('back', () => this.showHome());
    if (nextStoryScene) {
      this.bind('journal-continue', () => this.showStory(nextStoryScene.afterLevelId, undefined, 'journal'));
    }
    this.screen.querySelectorAll<HTMLButtonElement>('[data-story-level]').forEach((button) => {
      button.addEventListener('click', () => {
        const levelId = Number(button.dataset.storyLevel);
        if (!Number.isInteger(levelId)) return;
        this.showStory(levelId, undefined, 'journal');
      });
    });
  }


  private renderRoomCardArt(roomId: string, sceneAsset: string, completedTaskCount: number): string {
    if (isLayeredRoom(roomId)) {
      return getLayeredRoomSceneMarkup(roomId, completedTaskCount, 'card');
    }
    return `<img src="${sceneAsset}" alt="" draggable="false" />`;
  }

  private renderRoomSceneArt(roomId: string, sceneAsset: string, completedTaskCount: number): string {
    if (isLayeredRoom(roomId)) {
      return getLayeredRoomSceneMarkup(roomId, completedTaskCount, 'detail');
    }
    return `<img class="room-visual-image" src="${sceneAsset}" alt="" draggable="false" />`;
  }

  private showManor(): void {
    const cards = rooms.map((room) => {
      const unlockState = getRoomUnlockState(
        room,
        restorationTasks,
        this.progress.state.completedRestorationTasks,
      );
      const locked = !unlockState.unlocked;
      const visualState = getRoomVisualState(
        room.id,
        roomVisuals,
        restorationTasks,
        this.progress.state.completedRestorationTasks,
      );
      const sourceRoom = rooms.find((candidate) => candidate.id === unlockState.sourceRoomId);
      const lockedLabel = sourceRoom
        ? `Выполните ${unlockState.required} задачи в комнате «${sourceRoom.title}» (${unlockState.current}/${unlockState.required})`
        : 'Комната пока недоступна';
      const restorationLabel = visualState.isComplete
        ? 'Комната восстановлена'
        : `Восстановление: ${visualState.completedTaskCount}/${visualState.totalTaskCount}`;

      const sceneAsset = getRoomSceneAsset(visualState.stage.assetKey);
      return `
        <article
          class="room-card room-card--visual ${locked ? 'locked' : ''} ${visualState.isComplete ? 'restored' : ''} ${this.recentlyUnlockedRoomId === room.id ? 'just-unlocked' : ''}"
          ${locked ? '' : `data-room="${room.id}" role="button" tabindex="0"`}
          aria-label="${locked ? `${room.title}. ${lockedLabel}` : `Открыть комнату ${room.title}`}"
        >
          <div class="room-card-art" aria-hidden="true">
            ${this.renderRoomCardArt(room.id, sceneAsset, visualState.completedTaskCount)}
            <div class="room-card-art-shade"></div>
            ${locked ? '<div class="room-card-lock"><span></span></div>' : ''}
            <div class="room-stage-badge">${visualState.completedTaskCount}/${visualState.totalTaskCount}</div>
          </div>
          <div class="room-card-copy">
            <div class="room-title">${room.title}</div>
            <div class="room-meta">${locked ? lockedLabel : visualState.stage.title}</div>
            ${locked ? '' : `<div class="room-restoration-meta">${restorationLabel}</div>`}
          </div>
        </article>
      `;
    }).join('');

    this.renderScreen('manor', `
      ${this.topbar('Поместье', () => this.showHome())}
      <div class="chapter">Глава I · Возвращение</div>
      <h2>Комнаты Raven Manor</h2>
      <p class="subtitle">Ремонт комнат открывает новые группы уровней, механики и полезные бустеры.</p>
      <div class="wide-action-grid">
        <button class="primary" data-action="levels">Перейти к уровням</button>
        <button class="secondary" data-action="journal">Открыть дневник</button>
      </div>
      <div class="room-list">${cards}</div>
      <button class="ghost reset" data-action="reset">Сбросить прогресс</button>
    `);

    this.bind('back', () => this.showHome());
    this.bind('levels', () => this.showLevelMap());
    this.bind('journal', () => this.showStoryJournal());
    this.bind('reset', () => {
      if (confirm(this.localization.translate('Сбросить весь прогресс?'))) {
        this.progress.reset();
        this.analytics.recordAction('progress_reset');
        this.pendingRoomReveal = null;
        this.recentlyUnlockedRoomId = null;
        this.showManor();
      }
    });
    this.playRecentRoomUnlock();
    this.screen.querySelectorAll<HTMLElement>('[data-room]').forEach((card) => {
      const openRoom = () => {
        if (card.dataset.actionPending === 'true') return;
        card.dataset.actionPending = 'true';
        this.audio.play('ui');
        this.showRoom(card.dataset.room!);
      };
      card.addEventListener('click', openRoom);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openRoom();
        }
      });
    });
  }

  private getLevelMapFocusTarget(): string | null {
    const states = levelGroups.map((group) => {
      const state = getLevelGroupState(
        group,
        levelGroups,
        this.progress.state.completed,
        this.progress.state.completedRestorationTasks,
      );
      return {
        id: group.id,
        unlocked: state.unlocked,
        completedCount: state.completedCount,
        totalCount: state.totalCount,
      };
    });
    return getLevelMapFocusGroupId(states);
  }

  private showLevelMap(focusGroupId: string | null = null): void {
    const groupCards = levelGroups.map((group) => {
      const state = getLevelGroupState(
        group,
        levelGroups,
        this.progress.state.completed,
        this.progress.state.completedRestorationTasks,
      );
      const sourceGroup = levelGroups.find((candidate) => candidate.id === state.sourceGroupId);
      const requiredTask = restorationTasks.find((task) => task.id === state.requiredTaskId);
      const unlockMessage = state.unlocked
        ? `Пройдено ${state.completedCount}/${state.totalCount}`
        : requiredTask
          ? `Нужен ремонт: «${requiredTask.title}»`
          : `Пройдите ${state.requiredCount} уровня в группе «${sourceGroup?.title ?? ''}»`;
      const levelCards = group.levelIds.map((levelId) => {
        const level = levels.find((candidate) => candidate.id === levelId);
        if (!level) throw new Error(`Unknown level in group ${group.id}: ${levelId}`);
        return this.renderLevelCard(level, state.unlocked);
      }).join('');

      return `
        <section class="level-group ${state.unlocked ? '' : 'locked'}" data-level-group-id="${group.id}" tabindex="-1">
          <div class="level-group-heading">
            <div>
              <div class="chapter">${state.unlocked ? 'Доступно' : 'Закрыто ремонтом'}</div>
              <h2>${group.title}</h2>
              <p class="subtitle">${group.description}</p>
            </div>
            <div class="group-progress">${unlockMessage}</div>
          </div>
          <div class="level-grid level-grid-map">${levelCards}</div>
        </section>
      `;
    }).join('');

    this.renderScreen('levels', `
      ${this.topbar('Уровни', () => this.showHome())}
      <div class="chapter">Match-3 кампания</div>
      <h2>Зарабатывайте звёзды для ремонта</h2>
      <p class="subtitle">Первые уровни доступны сразу. Ключевые ремонты открывают следующие группы и новые механики.</p>
      ${this.renderActiveRestorationCard()}
      <button class="secondary wide-action" data-action="manor">Открыть поместье</button>
      <div class="level-group-list">${groupCards}</div>
    `);

    if (focusGroupId) {
      window.requestAnimationFrame(() => {
        const target = this.screen.querySelector<HTMLElement>(
          `[data-level-group-id="${focusGroupId}"]`,
        );
        target?.scrollIntoView({ block: 'start', inline: 'nearest' });
        target?.focus({ preventScroll: true });
      });
    }

    this.bind('back', () => this.showHome());
    this.bind('manor', () => this.showManor());
    this.bind('active-restoration', (button) => this.showRoom(button.dataset.roomId ?? 'hall'));
    this.screen.querySelectorAll<HTMLButtonElement>('[data-level]').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.actionPending === 'true') return;
        button.dataset.actionPending = 'true';
        button.disabled = true;
        this.audio.play('ui');
        this.startLevel(Number(button.dataset.level));
      });
    });
  }

  private renderLevelCard(level: LevelDefinition, groupUnlocked: boolean): string {
    const stars = this.progress.state.stars[level.id] ?? 0;
    return `
      <article class="level-card ${groupUnlocked ? '' : 'locked'}">
        <div>
          <div class="level-card-topline">
            <div class="level-number">${String(level.id).padStart(3, '0')}</div>
            <span class="difficulty difficulty-${level.difficulty}">${DIFFICULTY_LABELS[level.difficulty]}</span>
          </div>
          <h3>${level.title}</h3>
          <div class="room-meta level-objective">${this.renderLevelObjectiveSummary(level)}</div>
          <div class="balance-meta">${level.moves} ходов · 3★ при ${level.starThresholds.threeStarsMovesLeft}+ оставшихся</div>
        </div>
        <div>
          <div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
          <button class="${groupUnlocked ? 'primary' : 'ghost'}" ${groupUnlocked ? '' : 'disabled'} data-level="${level.id}">
            ${groupUnlocked ? 'Играть' : 'Закрыто'}
          </button>
        </div>
      </article>
    `;
  }

  private showRoom(roomId: string): void {
    this.currentRoomId = roomId;
    const room = rooms.find((item) => item.id === roomId);
    if (!room) return;

    const unlockState = getRoomUnlockState(
      room,
      restorationTasks,
      this.progress.state.completedRestorationTasks,
    );
    if (!unlockState.unlocked) {
      this.showManor();
      return;
    }

    const restorationCards = getRoomRestorationTasks(restorationTasks, room.id)
      .map((task) => this.renderRestorationTask(task))
      .join('');
    const roomVisual = this.renderRoomVisual(room.id, room.title);

    this.renderScreen('room', `
      ${this.topbar(room.title, () => this.showManor())}
      <p class="subtitle">${room.description}</p>
      ${roomVisual}
      <section class="room-section">
        <div class="section-heading">
          <div>
            <div class="chapter">Восстановление</div>
            <h2>Задачи комнаты</h2>
          </div>
        </div>
        <div class="restoration-list">${restorationCards}</div>
      </section>
      <section class="room-section room-level-cta">
        <div>
          <div class="chapter">Match-3</div>
          <h2>Нужны ещё звёзды?</h2>
          <p class="subtitle">Проходите открытые уровни, зарабатывайте звёзды и возвращайтесь к текущей задаче ремонта.</p>
        </div>
        <button class="primary" data-action="levels">К уровням</button>
      </section>
    `);

    this.bind('back', () => this.showManor());
    this.bind('levels', () => this.showLevelMap(this.getLevelMapFocusTarget()));
    this.screen.querySelectorAll<HTMLButtonElement>('[data-restoration-task]').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.actionPending === 'true') return;
        button.dataset.actionPending = 'true';
        this.restoreTask(button.dataset.restorationTask!);
        window.setTimeout(() => {
          if (button.isConnected) delete button.dataset.actionPending;
        }, 300);
      });
    });
  }

  private renderRoomVisual(roomId: string, roomTitle: string): string {
    const state = getRoomVisualState(
      roomId,
      roomVisuals,
      restorationTasks,
      this.progress.state.completedRestorationTasks,
    );
    const roomTasks = getRoomRestorationTasks(restorationTasks, roomId);
    const milestones = roomTasks.map((task, index) => {
      const completed = Boolean(this.progress.state.completedRestorationTasks[task.id]);
      return `
        <div class="room-visual-milestone ${completed ? 'completed' : ''}">
          <span>${completed ? '✓' : index + 1}</span>
          <small>${task.title}</small>
        </div>
      `;
    }).join('');

    const sceneAsset = getRoomSceneAsset(state.stage.assetKey);
    const reveal = this.pendingRoomReveal?.roomId === roomId
      ? this.pendingRoomReveal
      : null;
    const revealParticles = reveal
      ? this.renderVfxParticles(reveal.unlockedRoomTitle ? 'unlock' : 'restoration', 'restoration-spark')
      : '';
    return `
      <section
        class="room-visual room-visual--${roomId} stage-${state.completedTaskCount} ${reveal ? 'is-revealing' : ''}"
        data-room-asset="${state.stage.assetKey}"
        aria-label="${roomTitle}: ${state.stage.title}"
      >
        <div class="room-visual-scene">
          ${this.renderRoomSceneArt(roomId, sceneAsset, state.completedTaskCount)}
          <div class="room-visual-vignette" aria-hidden="true"></div>
          ${reveal ? `
            <div class="room-restoration-reveal" data-restoration-reveal role="status" aria-live="polite">
              <img class="room-restoration-before" src="${reveal.previousAsset}" alt="" draggable="false" />
              <div class="room-restoration-flash" aria-hidden="true"></div>
              <div class="room-restoration-particles" aria-hidden="true">${revealParticles}</div>
              <div class="room-restoration-message">
                <span>Восстановлено</span>
                <strong>${reveal.taskTitle}</strong>
                ${reveal.rewardMessage ? `<small>Получено: ${reveal.rewardMessage}</small>` : ''}
                ${reveal.unlockMessage ? `<small>${reveal.unlockMessage}</small>` : ''}
                ${reveal.unlockedRoomTitle ? `<small>Открыта комната «${reveal.unlockedRoomTitle}»</small>` : ''}
              </div>
            </div>
          ` : ''}
          <div class="room-visual-copy">
            <div class="room-visual-stage-label">Состояние ${state.completedTaskCount}/${state.totalTaskCount}</div>
            <h2>${state.stage.title}</h2>
            <p>${state.stage.description}</p>
          </div>
        </div>
        <div class="room-visual-milestones">${milestones}</div>
      </section>
    `;
  }

  private renderRestorationTask(task: RestorationTaskDefinition): string {
    const roomTasks = getRoomRestorationTasks(restorationTasks, task.roomId);
    const status = getRestorationTaskStatus(
      task,
      roomTasks,
      this.progress.state.completedRestorationTasks,
      this.availableStars,
    );
    const completed = status === 'completed';
    const disabled = completed || status === 'locked';
    const buttonLabel = status === 'completed'
      ? 'Выполнено'
      : status === 'locked'
        ? 'Сначала предыдущая'
        : `${task.starCost} ★`;

    return `
      <article class="restoration-card ${completed ? 'completed' : ''} ${status === 'locked' ? 'locked' : ''} ${status === 'insufficient-stars' ? 'insufficient-stars' : ''}">
        <div class="restoration-status">${completed ? '✓' : task.order}</div>
        <div>
          <h3>${task.title}${task.optional ? ' <small class="optional-task-label">Необязательно</small>' : ''}</h3>
          <div class="room-meta">${task.description}</div>
          ${this.renderTaskOutcome(task)}
        </div>
        <button
          class="${completed ? 'ghost' : 'secondary'} compact"
          ${disabled ? 'disabled' : ''}
          data-restoration-task="${task.id}"
          data-restoration-status="${status}"
        >${buttonLabel}</button>
      </article>
    `;
  }

  private restoreTask(taskId: string): void {
    const task = restorationTasks.find((candidate) => candidate.id === taskId);
    if (!task) return;

    const roomTasks = getRoomRestorationTasks(restorationTasks, task.roomId);
    const status = getRestorationTaskStatus(
      task,
      roomTasks,
      this.progress.state.completedRestorationTasks,
      this.availableStars,
    );
    const blockedMessage = getRestorationBlockedMessage(status, task, this.availableStars);
    if (blockedMessage) {
      this.analytics.recordAction('restoration_blocked', { taskId: task.id, roomId: task.roomId, status });
      this.audio.play('invalid');
      this.showToast(blockedMessage, 'warning');
      return;
    }
    if (status !== 'available') return;

    const beforeVisual = getRoomVisualState(
      this.currentRoomId,
      roomVisuals,
      restorationTasks,
      this.progress.state.completedRestorationTasks,
    );
    const unlockedBefore = new Set(
      rooms
        .filter((room) => getRoomUnlockState(
          room,
          restorationTasks,
          this.progress.state.completedRestorationTasks,
        ).unlocked)
        .map((room) => room.id),
    );
    const updatedTasks = completeRestorationTask(
      taskId,
      restorationTasks,
      this.progress.state.completedRestorationTasks,
      this.progress.availableStars,
    );

    if (!updatedTasks[taskId] || this.progress.state.completedRestorationTasks[taskId]) {
      this.showRoom(this.currentRoomId);
      return;
    }

    this.progress.completeRestorationTask(taskId);
    this.analytics.recordRestoration(task.id, task.roomId);
    const afterVisual = getRoomVisualState(
      this.currentRoomId,
      roomVisuals,
      restorationTasks,
      this.progress.state.completedRestorationTasks,
    );
    const newlyUnlockedRoom = rooms.find((room) => (
      !unlockedBefore.has(room.id)
      && getRoomUnlockState(
        room,
        restorationTasks,
        this.progress.state.completedRestorationTasks,
      ).unlocked
    ));

    this.pendingRoomReveal = {
      roomId: this.currentRoomId,
      previousAsset: getRoomSceneAsset(beforeVisual.stage.assetKey),
      taskTitle: task.title,
      unlockedRoomTitle: newlyUnlockedRoom?.title,
      rewardMessage: this.getTaskRewardMessage(task),
      unlockMessage: this.getTaskUnlockMessage(task),
    };
    this.recentlyUnlockedRoomId = newlyUnlockedRoom?.id ?? this.recentlyUnlockedRoomId;
    this.audio.play(task.rewards?.length ? 'boosterReward' : newlyUnlockedRoom ? 'unlock' : 'restore');
    this.showRoom(this.currentRoomId);
    this.playRestorationReveal();
  }

  private startLevel(levelId: number): void {
    this.currentLevel = levels.find((level) => level.id === levelId) ?? null;
    if (!this.currentLevel) throw new Error(`Unknown level: ${levelId}`);

    const group = levelGroups.find((candidate) => candidate.levelIds.includes(levelId));
    if (!group || !getLevelGroupState(
      group,
      levelGroups,
      this.progress.state.completed,
      this.progress.state.completedRestorationTasks,
    ).unlocked) {
      throw new Error(`Level ${levelId} is locked.`);
    }

    this.engine = Match3Engine.fromSetup(this.currentLevel.board, tileTypes.length);
    this.selected = null;
    this.activeBooster = null;
    this.objectiveTracker = new ObjectiveTracker(
      createLevelObjectives(this.currentLevel.id, this.currentLevel.objectives),
    );
    this.movesLeft = this.currentLevel.moves;
    this.busy = false;
    this.matchedTiles.clear();
    this.invalidTiles.clear();
    this.hintedTiles.clear();
    this.createdSpecialTiles.clear();
    this.boardSettling = false;
    this.boardReshuffling = false;
    this.boardMessage = '';
    this.cascadeLevel = 0;
    this.swapOffsets.clear();
    this.analytics.startLevel(this.currentLevel.id);
    this.audio.play('story');
    this.renderGame();

    if (shouldOfferTutorial(this.progress.state.tutorial)) {
      this.offerTutorial();
    }
  }

  private renderLevelObjectiveSummary(level: LevelDefinition): string {
    return `Цели: ${level.objectives.map((objective) => {
      if (objective.type === 'collect') {
        return `${objective.target} × ${this.renderTileIcon(objective.tileType, 'inline-tile-icon')}`;
      }
      return `${objective.target} × ${getObstacleLabel(objective.obstacleKind)}`;
    }).join(' · ')}`;
  }

  private renderObjectiveCard(snapshot: ObjectiveSnapshot): string {
    const progress = Math.min(100, (snapshot.current / snapshot.target) * 100);
    if ('tileType' in snapshot && typeof snapshot.tileType === 'number') {
      const tile = tileTypes[snapshot.tileType];
      return `
        <article class="objective-card ${snapshot.complete ? 'complete' : ''}">
          <div class="objective-copy">
            <span class="hud-label">Собрать</span>
            <strong>${snapshot.current} / ${snapshot.target} · ${tile?.name ?? 'фишки'}</strong>
            <div class="progress" aria-label="Прогресс цели"><i style="width:${progress}%"></i></div>
          </div>
          <div class="objective-icon">${this.renderTileIcon(snapshot.tileType, 'objective-tile-icon')}</div>
        </article>
      `;
    }

    const obstacleKind = 'obstacleKind' in snapshot
      ? snapshot.obstacleKind as ObstacleKind
      : 'rubble';
    const presentation = getObstaclePresentation({ kind: obstacleKind, layers: 1 });
    return `
      <article class="objective-card objective-card--obstacle ${snapshot.complete ? 'complete' : ''}">
        <div class="objective-copy">
          <span class="hud-label">Очистить</span>
          <strong>${snapshot.current} / ${snapshot.target} · ${getObstacleLabel(obstacleKind)}</strong>
          <div class="progress" aria-label="Прогресс цели"><i style="width:${progress}%"></i></div>
        </div>
        <div class="objective-icon"><img class="objective-obstacle-icon" src="${presentation.assetPath}" alt="" draggable="false" /></div>
      </article>
    `;
  }

  private getObjectivePriority() {
    const snapshots = this.objectiveTracker?.snapshots ?? [];
    return {
      collects: snapshots.flatMap((snapshot) => (
        'tileType' in snapshot && typeof snapshot.tileType === 'number'
          ? [{ tileType: snapshot.tileType, remaining: snapshot.target - snapshot.current }]
          : []
      )),
      obstacles: snapshots.flatMap((snapshot) => (
        'obstacleKind' in snapshot
          ? [{ obstacleKind: undefined, kind: snapshot.obstacleKind as ObstacleKind, remaining: snapshot.target - snapshot.current }]
          : []
      )).map(({ kind, remaining }) => ({ kind, remaining })),
    };
  }

  private renderTileIcon(tileType: number, className = 'tile-icon'): string {
    const tile = tileTypes[tileType];
    if (!tile) return '';
    return `<img class="${className}" src="${tile.assetPath}" alt="" draggable="false" />`;
  }

  private renderBoosterBar(): string {
    const kinds: readonly BoosterKind[] = ['hammer', 'shuffle'];
    return `
      <section class="booster-bar" aria-label="Бустеры уровня">
        ${kinds.map((kind) => {
          const presentation = getBoosterPresentation(kind);
          const unlocked = isBoosterUnlocked(
            kind,
            restorationTasks,
            this.progress.state.completedRestorationTasks,
          );
          const count = this.progress.getBoosterCount(kind);
          const unlockTask = getBoosterUnlockTask(kind, restorationTasks);
          const disabled = !unlocked || count <= 0 || this.busy;
          const active = this.activeBooster === kind;
          const label = !unlocked
            ? `Закрыто · ${unlockTask?.title ?? 'выполните ремонт'}`
            : count > 0 ? `${presentation.shortName} · ${count}` : 'Нет зарядов';
          return `
            <button
              class="booster-button ${presentation.cssClass} ${active ? 'active' : ''} ${unlocked ? '' : 'locked'}"
              data-action="booster-${kind}"
              ${disabled && !active ? 'disabled' : ''}
              aria-pressed="${active}"
              aria-label="${presentation.name}. ${label}"
            >
              <img src="${presentation.assetPath}" alt="" draggable="false" />
              <span>${label}</span>
            </button>
          `;
        }).join('')}
      </section>
    `;
  }

  private toggleHammerBooster(): void {
    if (this.busy) return;
    if (!isBoosterUnlocked('hammer', restorationTasks, this.progress.state.completedRestorationTasks)) {
      const task = getBoosterUnlockTask('hammer', restorationTasks);
      this.showToast(`Сначала выполните ремонт «${task?.title ?? 'Убрать обломки'}».`, 'warning');
      return;
    }
    if (this.progress.getBoosterCount('hammer') <= 0) {
      this.showToast('Серебряные молоты закончились. Новые выдаются за восстановление комнат.', 'warning');
      return;
    }
    this.selected = null;
    this.activeBooster = this.activeBooster === 'hammer' ? null : 'hammer';
    this.boardMessage = this.activeBooster ? 'Выберите клетку для молота' : '';
    this.audio.play('select');
    this.renderGame();
  }

  private async useShuffleBooster(): Promise<void> {
    if (this.busy || !this.currentLevel) return;
    if (!isBoosterUnlocked('shuffle', restorationTasks, this.progress.state.completedRestorationTasks)) {
      const task = getBoosterUnlockTask('shuffle', restorationTasks);
      this.showToast(`Сначала выполните ремонт «${task?.title ?? 'Открыть ставни'}».`, 'warning');
      return;
    }
    if (this.progress.getBoosterCount('shuffle') <= 0) {
      this.showToast('Перемешивания закончились. Новые выдаются за восстановление комнат.', 'warning');
      return;
    }

    this.busy = true;
    this.activeBooster = null;
    this.selected = null;
    this.boardReshuffling = true;
    this.boardMessage = 'Ворон перестраивает поле…';
    this.audio.play('boosterShuffle');
    this.renderGame();
    await this.motionDelay('reshuffle');
    const reshuffled = this.engine.reshuffle();
    if (!reshuffled) {
      this.boardReshuffling = false;
      this.boardMessage = '';
      this.busy = false;
      this.audio.play('invalid');
      this.showToast('Сейчас это поле нельзя безопасно перемешать.', 'warning');
      this.renderGame();
      return;
    }
    this.progress.useBooster('shuffle');
    this.analytics.recordAction('booster_used', {
      kind: 'shuffle',
      levelId: this.currentLevel.id,
      remaining: this.progress.getBoosterCount('shuffle'),
    });
    this.boardSettling = true;
    this.renderGame();
    await this.motionDelay('settle');
    this.boardSettling = false;
    this.boardReshuffling = false;
    this.boardMessage = '';
    this.busy = false;
    this.renderGame();
  }

  private renderGame(): void {
    if (!this.currentLevel || !this.objectiveTracker) return;
    const objectiveSnapshots = this.objectiveTracker.snapshots;
    const tutorialVisible = shouldShowTutorial(this.progress.state.tutorial);
    const boardStateClasses = [
      this.boardSettling ? 'is-settling' : '',
      this.boardReshuffling ? 'is-reshuffling' : '',
      this.cascadeLevel > 1 ? `has-cascade cascade-${Math.min(this.cascadeLevel, 4)}` : '',
    ].filter(Boolean).join(' ');

    this.renderScreen('game', `
      <div class="game-layout ${tutorialVisible ? 'with-tutorial' : ''}">
        ${this.topbar(this.currentLevel.title, () => this.showLevelMap())}
        ${this.renderTutorialBanner()}
        <section class="game-hud" aria-label="Цель уровня и оставшиеся ходы">
          <div class="objective-list">${objectiveSnapshots.map((snapshot) => this.renderObjectiveCard(snapshot)).join('')}</div>
          <div class="move-counter">
            <span>Ходы</span>
            <strong>${this.movesLeft}</strong>
          </div>
        </section>
        <div class="star-targets"><span>★★★ ${this.currentLevel.starThresholds.threeStarsMovesLeft}+</span><span>★★ ${this.currentLevel.starThresholds.twoStarsMovesLeft}+</span><small>ходов останется</small></div>
        ${this.renderBoosterBar()}
        <div class="board-stage">
          <div class="board-wrap ${boardStateClasses}">
            <div class="board-sigil" aria-hidden="true"></div>
            <div class="board" role="grid" aria-label="Игровое поле с препятствиями" aria-busy="${this.busy}">${this.renderBoard()}</div>
            <div class="board-match-vfx" aria-hidden="true">${this.renderMatchVfx()}</div>
            <div class="board-feedback ${this.boardMessage ? 'show' : ''} ${this.cascadeLevel > 1 ? 'cascade' : ''}" role="status" aria-live="polite">${this.boardMessage}</div>
          </div>
        </div>
        <div class="game-actions">
          <button class="secondary" data-action="hint"><span aria-hidden="true">✦</span> Подсказка</button>
          <button class="ghost" data-action="restart"><span aria-hidden="true">↻</span> Заново</button>
        </div>
      </div>
    `);

    this.bind('back', () => this.showLevelMap());
    this.bind('hint', () => this.showHint());
    this.bind('restart', () => this.startLevel(this.currentLevel!.id));
    this.bind('booster-hammer', () => this.toggleHammerBooster());
    this.bind('booster-shuffle', () => { void this.useShuffleBooster(); });
    this.bind('tutorial-next', () => {
      this.progress.advanceTutorial();
      this.renderGame();
    });
    this.bind('tutorial-skip', () => {
      this.progress.skipTutorial();
      this.renderGame();
    });
    this.bindBoardInput();
  }

  private renderBoard(): string {
    return this.engine.board.flatMap((row, rowIndex) =>
      row.map((tile, colIndex) => {
        const position = { row: rowIndex, col: colIndex };
        const key = getTileKey(rowIndex, colIndex);
        if (!this.engine.isActive(position)) {
          return `<span class="tile tile-void" role="gridcell" aria-hidden="true"></span>`;
        }

        const definition = tileTypes[tile];
        const obstacle = this.engine.getObstacle(position);
        const obstaclePresentation = obstacle ? getObstaclePresentation(obstacle) : null;
        const special = definition ? this.engine.getSpecial(position) : null;
        const specialPresentation = special ? getSpecialPresentation(special) : null;
        const interactive = this.engine.canSwap(position);
        const hammerTarget = this.activeBooster === 'hammer' && this.engine.canHammer(position);
        const swapOffset = this.swapOffsets.get(key);
        const baseClass = definition
          ? getTileClassName(tile, {
              selected: this.selected?.row === rowIndex && this.selected?.col === colIndex,
              hinted: this.hintedTiles.has(key),
              invalid: this.invalidTiles.has(key),
              matched: this.matchedTiles.has(key),
              settling: this.boardSettling,
            })
          : 'tile tile-obstacle-only';
        const className = [
          baseClass,
          specialPresentation ? `special-tile ${specialPresentation.cssClass}` : '',
          obstaclePresentation ? `has-obstacle ${obstaclePresentation.cssClass} obstacle-layers-${obstacle!.layers}` : '',
          hammerTarget ? 'booster-target' : '',
          this.createdSpecialTiles.has(key) ? 'special-created' : '',
          swapOffset ? 'swapping' : '',
        ].filter(Boolean).join(' ');
        const swapStyle = swapOffset ? `style="--swap-x:${swapOffset.x};--swap-y:${swapOffset.y}"` : '';
        const glyph = specialPresentation ?? (definition ? {
          name: definition.name,
          assetPath: definition.assetPath,
          cssClass: '',
        } : null);
        const names = [
          specialPresentation ? `${specialPresentation.name}, создана из фишки ${definition?.name ?? ''}` : definition?.name,
          obstaclePresentation ? `${obstaclePresentation.name}, ${obstaclePresentation.layerLabel}` : null,
        ].filter(Boolean).join(', ');
        const tag = interactive || hammerTarget ? 'button' : 'span';

        return `
          <${tag}
            class="${className}"
            ${swapStyle}
            ${interactive || hammerTarget ? `data-cell="${key}"` : ''}
            ${interactive ? `data-tile="${key}" data-tile-type="${definition!.id}"` : ''}
            ${special ? `data-special="${special.kind}"` : ''}
            ${obstacle ? `data-obstacle="${obstacle.kind}"` : ''}
            role="gridcell"
            aria-label="${names || 'Заблокированная клетка'}, ряд ${rowIndex + 1}, колонка ${colIndex + 1}"
            ${interactive || hammerTarget ? `aria-pressed="${this.selected?.row === rowIndex && this.selected?.col === colIndex}"` : ''}
          >
            <span class="tile-surface" aria-hidden="true"></span>
            ${specialPresentation ? '<span class="special-aura" aria-hidden="true"></span>' : ''}
            ${glyph ? `<img class="tile-glyph ${specialPresentation ? 'tile-glyph--special' : ''} ${obstacle?.kind === 'fog' ? 'tile-glyph--fogged' : ''}" src="${glyph.assetPath}" alt="" draggable="false" />` : ''}
            ${obstaclePresentation ? `<span class="obstacle-overlay" aria-hidden="true"><img src="${obstaclePresentation.assetPath}" alt="" draggable="false" />${obstacle!.layers === 2 ? '<i class="obstacle-layer-mark">2</i>' : ''}</span>` : ''}
          </${tag}>
        `;
      }),
    ).join('');
  }

  private bindBoardInput(): void {
    const board = this.screen.querySelector<HTMLElement>('.board');
    if (!board) return;
    let pointerStart: Position | null = null;

    board.addEventListener('pointerdown', (event) => {
      if (this.busy) return;
      pointerStart = this.getTilePosition(event.target);
    });

    board.addEventListener('pointerup', (event) => {
      if (this.busy || !pointerStart) return;
      const first = pointerStart;
      pointerStart = null;
      const elementAtPoint = document.elementFromPoint(event.clientX, event.clientY);
      const second = this.getTilePosition(elementAtPoint ?? event.target);
      if (!second) return;

      if (this.activeBooster === 'hammer') {
        void this.onTileClick(second);
      } else if (this.engine.areAdjacent(first, second)) {
        void this.attemptSwap(first, second);
      } else {
        void this.onTileClick(second);
      }
    });

    board.addEventListener('pointercancel', () => {
      pointerStart = null;
    });

    board.addEventListener('click', (event) => {
      // Pointer input is handled above. Keyboard-generated clicks have detail 0.
      if (event.detail !== 0 || this.busy) return;
      const position = this.getTilePosition(event.target);
      if (position) void this.onTileClick(position);
    });
  }

  private getTilePosition(target: EventTarget | null): Position | null {
    if (!(target instanceof Element)) return null;
    const tile = target.closest<HTMLElement>('[data-cell], [data-tile]');
    const key = tile?.dataset.cell ?? tile?.dataset.tile;
    if (!key) return null;
    const [row, col] = key.split(',').map(Number);
    return Number.isInteger(row) && Number.isInteger(col) ? { row, col } : null;
  }

  private async onTileClick(position: Position): Promise<void> {
    if (this.busy || !this.currentLevel) return;
    if (this.activeBooster === 'hammer') {
      await this.useHammerBooster(position);
      return;
    }
    if (!this.selected) {
      this.audio.play('select');
      this.selected = position;
      this.renderGame();
      return;
    }
    if (this.selected.row === position.row && this.selected.col === position.col) {
      this.audio.play('select');
      this.selected = null;
      this.renderGame();
      return;
    }
    if (!this.engine.areAdjacent(this.selected, position)) {
      this.audio.play('select');
      this.selected = position;
      this.renderGame();
      return;
    }

    const first = this.selected;
    this.selected = null;
    await this.attemptSwap(first, position);
  }

  private async useHammerBooster(position: Position): Promise<void> {
    if (this.busy || !this.currentLevel || !this.objectiveTracker) return;
    if (!this.engine.canHammer(position)) {
      this.audio.play('invalid');
      this.showToast('Молот нельзя применить к этой клетке.', 'warning');
      return;
    }
    if (this.progress.getBoosterCount('hammer') <= 0) {
      this.activeBooster = null;
      this.renderGame();
      return;
    }

    this.busy = true;
    this.activeBooster = null;
    this.selected = null;
    this.matchedTiles.clear();
    this.matchedTiles.add(getTileKey(position.row, position.col));
    this.boardMessage = 'Серебряный молот';
    this.audio.play('hammer');
    this.renderGame();
    await this.motionDelay('clear');

    const clearResult = this.engine.hitCell(position);
    const changed = clearResult.removedTileTypes.length > 0 || clearResult.obstacleDamage.length > 0;
    if (!changed || !this.progress.useBooster('hammer')) {
      this.matchedTiles.clear();
      this.boardMessage = '';
      this.busy = false;
      this.renderGame();
      return;
    }

    this.analytics.recordAction('booster_used', {
      kind: 'hammer',
      levelId: this.currentLevel.id,
      remaining: this.progress.getBoosterCount('hammer'),
      target: clearResult.obstacleDamage[0]?.kind ?? 'tile',
    });
    this.objectiveTracker.handle({ type: 'tiles-removed', tileTypes: clearResult.removedTileTypes });
    this.objectiveTracker.handle({ type: 'obstacles-cleared', obstacleKinds: clearResult.clearedObstacleKinds });
    this.recordObstacleAnalytics(clearResult.obstacleDamage);
    this.engine.collapse();
    this.matchedTiles.clear();
    this.boardSettling = true;
    this.renderGame();
    await this.motionDelay('settle');
    this.boardSettling = false;

    await this.resolveBoosterCascades();
    await this.ensurePlayableBoard();
    this.boardMessage = '';
    this.cascadeLevel = 0;
    this.busy = false;

    if (this.objectiveTracker.isComplete) {
      this.winLevel();
    } else {
      this.renderGame();
    }
  }

  private async resolveBoosterCascades(): Promise<void> {
    if (!this.objectiveTracker) return;
    const objectivePriority = this.getObjectivePriority();
    let cascade = 0;

    while (this.engine.findMatches().length > 0) {
      cascade++;
      this.cascadeLevel = cascade;
      const plan = planMatchedResolution(
        this.engine,
        null,
        objectivePriority,
        false,
      );
      if (plan.clearPositions.length === 0) break;

      this.matchedTiles.clear();
      plan.clearPositions.forEach((item) => this.matchedTiles.add(getTileKey(item.row, item.col)));
      this.boardMessage = cascade > 1
        ? `Каскад ×${cascade}${plan.message ? ` · ${plan.message}` : ''}`
        : plan.message || `Комбинация ×${plan.clearPositions.length}`;
      this.playResolutionAudio(plan, cascade + 1);
      this.recordSpecialAnalytics(plan);
      this.renderGame();
      await this.motionDelay('clear');

      const clearResult = this.engine.resolveClear(plan.clearPositions);
      this.objectiveTracker.handle({ type: 'tiles-removed', tileTypes: clearResult.removedTileTypes });
      this.objectiveTracker.handle({ type: 'obstacles-cleared', obstacleKinds: clearResult.clearedObstacleKinds });
      this.playObstacleAudio(clearResult.obstacleDamage.map((damage) => damage.kind));
      this.recordObstacleAnalytics(clearResult.obstacleDamage);
      applySpecialCreations(this.engine, plan.creations);
      this.engine.collapse();
      this.matchedTiles.clear();
      this.createdSpecialTiles.clear();
      for (const created of findCreatedSpecialPositions(this.engine, plan.creations)) {
        this.createdSpecialTiles.add(getTileKey(created.row, created.col));
      }
      this.boardSettling = true;
      this.renderGame();
      await this.motionDelay('settle');
      this.boardSettling = false;
      this.createdSpecialTiles.clear();
    }
  }

  private async ensurePlayableBoard(): Promise<void> {
    if (this.engine.findPossibleMove()) return;
    this.boardReshuffling = true;
    this.audio.play('reshuffle');
    this.boardMessage = 'Ворон перемешивает поле…';
    this.renderGame();
    await this.motionDelay('reshuffle');
    const reshuffled = this.engine.reshuffle();
    if (!reshuffled) this.engine.generateBoard();
    this.boardSettling = true;
    this.renderGame();
    await this.motionDelay('settle');
    this.boardSettling = false;
    this.boardReshuffling = false;
    this.boardMessage = '';
  }

  private async attemptSwap(first: Position, second: Position): Promise<void> {
    if (this.busy || !this.currentLevel || !this.objectiveTracker) return;
    this.busy = true;
    this.selected = null;
    const directCombo = this.engine.getDirectSpecialCombo(first, second);
    await this.swapWithMotion(first, second);
    const initialMatches = this.engine.findMatches();

    if (initialMatches.length === 0 && !directCombo) {
      this.analytics.recordMove(false);
      this.audio.play('invalid');
      this.invalidTiles.add(getTileKey(first.row, first.col));
      this.invalidTiles.add(getTileKey(second.row, second.col));
      this.boardMessage = 'Нет комбинации';
      this.renderGame();
      await this.motionDelay('invalidHold');
      this.invalidTiles.clear();
      this.boardMessage = '';
      await this.swapWithMotion(first, second);
      this.busy = false;
      this.renderGame();
      return;
    }

    this.analytics.recordMove(true);
    this.movesLeft--;
    if (this.progress.state.tutorial.preference === 'enabled'
      && this.progress.state.tutorial.step === 0) {
      this.progress.advanceTutorial();
    }

    const objectivePriority = this.getObjectivePriority();
    let cascade = 0;
    let firstResolution = true;
    let pendingDirectCombo = directCombo;

    while (pendingDirectCombo || this.engine.findMatches().length > 0) {
      cascade++;
      this.cascadeLevel = cascade;
      const plan = pendingDirectCombo
        ? planDirectSpecialResolution(
          this.engine,
          first,
          second,
          pendingDirectCombo,
          objectivePriority,
        )
        : planMatchedResolution(
          this.engine,
          firstResolution ? [first, second] : null,
          objectivePriority,
          firstResolution,
        );

      if (plan.clearPositions.length === 0) break;
      this.matchedTiles.clear();
      plan.clearPositions.forEach((position) => (
        this.matchedTiles.add(getTileKey(position.row, position.col))
      ));
      const fallbackMessage = cascade > 1
        ? `Каскад ×${cascade}`
        : `Комбинация ×${plan.clearPositions.length}`;
      this.boardMessage = plan.message
        ? cascade > 1 ? `Каскад ×${cascade} · ${plan.message}` : plan.message
        : fallbackMessage;
      this.playResolutionAudio(plan, cascade);
      this.recordSpecialAnalytics(plan);
      this.renderGame();
      await this.motionDelay('clear');

      const clearResult = this.engine.resolveClear(plan.clearPositions);
      this.objectiveTracker?.handle({ type: 'tiles-removed', tileTypes: clearResult.removedTileTypes });
      this.objectiveTracker?.handle({ type: 'obstacles-cleared', obstacleKinds: clearResult.clearedObstacleKinds });
      this.playObstacleAudio(clearResult.obstacleDamage.map((damage) => damage.kind));
      this.recordObstacleAnalytics(clearResult.obstacleDamage);
      applySpecialCreations(this.engine, plan.creations);
      this.engine.collapse();
      this.matchedTiles.clear();
      this.createdSpecialTiles.clear();
      for (const position of findCreatedSpecialPositions(this.engine, plan.creations)) {
        this.createdSpecialTiles.add(getTileKey(position.row, position.col));
      }
      this.boardSettling = true;
      this.renderGame();
      await this.motionDelay('settle');
      this.boardSettling = false;

      if (this.createdSpecialTiles.size > 0) {
        this.renderGame();
        await this.delay(this.prefersReducedMotion() ? 0 : 260);
        this.createdSpecialTiles.clear();
      }

      pendingDirectCombo = null;
      firstResolution = false;
    }

    await this.motionDelay('feedbackHold');
    this.boardMessage = '';
    this.cascadeLevel = 0;
    this.createdSpecialTiles.clear();
    if (!this.engine.findPossibleMove()) {
      this.boardReshuffling = true;
      this.audio.play('reshuffle');
      this.boardMessage = 'Ворон перемешивает поле…';
      this.renderGame();
      await this.motionDelay('reshuffle');
      const reshuffled = this.engine.reshuffle();
      if (!reshuffled) this.engine.generateBoard();
      this.boardSettling = true;
      this.renderGame();
      await this.motionDelay('settle');
      this.boardSettling = false;
      this.boardReshuffling = false;
      this.boardMessage = '';
    }

    this.busy = false;
    if (this.objectiveTracker?.isComplete) {
      this.winLevel();
    } else if (this.movesLeft <= 0) {
      this.loseLevel();
    } else {
      this.renderGame();
    }
  }

  private playResolutionAudio(plan: SpecialResolutionPlan, cascade: number): void {
    if (plan.directCombo) {
      this.audio.play('specialCombo');
      return;
    }
    if (plan.activations.some(({ special }) => special.kind === 'prism')) {
      this.audio.play('prism');
      return;
    }
    if (plan.activations.some(({ special }) => special.kind === 'bomb')) {
      this.audio.play('bomb');
      return;
    }
    if (plan.activations.some(({ special }) => special.kind === 'rocket')) {
      this.audio.play('rocket');
      return;
    }
    if (plan.activations.some(({ special }) => special.kind === 'raven')) {
      this.audio.play('raven');
      return;
    }
    if (plan.creations.length > 0) {
      this.audio.play('specialCreate');
      return;
    }
    this.audio.play(cascade > 1 ? 'cascade' : 'match');
  }

  private recordSpecialAnalytics(plan: SpecialResolutionPlan): void {
    for (const creation of plan.creations) {
      this.analytics.recordAction('special_created', {
        kind: creation.special.kind,
        direction: creation.special.kind === 'rocket' ? creation.special.direction : null,
        levelId: this.currentLevel?.id ?? null,
      });
    }
    for (const activation of plan.activations) {
      this.analytics.recordAction('special_activated', {
        kind: activation.special.kind,
        levelId: this.currentLevel?.id ?? null,
      });
    }
    if (plan.directCombo) {
      this.analytics.recordAction('special_combo', {
        combo: plan.directCombo,
        levelId: this.currentLevel?.id ?? null,
      });
    }
  }

  private playObstacleAudio(kinds: readonly ObstacleKind[]): void {
    if (kinds.includes('rubble')) {
      this.audio.play('rubbleBreak');
    } else if (kinds.includes('chain')) {
      this.audio.play('chainBreak');
    } else if (kinds.includes('fog')) {
      this.audio.play('fogClear');
    }
  }

  private recordObstacleAnalytics(damage: readonly ObstacleDamage[]): void {
    for (const item of damage) {
      this.analytics.recordAction(item.cleared ? 'obstacle_cleared' : 'obstacle_damaged', {
        kind: item.kind,
        remainingLayers: item.remainingLayers,
        levelId: this.currentLevel?.id ?? null,
      });
    }
  }

  private async swapWithMotion(first: Position, second: Position): Promise<void> {
    this.audio.play('swap');
    this.engine.swap(first, second);
    const deltaX = second.col - first.col;
    const deltaY = second.row - first.row;
    this.swapOffsets.set(getTileKey(first.row, first.col), { x: deltaX, y: deltaY });
    this.swapOffsets.set(getTileKey(second.row, second.col), { x: -deltaX, y: -deltaY });
    this.renderGame();
    await this.motionDelay('swap');
    this.swapOffsets.clear();
  }

  private winLevel(): void {
    if (!this.currentLevel) return;
    const completedLevelId = this.currentLevel.id;
    const stars = calculateLevelStars(this.currentLevel, this.movesLeft);
    this.analytics.finishLevel('win', stars, this.movesLeft);
    const newlyEarned = this.progress.saveLevel(completedLevelId, stars);
    const nextLevelId = getNextPlayableLevelId(
      completedLevelId,
      levels.map((level) => level.id),
      levelGroups,
      this.progress.state.completed,
      this.progress.state.completedRestorationTasks,
    );
    const activeRestoration = getActiveRestoration(
      rooms,
      restorationTasks,
      this.progress.state.completedRestorationTasks,
      this.progress.availableStars,
    );
    const storyScene = getStorySceneForLevel(storyScenes, completedLevelId);
    this.audio.play('win');
    const rewardMessage = newlyEarned > 0
      ? `Получено новых звёзд: ${newlyEarned} ★`
      : 'Лучший результат уровня не улучшен.';
    const canRepair = activeRestoration?.status === 'available';
    const metaMessage = activeRestoration
      ? canRepair
        ? `Теперь можно выполнить ремонт «${activeRestoration.task.title}» в комнате «${activeRestoration.room.title}».`
        : `Следующая задача: «${activeRestoration.task.title}». Нужно ещё ${activeRestoration.starsMissing} ★.`
      : 'Все доступные задачи ремонта выполнены.';

    this.openModal(`
      <div class="result-vfx result-vfx--win" aria-hidden="true">${this.renderVfxParticles('win', 'result-particle')}</div>
      <div class="result-emblem result-emblem--win" aria-hidden="true">✦</div>
      <div class="big-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
      <h2>Уровень пройден</h2>
      <p>Звёзды восстанавливают поместье, а ключевые ремонты открывают следующие уровни и механики.</p>
      <p class="reward-message">${rewardMessage}</p>
      <div class="result-next-step ${canRepair ? 'ready' : ''}">
        <span>Следующий шаг</span>
        <strong>${metaMessage}</strong>
        ${activeRestoration ? this.renderTaskOutcome(activeRestoration.task, true) : ''}
      </div>
      <div class="modal-balance">Доступно: ${this.progress.availableStars} ★ · Молоты: ${this.progress.getBoosterCount('hammer')} · Перемешивания: ${this.progress.getBoosterCount('shuffle')}</div>
      <div class="stack">
        ${canRepair ? '<button class="primary" data-action="repair-now">Выполнить ремонт</button>' : ''}
        ${nextLevelId === null
          ? ''
          : `<button class="${canRepair ? 'secondary' : 'primary'}" data-action="next-level">Следующий уровень</button>`}
        <button class="${nextLevelId === null && !canRepair ? 'primary' : 'secondary'}" data-action="levels">К уровням</button>
        <button class="secondary" data-action="manor">В поместье</button>
        ${storyScene ? `<button class="ghost" data-action="story">${this.progress.isStoryViewed(completedLevelId) ? 'Повторить сюжетную сцену' : 'Сюжетная сцена'}${nextLevelId === null ? ' → к уровням' : ' → следующий уровень'}</button>` : ''}
      </div>
    `, 'modal-card--result modal-card--win');

    if (canRepair && activeRestoration) {
      this.bindModal('repair-now', () => {
        this.currentRoomId = activeRestoration.room.id;
        this.closeModal();
        this.restoreTask(activeRestoration.task.id);
      });
    }
    if (nextLevelId !== null) {
      this.bindModal('next-level', () => {
        this.closeModal();
        this.startLevel(nextLevelId);
      });
    }
    this.bindModal('levels', () => {
      this.closeModal();
      this.showLevelMap();
    });
    this.bindModal('manor', () => {
      this.closeModal();
      this.showManor();
    });
    if (storyScene) {
      this.bindModal('story', () => {
        this.closeModal();
        this.showStory(completedLevelId, nextLevelId);
      });
    }
  }

  private loseLevel(): void {
    this.analytics.finishLevel('loss', 0, this.movesLeft);
    this.audio.play('loss');
    this.openModal(`
      <div class="result-vfx result-vfx--loss" aria-hidden="true">${this.renderVfxParticles('loss', 'result-particle')}</div>
      <div class="result-emblem result-emblem--loss" aria-hidden="true">☾</div>
      <h2>Ходы закончились</h2>
      <p class="subtitle">Можно повторить попытку или выбрать другой открытый уровень.</p>
      <div class="stack">
        <button class="primary" data-action="retry">Повторить</button>
        <button class="ghost" data-action="exit">К уровням</button>
      </div>
    `, 'modal-card--result modal-card--loss');
    this.bindModal('retry', () => {
      this.closeModal();
      this.startLevel(this.currentLevel!.id);
    });
    this.bindModal('exit', () => {
      this.closeModal();
      this.showLevelMap();
    });
  }


  private renderTutorialBanner(): string {
    const tutorial = this.progress.state.tutorial;
    if (!shouldShowTutorial(tutorial)) return '';

    if (tutorial.step === 0) {
      return `
        <aside class="tutorial-banner" aria-live="polite">
          <div class="tutorial-icon">↔</div>
          <div>
            <div class="chapter">Быстрая подсказка · 1/2</div>
            <strong>Меняйте соседние фишки</strong>
            <p>Соберите три или больше одинаковых фишек. Линии из 4–5, формы T/L и квадраты 2×2 создают усиления.</p>
          </div>
          <div class="tutorial-actions">
            <button class="secondary compact" data-action="tutorial-next">Понятно</button>
            <button class="ghost compact" data-action="tutorial-skip">Пропустить</button>
          </div>
        </aside>
      `;
    }

    return `
      <aside class="tutorial-banner" aria-live="polite">
        <div class="tutorial-icon">★</div>
        <div>
          <div class="chapter">Быстрая подсказка · 2/2</div>
          <strong>Следите за целью и ходами</strong>
          <p>Ракеты чистят линии, руны взрывают область, ворон ищет полезную цель, а призма очищает выбранный цвет.</p>
        </div>
        <div class="tutorial-actions">
          <button class="secondary compact" data-action="tutorial-next">Готово</button>
          <button class="ghost compact" data-action="tutorial-skip">Отключить</button>
        </div>
      </aside>
    `;
  }

  private offerTutorial(): void {
    this.openModal(`
      <div class="tutorial-raven"><img src="${ravenMark}" alt="" draggable="false" /></div>
      <div class="chapter">Необязательное обучение</div>
      <h2>Показать две короткие подсказки?</h2>
      <p class="subtitle">Они появятся прямо над полем и не будут останавливать игру. Обучение всегда можно включить снова в настройках.</p>
      <div class="stack">
        <button class="primary" data-action="tutorial-start">Показать подсказки</button>
        <button class="ghost" data-action="tutorial-skip">Играть без обучения</button>
      </div>
    `);

    this.bindModal('tutorial-start', () => {
      this.progress.startTutorial();
      this.closeModal();
      this.renderGame();
    });
    this.bindModal('tutorial-skip', () => {
      this.progress.skipTutorial();
      this.closeModal();
      this.renderGame();
    });
  }

  private showSpecialGuide(): void {
    const entries = [
      {
        special: { kind: 'rocket', direction: 'row', baseTile: 0 } as const,
        title: 'Серебряная ракета',
        creation: 'Линия из 4 одинаковых фишек',
        effect: 'Очищает целый ряд или колонку.',
      },
      {
        special: { kind: 'bomb', baseTile: 0 } as const,
        title: 'Взрывная руна',
        creation: 'Комбинация в форме T или L',
        effect: 'Очищает область 3×3.',
      },
      {
        special: { kind: 'raven', baseTile: 0 } as const,
        title: 'Призрачный ворон',
        creation: 'Квадрат 2×2',
        effect: 'Очищает соседей и летит к полезной цели.',
      },
      {
        special: { kind: 'prism', baseTile: 0 } as const,
        title: 'Лунная призма',
        creation: 'Линия из 5 или больше',
        effect: 'Поменяйте с обычной фишкой, чтобы очистить весь её цвет.',
      },
    ];
    const cards = entries.map((entry) => {
      const presentation = getSpecialPresentation(entry.special);
      return `
        <article class="special-guide-card ${presentation.cssClass}">
          <div class="special-guide-icon"><img src="${presentation.assetPath}" alt="" draggable="false" /></div>
          <div>
            <strong>${entry.title}</strong>
            <small>${entry.creation}</small>
            <p>${entry.effect}</p>
          </div>
        </article>
      `;
    }).join('');

    this.openModal(`
      <div class="chapter">Справочник комбинаций</div>
      <h2>Готические усиления</h2>
      <p class="subtitle">Усиление активируется, когда попадает в комбинацию. Поддерживаются также пары: ракета + ракета, ракета + руна, руна + руна и призма + обычная фишка.</p>
      <div class="special-guide-grid">${cards}</div>
      <button class="primary" data-action="close-special-guide">Понятно</button>
    `, 'modal-card--special-guide');
    this.bindModal('close-special-guide', () => this.closeModal());
  }

  private showObstacleGuide(): void {
    const entries = [
      {
        obstacle: { kind: 'chain', layers: 1 } as const,
        title: 'Цепи',
        rule: 'Фишку нельзя двигать. Соберите комбинацию с ней или зацепите усилением, чтобы снять один слой.',
      },
      {
        obstacle: { kind: 'rubble', layers: 1 } as const,
        title: 'Завалы',
        rule: 'Занимают клетку и останавливают падение. Комбинации и усиления рядом снимают один слой.',
      },
      {
        obstacle: { kind: 'fog', layers: 1 } as const,
        title: 'Туман',
        rule: 'Скрывает и блокирует фишку. Комбинации и усиления рядом рассеивают один слой.',
      },
    ];
    const cards = entries.map((entry) => {
      const presentation = getObstaclePresentation(entry.obstacle);
      return `
        <article class="special-guide-card ${presentation.cssClass}">
          <div class="special-guide-icon"><img src="${presentation.assetPath}" alt="" draggable="false" /></div>
          <div>
            <strong>${entry.title}</strong>
            <small>${entry.obstacle.layers === 1 ? 'Один слой' : 'Два слоя'}</small>
            <p>${entry.rule}</p>
          </div>
        </article>
      `;
    }).join('');

    this.openModal(`
      <div class="chapter">Справочник поля</div>
      <h2>Препятствия поместья</h2>
      <p class="subtitle">Цифра 2 на препятствии означает, что его нужно задеть в двух разных разрешениях комбинаций.</p>
      <div class="special-guide-grid">${cards}</div>
      <button class="primary" data-action="close-obstacle-guide">Понятно</button>
    `, 'modal-card--special-guide');
    this.bindModal('close-obstacle-guide', () => this.closeModal());
  }

  private showBoosterGuide(): void {
    const kinds: readonly BoosterKind[] = ['hammer', 'shuffle'];
    const cards = kinds.map((kind) => {
      const presentation = getBoosterPresentation(kind);
      const unlocked = isBoosterUnlocked(kind, restorationTasks, this.progress.state.completedRestorationTasks);
      const unlockTask = getBoosterUnlockTask(kind, restorationTasks);
      const count = this.progress.getBoosterCount(kind);
      return `
        <article class="special-guide-card ${presentation.cssClass}">
          <div class="special-guide-icon"><img src="${presentation.assetPath}" alt="" draggable="false" /></div>
          <div>
            <strong>${presentation.name}</strong>
            <small>${unlocked ? `Доступно: ${count}` : `Открывается: ${unlockTask?.title ?? 'ремонт комнаты'}`}</small>
            <p>${presentation.description}</p>
          </div>
        </article>
      `;
    }).join('');

    this.openModal(`
      <div class="chapter">Награды ремонта</div>
      <h2>Активные бустеры</h2>
      <p class="subtitle">Бустеры не тратят ход. Их запасы сохраняются между уровнями и пополняются за задачи восстановления.</p>
      <div class="special-guide-grid">${cards}</div>
      <button class="primary" data-action="close-booster-guide">Понятно</button>
    `, 'modal-card--special-guide');
    this.bindModal('close-booster-guide', () => this.closeModal());
  }

  private showSettings(returnAction?: () => void): void {
    if (returnAction) this.settingsReturnAction = returnAction;
    if (!this.settingsReturnAction) this.settingsReturnAction = () => this.showHome();

    const preference: TutorialPreference = this.progress.state.tutorial.preference;
    const status = preference === 'undecided'
      ? 'Будет предложено при запуске уровня'
      : preference === 'enabled'
        ? `Включено · шаг ${Math.min(2, this.progress.state.tutorial.step + 1)}/2`
        : preference === 'completed'
          ? 'Завершено'
          : 'Отключено';
    const audio = this.audio.settings;
    const audioSupported = this.audio.supported;
    const musicPercent = Math.round(audio.musicVolume * 100);
    const effectsPercent = Math.round(audio.effectsVolume * 100);
    const pwaStatus = this.pwa.status;
    const analyticsSummary = this.analytics.getSummary();
    const recoveryStatus = this.progress.recoveryNotice
      ? `<div class="setting-status setting-status--warning">${this.progress.recoveryNotice}</div>`
      : `<div class="setting-status">${this.progress.storageAvailable ? 'Сохранение работает' : 'Хранилище недоступно'}</div>`;
    const languageButtons = LOCALE_OPTIONS.map((option) => `
      <button
        type="button"
        class="language-option ${option.code === this.localization.locale ? 'active' : ''}"
        data-locale="${option.code}"
        aria-pressed="${option.code === this.localization.locale}"
        data-no-translate
      >${option.nativeName}</button>
    `).join('');

    this.renderScreen('settings', `
      ${this.topbar('Настройки', () => this.returnFromSettings(), false)}
      <div class="chapter">Аудио</div>
      <h2>Музыка и звуки</h2>
      <section class="settings-card audio-settings-card">
        <div class="setting-row setting-row--status">
          <div>
            <strong>Звук игры</strong>
            <p class="subtitle">Простая готическая тема в ре миноре и короткие игровые сигналы. Браузер включает звук после первого касания.</p>
          </div>
          <button class="${audio.muted || !audioSupported ? 'ghost' : 'secondary'} compact audio-toggle" data-action="audio-toggle" aria-pressed="${audio.muted}" ${audioSupported ? '' : 'disabled'}>
            ${audioSupported ? (audio.muted ? 'Включить звук' : 'Выключить звук') : 'Звук недоступен'}
          </button>
        </div>
        <label class="volume-control">
          <span><strong>Музыка</strong><output data-audio-output="music">${musicPercent}%</output></span>
          <input type="range" min="0" max="100" step="1" value="${musicPercent}" data-audio-volume="music" ${audio.muted || !audioSupported ? 'disabled' : ''} aria-label="Громкость музыки" />
        </label>
        <label class="volume-control">
          <span><strong>Эффекты</strong><output data-audio-output="effects">${effectsPercent}%</output></span>
          <input type="range" min="0" max="100" step="1" value="${effectsPercent}" data-audio-volume="effects" ${audio.muted || !audioSupported ? 'disabled' : ''} aria-label="Громкость эффектов" />
        </label>
        <div class="audio-preview-actions">
          <button class="ghost" data-action="audio-music-preview" ${audio.muted || !audioSupported ? 'disabled' : ''}>Проверить музыку</button>
          <button class="ghost" data-action="audio-preview" ${audio.muted || !audioSupported ? 'disabled' : ''}>Проверить эффекты</button>
        </div>
      </section>

      <div class="chapter settings-section-label">Язык</div>
      <h2>Язык интерфейса и сюжета</h2>
      <section class="settings-card language-settings-card">
        <p class="subtitle">Изменение языка не сбрасывает игровой прогресс.</p>
        <div class="language-options" role="group" aria-label="Язык интерфейса и сюжета">${languageButtons}</div>
      </section>

      <div class="chapter settings-section-label">Игровые настройки</div>
      <h2>Подсказки и обучение</h2>
      <section class="settings-card">
        <div>
          <strong>Короткое обучение match-3</strong>
          <p class="subtitle">Две контекстные подсказки без обязательного обучающего уровня.</p>
        </div>
        <div class="setting-status">${status}</div>
        <div class="stack">
          <button class="secondary" data-action="tutorial-restart">Показать снова</button>
          <button class="ghost" data-action="tutorial-disable">Отключить подсказки</button>
        </div>
      </section>

      <div class="chapter settings-section-label">Игровое поле</div>
      <h2>Усиления</h2>
      <section class="settings-card">
        <div>
          <strong>Сильные комбинации</strong>
          <p class="subtitle">Линии из 4–5, формы T/L и квадраты 2×2 создают специальные фишки.</p>
        </div>
        <div class="setting-status">Молоты: ${this.progress.getBoosterCount('hammer')} · Перемешивания: ${this.progress.getBoosterCount('shuffle')}</div>
        <div class="stack"><button class="secondary" data-action="booster-guide">Активные бустеры</button><button class="ghost" data-action="special-guide">Комбинации</button><button class="ghost" data-action="obstacle-guide">Препятствия</button></div>
      </section>
      <p class="footer-note settings-context-note">Новые механики позднее будут объясняться такими же короткими контекстными карточками.</p>

      <div class="chapter settings-section-label">Доступность</div>
      <h2>Анимации и эффекты</h2>
      <section class="settings-card">
        <div>
          <strong>Сокращение движения</strong>
          <p class="subtitle">Игра автоматически следует системной настройке <em>Reduce Motion</em>. При её включении отключаются частицы, перелёты и декоративные движения, но все состояния остаются видимыми.</p>
        </div>
        <div class="setting-status">${this.prefersReducedMotion() ? 'Сокращённые эффекты активны' : 'Полные эффекты активны'}</div>
      </section>

      <div class="chapter settings-section-label">Установка</div>
      <h2>Приложение на телефоне</h2>
      <section class="settings-card">
        <div class="setting-row setting-row--status">
          <div>
            <strong>Устанавливаемая PWA-сборка</strong>
            <p class="subtitle">При первом онлайн-запуске сборка целиком сохраняется на устройстве. Перед авиарежимом проверьте, что статус подтверждает офлайн-готовность.</p>
          </div>
          <div class="setting-status">${getPwaStatusLabel(pwaStatus)}</div>
        </div>
        <div class="stack">
          ${pwaStatus.installAvailable ? '<button class="primary" data-action="pwa-install">Установить приложение</button>' : ''}
          ${pwaStatus.serviceWorkerReady ? '<button class="secondary" data-action="pwa-offline-check">Проверить офлайн-готовность</button>' : ''}
          ${pwaStatus.serviceWorkerReady ? '<button class="ghost" data-action="pwa-update">Проверить обновление</button>' : ''}
        </div>
      </section>

      <div class="chapter settings-section-label">Playtest</div>
      <h2>Сохранение и диагностика</h2>
      <section class="settings-card diagnostics-card">
        <div class="setting-row setting-row--status">
          <div>
            <strong>${BUILD_LABEL}</strong>
            <p class="subtitle">Версия ${APP_VERSION} · ${navigator.onLine ? 'онлайн' : 'офлайн'}</p>
          </div>
          ${recoveryStatus}
        </div>
        <div class="playtest-summary" aria-label="Сводка локального тестирования">
          <span>Сессии <strong>${analyticsSummary.sessions}</strong></span>
          <span>Попытки <strong>${analyticsSummary.attempts}</strong></span>
          <span>Победы <strong>${analyticsSummary.wins}</strong></span>
          <span>Подсказки <strong>${analyticsSummary.hints}</strong></span>
        </div>
        <div class="settings-action-grid">
          <button class="secondary" data-action="save-export">Экспорт сохранения</button>
          <button class="ghost" data-action="save-import">Импорт сохранения</button>
          <button class="secondary" data-action="analytics-export">Экспорт аналитики</button>
          <button class="ghost" data-action="diagnostics-export">Экспорт диагностики</button>
        </div>
        <button class="ghost compact" data-action="analytics-reset">Очистить локальную аналитику</button>
        <input class="visually-hidden" type="file" accept="application/json,.json" data-save-import-file aria-label="Выбрать файл сохранения" />
        <p class="subtitle settings-privacy-note">Данные остаются только на устройстве, пока игрок сам не экспортирует JSON. Сторонняя аналитика не подключается.</p>
      </section>
    `);

    this.bind('back', () => this.returnFromSettings());
    this.screen.querySelectorAll<HTMLButtonElement>('[data-locale]').forEach((button) => {
      button.addEventListener('click', () => {
        const locale = button.dataset.locale as AppLocale | undefined;
        if (!locale || !LOCALE_OPTIONS.some((option) => option.code === locale)) return;
        this.localization.setLocale(locale);
        this.analytics.recordAction('locale_changed', { locale });
        this.showSettings();
      });
    });
    this.bind('tutorial-restart', () => {
      this.progress.restartTutorial();
      this.showSettings();
    });
    this.bind('tutorial-disable', () => {
      this.progress.skipTutorial();
      this.showSettings();
    });
    this.bind('booster-guide', () => this.showBoosterGuide());
    this.bind('special-guide', () => this.showSpecialGuide());
    this.bind('obstacle-guide', () => this.showObstacleGuide());
    this.bind('audio-toggle', () => {
      this.audio.updateSettings({ muted: !this.audio.settings.muted });
      this.showSettings();
    });
    this.bind('audio-music-preview', () => this.audio.previewMusic());
    this.bind('audio-preview', () => this.audio.previewEffects());
    this.bind('pwa-install', () => { void this.installPwa(); });
    this.bind('pwa-offline-check', () => { void this.checkPwaOfflineReadiness(); });
    this.bind('pwa-update', () => { void this.checkPwaUpdate(); });
    this.bind('save-export', () => this.exportSave());
    this.bind('save-import', () => this.screen.querySelector<HTMLInputElement>('[data-save-import-file]')?.click());
    this.bind('analytics-export', () => this.exportAnalytics());
    this.bind('diagnostics-export', () => this.exportDiagnostics());
    this.bind('analytics-reset', () => {
      if (confirm(this.localization.translate('Очистить только локальные данные плейтеста? Игровой прогресс сохранится.'))) {
        this.analytics.reset();
        this.showSettings();
      }
    });
    this.screen.querySelector<HTMLInputElement>('[data-save-import-file]')?.addEventListener('change', (event) => {
      const file = (event.currentTarget as HTMLInputElement).files?.[0];
      if (file) void this.importSave(file);
    });
    this.bindAudioVolume('music');
    this.bindAudioVolume('effects');
  }

  private exportFileStamp(): string {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }

  private exportSave(): void {
    downloadJson(
      `raven-manor-save-${this.exportFileStamp()}.json`,
      this.progress.exportData(APP_VERSION),
    );
    this.analytics.recordAction('save_exported');
    this.showToast('Сохранение экспортировано.');
  }

  private async importSave(file: File): Promise<void> {
    if (!confirm(this.localization.translate('Заменить текущий игровой прогресс данными из выбранного файла?'))) return;
    try {
      this.progress.importData(await file.text());
      this.analytics.recordAction('save_imported');
      this.pendingRoomReveal = null;
      this.recentlyUnlockedRoomId = null;
      this.showSettings();
      this.showToast('Сохранение импортировано.');
    } catch (error) {
      this.errors.record('application', error);
      this.showToast(error instanceof Error ? error.message : 'Не удалось импортировать сохранение.', 'warning');
    }
  }

  private exportAnalytics(): void {
    downloadJson(
      `raven-manor-playtest-${this.exportFileStamp()}.json`,
      {
        appVersion: APP_VERSION,
        exportedAt: new Date().toISOString(),
        analytics: this.analytics.exportData(),
      },
    );
    this.analytics.recordAction('analytics_exported');
    this.showToast('Данные плейтеста экспортированы.');
  }

  private exportDiagnostics(): void {
    downloadJson(
      `raven-manor-diagnostics-${this.exportFileStamp()}.json`,
      {
        appVersion: APP_VERSION,
        build: BUILD_LABEL,
        exportedAt: new Date().toISOString(),
        environment: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          appLocale: this.localization.locale,
          online: navigator.onLine,
          viewport: {
            width: window.visualViewport?.width ?? window.innerWidth,
            height: window.visualViewport?.height ?? window.innerHeight,
            devicePixelRatio: window.devicePixelRatio,
          },
          reducedMotion: this.prefersReducedMotion(),
          pwa: this.pwa.status,
          currentScreen: this.currentScreenMode,
        },
        progress: this.progress.exportData(APP_VERSION),
        analytics: this.analytics.exportData(),
        errors: this.errors.getEntries(),
      },
    );
    this.analytics.recordAction('diagnostics_exported');
    this.showToast('Диагностика экспортирована.');
  }

  private async installPwa(): Promise<void> {
    const outcome = await this.pwa.install();
    this.analytics.recordAction('pwa_install_prompt', { outcome });
    this.showSettings();
    this.showToast(
      outcome === 'accepted'
        ? 'Установка Raven Manor подтверждена.'
        : outcome === 'dismissed'
          ? 'Установка отменена.'
          : 'Установка доступна через меню браузера.',
      outcome === 'accepted' ? 'info' : 'warning',
    );
  }

  private async checkPwaOfflineReadiness(): Promise<void> {
    const status = await this.pwa.refreshOfflineStatus();
    this.showSettings();
    this.showToast(
      status.offlineReady
        ? `Офлайн-версия готова: ${status.cachedAssets}/${status.totalAssets} файлов.`
        : `Офлайн-кэш ещё не завершён: ${status.cachedAssets}/${status.totalAssets || '—'} файлов.`,
      status.offlineReady ? 'info' : 'warning',
    );
  }

  private async checkPwaUpdate(): Promise<void> {
    try {
      const result = await this.pwa.checkForUpdate();
      if (result.status === 'current') {
        this.showToast(`Установлена актуальная версия ${result.currentVersion}.`);
        return;
      }
      if (result.status === 'offline') {
        this.showToast('Для проверки обновления нужен интернет.', 'warning');
        return;
      }
      if (result.status === 'unavailable') {
        this.showToast('Проверка обновлений доступна только в установленной production-сборке.', 'warning');
        return;
      }

      this.showToast(`Найдена версия ${result.remoteVersion}. Перезапускаю приложение…`);
      window.setTimeout(() => window.location.reload(), 650);
    } catch (error) {
      this.errors.record('application', error);
      this.showToast('Не удалось получить свежую версию с сервера.', 'warning');
    }
  }

  private showStory(
    levelId: number,
    nextLevelId?: number | null,
    returnTarget: StoryReturnTarget = 'home',
  ): void {
    const scene = getStorySceneForLevel(storyScenes, levelId);
    if (!scene) {
      this.showToast('Для этого уровня сюжетная сцена пока не подготовлена.', 'warning');
      return;
    }

    this.audio.play('story');
    this.showStoryBeat(scene, 0, nextLevelId, returnTarget);
  }

  private showStoryBeat(
    scene: (typeof storyScenes)[number],
    beatIndex: number,
    nextLevelId?: number | null,
    returnTarget: StoryReturnTarget = 'home',
  ): void {
    const beat = scene.beats[beatIndex];
    const presentation = getStoryScenePresentation(scene, beat);
    const isFinalBeat = beatIndex === scene.beats.length - 1;
    const continueLabel = isFinalBeat
      ? getStoryContinueLabel(nextLevelId, returnTarget)
      : 'Далее';
    const progressDots = scene.beats.map((_, index) => (
      `<span class="${index <= beatIndex ? 'active' : ''}"></span>`
    )).join('');

    this.openModal(`
      <article class="story-scene story-scene--${beat.portraitSide}" aria-label="Сюжетная сцена: ${beat.speaker}">
        <div class="story-scene-art">
          <img class="story-background" src="${presentation.backgroundAsset}" alt="" draggable="false" />
          <div class="story-atmosphere" aria-hidden="true"></div>
          <img class="story-portrait" src="${presentation.portraitAsset}" alt="" draggable="false" />
          <div class="story-scene-heading">
            <div class="chapter">${scene.chapter}</div>
            <small>${scene.title}</small>
            <strong>${beat.speaker}</strong>
          </div>
        </div>
        <div class="story-dialogue">
          <div class="story-beat-progress" aria-label="Реплика ${beatIndex + 1} из ${scene.beats.length}">${progressDots}</div>
          <p>${beat.text}</p>
          <button class="primary" data-action="continue">${continueLabel}</button>
        </div>
      </article>
    `, 'modal-card--story modal-card--cinematic');

    this.bindModal('continue', () => {
      if (!isFinalBeat) {
        this.showStoryBeat(scene, beatIndex + 1, nextLevelId, returnTarget);
        return;
      }

      const wasViewed = this.progress.isStoryViewed(scene.afterLevelId);
      this.progress.markStoryViewed(scene.afterLevelId);
      if (wasViewed) {
        this.analytics.recordAction('story_replayed', { levelId: scene.afterLevelId });
      } else {
        this.analytics.recordStory(scene.afterLevelId);
      }
      const continuation = resolveStoryContinuation(nextLevelId, returnTarget);
      this.closeModal();
      if (continuation.kind === 'level') {
        this.startLevel(continuation.levelId);
      } else if (continuation.kind === 'level-map') {
        this.showLevelMap();
      } else if (continuation.kind === 'journal') {
        this.showStoryJournal();
      } else {
        this.showHome();
      }
    });
  }

  private showHint(): void {
    if (this.busy || !this.objectiveTracker) return;
    const bestMove = findBestMove(this.engine, this.getObjectivePriority());
    if (!bestMove) return;
    this.analytics.recordHint();
    this.audio.play('hint');
    this.hintedTiles.clear();
    for (const position of bestMove.move) {
      this.hintedTiles.add(getTileKey(position.row, position.col));
    }
    this.boardMessage = bestMove.completesObjective
      ? 'Лучший ход · завершает цель'
      : bestMove.objectiveProgress > 0
        ? `Лучший ход · +${bestMove.objectiveProgress} к цели`
        : (bestMove.specialPower ?? 0) > 0
          ? 'Лучший ход · создаёт или активирует усиление'
          : 'Лучший доступный ход';
    this.renderGame();
    window.setTimeout(() => {
      this.hintedTiles.clear();
      this.boardMessage = '';
      if (this.screen.classList.contains('screen-game')) this.renderGame();
    }, 1900);
  }

  private bindStarWalletToggle(): void {
    const button = this.screen.querySelector<HTMLButtonElement>('[data-action="star-wallet-toggle"]');
    const popover = this.screen.querySelector<HTMLElement>('#star-wallet-popover');
    if (!button || !popover) return;

    button.addEventListener('click', () => {
      this.audio.play('ui');
      this.starWalletExpanded = !this.starWalletExpanded;
      button.setAttribute('aria-expanded', String(this.starWalletExpanded));
      button.setAttribute(
        'aria-label',
        this.localization.translate(`Доступно звёзд: ${this.availableStars}. ${this.starWalletExpanded ? 'Скрыть' : 'Показать'} подробный баланс`),
      );
      popover.hidden = !this.starWalletExpanded;
    });
  }

  private showToast(message: string, tone: 'warning' | 'info' = 'info'): void {
    if (this.toastTimer !== null) window.clearTimeout(this.toastTimer);
    this.toast.textContent = this.localization.translate(message);
    this.toast.className = `toast show toast--${tone}`;
    this.toastTimer = window.setTimeout(() => {
      this.toast.className = 'toast';
      this.toast.textContent = '';
      this.toastTimer = null;
    }, 2600);
  }

  private bind(action: string, handler: (element: HTMLElement) => void): void {
    const element = this.screen.querySelector<HTMLElement>(`[data-action="${action}"]`);
    element?.addEventListener('click', () => {
      if (element.dataset.actionPending === 'true') return;
      element.dataset.actionPending = 'true';
      this.audio.play('ui');
      handler(element);
      window.setTimeout(() => {
        if (element.isConnected) delete element.dataset.actionPending;
      }, 300);
    });
  }

  private bindModal(action: string, handler: () => void): void {
    const element = this.modal.querySelector<HTMLElement>(`[data-action="${action}"]`);
    element?.addEventListener('click', () => {
      if (element.dataset.actionPending === 'true') return;
      element.dataset.actionPending = 'true';
      if (element instanceof HTMLButtonElement) element.disabled = true;
      this.audio.play('ui');
      handler();
    });
  }

  private bindAudioVolume(kind: 'music' | 'effects'): void {
    const input = this.screen.querySelector<HTMLInputElement>(`[data-audio-volume="${kind}"]`);
    const output = this.screen.querySelector<HTMLOutputElement>(`[data-audio-output="${kind}"]`);
    input?.addEventListener('input', () => {
      const volume = Number(input.value) / 100;
      if (kind === 'music') {
        this.audio.updateSettings({ musicVolume: volume });
      } else {
        this.audio.updateSettings({ effectsVolume: volume });
      }
      if (output) output.value = `${Math.round(volume * 100)}%`;
    });
    input?.addEventListener('change', () => {
      if (kind === 'effects') this.audio.previewEffects();
    });
  }

  private openModal(content: string, cardClass = ''): void {
    if (this.modalCloseTimer !== null) {
      window.clearTimeout(this.modalCloseTimer);
      this.modalCloseTimer = null;
    }
    const className = ['modal-card', 'modal-card-enter', cardClass].filter(Boolean).join(' ');
    this.modal.classList.remove('is-closing');
    this.modal.innerHTML = `<div class="${className}">${content}</div>`;
    this.modal.classList.add('show');
    this.bindImageStates(this.modal);
    this.localization.translateElement(this.modal);
  }

  private closeModal(): void {
    if (!this.modal.classList.contains('show')) return;
    this.modal.classList.add('is-closing');
    this.modalCloseTimer = window.setTimeout(() => {
      if (!this.modal.classList.contains('is-closing')) return;
      this.modal.classList.remove('show', 'is-closing');
      this.modal.innerHTML = '';
      this.modalCloseTimer = null;
    }, getMotionDuration('modalExit', this.prefersReducedMotion()));
  }

  private bindImageStates(scope: HTMLElement): void {
    scope.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
      const markLoaded = () => image.classList.remove('asset-pending');
      const showFallback = () => {
        const fallback = document.createElement('span');
        fallback.className = 'asset-fallback';
        fallback.textContent = 'RM';
        fallback.setAttribute('role', 'img');
        fallback.setAttribute('aria-label', this.localization.translate('Изображение временно недоступно'));
        image.replaceWith(fallback);
      };

      if (image.complete) {
        if (image.naturalWidth === 0) showFallback();
      } else {
        image.classList.add('asset-pending');
        image.addEventListener('load', markLoaded, { once: true });
        image.addEventListener('error', showFallback, { once: true });
      }
    });
  }

  private renderMatchVfx(): string {
    if (this.prefersReducedMotion() || this.matchedTiles.size === 0) return '';
    return Array.from(this.matchedTiles).flatMap((key) => {
      const [row, col] = key.split(',').map(Number);
      const tileType = this.engine.board[row]?.[col];
      const tile = tileType === undefined ? null : tileTypes[tileType];
      const left = (col + .5) * 12.5;
      const top = (row + .5) * 12.5;
      return createParticleIndexes('match').map((particle) => `
        <i
          class="match-spark ${tile ? `match-spark--${tile.id}` : ''}"
          style="--left:${left};--top:${top};--particle:${particle}"
        ></i>
      `);
    }).join('');
  }

  private renderVfxParticles(kind: VfxKind, className: string): string {
    const reducedMotion = this.prefersReducedMotion();
    return createParticleIndexes(kind, reducedMotion).map((index) => {
      const x = 8 + ((index * 37) % 84);
      const y = 12 + ((index * 53) % 76);
      const angle = (index * 47) % 360;
      const delay = (index % 7) * 45;
      const size = 4 + (index % 3) * 2;
      return `<i class="${className} ${className}--${kind}" style="--i:${index};--x:${x};--y:${y};--angle:${angle};--delay:${delay}ms;--particle-size:${size}px"></i>`;
    }).join('');
  }

  private playRestorationReveal(): void {
    const revealElement = this.screen.querySelector<HTMLElement>('[data-restoration-reveal]');
    if (!revealElement) return;
    const reducedMotion = this.prefersReducedMotion();
    window.setTimeout(() => {
      revealElement.classList.add('is-finished');
      window.setTimeout(() => revealElement.remove(), reducedMotion ? 0 : 180);
      this.pendingRoomReveal = null;
    }, getMotionDuration('restorationReveal', reducedMotion));
  }

  private playRecentRoomUnlock(): void {
    if (!this.recentlyUnlockedRoomId) return;
    const unlockedId = this.recentlyUnlockedRoomId;
    const card = this.screen.querySelector<HTMLElement>(`[data-room="${unlockedId}"]`);
    if (!card) return;
    window.setTimeout(() => {
      card.classList.remove('just-unlocked');
      if (this.recentlyUnlockedRoomId === unlockedId) this.recentlyUnlockedRoomId = null;
    }, getMotionDuration('roomUnlock', this.prefersReducedMotion()));
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }

  private motionDelay(name: MotionDurationName): Promise<void> {
    return this.delay(getMotionDuration(name, this.prefersReducedMotion()));
  }

  private delay(ms: number): Promise<void> {
    if (ms <= 0) return Promise.resolve();
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }
}
