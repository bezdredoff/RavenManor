# FEATURE-041 — Manor, rooms, and narrative presentation

## Goal

Replace player-facing room and story emoji placeholders with an authored,
mobile-first Romantic Gothic Restoration presentation.

## Scope

- twenty room-stage SVG scenes for Hall, Library, Garden, Crypt, and Tower;
- room card thumbnails based on current restoration state;
- room detail scene with stage title, description, and milestones;
- visual locked-room treatment without emoji;
- four visual-novel backdrops and four portrait assets;
- typed story data and independent asset resolvers;
- tests covering every room and story asset slot;
- contained mobile scrolling and touch/keyboard room-card access.

## Out of scope

- restoration particles and reveal animation — FEATURE-042;
- final painted character illustrations;
- audio and voiceover;
- branching dialogue;
- changes to stars, unlock rules, levels, or save format.

## Acceptance criteria

- no room or story scene depends on an emoji placeholder;
- every existing room `assetKey` resolves to a unique authored scene;
- every restoration action immediately displays the next room state;
- locked rooms remain recognisable but clearly inaccessible;
- story scenes fit a mobile viewport and scroll only inside the modal when
  necessary;
- room cards support touch, pointer, Enter, and Space;
- gameplay, balance, progression, and V4 saves remain unchanged;
- TypeScript and production build pass;
- full Vitest suite passes in the project environment.
