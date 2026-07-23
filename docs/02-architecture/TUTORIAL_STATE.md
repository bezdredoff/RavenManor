# Tutorial State

## Purpose

Tutorial guidance is optional, persisted, and independent from level content.
A level does not become a special tutorial level merely because guidance is
visible.

## State

```ts
type TutorialState = {
  preference: 'undecided' | 'enabled' | 'skipped' | 'completed';
  step: number;
};
```

The implementation lives in:

```text
src/meta/TutorialState.ts
```

Persistence is owned by `ProgressStore` under `ravenManorStateV4`.

## Migration

- a V3/V2 save with completed levels or restoration tasks migrates to
  `skipped`, preventing an interruption for an existing player;
- an untouched legacy save migrates to `undecided`;
- invalid stored values are sanitized.

## UI integration

`GameApp` owns presentation only:

- first-level choice modal;
- two non-blocking contextual banners;
- Settings controls.

Business rules and state transitions remain testable without the DOM.

## Extension rule

Future contextual tutorials should add stable mechanic IDs rather than one
large global step counter. FEATURE-037 intentionally keeps a minimal two-step
first-session state until additional mechanics exist.
