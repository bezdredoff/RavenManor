# Chapter One Campaign — 30-Level Vertical Slice

## Chapter structure

The expanded vertical slice is one complete chapter rather than a production-
scale campaign. It contains five room arcs with six levels each:

| Room | Levels | First beat | Second beat |
| --- | ---: | --- | --- |
| Hall | 1–6 | arrival and basic collection | mixed goals, chains, rubble |
| Library | 7–12 | fog and shaped boards | layered blockers and four-goal finale |
| Winter Garden | 13–18 | readable blocker patterns | compact masks and mixed finale |
| Crypt | 19–24 | focused blocker challenges | dense corridors and contract finale |
| Raven Tower | 25–30 | vertical/architectural masks | final all-mechanics challenge |

Each beat contains exactly three levels so the level map remains scan-friendly
on a phone. The first group of the chapter is open. Every later group is opened
by a named restoration task.

## Restoration rhythm

```text
three levels
→ earn stars
→ perform highlighted repair
→ reveal room stage / reward
→ open next three levels
```

The third restoration task in a room remains optional and grants boosters. It
never blocks the main campaign.

## Content rules

- Level definitions stay pure JSON.
- No level-specific code branches are allowed.
- Masks, blockers, objectives, move limits, and star thresholds provide variety.
- Existing special tiles and boosters remain universally available after their
  restoration unlock.
- Room finales are levels 6, 12, 18, 24, and 30.
- Level 30 is the only chapter finale and combines every current blocker type.

## Interim story cadence

FEATURE-051 retains the existing ten authored scenes and spaces them across
milestone levels. Levels without authored scenes do not display a dead story
button. FEATURE-052 will add the missing twenty events and the replayable
journal.
