# Level Content Scaling

FEATURE-051 proves that the gameplay runtime can grow from ten to thirty levels
without adding level-specific engine code.

## Source of truth

- `src/data/levels/levels.json` owns board and objective content.
- `src/data/progression/level-groups.json` owns campaign grouping and gates.
- `src/data/restorationTasks.ts` owns the restoration-to-group connection.

The UI and engine iterate over these validated catalogs. No switch statement is
allowed for individual level IDs.

## Validation contract

Every level must have:

- unique sequential positive ID;
- 8×8 zero/one mask;
- unique blocker positions on active cells;
- at least one objective;
- objective targets compatible with configured blockers;
- valid move and star thresholds.

Every level must be assigned exactly once to a progression group. Groups may be
replayed from legacy saves when at least one level in that group was already
completed.

## Runtime smoke policy

Before merging a content expansion:

1. construct every level repeatedly;
2. confirm no initial line or square match;
3. confirm at least one legal move;
4. execute random legal moves and cascades with a guard;
5. confirm dead boards can reshuffle while preserving masks and blockers.

Balance success still requires human playtesting; generation smoke tests only
prove technical playability.
