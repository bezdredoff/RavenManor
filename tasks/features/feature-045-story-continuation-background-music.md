# FEATURE-045 — Story continuation and background music

## Problem

First-playtest follow-up identified two issues:

1. A story scene opened from the victory modal closed back onto the already
   completed board instead of continuing the level flow.
2. The original procedural ambience was so static and quiet that players heard
   effects but did not perceive background music.

## Behaviour

### Post-win story

- The victory modal still calculates the next playable level once.
- Opening its story scene passes that result into the story flow.
- Continuing the scene starts that level directly.
- When there is no next available level, continuing opens the level map.
- Stories opened from Home still close normally.

### Music

- Start after the first pointer or keyboard gesture.
- Play a simple looping D-minor theme with melody and harmony.
- Keep music below effects at default volume.
- Stop scheduled music when muted, set to zero, or the page becomes hidden.
- Restart from the first phrase through `Проверить музыку`.
- Remain fully playable when Web Audio is unsupported.

## Acceptance criteria

- the completed board is never revealed after continuing a post-win story;
- the correct next unlocked unfinished level starts;
- final-level story continuation opens the level map;
- Home story continuation only closes the modal;
- background music is recognisable as music on phone speakers;
- music and effects sliders remain independent and persistent;
- `npm test` and `npm run build` pass;
- Home and Match-3 retain no-document-scroll behaviour at `320 × 568`.
