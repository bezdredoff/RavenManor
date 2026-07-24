# Match-3 ↔ Restoration connection

FEATURE-050 turns the two prototype loops into one progression chain:

```text
play an unlocked level
→ earn stars
→ complete the highlighted restoration task
→ receive boosters and/or unlock the next level group
→ return to match-3 with a visible new capability
```

## Active restoration

The level map always shows one active non-optional restoration task from the
first unlocked room that still advances the chapter. The card includes:

- room and task title;
- star cost and missing stars;
- booster reward;
- mechanics or level group unlocked by the task;
- direct navigation to the room.

Third tasks in each room are optional completion rewards. They remain visible
inside the room but do not replace the next progression-critical task on the
level map.

## Progression gates in the 10-level slice

| Level group | Restoration gate | New content communicated |
| --- | --- | --- |
| 1–3 | Always open | Earn the first restoration stars |
| 4–6 | Light the Hall chandelier | Mixed objectives, chains and rubble |
| 7–9 | Repair the Library shelves | Fog, layered obstacles and board masks |
| 10 | Repair the Garden fountain | Combined finale |

A legacy save that already completed a level inside a gated group keeps that
group replayable. New saves follow the restoration gates normally.

## Win screen

After each victory the result modal explains what the stars enable. When the
active task is affordable, **Complete restoration** is the first action. The
player can still continue to another currently unlocked unfinished level.

## Optional room completion

The third task in each room is not needed for chapter progression. It provides
a larger booster bundle and a clear reason to fully restore a favourite room.
