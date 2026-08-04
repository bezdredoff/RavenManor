# FEATURE-069 — Unified UI Kit Consistency Pass

## Goal

Give Raven Manor controls one consistent Romantic Gothic language without
redesigning individual screens or creating a second design system.

## Scope

- extend the existing tokens in `src/ui/design-system.css`;
- align primary, secondary, ghost and icon buttons;
- align tabs, toggles and selected states;
- make disabled and locked states visually distinct;
- align modal surfaces and toast notifications;
- keep every normal interactive control at least 44 px tall.

## Out of Scope

- meta-screen composition (FEATURE-070);
- win/fail and transition composition (FEATURE-071);
- gameplay HUD and board layout (FEATURE-072);
- story portraits, journal information architecture, progress or save data;
- new raster or SVG assets.

## Acceptance Criteria

1. Existing design-system tokens remain the only shared control source.
2. Primary, secondary, ghost and icon controls have consistent border, depth,
   focus, pressed and disabled treatment.
3. Journal tabs, settings toggles and booster selection share the same gold
   selected-state cue.
4. Locked cards and controls share a desaturated visual cue without revealing
   future room art.
5. Generic modals and toast notifications use the same plum, brass and gold
   surface language.
6. The star-wallet topbar control is at least 44 px tall.
7. FEATURE-066, HOTFIX-066A, FEATURE-067 and FEATURE-068B contracts remain intact.
8. TypeScript, tests, production build and the FEATURE-069 verifier pass.

