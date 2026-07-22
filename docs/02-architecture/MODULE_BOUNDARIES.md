# Module Boundaries

## Engine
Разрешено: board, swaps, matches, cascades, special tiles, objectives.
Запрещено: DOM, CSS, localStorage, navigation.

## Data
Разрешено: декларативные definitions.
Запрещено: UI callbacks, DOM references.

## Progress
Разрешено: save/load/migrations.
Запрещено: rendering.

## UI
Разрешено: render, input, navigation, orchestration.
Запрещено: дублирование игровых правил.
