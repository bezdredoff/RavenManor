# Story Journal

## Data

`storyScenes.ts` stores one scene per level with:

- stable scene ID;
- unlocking level ID;
- room ID;
- chapter, title, and spoiler-safe unlocked summary;
- major/interlude importance;
- semantic background and portrait keys;
- ordered dialogue beats.

## Save compatibility

The existing `viewedStoryScenes: Record<number, boolean>` remains inside
`ravenManorStateV4`. No storage migration is required.

A scene has one of three derived states:

- `locked`: its level is not completed;
- `new`: its level is completed but the final beat has not been read;
- `viewed`: its final beat has been read at least once.

Replay does not change stars, levels, restoration, boosters, or story unlocks.

## Navigation

- Home exposes both `Продолжить историю` and the full `Дневник`.
- Manor also links to the journal.
- The journal is a contained-scroll screen grouped by room.
- `Продолжить` selects the earliest unlocked unread scene.
- a replay opened from the journal returns to the journal;
- a post-win scene retains its next-level continuation.

## Analytics

First completion uses the existing `story_viewed` event. Replays record
`story_replayed` and do not duplicate first-view progress.
