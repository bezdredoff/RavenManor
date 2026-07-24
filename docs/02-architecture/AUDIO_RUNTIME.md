# Audio Runtime

## Purpose

FEATURE-043 adds a small Web Audio presentation layer without coupling audio to
Match-3 rules, progression, saves, or CSS animation callbacks.

## Modules

- `src/audio/AudioSettings.ts` owns persisted mute/music/effects settings.
- `src/audio/AudioCues.ts` maps semantic events to short synthesised cues.
- `src/audio/AudioManager.ts` owns the browser `AudioContext`, category gains,
  procedural ambience, autoplay activation, and page-visibility suspension.

The audio preference key is:

```text
ravenManorAudioV1
```

It is intentionally separate from `ravenManorStateV4`. Resetting game progress
must not reset accessibility or audio preferences.

## Autoplay policy

Browsers normally prohibit audio before user interaction. `AudioManager.arm()`
listens for the first pointer or keyboard action and then activates the audio
context. No startup error or blocked promise should be presented to the player.

When Web Audio is unavailable, Settings displays `Звук недоступен` and disables
all audio controls. Gameplay remains fully functional.

## Categories

- **Music** — a very quiet three-voice Romantic Gothic ambience.
- **Effects** — UI, selection, swap, invalid move, match, cascade, hint,
  reshuffle, results, restoration, unlock, and narrative cues.

Both category values use the inclusive `0..1` range. Incoming persisted values
are clamped before use.

## Performance and safety

- no downloaded audio assets;
- one persistent ambient oscillator group after activation;
- short effects create nodes that stop themselves;
- effects have conservative gain values;
- the context suspends while the page is hidden;
- audio never controls gameplay timing;
- missing or unsupported audio never blocks input.

## Production replacement

The semantic cue API is the stable contract. A future audio team may replace
procedural cues with licensed or authored files while keeping calls such as:

```ts
audio.play('match');
audio.play('restore');
audio.play('story');
```
