import { levels, rooms, tileTypes, type LevelDefinition } from '../data/gameData';
import { Match3Engine, type Position } from '../engine/Match3Engine';
import { ProgressStore } from '../engine/ProgressStore';
import { CollectObjective } from '../objectives/CollectObjective';
import { ObjectiveTracker } from '../objectives/ObjectiveTracker';

export class GameApp {
  private readonly root: HTMLElement;
  private readonly progress = new ProgressStore();
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
        <div class="resource">★ ${this.progress.totalStars}</div>
      </header>
    `;
  }

  showHome(): void {
    this.screen.innerHTML = `
      ${this.topbar('Raven Manor')}
      <section class="hero">
        <div class="raven">🦅</div>
        <h1>Raven Manor</h1>
        <p class="subtitle">Восстановите готическое поместье и раскройте тайну семьи Блэквуд.</p>
      </section>
      <div class="stack">
        <button class="primary" data-action="enter">Войти в поместье</button>
        <button class="secondary" data-action="story">Продолжить историю</button>
      </div>
      <p class="footer-note">Vite + TypeScript vertical slice</p>
    `;

    this.bind('enter', () => this.showManor());
    this.bind('story', () => this.showStory());
  }

  private showManor(): void {
    const cards = rooms.map((room) => {
      const locked = this.progress.totalStars < room.requiredStars;
      const roomStars = room.levelIds.reduce((sum, id) => sum + (this.progress.state.stars[id] ?? 0), 0);
      return `
        <article class="room-card ${locked ? 'locked' : ''}" ${locked ? '' : `data-room="${room.id}"`}>
          <div class="room-icon">${locked ? '🔒' : room.icon}</div>
          <div>
            <div class="room-title">${room.title}</div>
            <div class="room-meta">${locked ? `Нужно ${room.requiredStars} ★` : room.description}</div>
          </div>
          <div class="room-stars">${roomStars}/6 ★</div>
        </article>
      `;
    }).join('');

    this.screen.innerHTML = `
      ${this.topbar('Поместье', () => this.showHome())}
      <div class="chapter">Глава I · Возвращение</div>
      <h2>Комнаты Raven Manor</h2>
      <p class="subtitle">Проходите уровни и открывайте новые части особняка.</p>
      <div class="room-list">${cards}</div>
      <button class="ghost reset" data-action="reset">Сбросить прогресс</button>
    `;

    this.bind('back', () => this.showHome());
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

  private showRoom(roomId: string): void {
    this.currentRoomId = roomId;
    const room = rooms.find((item) => item.id === roomId);
    if (!room) return;

    const cards = room.levelIds.map((levelId) => {
      const level = levels[levelId - 1];
      const locked = this.progress.totalStars < level.requiredStars;
      const stars = this.progress.state.stars[level.id] ?? 0;

      return `
        <article class="level-card ${locked ? 'locked' : ''}">
          <div>
            <div class="level-number">${String(level.id).padStart(2, '0')}</div>
            <h3>${level.title}</h3>
            <div class="room-meta">Цель: ${level.targetCount} × ${tileTypes[level.targetTile].icon}</div>
          </div>
          <div>
            <div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
            <button class="${locked ? 'ghost' : 'primary'}" ${locked ? 'disabled' : ''} data-level="${level.id}">
              ${locked ? `${level.requiredStars} ★` : 'Играть'}
            </button>
          </div>
        </article>
      `;
    }).join('');

    this.screen.innerHTML = `
      ${this.topbar(room.title, () => this.showManor())}
      <p class="subtitle">${room.description}</p>
      <div class="level-grid">${cards}</div>
    `;

    this.bind('back', () => this.showManor());
    this.screen.querySelectorAll<HTMLButtonElement>('[data-level]').forEach((button) => {
      button.addEventListener('click', () => this.startLevel(Number(button.dataset.level)));
    });
  }

  private startLevel(levelId: number): void {
    this.currentLevel = levels[levelId - 1];
    this.engine = new Match3Engine();
    this.selected = null;
    this.collectObjective = new CollectObjective({
      id: `level-${this.currentLevel.id}-collect`,
      tileType: this.currentLevel.targetTile,
      target: this.currentLevel.targetCount,
    });
    this.objectiveTracker = new ObjectiveTracker([this.collectObjective]);
    this.movesLeft = this.currentLevel.moves;
    this.busy = false;
    this.renderGame();
  }

  private renderGame(): void {
    if (!this.currentLevel || !this.collectObjective) return;
    const objective = this.collectObjective.getSnapshot();
    const target = tileTypes[objective.tileType];

    this.screen.innerHTML = `
      ${this.topbar(this.currentLevel.title, () => this.showRoom(this.currentRoomId))}
      <section class="objective-card">
        <div>
          <strong>${objective.current} / ${objective.target} · ${target.name}</strong>
          <div class="progress"><i style="width:${Math.min(100, (objective.current / objective.target) * 100)}%"></i></div>
        </div>
        <div class="objective-icon">${target.icon}</div>
      </section>
      <div class="moves">Ходы: ${this.movesLeft}</div>
      <div class="board-wrap"><div class="board">${this.renderBoard()}</div></div>
      <div class="game-actions">
        <button class="secondary" data-action="hint">Подсказка</button>
        <button class="ghost" data-action="restart">Заново</button>
      </div>
    `;

    this.bind('back', () => this.showRoom(this.currentRoomId));
    this.bind('hint', () => this.showHint());
    this.bind('restart', () => this.startLevel(this.currentLevel!.id));

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
      `)
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
    this.busy = true;

    while (matches.length > 0) {
      const removed = this.engine.clearMatches(matches);
      this.objectiveTracker?.handle({
        type: 'tiles-removed',
        tileTypes: removed,
      });
      this.renderGame();
      await this.delay(140);
      this.engine.collapse();
      matches = this.engine.findMatches();
    }

    if (!this.engine.findPossibleMove()) {
      const reshuffled = this.engine.reshuffle();

      // This fallback should only be reached for an invalid or pathological
      // tile distribution. It keeps the level playable instead of blocking UI.
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
    const ratio = this.movesLeft / this.currentLevel.moves;
    const stars = ratio >= 0.45 ? 3 : ratio >= 0.2 ? 2 : 1;
    this.progress.saveLevel(this.currentLevel.id, stars);

    this.openModal(`
      <div class="big-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
      <h2>Уровень пройден</h2>
      <p>Вы нашли ещё один фрагмент истории Raven Manor.</p>
      <div class="stack">
        <button class="primary" data-action="levels">К уровням</button>
        <button class="secondary" data-action="story">Сюжетная сцена</button>
      </div>
    `);

    this.bindModal('levels', () => {
      this.closeModal();
      this.showRoom(this.currentRoomId);
    });
    this.bindModal('story', () => {
      this.closeModal();
      this.showStory();
    });
  }

  private loseLevel(): void {
    this.openModal(`
      <h2>Ходы закончились</h2>
      <p class="subtitle">Перестройте комбинации и попробуйте снова.</p>
      <div class="stack">
        <button class="primary" data-action="retry">Повторить</button>
        <button class="ghost" data-action="exit">Выйти</button>
      </div>
    `);

    this.bindModal('retry', () => {
      this.closeModal();
      this.startLevel(this.currentLevel!.id);
    });
    this.bindModal('exit', () => {
      this.closeModal();
      this.showRoom(this.currentRoomId);
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
