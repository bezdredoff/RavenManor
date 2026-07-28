# Layered Vestibule System

## Goal

FEATURE-054 upgrades the first room from a single flat illustration to a small
production-style layer kit. The Entrance Hall now keeps a stable architectural
base and reveals restoration progress by adding or removing authored overlays.

## Integrated asset set

Folder: `src/assets/rooms/hall/`

### Composite stage previews

These are still used anywhere the code needs a single flat image asset, most
notably the restoration before/after reveal animation.

- `stage-0.png` — ruined vestibule
- `stage-1.png` — cleared passage
- `stage-2.png` — chandelier relit
- `stage-3.png` — restored portraits and warm final ambience

### Layer kit

Folder: `src/assets/rooms/hall/layered/`

- `base.png` — cold architectural plate of the vestibule
- `task1-debris.png` — debris, dust, cobweb clutter
- `task2-chandelier-on.png` — chandelier and candlelight pass
- `task3-decor-on.png` — restored portrait/decor pass
- `ambient-restored-glow.png` — soft final glow for the completed state

## Runtime rules

Only the first room uses layered art in FEATURE-054. Other rooms continue to use
stable single-image stage assets until their own layer kits are authored.

The hall resolves layers by completed restoration-task count:

- `0` → `base + debris`
- `1` → `base`
- `2` → `base + chandelier`
- `3` → `base + chandelier + decor + ambient glow`

## Why both layered and composite assets exist

Layered rendering is used in the room card and the room-detail hero to make the
meta progression feel more physical and immediate. Composite previews remain in
place for code paths that already expect one finished image, especially the
restoration reveal overlay.

## Next logical extension

Use the same contract for Library, Garden, Crypt, and Tower:

1. generate a neutral architectural base;
2. create one overlay per restoration task;
3. keep an optional final ambience/glow pass;
4. export stage composites for reveal transitions;
5. register the room in `roomLayeredPresentation.ts`.
