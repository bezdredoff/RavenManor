# Playtest Infrastructure

FEATURE-047 combines technical hardening, local analytics, and PWA delivery so
Raven Manor can be distributed to a wider test group without adding unvalidated
gameplay systems.

## Save resilience

The canonical gameplay key remains `ravenManorStateV4`; no gameplay migration is
required.

`ProgressStore` now:

- normalises imported and stored records instead of trusting arbitrary values;
- backs malformed JSON up to `ravenManorCorruptSaveBackupV1`;
- replaces a repeatedly crashing malformed save with a clean state;
- reports the recovery in Settings and through a toast;
- catches storage write failures so gameplay can continue in memory;
- exports a versioned `raven-manor-save` envelope;
- imports both that envelope and recognised legacy state-shaped JSON.

Import never changes audio preferences or playtest analytics because they use
separate storage keys.

## Error capture

`ErrorLog` stores the latest 50 window errors, unhandled promise rejections, and
explicit application errors in `ravenManorErrorLogV1`.

The log is local-only and is included only when the player explicitly exports a
diagnostics file. An initialization failure renders a recoverable reload screen
instead of leaving a blank page.

## Diagnostics export

The diagnostics JSON includes:

- app/build version;
- timestamp and current screen;
- browser language and user agent;
- viewport, device pixel ratio, online state, reduced-motion state;
- PWA/service-worker status;
- versioned gameplay save;
- local playtest analytics;
- captured errors.

This is intended for voluntary attachment to a bug report. It is not uploaded
automatically.

## Input hardening

Generic screen actions receive a short click lock. Modal actions disable their
button immediately. Room, level, and restoration entry points also reject rapid
duplicate activation. Match-3 still uses its existing `busy` transaction guard.

## Asset warm-up

The Raven mark and the six tile SVG assets are decoded during idle time. This
reduces first-use flashing without delaying initial interaction.
