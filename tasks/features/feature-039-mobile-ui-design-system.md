# FEATURE-039 — Mobile-first UI design system

## Status

In Review

## Goal

Apply one reusable Romantic Gothic UI system and make the core experience fit
portrait phones without unnecessary document scrolling.

## Scope

- shared visual tokens;
- touch-safe button and icon-button primitives;
- mobile viewport and safe-area shell;
- explicit locked/contained screen scroll policy;
- redesigned Home, top bar, cards, wallet, settings, and modal shells;
- compact Match-3 HUD and viewport-fitted board;
- centred desktop mobile preview;
- accessibility labels and reduced-motion fallback;
- documentation and tests for layout policy.

## Out of Scope

- final authored icons;
- final tile artwork;
- room artwork;
- swap/fall/VFX animation;
- audio;
- landscape-specific game layout.

## Acceptance Criteria

- Home does not vertically scroll at 320×568 and larger;
- Match-3 does not vertically scroll at 320×568 and larger;
- tutorial mode remains usable without document scrolling;
- board gestures do not scroll the page;
- content-heavy screens use contained scrolling;
- normal interactive controls are at least 44 px;
- safe-area insets are applied;
- desktop does not stretch wider than the mobile frame;
- no interaction depends only on hover;
- modals stay within the viewport and scroll internally;
- existing gameplay, progression, tutorial, and saves remain unchanged;
- `npm test` and `npm run build` pass.

## Manual Test

1. Test Home at 320×568 and confirm every action is visible without scrolling.
2. Open level 1 and confirm objective, moves, board, and both actions fit.
3. Enable tutorial and confirm the smaller board still fits without page scroll.
4. Drag a finger across the board and confirm the page does not move.
5. Check 360×800, 390×844, and 430×932.
6. Open level selection and confirm only its content area scrolls.
7. Open a long room screen and confirm its top bar remains reachable.
8. Open story/win/settings modals and confirm overflow stays inside the modal.
9. Test a desktop viewport and confirm the app is centred as a phone frame.
