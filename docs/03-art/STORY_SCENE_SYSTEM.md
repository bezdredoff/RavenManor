# Story Scene System

## Vertical-slice contract

The ten prototype levels each own one authored story scene. Scenes no longer
rotate through a short reusable list.

```text
level 1 -> scene 1
...
level 10 -> scene 10
```

Every scene contains at least four dialogue beats. A beat may change speaker,
portrait, and portrait side while retaining the scene backdrop and title. This
creates a compact visual-novel conversation rather than one short paragraph.

## Data model

`storyScenes.ts` stores:

- the level that unlocks the scene;
- chapter and scene title;
- semantic background key;
- ordered dialogue beats;
- speaker, text, portrait key, and portrait side per beat.

`storyPresentation.ts` resolves semantic keys to local SVG assets. Existing room
art may also be used as a story backdrop, so writing and art can evolve without
embedding file paths in narrative data.

## Progression

`ProgressState.viewedStoryScenes` records viewed scenes by level ID.

- the victory screen always opens the scene associated with the completed level;
- replaying a level may replay its scene;
- Home offers the earliest completed but unviewed scene;
- after all unlocked scenes are viewed, Home shows no new-story action;
- story progression never wraps back to scene 1.

The additional field is restored into existing `ravenManorStateV4` saves without
changing the storage key.

## Continuation context

A scene opened from Home returns to Home after its final beat.

A scene opened from a victory retains the already calculated destination:

- `Следующий уровень` starts the next unlocked unfinished level;
- `К уровням` opens the map after the final available level.

Intermediate beats use `Далее`; only the final beat performs navigation and
marks the scene viewed.

## Current narrative arc

1. The unsigned letter opens the manor gates.
2. Evelyn meets the reflectionless Lord Adrian.
3. A damaged portrait reveals an erased childhood.
4. Her mother's diary exposes the Night Circle contract.
5. Moon roses return the name Lucian.
6. Evelyn finds her own empty sarcophagus.
7. Adrian confesses his role as guardian.
8. Evelyn finds the order she wrote to erase her memory.
9. Lucian recounts the stolen night in the tower.
10. The tower opens and a deeper part of the contract awakens.

## Mobile and accessibility

- dialogue remains selectable text, never baked into art;
- beat progress is visible but decorative;
- the scene card scrolls internally on short phones;
- the page behind the modal never scrolls;
- each continuation action is touch-safe;
- reduced motion removes decorative travel but not dialogue or progression.
