# Match-3 Context Pack

## Read First
- `CONSTITUTION.md`
- `docs/01-design/MATCH3.md`
- `docs/02-architecture/MODULE_BOUNDARIES.md`

## Current Engine
`src/engine/Match3Engine.ts`

## Invariants
- engine is DOM-independent;
- invalid swap is reverted;
- cascades cost no moves;
- board must have at least one possible move;
- UI must not duplicate match detection.
