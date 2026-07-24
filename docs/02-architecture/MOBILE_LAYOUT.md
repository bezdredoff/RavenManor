# Mobile Layout Architecture

## Viewport shell

`app-shell` owns exactly one visual viewport:

```text
body
└── app-shell (100dvh, maximum width 480px)
    ├── screen
    └── modal overlay
```

The document itself never scrolls. This avoids browser-page movement during
Match-3 input and keeps the desktop version framed like a phone.

## Screen policies

`src/ui/layoutPolicy.ts` is the source of truth.

### Locked

- `home`;
- `game`.

These screens use the current viewport height and must not create vertical page
scroll at 320×568 or larger.

### Contained scroll

- `manor`;
- `levels`;
- `room`;
- `settings`.

These screens scroll inside the `screen` element. Their top bar is sticky and
the browser document remains fixed.

## Dynamic viewport and safe areas

Use `100dvh`, not only `100vh`, because mobile browser chrome changes the visual
viewport. Insets use:

```css
safe-area-inset-top
safe-area-inset-right
safe-area-inset-bottom
safe-area-inset-left
```

## Match-3 fitting

The game screen is a height-constrained CSS grid:

1. top bar;
2. optional tutorial banner;
3. objective and moves HUD;
4. compact star thresholds;
5. square board in the flexible remaining region;
6. bottom actions.

The board scales from both width and available height. During onboarding it can
shrink temporarily so all controls remain visible without scrolling.

The 8×8 board is the documented dense-control exception to the 44 px rule on a
320 px phone. Board interaction remains touch-safe through large contiguous
cells, spacing, selected-state feedback, and `touch-action: none`. All normal
buttons still meet the target requirement.

## QA viewports

Required manual checks:

- 320×568;
- 360×800;
- 390×844;
- 430×932;
- desktop viewport with a centred mobile frame.

At 320×568 verify:

- Home has no vertical scroll;
- gameplay has no vertical scroll;
- all game actions are visible;
- the board remains square;
- tutorial mode still fits;
- dragging/touching the board does not move the page;
- modal content remains reachable.
