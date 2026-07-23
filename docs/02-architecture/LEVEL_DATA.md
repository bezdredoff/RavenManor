# Level Data Contract

## Purpose

Level content is stored as validated JSON so designers and independent AI agents
can add or balance content without editing gameplay UI classes.

## Level Schema Version 2

```json
{
  "schemaVersion": 2,
  "id": 1,
  "title": "Первые розы",
  "difficulty": "easy",
  "moves": 18,
  "starThresholds": {
    "twoStarsMovesLeft": 4,
    "threeStarsMovesLeft": 10
  },
  "objectives": [
    {
      "id": "primary",
      "type": "collect",
      "tileType": 0,
      "target": 15
    }
  ]
}
```

`requiredStars` was removed from level data. Unlocking is now owned by the
separate level-group progression catalog.

## Files

```text
src/data/levels/levels.json
src/data/levels/level.schema.json
src/data/levelTypes.ts
src/data/levelValidation.ts
src/data/progression/level-groups.json
src/data/progression/level-group.schema.json
src/data/levelGroupTypes.ts
src/data/levelGroupValidation.ts
```

## Scaling Beyond the Prototype

The ten-level file is intentionally small. A production catalog can later be
sharded without changing the gameplay contract:

```text
levels/chapter-001/levels-0001-0100.json
levels/chapter-002/levels-0101-0200.json
progression/chapter-001-groups.json
```

The application consumes validated arrays, not a hard-coded maximum count.
