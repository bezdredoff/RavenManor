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
};

export type ProgressStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const STORAGE_KEY = 'ravenManorStateV4';
const LEGACY_V3_STORAGE_KEY = 'ravenManorStateV3';
const LEGACY_V2_STORAGE_KEY = 'ravenManorStateV2';

const createEmptyState = (): ProgressState => ({
  stars: {},
  completed: {},
  completedRestorationTasks: {},
  starBalance: createStarBalance(),
  tutorial: createTutorialState(),
  storyStep: 0,
});

export class ProgressStore {
  state: ProgressState;

  constructor(
    private readonly restorationTasks: readonly RestorationTaskDefinition[] = [],
    private readonly storage: ProgressStorage = localStorage,
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

  advanceStory(maxSteps: number): number {
    const current = Math.min(this.state.storyStep, maxSteps - 1);
    this.state.storyStep = (current + 1) % maxSteps;
    this.persist();
    return current;
  }

  reset(): void {
    this.state = createEmptyState();
    this.storage.removeItem(LEGACY_V3_STORAGE_KEY);
    this.storage.removeItem(LEGACY_V2_STORAGE_KEY);
    this.persist();
  }

  private load(): { state: ProgressState; migrated: boolean } {
    const currentRaw = this.storage.getItem(STORAGE_KEY);
    const legacyV3Raw = currentRaw ? null : this.storage.getItem(LEGACY_V3_STORAGE_KEY);
    const legacyV2Raw = currentRaw || legacyV3Raw
      ? null
      : this.storage.getItem(LEGACY_V2_STORAGE_KEY);
    const raw = currentRaw ?? legacyV3Raw ?? legacyV2Raw;

    if (!raw) return { state: createEmptyState(), migrated: false };

    try {
      const parsed = JSON.parse(raw) as Partial<ProgressState>;
      const stars = parsed.stars ?? {};
      const completed = parsed.completed ?? {};
      const completedRestorationTasks = parsed.completedRestorationTasks ?? {};
      const hasExistingProgress = Object.values(completed).some(Boolean)
        || Object.values(completedRestorationTasks).some(Boolean);

      return {
        state: {
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
          storyStep: parsed.storyStep ?? 0,
        },
        migrated: Boolean(legacyV3Raw || legacyV2Raw)
          || !parsed.starBalance
          || !parsed.tutorial,
      };
    } catch {
      return { state: createEmptyState(), migrated: false };
    }
  }

  private persist(): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }
}
