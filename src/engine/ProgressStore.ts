export type ProgressState = {
  stars: Record<number, number>;
  completed: Record<number, boolean>;
  storyStep: number;
};

const STORAGE_KEY = 'ravenManorStateV2';

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

  advanceStory(maxSteps: number): number {
    const current = Math.min(this.state.storyStep, maxSteps - 1);
    this.state.storyStep = (current + 1) % maxSteps;
    this.persist();
    return current;
  }

  reset(): void {
    this.state = { stars: {}, completed: {}, storyStep: 0 };
    this.persist();
  }

  private load(): ProgressState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { stars: {}, completed: {}, storyStep: 0 };
    } catch {
      return { stars: {}, completed: {}, storyStep: 0 };
    }
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }
}
