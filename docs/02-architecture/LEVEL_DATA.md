# Level Data Contract

## Purpose

Level content is stored as JSON so level designers and independent AI agents
can create or balance levels without editing `GameApp` or gameplay classes.

## Files

```text
src/data/levels/levels.json       Current level catalog
src/data/levels/level.schema.json JSON Schema contract
src/data/levelTypes.ts            TypeScript mirror used by application code
src/data/levelValidation.ts       Runtime validation and actionable errors
src/data/gameData.ts              Validated import boundary and public exports
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

## Runtime trust boundary

Imported JSON is treated as `unknown`. `gameData.ts` calls
`validateLevelCatalog` before exporting levels to gameplay code.

Validation currently checks:

- a non-empty level array;
- schema version 1;
- positive, unique level IDs;
- non-empty titles;
- positive move limits;
- non-negative star requirements;
- at least one objective;
- unique objective IDs within each level;
- supported objective type `collect`;
- tile indices within the current tile catalog;
- positive collect targets;
- unexpected fields.

Invalid content throws `LevelValidationError` before gameplay starts. Every issue
contains a JSON-style path, for example:

```text
levels[0].objectives[0].tileType: must be between 0 and 5
```

## Objective definitions

The `objectives` array is a discriminated union. The current prototype supports:

- `collect` — remove a configured number of one tile type.

New objective kinds must extend:

1. the JSON Schema;
2. the TypeScript union;
3. runtime validation;
4. objective construction in the gameplay layer;
5. automated tests.

## Content authoring rule

Changing level balance should normally require edits only to `levels.json`.
Application code changes only when the contract or supported mechanics change.

After every level-data edit, run:

```bash
npm test
npm run build
```
