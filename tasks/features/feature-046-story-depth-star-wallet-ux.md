# FEATURE-046 — Story depth and star-wallet UX

## Player evidence

External prototype players reported:

- four short scenes loop before the ten-level slice ends;
- the story does not feel substantial enough to motivate continued play;
- earned/spent/available star values are repeated too often;
- room-task screens duplicate the available-star count;
- pressing a task without enough stars gives no explanation.

## Scope

- ten story scenes, one for each prototype level;
- at least four dialogue beats per scene;
- viewed-scene persistence without cycling;
- Home access to completed but unviewed scenes;
- collapsible wallet on the persistent top-right star counter;
- removal of all standalone detailed wallets and room-heading duplication;
- clickable unlocked-but-unaffordable restoration task;
- non-blocking missing-star notification.

## Out of scope

- branching dialogue choices;
- localization pipeline;
- new character art;
- automatic story playback after every win;
- changing level rewards or restoration costs;
- changing the V4 storage key.

## Acceptance criteria

1. Levels 1-10 each resolve to a unique scene.
2. Every scene has four or more dialogue beats.
3. Home never cycles back to a viewed scene.
4. Existing V4 saves load with an empty viewed-scene map.
5. Detailed star accounting is hidden initially.
6. The top-right counter toggles the wallet popover.
7. Room task headings have no second available-star counter.
8. An unaffordable unlocked task remains pressable.
9. Pressing it spends nothing and announces the missing amount.
10. Home and Match-3 retain no document scroll at 320×568.
