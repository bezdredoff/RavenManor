# Level and Room Progression

## Level Groups

`level-groups.json` defines selectable batches independently from level balance.

```json
{
  "id": "arrival",
  "levelIds": [1, 2, 3],
  "unlock": { "type": "always" }
}
```

A later group can require distinct completed levels from an earlier group:

```json
{
  "unlock": {
    "type": "complete-in-group",
    "groupId": "arrival",
    "count": 2
  }
}
```

This provides choice while preserving controlled progression. Completion is a
boolean per level, so replaying one level cannot fake multiple victories.

## Room Unlocks

Rooms no longer own `levelIds`. Their unlock rule references restoration state:

```ts
{
  type: 'room-restoration',
  roomId: 'hall',
  completedTasks: 2,
}
```

This decoupling allows many levels to fund a smaller number of meaningful manor
scenes.

## Invariants

- every level belongs to exactly one progression group;
- group unlocks reference an earlier group;
- the first group is always open;
- room unlocks do not consume stars themselves;
- spending stars cannot relock an already restored stage;
- level star thresholds do not control level availability.
