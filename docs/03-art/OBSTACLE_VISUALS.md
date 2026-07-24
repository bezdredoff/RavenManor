# Obstacle visual and audio direction

## Shared direction

Obstacle art follows Romantic Gothic Restoration: readable silhouettes, muted
stone and silver values, warm gold accents, and no gore or horror imagery.
All assets are prototype-ready transparent SVGs at a 128×128 view box.

## Chain

- silver links with a diagonal warm highlight;
- remains readable over every tile colour;
- locked appearance without covering the complete base silhouette.

## Rubble

- dark architectural stone rather than wooden boxes;
- asymmetrical profile so repeated blockers do not look like UI buttons;
- occupies the whole cell because no tile exists underneath.

## Fog

- cold blue-grey translucent cloud;
- underlying tile remains faintly visible;
- slow CSS drift is disabled by `prefers-reduced-motion`.

## Double layers

A small `2` badge communicates remaining layers. The prototype avoids separate
art files for every layer to keep production scalable.

## Procedural sound cues

- `chainBreak`: short metallic descending strike;
- `rubbleBreak`: low stone impact;
- `fogClear`: soft ascending airy tone.

All cues use the existing Web Audio effects volume and mute settings. No binary
audio assets are required for this prototype phase.
