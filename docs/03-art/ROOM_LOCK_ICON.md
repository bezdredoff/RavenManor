# Locked Room Icon

FEATURE-056A replaces the former CSS-built padlock with a single SVG asset:

`src/assets/ui/room-lock.svg`

## Reason

The earlier icon was assembled from two pseudo-elements. On some browser and
layout combinations the rectangular body appeared above the curved shackle,
which made the symbol look broken. The new asset is one coordinate system and
therefore cannot separate into independently positioned pieces.

## Presentation contract

- one complete closed padlock;
- 64×64 SVG view box;
- parchment outline, dark plum body, antique-gold keyhole;
- no font glyphs or emoji;
- centred in the locked room artwork;
- decorative only because the room card already contains the accessible locked
  state label.
