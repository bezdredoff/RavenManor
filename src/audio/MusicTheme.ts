export type MusicWave = 'sine' | 'triangle';

export type MusicNoteEvent = Readonly<{
  beat: number;
  durationBeats: number;
  frequency: number;
  gain: number;
  wave: MusicWave;
}>;

export type MusicChordEvent = Readonly<{
  beat: number;
  durationBeats: number;
  frequencies: readonly number[];
  gain: number;
}>;

export type MusicTheme = Readonly<{
  bpm: number;
  beatsPerLoop: number;
  melody: readonly MusicNoteEvent[];
  harmony: readonly MusicChordEvent[];
}>;

/**
 * A short D-minor theme for the prototype. It is intentionally sparse so that
 * match feedback remains more important than the music on phone speakers.
 */
export const RAVEN_MANOR_THEME: MusicTheme = {
  bpm: 72,
  beatsPerLoop: 16,
  harmony: [
    { beat: 0, durationBeats: 4, frequencies: [146.83, 220, 293.66], gain: 0.042 },
    { beat: 4, durationBeats: 4, frequencies: [116.54, 174.61, 233.08], gain: 0.038 },
    { beat: 8, durationBeats: 4, frequencies: [98, 146.83, 196], gain: 0.038 },
    { beat: 12, durationBeats: 4, frequencies: [110, 164.81, 220, 277.18], gain: 0.04 },
  ],
  melody: [
    { beat: 0, durationBeats: 1.25, frequency: 293.66, gain: 0.13, wave: 'triangle' },
    { beat: 2, durationBeats: 0.8, frequency: 349.23, gain: 0.11, wave: 'triangle' },
    { beat: 3, durationBeats: 1.2, frequency: 440, gain: 0.12, wave: 'sine' },
    { beat: 5, durationBeats: 0.9, frequency: 349.23, gain: 0.1, wave: 'triangle' },
    { beat: 6.5, durationBeats: 1.4, frequency: 587.33, gain: 0.11, wave: 'sine' },
    { beat: 8.5, durationBeats: 1.1, frequency: 466.16, gain: 0.11, wave: 'triangle' },
    { beat: 10.5, durationBeats: 1, frequency: 392, gain: 0.1, wave: 'triangle' },
    { beat: 12.5, durationBeats: 1.1, frequency: 554.37, gain: 0.11, wave: 'sine' },
    { beat: 14.25, durationBeats: 1.35, frequency: 440, gain: 0.11, wave: 'triangle' },
  ],
};

export function getBeatDurationSeconds(bpm: number): number {
  if (!Number.isFinite(bpm) || bpm <= 0) throw new Error('Music BPM must be positive.');
  return 60 / bpm;
}

export function getMusicLoopDurationSeconds(theme: MusicTheme = RAVEN_MANOR_THEME): number {
  return getBeatDurationSeconds(theme.bpm) * theme.beatsPerLoop;
}

export function validateMusicTheme(theme: MusicTheme): readonly string[] {
  const errors: string[] = [];
  if (!Number.isFinite(theme.bpm) || theme.bpm <= 0) errors.push('bpm');
  if (!Number.isInteger(theme.beatsPerLoop) || theme.beatsPerLoop <= 0) errors.push('beatsPerLoop');

  const events = [
    ...theme.melody.map((event) => ({ ...event, frequencies: [event.frequency] })),
    ...theme.harmony,
  ];

  for (const event of events) {
    if (event.beat < 0 || event.beat >= theme.beatsPerLoop) errors.push('event.beat');
    if (event.durationBeats <= 0 || event.beat + event.durationBeats > theme.beatsPerLoop + 0.001) {
      errors.push('event.durationBeats');
    }
    if (event.gain <= 0 || event.gain > 0.2) errors.push('event.gain');
    if (event.frequencies.some((frequency) => frequency < 40 || frequency > 2000)) {
      errors.push('event.frequency');
    }
  }

  return errors;
}
