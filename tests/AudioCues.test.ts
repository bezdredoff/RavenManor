import { describe, expect, it } from 'vitest';
import { getCueDefinition, type AudioCue } from '../src/audio/AudioCues';

const cues: AudioCue[] = [
  'ui', 'select', 'hint', 'swap', 'invalid', 'match', 'cascade',
  'reshuffle', 'win', 'loss', 'restore', 'unlock', 'story',
];

describe('audio cue definitions', () => {
  it('defines a short synthesised cue for every gameplay event', () => {
    for (const cue of cues) {
      const definition = getCueDefinition(cue);
      expect(definition.frequencies.length).toBeGreaterThan(0);
      expect(definition.durationMs).toBeGreaterThan(0);
      expect(definition.durationMs).toBeLessThanOrEqual(800);
      expect(definition.gain).toBeGreaterThan(0);
      expect(definition.gain).toBeLessThanOrEqual(.12);
    }
  });
});
