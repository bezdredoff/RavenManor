import { getSafeStorage } from '../platform/SafeStorage';
import type { RestorationTaskDefinition } from '../data/restorationTasks';
import {
  awardStars,
  createStarBalance,
  restoreStarBalance,
  spendStars,
  type StarBalance,
} from '../meta/StarEconomy';
import {
  advanceTutorial,
  createTutorialState,
  restartTutorial,
  restoreTutorialState,
  skipTutorial,
  startTutorial,
  type TutorialState,
} from '../meta/TutorialState';

export type ProgressState = {
  stars: Record<number, number>;
  completed: Record<number, boolean>;
  completedRestorationTasks: Record<string, boolean>;
  starBalance: StarBalance;
  tutorial: TutorialState;
  storyStep: number;
  viewedStoryScenes: Record<number, boolean>;
};

export type ProgressExportEnvelope = Readonly<{
  format: 'raven-manor-save';
  formatVersion: 1;
  appVersion: string;
  exportedAt: string;
  state: ProgressState;
}>;

export type ProgressStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const STORAGE_KEY = 'ravenManorStateV4';
const LEGACY_V3_STORAGE_KEY = 'ravenManorStateV3';
const LEGACY_V2_STORAGE_KEY = 'ravenManorStateV2';
const CORRUPT_BACKUP_KEY = 'ravenManorCorruptSaveBackupV1';

const createEmptyState = (): ProgressState => ({
  stars: {},
  completed: {},
  completedRestorationTasks: {},
  starBalance: createStarBalance(),
  tutorial: createTutorialState(),
  storyStep: 0,
  viewedStoryScenes: {},
});

const normalizeStars = (value: unknown): Record<number, number> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, raw]) => [Number(key), Math.max(0, Math.min(3, Math.floor(Number(raw))))] as const)
      .filter(([key, stars]) => Number.isInteger(key) && key > 0 && Number.isFinite(stars)),
  );
};

const normalizeBooleanRecord = <K extends number | string>(
  value: unknown,
  keyParser: (key: string) => K | null,
): Record<K, boolean> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {} as Record<K, boolean>;
  const entries = Object.entries(value).flatMap(([key, raw]) => {
    const parsedKey = keyParser(key);
    return parsedKey === null || raw !== true ? [] : [[parsedKey, true] as const];
  });
  return Object.fromEntries(entries) as Record<K, boolean>;
};

export class ProgressStore {
  state: ProgressState;
  recoveryNotice: string | null = null;
  storageAvailable = true;

  constructor(
    private readonly restorationTasks: readonly RestorationTaskDefinition[] = [],
    private readonly storage: ProgressStorage = getSafeStorage(),
  ) {
    const { state, migrated } = this.load();
    this.state = state;

    if (migrated) this.persist();
  }

  get earnedStars(): number {
    return this.state.starBalance.earned;
  }

  get spentStars(): number {
    return this.state.starBalance.spent;
  }

  get availableStars(): number {
    return this.state.starBalance.available;
  }

  /** @deprecated Use earnedStars when checking progression thresholds. */
  get totalStars(): number {
    return this.earnedStars;
  }

  saveLevel(levelId: number, stars: number): number {
    const previousBest = this.state.stars[levelId] ?? 0;
    const nextBest = Math.max(previousBest, stars);
    const newlyEarned = nextBest - previousBest;

    this.state.stars[levelId] = nextBest;
    this.state.completed[levelId] = true;
    this.state.starBalance = awardStars(this.state.starBalance, newlyEarned);
    this.persist();

    return newlyEarned;
  }

  completeRestorationTask(taskId: string): boolean {
    if (this.state.completedRestorationTasks[taskId]) return false;

    const task = this.restorationTasks.find((candidate) => candidate.id === taskId);
    if (!task) throw new Error(`Unknown restoration task: ${taskId}`);

    this.state.starBalance = spendStars(this.state.starBalance, task.starCost);
    this.state.completedRestorationTasks[taskId] = true;
    this.persist();
    return true;
  }

  startTutorial(): void {
    this.state.tutorial = startTutorial();
    this.persist();
  }

  skipTutorial(): void {
    this.state.tutorial = skipTutorial();
    this.persist();
  }

  advanceTutorial(): void {
    this.state.tutorial = advanceTutorial(this.state.tutorial);
    this.persist();
  }

  restartTutorial(): void {
    this.state.tutorial = restartTutorial();
    this.persist();
  }

  /** @deprecated Story scenes are now associated with individual levels. */
  advanceStory(maxSteps: number): number {
    const current = Math.min(this.state.storyStep, Math.max(0, maxSteps - 1));
    this.state.storyStep = Math.min(current + 1, maxSteps);
    this.persist();
    return current;
  }

