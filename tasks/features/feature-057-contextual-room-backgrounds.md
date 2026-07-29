# FEATURE-057 — Contextual room backgrounds

## Goal

Replace legacy story SVG backdrops and the flat journal surface with the
existing Chapter-One room-stage PNG artwork.

## Implementation

- story scenes resolve their background from `scene.roomId`;
- the current restoration stage is derived from saved completed tasks;
- flat stage PNGs are resolved through `roomPresentation.ts`;
- `backgroundKey` remains a fallback for future non-room scenes;
- the journal uses the latest unlocked story scene as its room context;
- no DOM observers, secondary asset registries, save migrations, or new art are
  introduced.

## Acceptance criteria

- the level-1 gates scene displays Hall stage art rather than `gates.svg`;
- all current scenes use Hall, Library, Garden, Crypt, or Tower stage PNGs;
- replaying a scene reflects the room's current saved restoration stage;
- the journal displays the room of the newest unlocked story scene;
- navigating away from the journal removes its contextual background;
- portraits, dialogue progression, analytics, saves, and room restoration remain
  unchanged;
- TypeScript and the production build pass.
