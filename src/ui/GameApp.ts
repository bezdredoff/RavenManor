import {
  levelGroups,
  levels,
  rooms,
  tileTypes,
  type CollectObjectiveDefinition,
  type LevelDefinition,
  type LevelDifficulty,
} from '../data/gameData';
import {
  restorationTasks,
  type RestorationTaskDefinition,
} from '../data/restorationTasks';
import { roomVisuals } from '../data/roomVisuals';
import { storyScenes } from '../data/storyScenes';
import { Match3Engine, type Position } from '../engine/Match3Engine';
import { ProgressStore } from '../engine/ProgressStore';
import { getLevelGroupState } from '../meta/LevelProgression';
import { calculateLevelStars } from '../meta/LevelStarRating';
import {
  completeRestorationTask,
  getRestorationTaskStatus,
  getRoomRestorationTasks,
} from '../meta/RoomRestoration';
import { getRoomUnlockState } from '../meta/RoomProgression';
import { getRoomVisualState } from '../meta/RoomVisualState';
import {
  shouldOfferTutorial,
  shouldShowTutorial,
  type TutorialPreference,
} from '../meta/TutorialState';
import { CollectObjective } from '../objectives/CollectObjective';
import { ObjectiveTracker } from '../objectives/ObjectiveTracker';
import { getScreenClassName, type ScreenMode } from './layoutPolicy';
import {
  createParticleIndexes,
  getMotionDuration,
  type MotionDurationName,
  type VfxKind,
} from './motionPolicy';
import { getTileClassName, getTileKey } from './tilePresentation';
import { getRoomSceneAsset } from './roomPresentation';
import { getStoryScenePresentation } from './storyPresentation';

type SwapOffset = Readonly<{ x: number; y: number }>;

