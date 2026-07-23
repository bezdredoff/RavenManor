# FEATURE-015 — Explicit star economy

## Status

In Review

## Area

Meta game / Persistence

## Goal

Хранить и показывать заработанные, потраченные и доступные звёзды как явную
часть save-модели вместо вычисления расходов по completed task IDs при каждом
рендере.

## User Value

Игрок понимает, сколько звёзд он заработал, сколько уже вложил в Raven Manor и
сколько ещё может потратить. Повторные прохождения и восстановление комнат не
создают двойных начислений или списаний.

## Scope

- `StarBalance` с `earned`, `spent`, `available`;
- pure award/spend/restore operations;
- V3 save format;
- миграция V2 сохранений;
- начисление только разницы с лучшим результатом уровня;
- одноразовое списание стоимости restoration task;
- earned stars для unlock thresholds;
- wallet UI на экранах Manor и Room;
- reward feedback после победы;
- unit tests и архитектурная документация.

## Out of Scope

- баланс уровней 1-10;
- изменение стоимости restoration tasks;
- покупка или монетизация звёзд;
- другие валюты;
- серверное сохранение;
- analytics events.

## Requirements

- `available = earned - spent` после каждой операции и загрузки;
- все значения являются неотрицательными целыми;
- replay худшего результата не начисляет звёзды;
- replay с улучшением начисляет только разницу;
- completed task не списывает стоимость повторно;
- нельзя потратить больше доступного баланса;
- spending не влияет на room/level unlock thresholds;
- старый V2 save открывается без потери прогресса;
- reset создаёт пустой V3 wallet.

## Acceptance Criteria

- новый профиль показывает `0 / 0 / 0`;
- победа на 1 звезду показывает `earned 1, spent 0, available 1`;
- улучшение результата с 1 до 3 начисляет ещё 2;
- повторный результат 2 после лучшего 3 ничего не начисляет;
- task стоимостью 1 переводит баланс `3 / 0 / 3` в `3 / 1 / 2`;
- refresh сохраняет все три значения;
- следующая комната остаётся открыта по earned threshold после spending;
- V2 save корректно мигрирует;
- `npm test` проходит;
- `npm run build` проходит.

## Likely Files

- `src/meta/StarEconomy.ts`
- `src/engine/ProgressStore.ts`
- `src/meta/RoomRestoration.ts`
- `src/ui/GameApp.ts`
- `src/style.css`
- `tests/StarEconomy.test.ts`
- `tests/ProgressStore.test.ts`
- `tests/RoomRestoration.test.ts`
- `docs/01-design/META_GAME.md`
- `docs/02-architecture/RESTORATION.md`
- `docs/02-architecture/STAR_ECONOMY.md`

## Dependencies

- FEATURE-013 — Room restoration tasks;
- FEATURE-014 — Room visual states.

## Manual Test

1. Сбросить прогресс и проверить баланс `0 / 0 / 0`.
2. Пройти первый уровень на одну звезду и проверить `1 / 0 / 1`.
3. Улучшить тот же уровень до трёх звёзд и проверить `3 / 0 / 3`.
4. Повторить уровень с результатом не выше трёх и проверить отсутствие новых
   звёзд.
5. Выполнить задачу стоимостью одну звезду и проверить `3 / 1 / 2`.
6. Обновить страницу и проверить сохранение баланса и задачи.
7. Проверить, что unlock thresholds используют earned stars.
8. Сбросить прогресс и проверить возврат к `0 / 0 / 0`.
