# Architecture

## Modules

### `src/engine/Match3Engine.ts`

Чистая игровая логика:

- генерация поля;
- перестановки;
- поиск матчей;
- удаление;
- падение;
- поиск возможного хода.

Не должен зависеть от DOM, UI или localStorage.

### `src/engine/ProgressStore.ts`

Отвечает за:

- сохранение звёзд;
- завершённые уровни;
- сюжетный прогресс;
- сброс данных.

### `src/data/gameData.ts`

Единый источник данных:

- комнаты;
- уровни;
- типы фишек;
- требования разблокировки.

### `src/ui/GameApp.ts`

Оркестрация экранов:

- главное меню;
- карта;
- выбор уровня;
- игровой экран;
- модальные окна;
- сюжетные сцены.

## Dependency direction

`data -> engine -> UI`

UI может использовать engine и data.
Engine не может использовать UI.
ProgressStore не должен знать о конкретной разметке.

## Extension points

Будущие модули:

- `Boosters`;
- `LevelObjectives`;
- `Obstacles`;
- `MetaGame`;
- `DialogueSystem`;
- `Analytics`;
- `LevelEditor`.
