export const TUTORIAL_STEP_COUNT = 2;

export type TutorialPreference = 'undecided' | 'enabled' | 'skipped' | 'completed';

export type TutorialState = {
  preference: TutorialPreference;
  step: number;
};

export const createTutorialState = (): TutorialState => ({
  preference: 'undecided',
  step: 0,
});

export const restoreTutorialState = (
  input: unknown,
  hasExistingProgress = false,
): TutorialState => {
  if (!input || typeof input !== 'object') {
    return hasExistingProgress
      ? { preference: 'skipped', step: TUTORIAL_STEP_COUNT }
      : createTutorialState();
  }

  const candidate = input as Partial<TutorialState>;
  const preference = candidate.preference;
  const validPreference = preference === 'undecided'
    || preference === 'enabled'
    || preference === 'skipped'
    || preference === 'completed';

  if (!validPreference) return createTutorialState();

  const rawStep = Number.isInteger(candidate.step) ? Number(candidate.step) : 0;
  const step = Math.max(0, Math.min(TUTORIAL_STEP_COUNT, rawStep));

  if (preference === 'skipped' || preference === 'completed') {
    return { preference, step: TUTORIAL_STEP_COUNT };
  }

  if (preference === 'enabled' && step >= TUTORIAL_STEP_COUNT) {
    return { preference: 'completed', step: TUTORIAL_STEP_COUNT };
  }

  return { preference, step };
};

export const shouldOfferTutorial = (state: TutorialState): boolean =>
  state.preference === 'undecided';

export const shouldShowTutorial = (state: TutorialState): boolean =>
  state.preference === 'enabled' && state.step < TUTORIAL_STEP_COUNT;

export const startTutorial = (): TutorialState => ({
  preference: 'enabled',
  step: 0,
});

export const skipTutorial = (): TutorialState => ({
  preference: 'skipped',
  step: TUTORIAL_STEP_COUNT,
});

export const advanceTutorial = (state: TutorialState): TutorialState => {
  if (state.preference !== 'enabled') return state;

  const nextStep = Math.min(TUTORIAL_STEP_COUNT, state.step + 1);
  return nextStep >= TUTORIAL_STEP_COUNT
    ? { preference: 'completed', step: TUTORIAL_STEP_COUNT }
    : { preference: 'enabled', step: nextStep };
};

export const restartTutorial = (): TutorialState => startTutorial();
