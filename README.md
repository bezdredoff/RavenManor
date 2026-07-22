# Raven Manor AI Studio

Рабочий AI-first репозиторий для разработки готической match-3 игры с помощью ChatGPT, локальных моделей и людей.

## Start

```bash
npm install
npm run dev
```

## Mandatory Reading

1. `GAME_BIBLE.md`
2. `CONSTITUTION.md`
3. `AGENTS.md`
4. `docs/08-process/WORKFLOW.md`

## Repository Layers

- `src/` — рабочий прототип;
- `docs/` — продуктовая и техническая документация;
- `knowledge/` — краткий контекст для AI;
- `contexts/` — готовые context packs;
- `roles/` — роли AI-исполнителей;
- `tasks/` — epics, features, research, bugs и debt;
- `templates/` — единый формат новых задач;
- `prompts/` — промпты реализации и review.

## Current Backlog

- 8 epics;
- 40 feature briefs;
- 5 research tasks;
- process definitions;
- ADR;
- AI context packs.

## Recommended First Sequence

1. FEATURE-001 — Reshuffle dead board
2. FEATURE-028 — Unit tests engine
3. FEATURE-002 — Touch swipe input
4. FEATURE-037 — First-session tutorial
5. FEATURE-029 — CI build check
6. FEATURE-030 — GitHub Pages deploy
