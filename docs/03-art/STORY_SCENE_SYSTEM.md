# Story Scene System

## FEATURE-052 contract

The first chapter contains 30 authored scenes: one after every level.

- ten major scenes use at least five dialogue beats;
- twenty interludes use at least three dialogue beats;
- all scenes use semantic portrait and backdrop keys;
- room restoration artwork is reused as Library, Garden, and Crypt backdrops;
- locked journal entries do not expose scene titles or summaries.

## Portraits

Integrated prototype portraits:

- Evelyn;
- Adrian;
- Raven;
- unknown/Lucian silhouette;
- revealed Lucian.

The revealed Lucian asset is intentionally restricted to the level-30 scene.

## Journal art

`story-journal.svg` is the reusable archive icon. It combines the book, raven,
and Blackwood wine/gold visual language without adding final emoji assets.

## Production replacement

Final art may replace any semantic asset without editing scene data. Keep the
same `StoryPortraitKey` and `StoryBackgroundKey` values, or add a resolver entry
before authoring a new key.
