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

  private topbar(title: string, back?: () => void): string {
    return `
      <header class="topbar">
        ${back ? '<button class="ghost compact" data-action="back">←</button>' : '<div></div>'}
        <div class="brand">${title}</div>
        <div class="resource" title="Доступные звёзды">★ ${this.availableStars}</div>
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
    this.screen.innerHTML = `
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
      <p class="footer-note">Первые 10 уровней — вертикальный срез масштабируемой системы.</p>
    `;

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

      return `
        <article class="room-card ${locked ? 'locked' : ''} ${visualState.isComplete ? 'restored' : ''}" ${locked ? '' : `data-room="${room.id}"`}>
          <div class="room-icon">${locked ? '🔒' : visualState.stage.placeholderIcon}</div>
          <div>
            <div class="room-title">${room.title}</div>
            <div class="room-meta">${locked ? lockedLabel : room.description}</div>
            ${locked ? '' : `<div class="room-restoration-meta">${restorationLabel}</div>`}
          </div>
          <div class="room-stage">${visualState.completedTaskCount}/${visualState.totalTaskCount}</div>
        </article>
      `;
    }).join('');

    this.screen.innerHTML = `
      ${this.topbar('Поместье', () => this.showHome())}
      <div class="chapter">Глава I · Возвращение</div>
      <h2>Комнаты Raven Manor</h2>
      <p class="subtitle">Комнаты открываются через восстановление. Match-3 уровни имеют отдельную прогрессию.</p>
      ${this.renderStarWallet()}
      <button class="primary wide-action" data-action="levels">Перейти к уровням</button>
      <div class="room-list">${cards}</div>
      <button class="ghost reset" data-action="reset">Сбросить прогресс</button>
    `;

    this.bind('back', () => this.showHome());
    this.bind('levels', () => this.showLevelMap());
    this.bind('reset', () => {
      if (confirm('Сбросить весь прогресс?')) {
        this.progress.reset();
        this.showManor();
      }
    });
    this.screen.querySelectorAll<HTMLElement>('[data-room]').forEach((card) => {
      card.addEventListener('click', () => this.showRoom(card.dataset.room!));
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

    this.screen.innerHTML = `
      ${this.topbar('Уровни', () => this.showHome())}
      <div class="chapter">Match-3 кампания</div>
      <h2>Выберите уровень</h2>
      <p class="subtitle">Первые три уровня доступны сразу. Внутри каждой группы можно выбирать порядок прохождения.</p>
      ${this.renderStarWallet()}
      <button class="secondary wide-action" data-action="manor">Вернуться в поместье</button>
      <div class="level-group-list">${groupCards}</div>
    `;

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
          <div class="room-meta">Цель: ${objective.target} × ${tileTypes[objective.tileType].icon}</div>
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

    this.screen.innerHTML = `
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
    `;

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

    return `
      <section
        class="room-visual room-visual--${roomId} stage-${state.completedTaskCount}"
        data-room-asset="${state.stage.assetKey}"
        aria-label="${roomTitle}: ${state.stage.title}"
      >
        <div class="room-visual-scene">
          <div class="room-visual-mist"></div>
          <div class="room-visual-symbol" aria-hidden="true">${state.stage.placeholderIcon}</div>
          <div class="room-visual-copy">
            <div class="chapter">Состояние комнаты · ${state.completedTaskCount}/${state.totalTaskCount}</div>
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
    const updatedTasks = completeRestorationTask(
      taskId,
      restorationTasks,
      this.progress.state.completedRestorationTasks,
      this.progress.availableStars,
    );

    if (updatedTasks[taskId] && !this.progress.state.completedRestorationTasks[taskId]) {
      this.progress.completeRestorationTask(taskId);
    }
    this.showRoom(this.currentRoomId);
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

  private renderGame(): void {
    if (!this.currentLevel || !this.collectObjective) return;
    const objective = this.collectObjective.getSnapshot();
    const target = tileTypes[objective.tileType];

    this.screen.innerHTML = `
      ${this.topbar(this.currentLevel.title, () => this.showLevelMap())}
      ${this.renderTutorialBanner()}
      <section class="objective-card">
        <div>
          <strong>${objective.current} / ${objective.target} · ${target.name}</strong>
          <div class="progress"><i style="width:${Math.min(100, (objective.current / objective.target) * 100)}%"></i></div>
        </div>
        <div class="objective-icon">${target.icon}</div>
      </section>
      <div class="moves">Ходы: ${this.movesLeft}</div>
      <div class="star-targets">3★: ${this.currentLevel.starThresholds.threeStarsMovesLeft}+ ходов · 2★: ${this.currentLevel.starThresholds.twoStarsMovesLeft}+</div>
      <div class="board-wrap"><div class="board">${this.renderBoard()}</div></div>
      <div class="game-actions">
        <button class="secondary" data-action="hint">Подсказка</button>
        <button class="ghost" data-action="restart">Заново</button>
      </div>
    `;

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
    this.screen.querySelectorAll<HTMLButtonElement>('[data-tile]').forEach((button) => {
      button.addEventListener('click', () => {
        const [row, col] = button.dataset.tile!.split(',').map(Number);
        this.onTileClick({ row, col });
      });
    });
  }

  private renderBoard(): string {
    return this.engine.board.flatMap((row, rowIndex) =>
      row.map((tile, colIndex) => `
        <button
          class="tile ${this.selected?.row === rowIndex && this.selected?.col === colIndex ? 'selected' : ''}"
          data-tile="${rowIndex},${colIndex}"
        >${tileTypes[tile]?.icon ?? ''}</button>
      `),
    ).join('');
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
    this.engine.swap(first, position);
    let matches = this.engine.findMatches();
    if (matches.length === 0) {
      this.engine.swap(first, position);
      this.renderGame();
      return;
    }

    this.movesLeft--;
    if (this.progress.state.tutorial.preference === 'enabled'
      && this.progress.state.tutorial.step === 0) {
      this.progress.advanceTutorial();
    }
    this.busy = true;
    while (matches.length > 0) {
      const removed = this.engine.clearMatches(matches);
      this.objectiveTracker?.handle({ type: 'tiles-removed', tileTypes: removed });
      this.renderGame();
      await this.delay(140);
      this.engine.collapse();
      matches = this.engine.findMatches();
    }

    if (!this.engine.findPossibleMove()) {
      const reshuffled = this.engine.reshuffle();
      if (!reshuffled) this.engine.generateBoard();
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

  private winLevel(): void {
    if (!this.currentLevel) return;
    const stars = calculateLevelStars(this.currentLevel, this.movesLeft);
    const newlyEarned = this.progress.saveLevel(this.currentLevel.id, stars);
    const rewardMessage = newlyEarned > 0
      ? `Получено новых звёзд: ${newlyEarned} ★`
      : 'Лучший результат уровня не улучшен.';

    this.openModal(`
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
    `);

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
      <h2>Ходы закончились</h2>
      <p class="subtitle">Можно повторить попытку или выбрать другой открытый уровень.</p>
      <div class="stack">
        <button class="primary" data-action="retry">Повторить</button>
        <button class="ghost" data-action="exit">К уровням</button>
      </div>
    `);
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

    this.screen.innerHTML = `
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
      <p class="footer-note">Новые механики позднее будут объясняться такими же короткими контекстными карточками.</p>
    `;

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
    const scenes = [
      ['👩‍🎨', 'Эвелин', 'После многих лет отсутствия я снова стою перед воротами Raven Manor. Письмо не было подписано.'],
      ['🦅', 'Ворон', 'Кар-р... Дом узнаёт свою наследницу, даже если она сама ещё ничего не помнит.'],
      ['🧛', 'Лорд Адриан', 'Восстановите комнаты, Эвелин. Каждая из них хранит часть древнего договора.'],
      ['🌑', 'Неизвестный силуэт', 'Ты уже была здесь. В башне. В ту ночь, которую у тебя отняли.'],
    ];
    const scene = scenes[this.progress.advanceStory(scenes.length)];
    this.openModal(`
      <div class="portrait">${scene[0]}</div>
      <div class="chapter">${scene[1]}</div>
      <div class="dialogue">${scene[2]}</div>
      <button class="primary" data-action="continue">Продолжить</button>
    `);
    this.bindModal('continue', () => this.closeModal());
  }

  private showHint(): void {
    const move = this.engine.findPossibleMove();
    if (!move) return;
    for (const position of move) {
      this.screen
        .querySelector<HTMLElement>(`[data-tile="${position.row},${position.col}"]`)
        ?.classList.add('hint');
    }
    window.setTimeout(() => {
      this.screen.querySelectorAll('.hint').forEach((element) => element.classList.remove('hint'));
    }, 1500);
  }

  private bind(action: string, handler: () => void): void {
    this.screen.querySelector<HTMLElement>(`[data-action="${action}"]`)?.addEventListener('click', handler);
  }

  private bindModal(action: string, handler: () => void): void {
    this.modal.querySelector<HTMLElement>(`[data-action="${action}"]`)?.addEventListener('click', handler);
  }

  private openModal(content: string): void {
    this.modal.innerHTML = `<div class="modal-card">${content}</div>`;
    this.modal.classList.add('show');
  }

  private closeModal(): void {
    this.modal.classList.remove('show');
    this.modal.innerHTML = '';
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }
}
