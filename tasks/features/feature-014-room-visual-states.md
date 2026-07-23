# FEATURE-014 — Room visual states

## Status

In Review

## Area

Meta game / Presentation

## Goal

Каждая выполненная restoration task должна немедленно и заметно менять
визуальное состояние соответствующей комнаты.

## User Value

Игрок видит, зачем он проходит match-3 уровни и тратит звёзды: Raven Manor
последовательно оживает, а прогресс комнаты ощущается как отдельная награда.

## Scope

- четыре состояния для каждой комнаты: 0, 1, 2 и 3 выполненные задачи;
- data-driven определения visual stages;
- стабильный `assetKey` для будущих финальных изображений;
- CSS/emoji placeholder preview до появления room art;
- stage title и narrative description;
- milestone-индикаторы трёх задач;
- visual progress в карточках экрана поместья;
- pure state selector и unit tests;
- документация контракта visual assets.

## Out of Scope

- генерация или интеграция финальных room illustrations;
- анимации ремонта и particle effects;
- выбор из нескольких вариантов декора;
- сохранение visual stage отдельным полем;
- новые restoration tasks;
- изменение экономики звёзд.

## Requirements

- visual stage вычисляется только из completed restoration task IDs;
- данные visual stage не дублируются в save;
- каждая комната имеет `taskCount + 1` visual stages;
- каждая стадия имеет уникальный стабильный `assetKey`;
- после выполнения задачи preview обновляется без перезагрузки;
- после обновления страницы сохраняется правильная стадия;
- изменения одной комнаты не меняют preview другой комнаты;
- UI остаётся рабочим без финальных image assets.

## Acceptance Criteria

- нет выполненных задач: отображается ruined stage 0;
- после первой задачи отображается stage 1;
- после второй задачи отображается stage 2;
- после третьей задачи отображается fully restored stage 3;
- milestone выполненной задачи отмечается галочкой;
- карточка комнаты в Manor показывает `N/3` или `Комната восстановлена`;
- reset progress возвращает preview к stage 0;
- refresh сохраняет текущий stage;
- все комнаты имеют корректный набор visual stages;
- `npm test` проходит;
- `npm run build` проходит.

## Likely Files

- `src/data/roomVisuals.ts`
- `src/meta/RoomVisualState.ts`
- `src/ui/GameApp.ts`
- `src/style.css`
- `tests/RoomVisualState.test.ts`
- `docs/01-design/META_GAME.md`
- `docs/02-architecture/RESTORATION.md`
- `docs/02-architecture/ROOM_VISUALS.md`

## Dependencies

- FEATURE-013 — Room restoration tasks.

## Manual Test

1. Сбросить прогресс и открыть Вестибюль.
2. Проверить ruined preview и прогресс `0/3`.
3. Получить звёзды и выполнить первую задачу.
4. Проверить новый icon, title, description и milestone `✓`.
5. Обновить страницу и проверить сохранение stage 1.
6. Выполнить остальные задачи и проверить stage 2 и stage 3.
7. Вернуться в Manor и проверить `Комната восстановлена`.
8. Сбросить прогресс и проверить возврат к stage 0.
