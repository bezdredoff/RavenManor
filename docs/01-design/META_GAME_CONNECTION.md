# Match-3 ↔ Restoration connection

FEATURE-050 connected the loops; FEATURE-051 extends that connection through a
complete 30-level chapter:

```text
play a three-level room beat
→ earn stars
→ complete the highlighted restoration task
→ receive boosters and/or open the next beat
→ see the repaired room stage
→ return to match-3
```

## Active restoration

The level map shows one active non-optional task from the first unlocked room
that still advances the chapter. The card includes room, cost, missing stars,
rewards, and the exact level group it opens.

Third tasks are optional completion rewards. They remain available inside the
room but never replace the next progression-critical task.

## Chapter gates

| Levels | Room beat | Restoration gate |
| ---: | --- | --- |
| 1–3 | Hall arrival | Always open |
| 4–6 | Hall restoration | Light the Hall chandelier |
| 7–9 | Library entry | Open the Library shutters |
| 10–12 | Forbidden archive | Repair the Library shelves |
| 13–15 | Garden entry | Clear the Garden vines |
| 16–18 | Heart of the garden | Repair the Garden fountain |
| 19–21 | Crypt entry | Clear the Crypt stairs |
| 22–24 | Ancient contract | Restore the Crypt seals |
| 25–27 | Tower ascent | Repair the Tower steps |
| 28–30 | Tower awakening | Open the Observatory |

A legacy save that already completed a level inside a gated group keeps that
group replayable. This prevents content from being taken away during migration.

## Star economy

Required tasks through the chapter cost twelve stars in total. Since every
level grants at least one star on first completion, the campaign cannot require
perfect play. Better star ratings fund optional room completion and leave more
freedom to choose when to spend stars.

## Win screen

After victory, the result modal explains the next repair. When the active task
is affordable, **Выполнить ремонт** is the primary action. The player may still
continue to another currently unlocked unfinished level.
