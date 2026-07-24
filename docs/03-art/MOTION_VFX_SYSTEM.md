# Motion and VFX System

## Direction

Motion supports the Romantic Gothic Restoration direction. It should feel
controlled, elegant, and slightly supernatural rather than loud or arcade-like.

The visual vocabulary is:

- antique-gold glints for rewards and restoration;
- rose-coloured sparks for rose matches;
- candle sparks for warm match feedback;
- moon-silver mist for failure;
- pale violet feather/petal shapes for room unlocks;
- restrained camera drift for narrative scenes.

## Timing hierarchy

| Event | Target timing | Character |
|---|---:|---|
| Button/tile response | 90–150 ms | immediate |
| Swap | 150 ms | readable, not floaty |
| Invalid rejection | about 190 ms | clear and brief |
| Match clear | about 230 ms | bright release |
| Tile settle | about 170 ms | soft weighted landing |
| Screen/modal entry | 220–240 ms | polished navigation |
| Reshuffle | about 460 ms | unusual board event |
| Room restoration | about 1180 ms | major metagame reward |

## Match-3 feedback

- Swapped symbols visibly travel between adjacent cells.
- An invalid swap returns to the original board state rather than teleporting.
- Matched tiles brighten, dissolve, and emit colour-related sparks.
- Cascades receive a stronger central label and a board pulse.
- Settling is shorter than clearing so the board quickly becomes playable.
- Hint pulse remains noticeable but does not move the entire board.

## Room restoration

The restored image is placed underneath the previous image. The reveal uses:

1. a brief antique-gold light sweep;
2. the previous state fading and lifting away;
3. small glints, dust, or feather-like particles;
4. a compact task-complete label;
5. an additional unlock line when a new room becomes available.

The animation must not hide the restoration task list or change scroll position.

## Results

Win:

- gold emblem;
- star award entrance;
- a bounded shower of gold glints.

Loss:

- moon-silver emblem;
- slow mist rather than a harsh red failure flash;
- immediate access to Retry and Level Map.

## Story presentation

- backdrop receives a very slow restrained push-in;
- portrait and nameplate enter separately;
- dialogue appears last;
- interaction remains available as soon as the modal is shown;
- repeated camera loops are not used.

## Reduced motion

With reduced motion:

- no particles are generated;
- no swap travel, camera zoom, pulse, confetti, mist, or restoration sweep runs;
- the new room stage appears immediately with the completion label;
- modals and screens appear without movement;
- no information depends on animation alone.
