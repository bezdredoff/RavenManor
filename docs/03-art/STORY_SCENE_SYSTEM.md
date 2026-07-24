# Story Scene System

## FEATURE-051 interim contract

The current ten authored scenes are retained as milestone scenes across the
30-level chapter:

```text
1, 3, 6, 9, 12, 15, 21, 24, 27, 30
```

Levels without an authored scene do not show a non-functional story button on
the victory screen. FEATURE-052 will add twenty additional events and the
replayable journal, producing one event per level.

## Data model

`storyScenes.ts` stores:

- the level that unlocks the scene;
- chapter and scene title;
- semantic background key;
- ordered dialogue beats;
- speaker, text, portrait key, and portrait side per beat.

`storyPresentation.ts` resolves semantic keys to local SVG assets. Existing room
art may be reused as story backdrops.

## Progression

`ProgressState.viewedStoryScenes` records viewed scenes by milestone level ID.

- replaying a milestone may replay its scene;
- Home offers the earliest completed but unviewed milestone;
- story progression never wraps to an already viewed scene;
- levels without scenes continue normally to the next level or level map.

## Continuation context

A scene opened from Home returns Home after its final beat. A scene opened from
a victory retains the calculated next-level destination. Intermediate beats use
`Далее`; only the final beat marks the scene viewed and navigates.

## Current narrative milestones

1. The unsigned letter opens the manor gates.
2. Evelyn meets reflectionless Lord Adrian.
3. A damaged portrait reveals an erased childhood.
4. Her mother's diary exposes the Night Circle contract.
5. Evelyn finds the order she wrote to erase her memory.
6. Moon roses return the name Lucian.
7. Evelyn finds her own empty sarcophagus.
8. Adrian confesses his role as guardian.
9. Lucian recounts the stolen night in the tower.
10. The tower opens and a deeper part of the contract awakens.
