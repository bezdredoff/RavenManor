import { describe, expect, it } from 'vitest';
import {
  TUTORIAL_STEP_COUNT,
  advanceTutorial,
  createTutorialState,
  restoreTutorialState,
  shouldOfferTutorial,
  shouldShowTutorial,
  skipTutorial,
  startTutorial,
} from '../src/meta/TutorialState';

describe('TutorialState', () => {
  it('offers guidance only before the player makes a choice', () => {
    const initial = createTutorialState();

    expect(shouldOfferTutorial(initial)).toBe(true);
    expect(shouldShowTutorial(initial)).toBe(false);
    expect(shouldOfferTutorial(startTutorial())).toBe(false);
    expect(shouldOfferTutorial(skipTutorial())).toBe(false);
  });

  it('runs two short contextual steps and then completes', () => {
    const started = startTutorial();
    const secondStep = advanceTutorial(started);
    const completed = advanceTutorial(secondStep);

    expect(shouldShowTutorial(started)).toBe(true);
    expect(secondStep).toEqual({ preference: 'enabled', step: 1 });
    expect(completed).toEqual({ preference: 'completed', step: TUTORIAL_STEP_COUNT });
    expect(shouldShowTutorial(completed)).toBe(false);
  });

  it('skips all tutorial steps immediately', () => {
    expect(skipTutorial()).toEqual({
      preference: 'skipped',
      step: TUTORIAL_STEP_COUNT,
    });
  });

  it('does not interrupt migrated players who already have progress', () => {
    expect(restoreTutorialState(undefined, true)).toEqual({
      preference: 'skipped',
      step: TUTORIAL_STEP_COUNT,
    });
    expect(restoreTutorialState(undefined, false)).toEqual(createTutorialState());
  });

  it('sanitizes persisted step values', () => {
    expect(restoreTutorialState({ preference: 'enabled', step: 99 })).toEqual({
      preference: 'completed',
      step: TUTORIAL_STEP_COUNT,
    });
  });
});
