# Audio Direction

## Mood

Raven Manor should sound intimate, mysterious, and elegant rather than loud or
aggressive. The reference contrast is the same as the visual direction:

```text
cold abandoned manor → warm restored sanctuary
```

## Prototype music

The prototype uses a deliberately simple D-minor theme:

- 72 BPM;
- four slowly changing harmonies;
- a sparse nine-note melody;
- filtered sine and triangle tones;
- a quiet short echo;
- approximately 13.3 seconds per loop.

It should read as actual background music rather than an unchanging low drone,
while remaining simple enough to replace later without changing game code.

## Prototype sound language

Effects use:

- restrained antique-bell-like UI intervals;
- soft ascending harmony for restoration and victory;
- descending moon-silver tones for loss;
- brighter layered notes for cascades and room unlocks.

No cue should resemble a casino jackpot, alarm, modern notification, or comic
sound effect.

## Mix priorities

1. Match feedback must be audible but short.
2. Invalid moves must be clear without sounding punitive.
3. Cascades and restoration may be richer than ordinary matches.
4. The melody must be audible on phone speakers but remain below effects.
5. Story cues should frame dialogue, not compete with reading.

## Defaults

- music: `28%`;
- effects: `72%`;
- mute: off.

The music bus applies its own conservative scaling after this user setting.
These values remain prototype hypotheses and must be revisited after a device
playtest with headphones and phone speakers.
