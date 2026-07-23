export type ProgressState = {
  stars: Record<number, number>;
  completed: Record<number, boolean>;
  completedRestorationTasks: Record<string, boolean>;
  storyStep: number;
};

const STORAGE_KEY = 'ravenManorStateV2';

const createEmptyState = (): ProgressState => ({
  stars: {},
  completed: {},
  completedRestorationTasks: {},
  storyStep: 0,
});

export class ProgressStore {
  state: ProgressState;

  constructor() {
    this.state = this.load();
  }

  get totalStars(): number {
    return Object.values(this.state.stars).reduce((sum, value) => sum + value, 0);
  }

  saveLevel(levelId: number, stars: number): void {
    this.state.stars[levelId] = Math.max(this.state.stars[levelId] ?? 0, stars);
    this.state.completed[levelId] = true;
    this.persist();
  }

  completeRestorationTask(taskId: string): void {
    this.state.completedRestorationTasks[taskId] = true;
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
    this.persist();
  }

  private load(): ProgressState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createEmptyState();

      const parsed = JSON.parse(raw) as Partial<ProgressState>;
      return {
        stars: parsed.stars ?? {},
        completed: parsed.completed ?? {},
        completedRestorationTasks: parsed.completedRestorationTasks ?? {},
        storyStep: parsed.storyStep ?? 0,
      };
    } catch {
      return createEmptyState();
    }
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }
}
