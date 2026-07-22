# FEATURE-006 — Objective abstraction

## Status

In Review

## Area

Architecture

## Goal

Вынести цели уровня в отдельный runtime-контракт, не зависящий от DOM и
конкретной collect-механики.

## User Value

Фича не меняет видимое поведение игры, но позволяет добавлять несколько типов
целей и несколько целей на одном уровне без разрастания `GameApp`.

## Context Pack

- `contexts/PACK-MATCH3.md`
- `docs/02-architecture/ARCHITECTURE.md`
- `docs/02-architecture/MODULE_BOUNDARIES.md`
- `docs/02-architecture/adr/004-data-driven-content.md`

## Scope

- контракт `LevelObjective`;
- тип игрового события `ObjectiveEvent`;
- неизменяемый снимок прогресса `ObjectiveSnapshot`;
- агрегатор `ObjectiveTracker`;
- unit tests контракта и агрегатора;
- документация архитектуры целей.

## Out of Scope

- конкретная collect-цель;
- изменение `GameApp`;
- изменение формата уровней;
- blockers, special tiles и UI нескольких целей;
- JSON definitions и validation.

## Requirements

- objective-модули не зависят от DOM или localStorage;
- UI получает только снимки прогресса;
- завершение уровня означает завершение всех его целей;
- пустой список целей не считается завершённым уровнем;
- tracker должен поддерживать reset.

## Acceptance Criteria

- `ObjectiveTracker` передаёт событие всем целям;
- snapshots отражают актуальный прогресс;
- `isComplete` становится true только при завершении всех целей;
- reset сбрасывает все цели;
- пустой tracker остаётся незавершённым;
- `npm test` проходит;
- `npm run build` проходит;
- видимое поведение текущего прототипа не меняется.

## Likely Files

- `src/objectives/LevelObjective.ts`
- `src/objectives/ObjectiveTracker.ts`
- `tests/ObjectiveTracker.test.ts`
- `docs/02-architecture/OBJECTIVES.md`

## Dependencies

- FEATURE-028 — Unit tests engine.

## Manual Test

1. Запустить существующий прототип.
2. Пройти или проиграть уровень.
3. Убедиться, что поведение игры не изменилось.
4. Выполнить `npm test`.
5. Выполнить `npm run build`.

## Risks

- слишком широкий контракт до реализации конкретных целей;
- попадание UI-терминов в objective layer;
- преждевременное добавление blocker-событий.
