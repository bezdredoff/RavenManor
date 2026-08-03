# Story Scene System

## FEATURE-052 contract

The first chapter contains 30 authored scenes: one after every level.

- ten major scenes use at least five dialogue beats;
- twenty interludes use at least three dialogue beats;
- all scenes use semantic portrait and backdrop keys;
- room restoration artwork is reused as Library, Garden, and Crypt backdrops;
- locked journal entries do not expose scene titles or summaries.

## Portraits

Integrated portraits:

- Evelyn;
- Adrian;
- Raven;
- unknown/Lucian silhouette;
- revealed Lucian.

The revealed Lucian asset is intentionally restricted to the level-30 scene.
The unknown silhouette uses one neutral 1024×1536 transparent PNG through
level 29. Its face and identity remain intentionally unreadable.

## Journal art

`story-journal.svg` is the reusable archive icon. It combines the book, raven,
and Blackwood wine/gold visual language without adding final emoji assets.

## Production replacement

Final art may replace any semantic asset without editing scene data. Keep the
same `StoryPortraitKey` and `StoryBackgroundKey` values, or add a resolver entry
before authoring a new key.

## FEATURE-057 room-stage reuse

Dialogue backgrounds now reuse the four flat PNG restoration stages exported
for each room. Replaying a scene shows the room's current saved stage. The
journal background follows the newest unlocked story entry. Legacy story SVG
backdrops remain only as fallbacks for future non-room scenes.
