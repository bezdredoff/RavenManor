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
- [ ] their top header scrolls away normally and never overlays content;
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

## FEATURE-046 story and star-wallet regression

- Complete each level 1-10 and confirm it opens a different scene.
- Confirm every scene contains multiple dialogue beats and does not loop to an
  earlier scene after all ten are viewed.
- Skip a post-win scene, return Home, and confirm the unviewed scene is offered.
- Confirm the top-right star counter is the only default wallet display.
- Tap the counter and confirm earned/spent/available appears in a popover.
- Tap again and confirm the popover closes without moving the page.
- Confirm Room task headings do not repeat the available-star counter.
- With zero available stars, tap the next unlocked restoration task.
- Confirm no star is spent and a readable missing-star notification appears.


## FEATURE-047 infrastructure and PWA

- Corrupt a disposable test save and confirm the game recovers with a warning.
- Export a save, reset progress, import it, and confirm level/story/room state.
- Confirm audio preferences are not changed by save import.
- Export local analytics and verify level attempts, hints, wins/losses, and
  duration are present.
- Export diagnostics and confirm viewport, version, PWA status, errors, save,
  and analytics are present.
- Confirm analytics can be cleared without resetting game progress.
- In a production preview, install the app where supported.
- After the first complete online launch, press `Проверить офлайн-готовность`.
- Confirm every production file is reported cached.
- Enable airplane mode and reopen/reload the PWA without a second online launch.
- Confirm Home, Levels, Manor, Settings, story, and gameplay assets remain
  available offline.
- Return online, deploy a newer cache version, and verify update checking does
  not erase the V4 save.

## PWA version update

- Record the version shown in Settings before deployment.
- Deploy a build with a different `APP_VERSION`.
- In the installed app press **Проверить обновление** while online.
- Confirm the UI reports the deployed version rather than `latest`.
- Confirm the app reloads once and Settings shows the new version.
- Confirm gameplay save, audio settings, and local analytics remain intact.
- Repeat the button on the new version and confirm it reports the exact current
  version.
- Confirm offline update checks explain that an internet connection is needed.

## FEATURE-048 special tiles

- create row and column rockets with lines of four;
- create a rune with a T/L shape;
- create a raven with a `2×2` square;
- create a prism with a line of five;
- activate each special through a matching clear;
- swap Prism + normal, Rocket + Rocket, Rocket + Rune, and Rune + Rune;
- confirm chain activations count each tile once;
- confirm Raven prioritises the current collect target;
- confirm Hint may recommend special creation/activation but still prioritises
  immediate objective progress;
- confirm reshuffle preserves specials and touch input never scrolls the page;
- repeat at `320×568` and with reduced motion enabled.

## FEATURE-049 shaped board and obstacle pass

- Play level 4 and confirm clipped corners are empty and never selectable.
- Confirm tiles fall through mask gaps into the next active slot.
- Play level 5 and confirm chained tiles cannot move but chains break in matches.
- Confirm a two-layer chain loses only one layer per resolution.
- Play level 6 and confirm rubble blocks falling tiles until destroyed.
- Confirm matches beside rubble damage it only once per cascade resolution.
- Play level 7 and confirm fogged tiles are hidden, locked, and preserved after clearing.
- Activate a rocket through rubble/fog and confirm the blocker is damaged.
- Confirm the raven prefers an unfinished blocker objective when useful.
- Confirm all objective cards must complete before the win screen appears.
- Confirm the level map shows every objective compactly on iPhone widths.
- Confirm reduced-motion mode disables fog drift.

## FEATURE-050 connected meta and boosters

- On a clean save, confirm levels 1–3 are open and later groups are repair-gated.
- Complete a level and confirm the result explains the next restoration task.
- Earn enough stars and use **Выполнить ремонт** directly from the win modal.
- Confirm `Зажечь люстру` opens levels 4–6.
- Confirm `Открыть ставни` opens levels 7–9 and `Починить стеллажи` opens levels 10–12.
- Confirm `Починить фонтан` opens levels 16–18.
- Import an older save with a completed gated level and confirm that group
  remains replayable.
