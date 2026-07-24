# Connected level progression

Level groups support three unlock rules:

```ts
{ type: 'always' }
{ type: 'complete-in-group', groupId, count }
{ type: 'restoration-task', taskId }
```

FEATURE-050 uses `restoration-task` for groups 2–4. Validation checks that the
task exists in the restoration catalog.

Every progression query receives both completion maps:

```ts
getLevelGroupState(group, groups, completedLevels, completedRestorationTasks)
isLevelUnlocked(levelId, groups, completedLevels, completedRestorationTasks)
getNextPlayableLevelId(currentLevelId, levelIds, groups, completedLevels, completedRestorationTasks)
```

When the current group is finished but the next restoration gate is closed,
`getNextPlayableLevelId` returns `null`. The win screen then routes the player
to the active repair rather than pretending another level is available.
