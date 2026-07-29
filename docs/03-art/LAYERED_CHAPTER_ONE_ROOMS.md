# Layered Chapter-One Room Art

FEATURE-056 completes the production-style layered room pipeline for every room
in Chapter One. Hall and Library keep their existing kits; Winter Garden,
Family Crypt, and Raven Tower now use the same runtime contract.

## Shared contract

Every room has:

- one cold architectural `base.png`;
- one task-one obstruction or access layer;
- one task-two functional focal layer;
- one task-three final decor or mechanism layer;
- one `ambient-restored-glow.png` layer;
- four flat `stage-0.png` … `stage-3.png` composites for reveal transitions.

The detailed room screen and Manor cards render the actual layer stack. The
existing before/after restoration reveal continues to use the flat composite
stages.

## Winter Garden

Folder: `src/assets/rooms/garden/`

- stage 0: base + overgrown vines and foliage;
- stage 1: cleared paths;
- stage 2: restored fountain and water light;
- stage 3: revived rose beds + final ambience.

Task mapping:

- `garden-clear-vines` → remove `task1-vines-overgrown.png`;
- `garden-repair-fountain` → add `task2-fountain-on.png`;
- `garden-revive-roses` → add `task3-roses-bloom.png` and final glow.

## Family Crypt

Folder: `src/assets/rooms/crypt/`

- stage 0: base + rubble blocking the central passage;
- stage 1: cleared stair and aisle;
- stage 2: restored family seals and memorial details;
- stage 3: braziers/candles + final warm memorial ambience.

Task mapping:

- `crypt-clear-stairs` → remove `task1-stair-rubble.png`;
- `crypt-restore-seals` → add `task2-seals-restored.png`;
- `crypt-light-braziers` → add `task3-braziers-on.png` and final glow.

## Raven Tower

Folder: `src/assets/rooms/tower/`

- stage 0: base + broken stair obstruction;
- stage 1: safe ascent;
- stage 2: opened observatory, telescope, and star field;
- stage 3: active raven clockwork + final celestial ambience.

Task mapping:

- `tower-repair-steps` → remove `task1-broken-steps.png`;
- `tower-open-observatory` → add `task2-observatory-open.png`;
- `tower-restore-raven-clock` → add `task3-raven-clock-on.png` and final glow.

## Chapter-one result

`roomLayeredPresentation.ts` now recognizes all five room ids:

- `hall`
- `library`
- `garden`
- `crypt`
- `tower`

New rooms should follow this same stable structure instead of introducing a new
one-off rendering path.
