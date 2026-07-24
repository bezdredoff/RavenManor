# Screen Composition Specifications

## Home

**Primary focal point:** Raven Manor exterior or interior doorway key art.

Layer order:

1. atmospheric full-screen background;
2. Raven Manor wordmark and raven/rose emblem;
3. primary Play button;
4. compact navigation for Manor, Story, and Settings;
5. subtle current-progress or continuation prompt.

Do not show implementation notes or vertical-slice disclaimers in the player UI.

## Level selection

Use grouped chapter panels or a vertical journey path.

Each level node/card must show:

- level number;
- best stars;
- difficulty only when useful;
- objective preview on selection rather than dense permanent text;
- clear available, completed, selected, and locked states.

The first screenful should expose the three currently available levels without
requiring scrolling.

## Match-3

Vertical order:

1. compact top navigation;
2. objective and moves HUD on one visual plane;
3. optional non-blocking tutorial strip;
4. board as the dominant central element;
5. hint/restart or future booster controls near the bottom safe area.

The board should use roughly 88–96% of the usable mobile width while also
respecting the remaining viewport height. It must remain the largest
high-contrast object and must not force document scrolling.

Star thresholds should be represented by a compact progress/ruler treatment,
not a long explanatory sentence during play.

## Manor overview

Use a navigable manor composition rather than a list of identical cards.
For the vertical slice, an illustrated vertical stack of room thumbnails is
acceptable if it communicates spatial progression.

Room states:

- locked: dark veil plus authored lock/seal;
- available: normal artwork and subtle active edge;
- in progress: visible restoration fraction;
- complete: warm frame and completed emblem.

## Room detail

The room image is the primary content.

Recommended composition:

1. room title/top navigation;
2. 3:2 or 16:10 stage artwork;
3. restoration milestone strip;
4. current task cards;
5. compact route back to level selection.

Completing a task should first reveal the visual change, then update supporting
text and controls.

## Story

Use visual-novel layout:

- location backdrop;
- one or two character portraits;
- lower dialogue panel;
- speaker plaque;
- advance area covering the dialogue panel rather than a small isolated button.

Short scenes may remain modal, but the modal should visually fill the mobile
frame and feel like a scene rather than a confirmation dialog.

## Settings

Use grouped setting rows. Future controls:

- tutorial guidance;
- music volume;
- SFX volume;
- reduced motion;
- high-contrast assistance;
- language.

Destructive actions such as resetting progress belong in a separated danger
section and must not visually compete with everyday settings.

## Win and loss

### Win

- star reveal as the focal event;
- clear newly earned amount;
- primary Continue/Levels action;
- Manor action when enough stars exist for restoration;
- replay only as a secondary mastery action.

### Loss

- clear reason and remaining objective;
- primary Retry action;
- secondary Choose another level action;
- avoid punitive or alarming visual treatment in the first ten levels.


## Match-3 board composition (FEATURE-040)

The board is the dominant visual object and must remain square and fully visible.
Its frame may use ornamental corners and a subtle central sigil, but decoration
must never overlap a tile hit area. The objective uses the same authored tile
asset as the board rather than a separate emoji or icon.

At 320 × 568 the priority order is:

1. compact top bar;
2. objective and moves;
3. square 8×8 board;
4. hint and restart actions.

Transient feedback appears inside the board frame so it does not increase screen
height. A tutorial banner reduces board size rather than creating page scroll.

## Manor and story implementation (FEATURE-041)

Room overview cards use a wide authored crop with copy below it. Locked cards
retain the room silhouette under a dark veil and CSS lock, while restored cards
receive a warmer edge. Room detail uses a fixed 16:9 scene, overlaid stage copy,
and the existing three-step milestone strip.

Story uses a portrait backdrop plus a transparent character layer. The artwork
occupies the upper portion of the modal and dialogue remains in a dedicated
lower panel. At short viewport heights the story card scrolls internally; the
browser document never scrolls.
