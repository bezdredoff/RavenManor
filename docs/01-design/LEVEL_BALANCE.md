# Level Balance — First 30 Levels

## Intent

FEATURE-051 expands the prototype from ten levels into one complete 30-level
chapter. The chapter is divided into five six-level room arcs. Each room has
two three-level beats separated by restoration gates. Difficulty deliberately
resets at the start of a new room, then rises toward a room finale.

## Campaign table

| Level | Room | Difficulty | Moves | Objectives | Obstacles | 3★ | 2★ |
|---:|---|---|---:|---|---:|---:|---:|
| 1 | Вестибюль | easy | 18 | 15 roses | 0 | 10+ | 4+ |
| 2 | Вестибюль | normal | 18 | 18 candles | 0 | 9+ | 4+ |
| 3 | Вестибюль | hard | 18 | 21 keys | 0 | 7+ | 3+ |
| 4 | Вестибюль | easy | 20 | 14 crystals + 12 roses | 0 | 9+ | 4+ |
| 5 | Вестибюль | normal | 21 | 6 chain + 16 bats | 6 | 8+ | 4+ |
| 6 | Вестибюль | finale | 23 | 8 rubble + 18 scrolls | 8 | 7+ | 3+ |
| 7 | Библиотека | easy | 23 | 8 fog + 20 roses | 8 | 9+ | 4+ |
| 8 | Библиотека | normal | 24 | 4 chain + 22 candles | 4 | 7+ | 3+ |
| 9 | Библиотека | hard | 25 | 4 rubble + 4 fog + 18 keys | 8 | 7+ | 3+ |
| 10 | Библиотека | normal | 24 | 6 chain + 16 scrolls | 10 | 9+ | 4+ |
| 11 | Библиотека | hard | 27 | 8 rubble + 16 keys + 14 scrolls | 8 | 7+ | 3+ |
| 12 | Библиотека | finale | 30 | 4 chain + 4 rubble + 6 fog + 18 crystals | 14 | 7+ | 3+ |
| 13 | Зимний сад | easy | 21 | 6 fog + 16 crystals | 6 | 10+ | 5+ |
| 14 | Зимний сад | normal | 23 | 8 chain + 18 roses | 8 | 9+ | 4+ |
| 15 | Зимний сад | hard | 27 | 8 rubble + 4 fog + 16 keys | 12 | 7+ | 3+ |
| 16 | Зимний сад | normal | 25 | 8 fog + 18 candles + 12 crystals | 8 | 9+ | 4+ |
| 17 | Зимний сад | hard | 28 | 8 chain + 4 rubble + 20 roses | 12 | 7+ | 3+ |
| 18 | Зимний сад | finale | 31 | 4 chain + 4 rubble + 4 fog + 20 roses | 12 | 7+ | 3+ |
| 19 | Крипта | easy | 22 | 6 rubble + 16 keys | 6 | 10+ | 5+ |
| 20 | Крипта | normal | 25 | 8 chain + 18 bats | 8 | 9+ | 4+ |
| 21 | Крипта | hard | 28 | 8 fog + 18 candles + 12 scrolls | 8 | 7+ | 3+ |
| 22 | Крипта | normal | 25 | 6 rubble + 18 crystals | 6 | 9+ | 4+ |
| 23 | Крипта | hard | 29 | 4 chain + 4 rubble + 4 fog + 18 keys | 12 | 7+ | 3+ |
| 24 | Крипта | finale | 32 | 6 chain + 6 rubble + 6 fog + 20 crystals | 18 | 7+ | 3+ |
| 25 | Воронья башня | easy | 22 | 6 rubble + 16 keys | 6 | 10+ | 5+ |
| 26 | Воронья башня | normal | 25 | 8 fog + 18 crystals | 8 | 9+ | 4+ |
| 27 | Воронья башня | hard | 29 | 8 chain + 20 bats + 14 scrolls | 8 | 7+ | 3+ |
| 28 | Воронья башня | normal | 27 | 6 rubble + 6 fog + 18 roses | 12 | 9+ | 4+ |
| 29 | Воронья башня | hard | 31 | 4 chain + 4 rubble + 4 fog + 18 keys | 12 | 7+ | 3+ |
| 30 | Воронья башня | finale | 34 | 6 chain + 6 rubble + 6 fog + 22 crystals | 18 | 7+ | 3+ |

## Difficulty wave

Each room follows the same readable rhythm:

```text
easy → normal → hard → normal → hard → finale
```

The second half does not introduce a brand-new system. It recombines already
learned masks, blockers, objectives, special tiles, and boosters in denser
layouts. This avoids tutorial overload while still increasing variety.

## Balance envelope

- move limits stay between 18 and 34;
- opening levels use at most two objectives;
- room finales may use up to four objectives;
- two-layer blockers appear after their one-layer version;
- every generated board must start without matches and with a legal move;
- one-star completion is always enough for progression;
- three-star thresholds reward efficient special-tile use but are never gates.

## Playtest method

For each level collect at least 20 attempts across different generated boards:

- win/loss and moves left;
- stars;
- hints and boosters used;
- special tiles created and activated;
- blocker types remaining at loss;
- time to complete;
- whether the player understood the restoration gate after the room beat.

Tune one dimension at a time: objective target, then blocker layers/placement,
then move limit. Do not change all three from one isolated loss.
