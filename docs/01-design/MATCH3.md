# Match-3 Design

## Current Rules
- поле 8×8;
- 6 типов фишек;
- swap только соседних фишек;
- ход засчитывается только при создании матча;
- матч: 3+ одинаковых по горизонтали или вертикали;
- каскады не тратят дополнительные ходы.

## Planned Rules
- match-4 creates line clear;
- match-5 creates color clear;
- T/L match creates area clear;
- blockers;
- multiple objectives;
- reshuffle animation.

## Design Constraint
Игровое поле не должно создавать безвыходные состояния.
