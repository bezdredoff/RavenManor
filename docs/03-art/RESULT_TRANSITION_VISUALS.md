# Result and Transition Visuals

FEATURE-071 makes level results a cinematic continuation surface rather than a
generic modal.

## Composition

- The upper scene reuses the canonical current room-stage presentation.
- The lower sheet owns stars, rewards, the next narrative/meta step and actions.
- Victory uses warm brass and plum; defeat desaturates the same room context.
- The primary action follows the player's next meaningful route. Secondary and
  utility routes remain visibly subordinate.
- Defeat replaces reward information with objective progress from the completed
  attempt.

## Continuation Priority

1. New unviewed story scene.
2. Affordable active restoration.
3. Next unlocked playable level.
4. Existing story replay or the level map as a safe fallback.

This ordering changes presentation only. Existing story, restoration and level
handlers remain the source of truth for navigation and progress.

## Responsive Contract

- The result card fills the app frame and never expands the document.
- The scene remains visible while the result sheet scrolls independently on
  short viewports.
- The primary action appears before optional routes.
- Result particle motion is removed by the established reduced-motion policy.

## Ownership

FEATURE-071 owns win, fail and continuation composition. FEATURE-072 owns the
in-level HUD, board layout, booster bar, last-moves warning and tutorial pointer.

