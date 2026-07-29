# FEATURE-056A — Room Lock Icon Fix

## Objective

Fix the visually split lock shown on closed room cards.

## Changes

- add `src/assets/ui/room-lock.svg`;
- import and preload it in `GameApp.ts`;
- render one SVG image instead of an empty span and CSS pseudo-elements;
- remove `.room-card-lock::before` and `.room-card-lock::after`;
- add regression coverage for the asset and presentation contract.

## Acceptance

- closed room cards show a recognisable complete padlock;
- the shackle is above the body;
- no square/arc inversion is visible in StackBlitz, GitHub Pages, or iPhone PWA;
- open room cards show no lock;
- room unlocking behaviour and saves remain unchanged.
