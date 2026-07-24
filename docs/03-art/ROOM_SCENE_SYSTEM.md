# Room Scene System

## Purpose

Raven Manor represents every room as a sequence of authored visual states. The
state is selected by restoration progress; UI code never derives a room image
from stars or level numbers.

```text
completed restoration tasks
        ↓
RoomVisualState
        ↓
stable assetKey
        ↓
roomPresentation asset resolver
        ↓
authored scene SVG / future production illustration
```

## Vertical-slice content

Five rooms each contain four scenes:

- state 0 — cold, ruined, obstructed;
- state 1 — the space becomes accessible;
- state 2 — the room's functional centre is restored;
- state 3 — warm focal reveal and narrative clue.

The integrated SVG scenes are intentionally replaceable prototypes. Their
composition, progression, colour temperature, and stable file slots are the
contract for later painterly production art.

## Visual language

All rooms follow Romantic Gothic Restoration:

- plum-black architecture and moon-silver edges;
- controlled antique-gold highlights;
- cold stage-zero colour and progressively warmer restored states;
- one immediately readable focal object per restoration step;
- ornamental framing shared by all five environments;
- no emoji or unrelated icon substitutes in player-facing room art.

## Mobile composition

Room detail art uses a 16:9 viewport. Essential focal objects stay inside the
central 80% safe area so the same source can be cropped on room cards without
losing the restoration change.

Room lists and room details use contained scrolling. The browser document itself
must remain fixed, and every open room card remains a touch-safe target.

## Asset replacement rule

Production art may replace any file under `src/assets/rooms`, but must preserve:

- the current asset-key mapping;
- the room and stage meaning;
- a readable mobile crop;
- consistent lighting progression;
- SVG or optimised web-image delivery compatible with Vite.