type RoomReveal = Readonly<{
  roomId: string;
  previousAsset: string;
  taskTitle: string;
  unlockedRoomTitle?: string;
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
  private engine = new Match3Engine();

  private currentRoomId = 'hall';
  private currentLevel: LevelDefinition | null = null;
  private selected: Position | null = null;
  private collectObjective: CollectObjective | null = null;
  private objectiveTracker: ObjectiveTracker | null = null;
  private movesLeft = 0;
  private busy = false;
  private readonly matchedTiles = new Set<string>();
  private readonly invalidTiles = new Set<string>();
  private readonly hintedTiles = new Set<string>();
  private boardSettling = false;
  private boardReshuffling = false;
  private boardMessage = '';
  private cascadeLevel = 0;
  private readonly swapOffsets = new Map<string, SwapOffset>();
  private currentScreenMode: ScreenMode | null = null;
  private pendingRoomReveal: RoomReveal | null = null;
  private recentlyUnlockedRoomId: string | null = null;
  private modalCloseTimer: number | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    this.renderShell();
    this.showHome();
  }

  private renderShell(): void {
    this.root.innerHTML = `
      <main class="app-shell">
        <section id="screen"></section>
        <div id="modal" class="modal"></div>
      </main>
    `;
  }

  private get screen(): HTMLElement {
    return this.root.querySelector('#screen') as HTMLElement;
  }

  private get modal(): HTMLElement {
    return this.root.querySelector('#modal') as HTMLElement;
  }

  private renderScreen(mode: ScreenMode, content: string): void {
    const isNavigation = this.currentScreenMode !== mode;
    this.currentScreenMode = mode;
    this.screen.className = `${getScreenClassName(mode)}${isNavigation ? ' screen-enter' : ''}`;
    this.screen.innerHTML = content;
  }

  private topbar(title: string, back?: () => void): string {
    return `
      <header class="topbar">
        ${back
          ? '<button class="icon-button" data-action="back" aria-label="Назад"><span aria-hidden="true">‹</span></button>'
          : '<div class="topbar-spacer" aria-hidden="true"></div>'}
        <div class="brand" title="${title}">${title}</div>
        <div class="resource" title="Доступные звёзды" aria-label="Доступно звёзд: ${this.availableStars}">
          <span aria-hidden="true">★</span><strong>${this.availableStars}</strong>
        </div>
      </header>
    `;
  }

  private get availableStars(): number {
    return this.progress.availableStars;
  }

  private renderStarWallet(): string {
    return `
      <section class="star-wallet" aria-label="Баланс звёзд">
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

  showHome(): void {
    this.renderScreen('home', `
      ${this.topbar('Raven Manor')}
      <section class="hero">
        <div class="raven">🦅</div>
        <h1>Raven Manor</h1>
        <p class="subtitle">Проходите match-3 уровни, восстанавливайте поместье и раскрывайте тайну семьи Блэквуд.</p>
      </section>
      <div class="stack">
        <button class="primary" data-action="play">Играть</button>
        <button class="secondary" data-action="manor">Поместье</button>
        <button class="ghost" data-action="story">Продолжить историю</button>
        <button class="ghost" data-action="settings">Настройки</button>
      </div>
      <p class="footer-note">Глава I · Возвращение в Raven Manor</p>
    `);

    this.bind('play', () => this.showLevelMap());
    this.bind('manor', () => this.showManor());
    this.bind('story', () => this.showStory());
    this.bind('settings', () => this.showSettings());
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
            <img src="${sceneAsset}" alt="" draggable="false" />
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
      <p class="subtitle">Комнаты открываются через восстановление. Match-3 уровни имеют отдельную прогрессию.</p>
      ${this.renderStarWallet()}
      <button class="primary wide-action" data-action="levels">Перейти к уровням</button>
      <div class="room-list">${cards}</div>
      <button class="ghost reset" data-action="reset">Сбросить прогресс</button>
    `);

    this.bind('back', () => this.showHome());
    this.bind('levels', () => this.showLevelMap());
    this.bind('reset', () => {
      if (confirm('Сбросить весь прогресс?')) {
        this.progress.reset();
        this.pendingRoomReveal = null;
        this.recentlyUnlockedRoomId = null;
        this.showManor();
      }
    });
    this.playRecentRoomUnlock();
    this.screen.querySelectorAll<HTMLElement>('[data-room]').forEach((card) => {
      const openRoom = () => this.showRoom(card.dataset.room!);
      card.addEventListener('click', openRoom);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openRoom();
        }
      });
    });
  }

  private showLevelMap(): void {
    const groupCards = levelGroups.map((group) => {
      const state = getLevelGroupState(
        group,
        levelGroups,
        this.progress.state.completed,
      );
      const sourceGroup = levelGroups.find((candidate) => candidate.id === state.sourceGroupId);
      const unlockMessage = state.unlocked
        ? `Пройдено ${state.completedCount}/${state.totalCount}`
        : `Пройдите ${state.requiredCount} уровня в группе «${sourceGroup?.title ?? ''}»`;
      const levelCards = group.levelIds.map((levelId) => {
        const level = levels.find((candidate) => candidate.id === levelId);
        if (!level) throw new Error(`Unknown level in group ${group.id}: ${levelId}`);
        return this.renderLevelCard(level, state.unlocked);
      }).join('');

      return `
        <section class="level-group ${state.unlocked ? '' : 'locked'}">
          <div class="level-group-heading">
            <div>
              <div class="chapter">${state.unlocked ? 'Доступно' : 'Закрыто'}</div>
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
      <h2>Выберите уровень</h2>
      <p class="subtitle">Первые три уровня доступны сразу. Внутри каждой группы можно выбирать порядок прохождения.</p>
      ${this.renderStarWallet()}
      <button class="secondary wide-action" data-action="manor">Вернуться в поместье</button>
      <div class="level-group-list">${groupCards}</div>
    `);

    this.bind('back', () => this.showHome());
    this.bind('manor', () => this.showManor());
    this.screen.querySelectorAll<HTMLButtonElement>('[data-level]').forEach((button) => {
      button.addEventListener('click', () => this.startLevel(Number(button.dataset.level)));
    });
  }

  private renderLevelCard(level: LevelDefinition, groupUnlocked: boolean): string {
    const objective = this.getCollectObjectiveDefinition(level);
    const stars = this.progress.state.stars[level.id] ?? 0;
    return `
      <article class="level-card ${groupUnlocked ? '' : 'locked'}">
        <div>
          <div class="level-card-topline">
            <div class="level-number">${String(level.id).padStart(3, '0')}</div>
            <span class="difficulty difficulty-${level.difficulty}">${DIFFICULTY_LABELS[level.difficulty]}</span>
          </div>
          <h3>${level.title}</h3>
          <div class="room-meta level-objective">Цель: ${objective.target} × ${this.renderTileIcon(objective.tileType, 'inline-tile-icon')}</div>
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
      ${this.renderStarWallet()}
      ${roomVisual}
      <section class="room-section">
        <div class="section-heading">
          <div>
            <div class="chapter">Восстановление</div>
            <h2>Задачи комнаты</h2>
          </div>
          <div class="resource resource-inline">★ ${this.availableStars}</div>
        </div>
        <div class="restoration-list">${restorationCards}</div>
      </section>
      <section class="room-section room-level-cta">
        <div>
          <div class="chapter">Match-3</div>
          <h2>Нужны ещё звёзды?</h2>
          <p class="subtitle">Уровни открываются отдельными группами и не привязаны к одной комнате.</p>
        </div>
        <button class="primary" data-action="levels">К уровням</button>
      </section>
    `);

    this.bind('back', () => this.showManor());
    this.bind('levels', () => this.showLevelMap());
    this.screen.querySelectorAll<HTMLButtonElement>('[data-restoration-task]').forEach((button) => {
      button.addEventListener('click', () => this.restoreTask(button.dataset.restorationTask!));
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
          <img class="room-visual-image" src="${sceneAsset}" alt="" draggable="false" />
          <div class="room-visual-vignette" aria-hidden="true"></div>
          ${reveal ? `
            <div class="room-restoration-reveal" data-restoration-reveal role="status" aria-live="polite">
              <img class="room-restoration-before" src="${reveal.previousAsset}" alt="" draggable="false" />
              <div class="room-restoration-flash" aria-hidden="true"></div>
              <div class="room-restoration-particles" aria-hidden="true">${revealParticles}</div>
              <div class="room-restoration-message">
                <span>Восстановлено</span>
                <strong>${reveal.taskTitle}</strong>
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
    const disabled = status !== 'available';
    const buttonLabel = status === 'completed'
      ? 'Выполнено'
      : status === 'locked'
        ? 'Сначала предыдущая'
        : `${task.starCost} ★`;

    return `
      <article class="restoration-card ${completed ? 'completed' : ''} ${status === 'locked' ? 'locked' : ''}">
        <div class="restoration-status">${completed ? '✓' : task.order}</div>
        <div>
          <h3>${task.title}</h3>
          <div class="room-meta">${task.description}</div>
        </div>
        <button
          class="${completed ? 'ghost' : 'secondary'} compact"
          ${disabled ? 'disabled' : ''}
          data-restoration-task="${task.id}"
        >${buttonLabel}</button>
      </article>
    `;
  }

  private restoreTask(taskId: string): void {
    const task = restorationTasks.find((candidate) => candidate.id === taskId);
    if (!task) return;

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
    };
    this.recentlyUnlockedRoomId = newlyUnlockedRoom?.id ?? this.recentlyUnlockedRoomId;
    this.showRoom(this.currentRoomId);
    this.playRestorationReveal();
  }

  private startLevel(levelId: number): void {
    this.currentLevel = levels.find((level) => level.id === levelId) ?? null;
    if (!this.currentLevel) throw new Error(`Unknown level: ${levelId}`);

    const group = levelGroups.find((candidate) => candidate.levelIds.includes(levelId));
    if (!group || !getLevelGroupState(group, levelGroups, this.progress.state.completed).unlocked) {
      throw new Error(`Level ${levelId} is locked.`);
    }

    const objectiveDefinition = this.getCollectObjectiveDefinition(this.currentLevel);
    this.engine = new Match3Engine();
    this.selected = null;
    this.collectObjective = new CollectObjective({
      id: `level-${this.currentLevel.id}-${objectiveDefinition.id}`,
      tileType: objectiveDefinition.tileType,
      target: objectiveDefinition.target,
    });
    this.objectiveTracker = new ObjectiveTracker([this.collectObjective]);
    this.movesLeft = this.currentLevel.moves;
    this.busy = false;
    this.matchedTiles.clear();
    this.invalidTiles.clear();
    this.hintedTiles.clear();
    this.boardSettling = false;
    this.boardReshuffling = false;
    this.boardMessage = '';
    this.cascadeLevel = 0;
    this.swapOffsets.clear();
    this.renderGame();

    if (shouldOfferTutorial(this.progress.state.tutorial)) {
      this.offerTutorial();
    }
  }

  private getCollectObjectiveDefinition(level: LevelDefinition): CollectObjectiveDefinition {
    const objective = level.objectives.find(
      (definition): definition is CollectObjectiveDefinition => definition.type === 'collect',
    );
    if (!objective) throw new Error(`Level ${level.id} does not define a collect objective.`);
    return objective;
  }

  private renderTileIcon(tileType: number, className = 'tile-icon'): string {
    const tile = tileTypes[tileType];
    if (!tile) return '';
    return `<img class="${className}" src="${tile.assetPath}" alt="" draggable="false" />`;
  }

  private renderGame(): void {
    if (!this.currentLevel || !this.collectObjective) return;
    const objective = this.collectObjective.getSnapshot();
    const target = tileTypes[objective.tileType];
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
          <div class="objective-card">
            <div class="objective-copy">
              <span class="hud-label">Цель</span>
              <strong>${objective.current} / ${objective.target} · ${target.name}</strong>
              <div class="progress" aria-label="Прогресс цели"><i style="width:${Math.min(100, (objective.current / objective.target) * 100)}%"></i></div>
            </div>
            <div class="objective-icon">${this.renderTileIcon(objective.tileType, 'objective-tile-icon')}</div>
          </div>
          <div class="move-counter">
            <span>Ходы</span>
            <strong>${this.movesLeft}</strong>
          </div>
        </section>
        <div class="star-targets"><span>★★★ ${this.currentLevel.starThresholds.threeStarsMovesLeft}+</span><span>★★ ${this.currentLevel.starThresholds.twoStarsMovesLeft}+</span><small>ходов останется</small></div>
        <div class="board-stage">
          <div class="board-wrap ${boardStateClasses}">
            <div class="board-sigil" aria-hidden="true"></div>
            <div class="board" role="grid" aria-label="Игровое поле 8 на 8" aria-busy="${this.busy}">${this.renderBoard()}</div>
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
        const definition = tileTypes[tile];
        const key = getTileKey(rowIndex, colIndex);
        if (!definition) {
          return `<span class="tile tile-empty" role="gridcell" aria-hidden="true"></span>`;
        }

        const swapOffset = this.swapOffsets.get(key);
        const className = [getTileClassName(tile, {
          selected: this.selected?.row === rowIndex && this.selected?.col === colIndex,
          hinted: this.hintedTiles.has(key),
          invalid: this.invalidTiles.has(key),
          matched: this.matchedTiles.has(key),
          settling: this.boardSettling,
        }), swapOffset ? 'swapping' : ''].filter(Boolean).join(' ');
        const swapStyle = swapOffset
          ? `style="--swap-x:${swapOffset.x};--swap-y:${swapOffset.y}"`
          : '';

        return `
          <button
            class="${className}"
            ${swapStyle}
            data-tile="${key}"
            data-tile-type="${definition.id}"
            role="gridcell"
            aria-label="${definition.name}, ряд ${rowIndex + 1}, колонка ${colIndex + 1}"
            aria-pressed="${this.selected?.row === rowIndex && this.selected?.col === colIndex}"
          >
            <span class="tile-surface" aria-hidden="true"></span>
            <img class="tile-glyph" src="${definition.assetPath}" alt="" draggable="false" />
          </button>
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

      if (this.engine.areAdjacent(first, second)) {
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
    const tile = target.closest<HTMLElement>('[data-tile]');
    if (!tile?.dataset.tile) return null;
    const [row, col] = tile.dataset.tile.split(',').map(Number);
    return Number.isInteger(row) && Number.isInteger(col) ? { row, col } : null;
  }

  private async onTileClick(position: Position): Promise<void> {
    if (this.busy || !this.currentLevel) return;
    if (!this.selected) {
      this.selected = position;
      this.renderGame();
      return;
    }
    if (this.selected.row === position.row && this.selected.col === position.col) {
      this.selected = null;
      this.renderGame();
      return;
    }
    if (!this.engine.areAdjacent(this.selected, position)) {
      this.selected = position;
      this.renderGame();
      return;
    }

    const first = this.selected;
    this.selected = null;
    await this.attemptSwap(first, position);
  }

  private async attemptSwap(first: Position, second: Position): Promise<void> {
    if (this.busy || !this.currentLevel) return;
    this.busy = true;
    this.selected = null;
    await this.swapWithMotion(first, second);
    let matches = this.engine.findMatches();

    if (matches.length === 0) {
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

    this.movesLeft--;
    if (this.progress.state.tutorial.preference === 'enabled'
      && this.progress.state.tutorial.step === 0) {
      this.progress.advanceTutorial();
    }

    let cascade = 0;
    while (matches.length > 0) {
      cascade++;
      this.cascadeLevel = cascade;
      this.matchedTiles.clear();
      matches.forEach((position) => this.matchedTiles.add(getTileKey(position.row, position.col)));
      this.boardMessage = cascade > 1 ? `Каскад ×${cascade}` : `Комбинация ×${matches.length}`;
      this.renderGame();
      await this.motionDelay('clear');

      const removed = this.engine.clearMatches(matches);
      this.objectiveTracker?.handle({ type: 'tiles-removed', tileTypes: removed });
      this.engine.collapse();
      this.matchedTiles.clear();
      this.boardSettling = true;
      this.renderGame();
      await this.motionDelay('settle');
      this.boardSettling = false;
      matches = this.engine.findMatches();
    }

    this.boardMessage = '';
    this.cascadeLevel = 0;
    if (!this.engine.findPossibleMove()) {
      this.boardReshuffling = true;
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

  private async swapWithMotion(first: Position, second: Position): Promise<void> {
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
    const stars = calculateLevelStars(this.currentLevel, this.movesLeft);
    const newlyEarned = this.progress.saveLevel(this.currentLevel.id, stars);
    const rewardMessage = newlyEarned > 0
      ? `Получено новых звёзд: ${newlyEarned} ★`
      : 'Лучший результат уровня не улучшен.';

    this.openModal(`
      <div class="result-vfx result-vfx--win" aria-hidden="true">${this.renderVfxParticles('win', 'result-particle')}</div>
      <div class="result-emblem result-emblem--win" aria-hidden="true">✦</div>
      <div class="big-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
      <h2>Уровень пройден</h2>
      <p>Победы открывают новые группы уровней. Звёзды можно тратить на восстановление поместья.</p>
      <p class="reward-message">${rewardMessage}</p>
      <div class="modal-balance">Доступно: ${this.progress.availableStars} ★</div>
      <div class="stack">
        <button class="primary" data-action="levels">К уровням</button>
        <button class="secondary" data-action="manor">В поместье</button>
        <button class="ghost" data-action="story">Сюжетная сцена</button>
      </div>
    `, 'modal-card--result modal-card--win');

    this.bindModal('levels', () => {
      this.closeModal();
      this.showLevelMap();
    });
    this.bindModal('manor', () => {
      this.closeModal();
      this.showManor();
    });
    this.bindModal('story', () => {
      this.closeModal();
      this.showStory();
    });
  }

  private loseLevel(): void {
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
            <p>Соберите три или больше одинаковых фишек в ряд. Поле уже активно — можно сразу играть.</p>
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
          <p>Комбинации из четырёх и каскады тоже засчитываются. Больше оставшихся ходов — больше звёзд.</p>
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
      <div class="portrait">🦉</div>
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

  private showSettings(): void {
    const preference: TutorialPreference = this.progress.state.tutorial.preference;
    const status = preference === 'undecided'
      ? 'Будет предложено при запуске уровня'
      : preference === 'enabled'
        ? `Включено · шаг ${Math.min(2, this.progress.state.tutorial.step + 1)}/2`
        : preference === 'completed'
          ? 'Завершено'
          : 'Отключено';

    this.renderScreen('settings', `
      ${this.topbar('Настройки', () => this.showHome())}
      <div class="chapter">Игровые настройки</div>
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
      <div class="chapter settings-section-label">Доступность</div>
      <h2>Анимации и эффекты</h2>
      <section class="settings-card">
        <div>
          <strong>Сокращение движения</strong>
          <p class="subtitle">Игра автоматически следует системной настройке <em>Reduce Motion</em>. При её включении отключаются частицы, перелёты и декоративные движения, но все состояния остаются видимыми.</p>
        </div>
        <div class="setting-status">${this.prefersReducedMotion() ? 'Сокращённые эффекты активны' : 'Полные эффекты активны'}</div>
      </section>
      <p class="footer-note">Новые механики позднее будут объясняться такими же короткими контекстными карточками.</p>
    `);

    this.bind('back', () => this.showHome());
    this.bind('tutorial-restart', () => {
      this.progress.restartTutorial();
      this.showSettings();
    });
    this.bind('tutorial-disable', () => {
      this.progress.skipTutorial();
      this.showSettings();
    });
  }

  private showStory(): void {
    const scene = storyScenes[this.progress.advanceStory(storyScenes.length)];
    const presentation = getStoryScenePresentation(scene);
    this.openModal(`
      <article class="story-scene story-scene--${scene.portraitSide}" aria-label="Сюжетная сцена: ${scene.speaker}">
        <div class="story-scene-art">
          <img class="story-background" src="${presentation.backgroundAsset}" alt="" draggable="false" />
          <div class="story-atmosphere" aria-hidden="true"></div>
          <img class="story-portrait" src="${presentation.portraitAsset}" alt="" draggable="false" />
          <div class="story-scene-heading">
            <div class="chapter">${scene.chapter}</div>
            <strong>${scene.speaker}</strong>
          </div>
        </div>
        <div class="story-dialogue">
          <p>${scene.text}</p>
          <button class="primary" data-action="continue">Продолжить</button>
        </div>
      </article>
    `, 'modal-card--story modal-card--cinematic');
    this.bindModal('continue', () => this.closeModal());
  }

  private showHint(): void {
    if (this.busy) return;
    const move = this.engine.findPossibleMove();
    if (!move) return;
    this.hintedTiles.clear();
    for (const position of move) {
      this.hintedTiles.add(getTileKey(position.row, position.col));
    }
    this.boardMessage = 'Возможный ход';
    this.renderGame();
    window.setTimeout(() => {
      this.hintedTiles.clear();
      this.boardMessage = '';
      if (this.screen.classList.contains('screen-game')) this.renderGame();
    }, 1500);
  }

  private bind(action: string, handler: () => void): void {
    this.screen.querySelector<HTMLElement>(`[data-action="${action}"]`)?.addEventListener('click', handler);
  }

  private bindModal(action: string, handler: () => void): void {
    this.modal.querySelector<HTMLElement>(`[data-action="${action}"]`)?.addEventListener('click', handler);
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
