export type AudioCue =
  | 'ui'
  | 'select'
  | 'hint'
  | 'swap'
  | 'invalid'
  | 'match'
  | 'cascade'
  | 'reshuffle'
  | 'win'
  | 'loss'
  | 'restore'
  | 'unlock'
  | 'story'
  | 'journalOpen'
  | 'specialCreate'
  | 'rocket'
  | 'bomb'
  | 'raven'
  | 'prism'
  | 'specialCombo'
  | 'chainBreak'
  | 'rubbleBreak'
  | 'fogClear'
  | 'hammer'
  | 'boosterShuffle'
  | 'boosterReward';

export type CueDefinition = Readonly<{
  frequencies: readonly number[];
  durationMs: number;
  gain: number;
  wave: OscillatorType;
}>;

const CUES: Readonly<Record<AudioCue, CueDefinition>> = {
  ui: { frequencies: [440], durationMs: 55, gain: 0.11, wave: 'sine' },
  select: { frequencies: [520], durationMs: 45, gain: 0.08, wave: 'sine' },
  hint: { frequencies: [660, 880], durationMs: 150, gain: 0.09, wave: 'sine' },
  swap: { frequencies: [300, 420], durationMs: 120, gain: 0.08, wave: 'triangle' },
  invalid: { frequencies: [180, 145], durationMs: 170, gain: 0.12, wave: 'sawtooth' },
  match: { frequencies: [520, 650, 780], durationMs: 180, gain: 0.1, wave: 'sine' },
  cascade: { frequencies: [660, 830, 990], durationMs: 240, gain: 0.11, wave: 'triangle' },
  reshuffle: { frequencies: [220, 277, 330], durationMs: 420, gain: 0.08, wave: 'triangle' },
  win: { frequencies: [392, 523, 659, 784], durationMs: 720, gain: 0.11, wave: 'sine' },
  loss: { frequencies: [294, 247, 196], durationMs: 620, gain: 0.08, wave: 'sine' },
  restore: { frequencies: [330, 440, 554, 660], durationMs: 650, gain: 0.1, wave: 'triangle' },
  unlock: { frequencies: [392, 494, 659, 784], durationMs: 800, gain: 0.11, wave: 'sine' },
  story: { frequencies: [262, 392], durationMs: 300, gain: 0.06, wave: 'sine' },
  journalOpen: { frequencies: [220, 330, 494], durationMs: 420, gain: 0.07, wave: 'triangle' },
  specialCreate: { frequencies: [523, 659, 784], durationMs: 320, gain: 0.1, wave: 'sine' },
  rocket: { frequencies: [240, 480, 960], durationMs: 360, gain: 0.1, wave: 'sawtooth' },
  bomb: { frequencies: [147, 98, 73], durationMs: 460, gain: 0.12, wave: 'triangle' },
  raven: { frequencies: [740, 620, 470], durationMs: 420, gain: 0.09, wave: 'triangle' },
  prism: { frequencies: [392, 587, 880, 1175], durationMs: 560, gain: 0.1, wave: 'sine' },
  specialCombo: { frequencies: [196, 392, 659, 988], durationMs: 680, gain: 0.12, wave: 'triangle' },
  chainBreak: { frequencies: [310, 245, 190], durationMs: 230, gain: 0.11, wave: 'square' },
  rubbleBreak: { frequencies: [135, 92, 64], durationMs: 330, gain: 0.12, wave: 'triangle' },
  fogClear: { frequencies: [420, 560, 740], durationMs: 390, gain: 0.07, wave: 'sine' },
  hammer: { frequencies: [210, 135, 420], durationMs: 300, gain: 0.12, wave: 'triangle' },
  boosterShuffle: { frequencies: [277, 370, 494, 659], durationMs: 470, gain: 0.09, wave: 'triangle' },
  boosterReward: { frequencies: [523, 659, 784, 1047], durationMs: 620, gain: 0.1, wave: 'sine' },
};

export function getCueDefinition(cue: AudioCue): CueDefinition {
  return CUES[cue];
}
