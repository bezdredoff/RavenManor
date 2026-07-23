# Level Data Contract

## Purpose

Level content is stored as JSON so level designers and independent AI agents
can create or balance levels without editing `GameApp` or gameplay classes.

## Files

```text
src/data/levels/levels.json       Current level catalog
src/data/levels/level.schema.json JSON Schema contract
src/data/levelTypes.ts            TypeScript mirror used by application code
src/data/gameData.ts              Import boundary and public data exports
```

## Level shape

```json
{
  "schemaVersion": 1,
  "id": 1,
  "title": "Уровень 1",
  "moves": 18,
  "requiredStars": 0,
  "objectives": [
    {
      "id": "primary",
      "type": "collect",
      "tileType": 0,
      "target": 12
    }
  ]
}
```

## Objective definitions

The `objectives` array is a discriminated union. FEATURE-011 supports only:

- `collect` — remove a configured number of one tile type.

New objective kinds must extend both the JSON Schema and the TypeScript union.
They must not add one-off fields to `GameApp`.

## Trust boundary

FEATURE-011 imports JSON and asserts it to `LevelDefinition[]` at the data
boundary. It does not claim that arbitrary JSON is safe.

FEATURE-012 will add runtime validation and actionable errors before the data is
exported to gameplay code.

## Content authoring rule

Changing level balance should normally require edits only to `levels.json`.
Application code may change only when the data contract or supported mechanics
change.
