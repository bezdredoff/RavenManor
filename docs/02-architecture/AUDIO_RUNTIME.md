# Audio Runtime

## Purpose

The audio layer is independent from Match-3 rules, progression, saves, and CSS
animation callbacks. FEATURE-045 replaces the original near-static ambience
with a clearly audible but restrained looping background theme.

## Modules

- `src/audio/AudioSettings.ts` owns persisted mute/music/effects settings.
- `src/audio/AudioCues.ts` maps semantic events to short synthesised cues.
- `src/audio/MusicTheme.ts` defines the tempo, harmony, melody, and loop
  validation for the background theme.
- `src/audio/AudioManager.ts` owns the browser `AudioContext`, category gains,
  music scheduling, autoplay activation, and page-visibility suspension.

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

- **Music** — a 16-beat D-minor loop at 72 BPM with four soft chord beds and a
  sparse nine-note melody.
- **Effects** — UI, selection, swap, invalid move, match, cascade, hint,
  reshuffle, results, restoration, unlock, and narrative cues.

Both category values use the inclusive `0..1` range. Incoming persisted values
are clamped before use.

## Music scheduler

The complete theme lasts roughly 13.3 seconds. The scheduler places the next
loop shortly before it is required rather than running a large permanent music
engine. Each transient oscillator owns an envelope and stops itself.

The music signal uses:

- sine chord voices;
- sparse sine/triangle melody notes;
- a low-pass filter;
- a short low-feedback delay;
- a separate music gain below the effects mix.

Muting music, setting its volume to zero, or hiding the page stops scheduled
music nodes. Returning to the page or restoring music volume starts the theme
again from its beginning.

## Verification controls

Settings provides separate actions for:

- `Проверить музыку` — restarts the loop from its first phrase;
- `Проверить эффекты` — plays the match cue.

These actions make it possible to distinguish browser autoplay restrictions,
music volume, and effects volume during device testing.

## Performance and safety

- no downloaded audio assets;
- one lightweight scheduling timer while music is active;
- all music and effect nodes stop themselves;
- conservative category and per-note gains;
- the context suspends while the page is hidden;
- audio never controls gameplay timing;
- missing or unsupported audio never blocks input.

## Production replacement

The semantic cue API and `MusicTheme` data are stable contracts. A future audio
team may replace procedural synthesis with authored or licensed files while
keeping calls such as:

```ts
audio.play('match');
audio.play('restore');
audio.play('story');
```
