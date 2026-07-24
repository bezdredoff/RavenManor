# Responsive Regression

## Supported vertical slice matrix

Every release candidate is checked at:

| Viewport | Profile | Purpose |
|---|---|---|
| 320 × 568 | compact | minimum-height and minimum-width stress test |
| 360 × 800 | standard | common Android portrait |
| 390 × 844 | standard | modern iPhone portrait |
| 430 × 932 | standard | large phone portrait |

`src/ui/responsivePolicy.ts` owns this matrix and the compact-profile rule.
The runtime uses `visualViewport` when available, so browser chrome and mobile
keyboard resizing do not rely only on the layout viewport.

## Locked screens

Home and Match-3 must fit inside one visual viewport and must not scroll the
browser document. Match-3 gestures use the board rather than page navigation.

## Contained-scroll screens

Levels, Manor, Room, and Settings may scroll only inside `.screen`. The outer
app shell and browser document remain fixed.

## Priority when vertical space is limited

1. preserve a usable complete board;
2. preserve objective, moves, and primary actions;
3. reduce decorative spacing and hero artwork;
4. reduce secondary copy;
5. never create hidden required actions below an accidental document scroll.

## Safe areas and inputs

- top, right, bottom, and left safe-area insets are applied;
- normal controls target at least 44 px;
- range inputs have a 44 px interaction row;
- no feature depends on hover;
- keyboard focus remains visible;
- modal overflow stays inside the modal card.