- Complete `Убрать обломки` and confirm two Silver Hammers are awarded.
- Select Hammer, tap an ordinary tile, and confirm no move is spent.
- Use Hammer on one- and two-layer chains, rubble, and fog.
- Confirm exactly one layer is removed and objective progress updates.
- Confirm a hammer-created cascade resolves normally.
- Complete `Открыть ставни` and confirm two Shuffle charges are awarded.
- Use Shuffle and confirm moves, obstacles, mask, and special-tile count remain
  valid while the charge decreases by one.
- Fully restore a room and confirm the optional task awards its larger bundle.
- Export/import the save and confirm booster counts remain unchanged.
- Test the gameplay layout at 320×568, 360×800, 390×844, and 430×932.
- Confirm the new booster row never causes document scroll or hides the board.

## FEATURE-051 thirty-level chapter

- On a clean save, confirm exactly levels 1–3 are initially playable.
- Confirm the map contains 10 groups and 30 unique levels.
- Confirm each restoration gate opens exactly the advertised three-level group:
  - chandelier → 4–6;
  - library shutters → 7–9;
  - library shelves → 10–12;
  - garden vines → 13–15;
  - garden fountain → 16–18;
  - crypt stairs → 19–21;
  - crypt seals → 22–24;
  - tower steps → 25–27;
  - observatory → 28–30.
- Confirm room finales appear at levels 6, 12, 18, 24, and 30.
- Play at least three generated boards for every level.
- Record losses where a particular blocker remains rather than immediately
  changing the move limit.
- Confirm levels without a milestone story scene do not show a dead story CTA.
- Confirm milestone scenes appear after 1, 3, 6, 9, 12, 15, 21, 24, 27, and 30.
- Import a pre-051 save and confirm completed gated groups remain replayable.
- Confirm the 30-level map scrolls inside the application frame on all target
  phone sizes without the header overlaying content.
- Confirm PWA update, offline launch, save export/import, audio, and analytics
  still work after the larger data bundle is deployed.

## FEATURE-052 story journal

- Complete levels 1 and 2 without reading their scenes; confirm both journal
  entries show `Новое` and level 3 remains locked.
- Read level 1 from the journal; confirm it becomes `Просмотрено` and returns to
  the journal.
- Replay level 1; confirm stars, boosters, repairs, and completed levels do not
  change.
- Confirm the Continue action selects the earliest unread unlocked scene.
- Confirm each room group contains six entries and the total is 30.
- Confirm locked entries hide their authored title and summary.
- Confirm the journal scrolls inside the app on 320×568 and 430×932 without the
  top bar overlapping entries.
- Complete level 30 and confirm Lucian uses the revealed portrait only there.
- Update the installed iPhone PWA and repeat the journal checks offline.

## FEATURE-053 localization and global navigation

- On Home, confirm there is no separate story-scene button.
- Complete a level without reading its scene and confirm the Journal button
  shows an animated `Новое` badge.
- Read every unlocked scene and confirm the badge and animation disappear.
- Enable Reduce Motion and confirm the badge remains visible but does not move.
- Open Settings and confirm Music and Sound are the first settings block.
- Confirm the mechanics-context note appears directly after the game-board
  guides, before Accessibility.
- Switch between Русский, English, and Беларуская and confirm the choice
  survives reload and PWA relaunch.
- Confirm all 30 level titles, room tasks, journal summaries, and dialogue text
  change language without resetting progress.
- Open Settings from Home, Levels, Manor, Room, Journal, and Match-3; press Back
  and confirm the exact caller screen returns.
- From an active Match-3 level, note the board and remaining moves, open
  Settings, change language, return, and confirm the same board and move count.
- Confirm the gear and star wallet both fit at 320×568 and do not obscure the
  centered page title.
- Repeat language switching and settings return while offline in the installed
  iPhone PWA.
