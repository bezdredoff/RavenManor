# Public Test Readiness Checklist

## Build and data

- [ ] `npm test` passes;
- [ ] `npm run build` passes;
- [ ] fresh progress starts correctly;
- [ ] existing V4 progress loads;
- [ ] game progress reset does not reset audio preferences;
- [ ] refresh preserves levels, stars, rooms, story, tutorial, and audio.

## Mobile UX

- [ ] Home fits at 320 × 568 without document scroll;
- [ ] Match-3 fits at 320 × 568 without document scroll;
- [ ] board swipes never move the page;
- [ ] contained-scroll screens scroll inside the app;
- [ ] safe areas do not cover controls;
- [ ] modal content remains reachable;
- [ ] landscape is usable enough to return or rotate, but portrait remains the
  supported presentation.

## Gameplay

- [ ] tap and swipe swaps work;
- [ ] invalid swap returns correctly and its message remains readable;
- [ ] horizontal lines, vertical lines, and `2×2` squares clear correctly;
- [ ] overlapping square/line shapes count each tile once;
- [ ] Hint prioritises the current objective over a larger unrelated clear;
- [ ] match, cascade, hint, reshuffle, win, and loss complete without stuck input;
- [ ] levels unlock by group victories;
- [ ] victory can continue directly to the next unlocked unfinished level;
- [ ] a post-win story scene continues to that next level rather than revealing the completed board;
- [ ] room restoration spends stars once;
- [ ] restored art and newly unlocked rooms persist.

## Presentation

- [ ] six tiles are recognisable at phone size;
- [ ] no player-facing room or character emoji placeholder remains;
- [ ] room stages visibly change;
- [ ] four story scenes display correctly;
- [ ] reduced motion removes decorative movement while retaining information;
- [ ] failed images receive the Raven Manor fallback instead of a broken icon.

## Audio

- [ ] no audio plays before the first user gesture;
- [ ] the D-minor background theme begins after activation and is audible on phone speakers;
- [ ] `Проверить музыку` restarts the first musical phrase;
- [ ] music and effects sliders work independently;
- [ ] mute stops both categories;
- [ ] settings persist after refresh;
- [ ] hidden tabs suspend audio;
- [ ] unsupported Web Audio leaves the game playable.

## Playtest capture

Record device/browser, viewport, level, action, expected result, actual result,
severity, screenshot/video, and reproducibility. Do not tune balance from one
random-board attempt; collect repeated runs.
