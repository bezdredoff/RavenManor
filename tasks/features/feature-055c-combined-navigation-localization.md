# FEATURE-055C — Combined navigation and localization hotfix

## Objective

Deliver FEATURE-055A and FEATURE-055B as one self-contained patch applied
straight to FEATURE-055, avoiding an ordering dependency between two archives.

## Scope

- focused navigation from a room to the latest unlocked unfinished level group;
- complete English and Belarusian result-window localization;
- broad GameApp UI localization coverage;
- automated regression tests for navigation and untranslated UI copy.

## Acceptance

- all included tests pass;
- the result heading and subtitle change in English and Belarusian;
- room-to-level navigation focuses the intended group;
- ordinary navigation continues to open the level map at the top;
- the archive has `src`, `tests`, `docs`, and `tasks` directly at ZIP root.
