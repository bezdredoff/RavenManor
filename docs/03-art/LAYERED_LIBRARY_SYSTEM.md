# Layered Library System

## Purpose

FEATURE-055 extends the working layered-room pipeline from the Entrance Hall to
the second room, the Library. The existing restoration tasks now produce visible
changes in the same authored interior rather than swapping unrelated prototype
illustrations.

## Layer kit

Folder: `src/assets/rooms/library/layered/`

- `base.png` — sealed, cold and underlit library with closed shutters;
- `task1-shutters-open.png` — open gothic window and moonlight pass;
- `task2-shelves-restored.png` — repaired/restocked shelves and ladder detail;
- `task3-desk-open.png` — restored writing desk, letter and study corner;
- `ambient-restored-glow.png` — final mixed moonlight/candlelight ambience.

## Runtime composition

- stage 0: base;
- stage 1: base + shutters/moonlight;
- stage 2: stage 1 + shelves;
- stage 3: stage 2 + writing desk + final ambience.

The same composition is used on the Manor card and Room hero. Flat stage
composites remain available for the existing before/after restoration reveal.

## Compatibility

The stable asset keys are unchanged:

- `rooms/library/stage-0-sealed`
- `rooms/library/stage-1-moonlit`
- `rooms/library/stage-2-shelves`
- `rooms/library/stage-3-desk`

No save migration or restoration-data changes are required.
