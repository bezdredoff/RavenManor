# Special Tile Visual and Audio System

## Visual language

Specials are gothic relics rather than modern cartoon weapons:

- Rocket: silver ceremonial bolt with an antique-gold fitting;
- Explosive Rune: violet alchemical orb with a wax-red rune core;
- Ghost Raven: moon-silver spectral bird;
- Lunar Prism: faceted iridescent moon crystal.

All four are authored as transparent `128×128` SVGs and remain readable at an
8×8 mobile-cell size. A shared gold border, aura, and glow separate them from
normal coloured tiles.

The same rocket SVG is rotated by CSS for row/column orientation.

## Motion

- creation: one bounded pop and brightness pulse;
- idle: slow aura turn and pulse;
- activation: brief flare using the normal clear timing;
- reduced motion: no looping aura or creation animation; a static bright outline
  remains.

## Procedural sound cues

No external audio files are required. FEATURE-048 adds six Web Audio cues:

```text
specialCreate, rocket, bomb, raven, prism, specialCombo
```

The sounds follow the existing prototype mix:

- Rocket: fast rising metallic sweep;
- Rune: low descending impact;
- Raven: descending spectral call;
- Prism: bright four-note shimmer;
- Combo: wider layered chord;
- Creation: short ascending reveal.

Effects remain below the existing gain limit and respect mute/effects volume.