  isStoryViewed(levelId: number): boolean {
    return Boolean(this.state.viewedStoryScenes[levelId]);
  }

  markStoryViewed(levelId: number): void {
    if (this.state.viewedStoryScenes[levelId]) return;
    this.state.viewedStoryScenes[levelId] = true;
    this.persist();
  }

  exportData(appVersion: string): ProgressExportEnvelope {
    return {
      format: 'raven-manor-save',
      formatVersion: 1,
      appVersion,
      exportedAt: new Date().toISOString(),
      state: JSON.parse(JSON.stringify(this.state)) as ProgressState,
    };
  }

  importData(raw: string): void {
    const parsed = JSON.parse(raw) as Partial<ProgressExportEnvelope> | Partial<ProgressState>;
    const candidate = 'format' in parsed && parsed.format === 'raven-manor-save'
      ? parsed.state
      : parsed;
    if (!candidate || typeof candidate !== 'object') {
      throw new Error('Файл не содержит сохранение Raven Manor.');
    }
    const record = candidate as Partial<ProgressState>;
    const hasRecognisedField = ['stars', 'completed', 'completedRestorationTasks', 'starBalance', 'tutorial', 'viewedStoryScenes']
      .some((field) => field in record);
    if (!hasRecognisedField) {
      throw new Error('Файл не похож на сохранение Raven Manor.');
    }
    this.state = this.normalizeState(record);
    this.recoveryNotice = null;
    this.persist();
  }

  reset(): void {
    this.state = createEmptyState();
    this.storage.removeItem(LEGACY_V3_STORAGE_KEY);
    this.storage.removeItem(LEGACY_V2_STORAGE_KEY);
    this.persist();
  }

  private normalizeState(parsed: Partial<ProgressState>): ProgressState {
    const stars = normalizeStars(parsed.stars);
    const completed = normalizeBooleanRecord<number>(parsed.completed, (key) => {
      const value = Number(key);
      return Number.isInteger(value) && value > 0 ? value : null;
    });
    const completedRestorationTasks = normalizeBooleanRecord<string>(
      parsed.completedRestorationTasks,
      (key) => key.trim() || null,
    );
    const viewedStoryScenes = normalizeBooleanRecord<number>(parsed.viewedStoryScenes, (key) => {
      const value = Number(key);
      return Number.isInteger(value) && value > 0 ? value : null;
    });
    const hasExistingProgress = Object.values(completed).some(Boolean)
      || Object.values(completedRestorationTasks).some(Boolean);

    return {
      stars,
      completed,
      completedRestorationTasks,
      starBalance: restoreStarBalance(
        parsed.starBalance,
        stars,
        this.restorationTasks,
        completedRestorationTasks,
      ),
      tutorial: restoreTutorialState(parsed.tutorial, hasExistingProgress),
      storyStep: Number.isFinite(parsed.storyStep) ? Math.max(0, Math.floor(Number(parsed.storyStep))) : 0,
      viewedStoryScenes,
    };
  }

  private load(): { state: ProgressState; migrated: boolean } {
    let currentRaw: string | null = null;
    let legacyV3Raw: string | null = null;
    let legacyV2Raw: string | null = null;
    try {
      currentRaw = this.storage.getItem(STORAGE_KEY);
      legacyV3Raw = currentRaw ? null : this.storage.getItem(LEGACY_V3_STORAGE_KEY);
      legacyV2Raw = currentRaw || legacyV3Raw
        ? null
        : this.storage.getItem(LEGACY_V2_STORAGE_KEY);
    } catch {
      this.storageAvailable = false;
      this.recoveryNotice = 'Локальное хранилище недоступно. Прогресс сохранится только до закрытия страницы.';
      return { state: createEmptyState(), migrated: false };
    }

    const raw = currentRaw ?? legacyV3Raw ?? legacyV2Raw;
    if (!raw) return { state: createEmptyState(), migrated: false };

    try {
      const parsed = JSON.parse(raw) as Partial<ProgressState>;
      return {
        state: this.normalizeState(parsed),
        migrated: Boolean(legacyV3Raw || legacyV2Raw)
          || !parsed.starBalance
          || !parsed.tutorial
          || !parsed.viewedStoryScenes,
      };
    } catch {
      try {
        this.storage.setItem(CORRUPT_BACKUP_KEY, raw);
      } catch {
        this.storageAvailable = false;
      }
      this.recoveryNotice = 'Повреждённое сохранение отложено в резервную копию. Игра запущена с чистым прогрессом.';
      return { state: createEmptyState(), migrated: true };
    }
  }

  private persist(): void {
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.storageAvailable = true;
    } catch {
      this.storageAvailable = false;
      this.recoveryNotice = 'Не удалось записать прогресс в память браузера.';
    }
  }
}
