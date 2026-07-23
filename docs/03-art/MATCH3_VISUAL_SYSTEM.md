# Match-3 Visual System

## Intent

The board should read as a collection of gothic amulets set into an ornate
manor mechanism, not as emoji placed on generic HTML buttons.

## Tile set

The six production slots use authored SVG fallbacks:

| Index | ID | Silhouette | Primary material |
|---:|---|---|---|
| 0 | rose | compact circular flower | crimson velvet and gold |
| 1 | candle | tall vertical form | ivory wax and amber flame |
| 2 | key | long diagonal form | antique gold |
| 3 | crystal | sharp diamond | moonlit blue-violet glass |
| 4 | bat | broad horizontal wings | purple-black enamel |
| 5 | scroll | horizontal rolled form | parchment and wax seal |

Colour is never the only differentiator. Each tile must remain recognisable by
silhouette at small sizes and in greyscale.

## Board frame

The board uses:

- a double antique-gold frame;
- dark plum material with a subtle manor sigil;
- restrained cell-specific glow;
- no decorative overlay that blocks the touch target;
- a square layout that remains fully visible on a 320 × 568 viewport.

## Interaction states

- **Pressed:** immediate scale response under a finger.
- **Selected:** raised tile with a bright gold double ring.
- **Hint:** two tiles pulse with glow and vertical lift.
- **Invalid swap:** both tiles shake and receive a danger-colour edge.
- **Match:** matched pieces brighten, expand, and dissolve.
- **Fall / settle:** refreshed board enters from slightly above.
- **Cascade:** compact central feedback names the cascade count.
- **Reshuffle:** the whole board shifts while the raven message is shown.

All feedback has a `prefers-reduced-motion` fallback.

## Input

Both interaction styles are supported:

1. tap one tile and then an adjacent tile;
2. press and drag/swipe from one tile to an adjacent tile.

The board uses `touch-action: none`, and tile artwork never intercepts pointer
input. Keyboard-generated button clicks remain supported.

## Future special tiles

Special tiles should keep the underlying object identity and add a separate,
high-contrast modifier:

- horizontal or vertical gold rune for line clear;
- circular rose sigil for radial clear;
- raven-feather halo for colour clear.

Do not create entirely unrelated silhouettes that can be confused with new
basic tile types.
