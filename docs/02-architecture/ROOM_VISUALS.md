# Room Visual States

## Goal

Make every restoration purchase produce immediate, visible feedback while
keeping final art production independent from gameplay code.

## Data contract

A room visual definition contains four stages for the current three-task room:

```ts
{
  roomId: 'hall',
  stages: [
    {
      completedTasks: 0,
      assetKey: 'rooms/hall/stage-0-ruined',
      placeholderIcon: '🏚️',
      title: 'Заброшенный вход',
      description: '...'
    }
  ]
}
```

The stable `assetKey` is the hand-off point for later generated or hand-painted
room artwork. The current UI does not load image files; it uses the placeholder
icon and CSS lighting so the feature can be tested before final assets exist.

## State derivation

The current stage is derived from the number of completed restoration tasks in
that room. It is not stored separately.

This prevents invalid states such as:

- a completed task with the ruined image;
- a restored image after save data lost a task;
- two independent migration paths for restoration and presentation.

## UI surfaces

The room detail screen shows:

- a large current-stage preview;
- stage title and narrative description;
- three milestone indicators;
- immediate rerender after completing a task.

The manor overview shows the current stage icon and restoration progress for
each unlocked room.

## Future asset replacement

A later art integration can add an asset resolver:

```text
assetKey → imported WebP/AVIF image
```

The fallback icon should remain available for missing assets and automated test
environments. Art replacement must not change task IDs, save data, or stage
selection rules.
