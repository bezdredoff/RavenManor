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
- [ ] invalid swap returns correctly;
- [ ] match, cascade, hint, reshuffle, win, and loss complete without stuck input;
- [ ] levels unlock by group victories;
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
- [ ] ambient music begins quietly after activation;
- [ ] music and effects sliders work independently;
- [ ] mute stops both categories;
- [ ] settings persist after refresh;
- [ ] hidden tabs suspend audio;
- [ ] unsupported Web Audio leaves the game playable.

## Playtest capture

Record device/browser, viewport, level, action, expected result, actual result,
severity, screenshot/video, and reproducibility. Do not tune balance from one
random-board attempt; collect repeated runs.
