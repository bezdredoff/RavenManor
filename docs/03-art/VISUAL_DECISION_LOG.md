# Visual Decision Log

## VD-001 — Art direction

**Decision:** Romantic Gothic Restoration.

**Reason:** It supports the manor mystery, restoration fantasy, and broad
match-3 readability without becoming childish or extreme horror.

## VD-002 — Visual transformation

**Decision:** Restoration changes lighting, clutter, focal objects, and revealed
story details while preserving one camera per room.

**Reason:** Players must instantly perceive progress and assets must remain
comparable across stages.

## VD-003 — Match-3 tile identity

**Decision:** Six authored gothic charms use unique silhouette plus colour.
Platform emoji are fallback-only during development.

**Reason:** Emoji are inconsistent across devices and insufficient for polished
gameplay feedback.

## VD-004 — UI ornament

**Decision:** Use restrained gothic structure rather than decorative frames on
every surface.

**Reason:** Readability and hierarchy are more important than ornament density.

## VD-005 — Typography split

**Decision:** Display serif for brand/titles; readable sans serif for interface
and body text.

**Reason:** The existing one-font approach weakens both atmosphere and dense UI
legibility.

## VD-006 — Room-art delivery

**Decision:** The vertical slice may use four full images per room, keyed by the
existing `assetKey` contract. All stages share camera and geometry.

**Reason:** This is simpler to integrate now and can later evolve into layered
assets without changing progression data.

## VD-007 — Implementation order

**Decision:** Build the component/token system before integrating final tiles or
room art.

**Reason:** Assets need predictable slots, dimensions, state rules, and fallback
behaviour.

## VD-008 — Player-facing prototype language

**Decision:** Remove developer notes such as “vertical slice” from player UI
during FEATURE-039.

**Reason:** Public presentation must feel like a game, not an internal demo.


## 2026-07-23 — Vector fallback tile set integrated

Decision: integrate a coherent six-piece SVG tile set before final outsourced or
AI-painted production art. The SVGs are treated as replaceable production
slots, not temporary emoji. Engine tile indices and save data remain unchanged.

Rationale: this gives immediate silhouette, touch, contrast, and motion feedback
for mobile testing while preserving an inexpensive asset-replacement path.

## 2026-07-23 — Basic tile readability hotfix

Decision: redraw the rose, key, and scroll after device review. The rose now
uses a layered top-down blossom, the key is optically centred around its total
silhouette, and the scroll seal uses an ornamental rose rather than a checkmark.
Embedded SVG drop-shadow filters are removed from these assets; the board's CSS
owns shadow presentation.

Rationale: authored assets still require in-game review at mobile cell size.
Recognisable silhouette, optical centring, and semantic clarity take precedence
over preserving the first vector draft.

## 2026-07-24 — Staged manor scenes and visual-novel slots integrated

Decision: use twenty authored SVG room scenes and eight story assets as the
vertical-slice visual benchmark. Existing room `assetKey` values remain the
stable contract; final painted art may replace files without changing
progression or UI code.

Rationale: restoration must be visible now, but independent artists and AI
agents need a safe replacement boundary. Story dialogue remains live text and
is never baked into an illustration.


## FEATURE-042 — Motion language

- Use restrained antique-gold glints as the default positive effect.
- Use colour-linked sparks for matches, moon-silver mist for loss, and pale
  violet feather/petal forms for unlocks.
- Treat room restoration as the longest and most important animation in the
  vertical slice.
- Animate screen entry only on navigation, never on every board re-render.
- Keep all particle systems DOM/CSS based and bounded for low-end phones.
- Follow `prefers-reduced-motion` automatically; no information may rely only
  on movement.

## FEATURE-043 — final UX decisions

- The remaining Home/tutorial bird emoji is replaced by an authored raven-and-
  rose SVG mark.
- Missing image assets use a branded `RM` fallback rather than the browser's
  broken-image icon.
- Audio is semantic and replaceable: UI code emits named cues rather than
  referencing files directly.
- The 320 × 568 viewport receives an explicit compact profile in addition to
  CSS media queries.
- Audio preferences live outside gameplay progress so a progress reset does not
  reset player comfort settings.
