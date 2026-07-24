# Story Scene System

## Presentation

Story is presented as a compact visual-novel card rather than a generic text
modal. Every scene has:

- a portrait-oriented environment backdrop;
- a transparent character or creature portrait;
- speaker, chapter label, and dialogue;
- left/right portrait placement;
- one clear continuation action.

The scene card is constrained to the visual viewport. On short phones it may
scroll inside the modal, but the page behind it never scrolls.

## Data and art separation

`storyScenes.ts` stores narrative data and semantic asset keys.
`storyPresentation.ts` resolves those keys to files. This permits independent
writers, artists, and AI agents to extend the story without embedding paths or
markup in narrative data.

## Current vertical-slice scenes

1. Evelyn returns to the manor gates.
2. The raven tells her that the house remembers.
3. Lord Adrian explains the ancient contract.
4. An unknown silhouette recalls the stolen night in the tower.

The integrated vector portraits are style-consistent production placeholders,
not the final character illustration benchmark. Final painted portraits may be
swapped into the same slots without changing story progression.

## Accessibility

- dialogue remains text, never baked into artwork;
- speaker names are visible and included in the scene label;
- decorative images have empty alternative text;
- continuation uses a standard touch-safe button;
- reduced-motion mode must not remove narrative information.
