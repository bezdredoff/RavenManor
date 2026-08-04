# Raven Manor UI Design System

## Purpose

This system translates the Romantic Gothic Restoration direction into reusable
mobile UI primitives. It is the required baseline for all screens added after
FEATURE-039.

## Product constraints

- portrait-first mobile layout;
- primary QA range: 320–430 CSS pixels wide;
- Home and Match-3 do not vertically scroll;
- content-heavy screens use one contained scroll region;
- controls use at least a 44 px target, except dense board cells;
- no hover-only actions;
- safe-area insets are respected;
- desktop presents a centred mobile frame instead of stretching the UI;
- page gestures on the board never scroll the document.

## Tokens

Tokens live in `src/ui/design-system.css`.

### Colour roles

- Night — application background;
- Ink/Panel — cards and raised surfaces;
- Wine/Rose — active gothic accent;
- Antique Gold — progression, rewards, and focus;
- Parchment — primary readable text;
- Moon Silver — secondary controls and labels.

Colour must communicate hierarchy, not replace text or icon meaning.

### Typography

- Display: Georgia-compatible serif stack for titles and the Raven Manor mood;
- UI: system sans-serif stack for controls, counters, small labels, and dense
  information;
- body copy is never smaller than 11 px in the 320 px QA viewport;
- interactive labels remain readable without relying on all-caps text.

### Spacing and shape

- spacing scale: 4, 8, 12, 16, 20, 24, 32 px;
- standard control radius: 16 px;
- panels: 16–28 px depending on prominence;
- pills are reserved for resources, statuses, and compact badges;
- primary screens should use few large surfaces rather than many nested cards.

## Components

### Top bar

- one 44 px back target;
- centred single-line title;
- compact available-star resource;
- sticky only on contained-scroll screens.

### Buttons

- Primary: progression or confirmation;
- Secondary: alternate useful action;
- Ghost: navigation, reset, or low-priority action;
- one primary action per local decision group;
- active feedback must work for touch, not only hover.

FEATURE-069 adds shared control-surface tokens instead of screen-local button
palettes. Primary, secondary, ghost and icon buttons use the same depth,
bottom-edge brass glint, focus, pressed and disabled grammar. Compact controls
remain at least `--touch-target` (44 px) tall outside the Match-3 board.

### Selection and locked states

- selected tabs, pressed toggles and active boosters use a gold border plus a
  restrained wine/plum surface;
- selection must also be exposed through `aria-selected` or `aria-pressed`;
- disabled controls use the shared disabled surface and retain readable text;
- locked cards and controls are desaturated and dimmed consistently, but must
  not reveal future restoration artwork;
- journal room navigation uses `tablist`, `tab`, and `tabpanel` semantics.

### Cards

- room cards prioritise title and state;
- level cards prioritise level number, stars, and Play;
- restoration cards use a numbered/completed status and one cost action;
- cards must not require hover to expose information.

### Modal

- constrained to the visual viewport;
- content scrolls inside the modal when necessary;
- safe-area padding is applied;
- critical action remains easy to reach with one hand.

Generic modal cards and toast notifications share the plum surface, brass line,
gold detail and restrained diamond ornament. Story modals keep the approved
FEATURE-066 composition and are excluded from the generic corner ornament.

## Accessibility

- minimum 44 px non-board controls;
- visible keyboard focus ring;
- `prefers-reduced-motion` support;
- icons and colour states include text or accessible names;
- gameplay tile buttons expose row, column, and tile name to assistive tech;
- selected tiles have outline and brightness change, not colour alone.

## Deferred to later features

FEATURE-039 keeps current emoji/content placeholders. FEATURE-040 replaces
board assets and adds gameplay motion. FEATURE-041 replaces room and story
placeholders. This separation prevents visual asset production from becoming a
prerequisite for the layout system.

FEATURE-069 does not redesign meta-screen composition, win/fail presentation or
the gameplay HUD. Those remain FEATURE-070, FEATURE-071 and FEATURE-072.
