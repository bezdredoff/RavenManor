# FEATURE-007 — Collect objective

## Status

In Review

## Area

Gameplay / Architecture

## Goal

Перевести существующую цель «собрать N фишек заданного типа» на контракт
`LevelObjective`, созданный в FEATURE-006.

## User Value

Игрок по-прежнему видит привычный счётчик цели и побеждает после сбора нужного
количества фишек. Для разработки появляется возможность добавлять другие типы
целей без новых счётчиков внутри `GameApp`.

## Context Pack

- `contexts/PACK-MATCH3.md`
- `docs/02-architecture/OBJECTIVES.md`
- `docs/02-architecture/MODULE_BOUNDARIES.md`
- `tasks/features/feature-006-objective-abstraction.md`

## Scope

- конкретная реализация `CollectObjective`;
- подсчёт удалённых фишек одного типа;
- накопление прогресса между каскадами;
- ограничение прогресса значением target;
- reset;
- подключение `GameApp` к `ObjectiveTracker`;
- unit tests;
- обновление документации.

## Out of Scope

- несколько целей на одном экране;
- новый формат `LevelDefinition`;
- JSON-конфигурации уровней;
- blocker objectives;
- изменение баланса уровней;
- новые визуальные эффекты.

## Requirements

- collect-цель принимает `tileType` и `target`;
- учитываются только удалённые фишки нужного типа;
- каждый каскад добавляет прогресс;
- UI читает прогресс из snapshot;
- `GameApp` не хранит отдельное поле `collected`;
- победа определяется через `ObjectiveTracker.isComplete`;
- reshuffle мёртвой доски продолжает работать.

## Acceptance Criteria

- матч нужного типа увеличивает счётчик;
- матч другого типа не увеличивает счётчик;
- каскады учитываются;
- прогресс не превышает target;
- restart создаёт цель с нулевым прогрессом;
- уровень завершается после выполнения collect-цели;
- поражение при нуле ходов продолжает работать;
- `npm test` проходит;
- `npm run build` проходит.

## Likely Files

- `src/objectives/CollectObjective.ts`
- `src/ui/GameApp.ts`
- `tests/CollectObjective.test.ts`
- `docs/02-architecture/OBJECTIVES.md`

## Dependencies

- FEATURE-001 — Dead-board reshuffle;
- FEATURE-006 — Objective abstraction;
- FEATURE-028 — Unit tests engine.

## Manual Test

1. Запустить первый уровень.
2. Сделать матч из целевых фишек и убедиться, что счётчик увеличился.
3. Сделать матч из другого типа и убедиться, что цель не изменилась.
4. Проверить каскад с целевыми фишками.
5. Нажать «Заново» и проверить сброс счётчика.
6. Собрать требуемое количество и увидеть окно победы.
7. Проиграть уровень по ходам и увидеть окно поражения.

## Risks

- двойной подсчёт одного каскада;
- потеря reshuffle-кода при замене `GameApp`;
- UI начинает читать mutable state вместо snapshot.
