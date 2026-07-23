# FEATURE-011 — Level JSON schema

## Status

In Review

## Area

Content / Architecture

## Goal

Перенести определения десяти уровней из генерируемых TypeScript-объектов в
JSON-каталог с явным версионируемым контрактом.

## User Value

Видимое поведение уровней не меняется. Разработчики, level designers и AI-агенты
могут редактировать цели, количество ходов и требования по звёздам без изменения
`GameApp`.

## Scope

- `levels.json` с десятью текущими уровнями;
- JSON Schema версии 1;
- TypeScript-типы уровня и objective definitions;
- массив `objectives` с collect-definition;
- загрузка JSON через `gameData.ts`;
- адаптация `GameApp` к новому data contract;
- migration-parity tests;
- документация уровня данных.

## Out of Scope

- runtime validation произвольного JSON;
- понятные сообщения об ошибках контента;
- загрузка уровней по сети;
- редактор уровней;
- новые objective types;
- изменение баланса уровней.

## Requirements

- данные десяти уровней хранятся в JSON;
- параметры существующих уровней сохраняются;
- схема имеет `schemaVersion: 1`;
- цели задаются массивом `objectives`;
- collect-objective содержит `id`, `type`, `tileType`, `target`;
- UI и runtime не читают legacy-поля `targetTile` и `targetCount`;
- JSON import изолирован в data layer;
- runtime validation отложена до FEATURE-012.

## Acceptance Criteria

- все десять уровней загружаются из `levels.json`;
- первый и десятый уровни сохраняют прежние параметры;
- выбор уровня и отображение цели работают;
- collect-прогресс и победа работают;
- restart и поражение работают;
- `npm test` проходит;
- `npm run build` проходит;
- изменение target в JSON отражается в игре без изменения TypeScript-кода.

## Likely Files

- `src/data/levels/levels.json`
- `src/data/levels/level.schema.json`
- `src/data/levelTypes.ts`
- `src/data/gameData.ts`
- `src/ui/GameApp.ts`
- `tests/LevelDefinitions.test.ts`
- `docs/02-architecture/LEVEL_DATA.md`

## Dependencies

- FEATURE-006 — Objective abstraction;
- FEATURE-007 — Collect objective.

## Manual Test

1. Открыть комнаты и убедиться, что доступны прежние десять уровней.
2. Запустить уровни 1 и 10 и проверить цель и число ходов.
3. Собрать collect-цель и проверить победу.
4. Нажать «Заново» и проверить сброс.
5. Временно изменить target уровня 1 в `levels.json`, перезапустить приложение и
   убедиться, что UI показывает новое значение; затем вернуть исходное значение.

## Risks

- расхождение JSON Schema и TypeScript union;
- доверие невалидному JSON до FEATURE-012;
- случайное изменение баланса при ручной миграции;
- зависимость UI от первой цели вместо общего multi-objective UI.
