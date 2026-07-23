# FEATURE-012 — Level validation

## Status

In Review

## Area

Tools / Content pipeline

## Goal

Проверять `levels.json` до передачи данных игровому коду и выдавать понятные
ошибки с точным путём к проблемному полю.

## User Value

Некорректный уровень больше не приводит к непредсказуемому поведению во время
игры. Ошибка обнаруживается сразу при запуске или в CI и указывает, что именно
нужно исправить.

## Scope

- runtime-валидация каталога уровней;
- `LevelValidationError` со списком проблем;
- проверка обязательных полей и допустимых значений;
- уникальные level IDs;
- уникальные objective IDs внутри уровня;
- проверка диапазона `tileType`;
- запрет неизвестных полей;
- подключение validation boundary в `gameData.ts`;
- unit tests;
- синхронизация JSON Schema и документации.

## Out of Scope

- визуальный редактор уровней;
- загрузка уровней по сети;
- автоматический баланс;
- новые objective types;
- проверка проходимости случайной доски;
- восстановление приложения после ошибочного каталога.

## Requirements

- JSON рассматривается как недоверенные данные;
- gameplay получает только `LevelDefinition[]`, прошедший validation;
- сообщения содержат путь вида `levels[2].moves`;
- все найденные ошибки собираются в один отчёт;
- валидатор не зависит от DOM;
- новая внешняя dependency не добавляется.

## Acceptance Criteria

- корректный текущий каталог загружается;
- не-массив и пустой массив отклоняются;
- schemaVersion должен быть 1;
- level IDs должны быть уникальными положительными целыми;
- title должен быть непустым;
- moves должен быть положительным целым;
- requiredStars должен быть неотрицательным целым;
- у уровня должна быть хотя бы одна цель;
- objective IDs должны быть уникальными внутри уровня;
- поддерживается только `collect`;
- tileType должен существовать в текущем tile catalog;
- target должен быть положительным целым;
- неизвестные поля отклоняются;
- `npm test` проходит;
- `npm run build` проходит.

## Likely Files

- `src/data/levelValidation.ts`
- `src/data/levelTypes.ts`
- `src/data/gameData.ts`
- `src/data/levels/level.schema.json`
- `tests/LevelValidation.test.ts`
- `docs/02-architecture/LEVEL_DATA.md`

## Dependencies

- FEATURE-011 — Level JSON schema;
- FEATURE-028 — Unit tests engine.

## Manual Test

1. Запустить корректную игру и открыть первый уровень.
2. Временно изменить `moves` первого уровня в `levels.json` на `0`.
3. Убедиться, что запуск останавливается с сообщением:
   `levels[0].moves: must be greater than or equal to 1`.
4. Вернуть исходное значение `18`.
5. Убедиться, что игра снова запускается.
6. Выполнить `npm test` и `npm run build`.

## Risks

- расхождение JSON Schema, TypeScript types и runtime validator;
- слишком строгая проверка при дальнейшем расширении формата;
- случайный commit намеренно сломанного тестового JSON.
