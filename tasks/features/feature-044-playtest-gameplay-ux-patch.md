# FEATURE-044 — Playtest gameplay and navigation patch

## Source

Feedback from the first small external prototype playtest.

## Scope

- recognise a `2×2` square of identical tiles as a valid four-tile match;
- merge overlapping square and line matches without double-counting;
- generate and reshuffle boards without immediate square matches;
- evaluate every legal Hint move using objective-first ranking;
- include deterministic cascades but exclude random refill predictions;
- keep combo and invalid-move messages readable for longer;
- preserve readability holds when reduced motion is enabled;
- add **Следующий уровень** to the victory result when an unlocked unfinished
  level is available;
- fall back to **К уровням** when no next playable level exists;
- update the optional tutorial copy.

## Out of scope

- special tiles created by squares;
- boosters or power-ups;
- prediction of random refill cascades;
- changes to move limits, targets, stars, saves, or room progression;
- a Next Level action after defeat.

## Acceptance criteria

1. A pure `2×2` square clears all four tiles and advances collect objectives.
2. A square intersecting a line clears each unique tile once.
3. A move that creates only a square is legal and can be hinted.
4. Hint prefers objective progress over a larger unrelated clear.
5. Hint is deterministic for an unchanged board and objective.
6. `Нет комбинации` remains visible for at least 600 ms.
7. The final combo/cascade label remains visible after the board settles.
8. Victory can continue directly to the next unlocked unfinished level.
9. Completing the second required level can continue into the newly unlocked
   group without visiting the map.
10. Existing saves remain compatible and no migration is required.
