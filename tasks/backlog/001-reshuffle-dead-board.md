# Task 001 — Reshuffle dead board

## Goal

Если на поле нет возможных ходов, перемешать существующие фишки и продолжить уровень.

## Scope

Разрешено менять:

- `src/engine/Match3Engine.ts`
- `src/ui/GameApp.ts`

Не менять:

- progression;
- room unlocks;
- visual theme.

## Requirements

- добавить публичный метод reshuffle;
- сохранить количество и типы существующих фишек;
- после reshuffle не должно быть стартовых матчей;
- после reshuffle должен существовать хотя бы один возможный ход;
- UI должен обновиться автоматически.

## Acceptance Criteria

- dead board не блокирует игру;
- `npm run build` проходит;
- обычные ходы работают как раньше.
