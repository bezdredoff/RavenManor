import { getCueDefinition, type AudioCue } from './AudioCues';
import {
  RAVEN_MANOR_THEME,
  getBeatDurationSeconds,
  getMusicLoopDurationSeconds,
} from './MusicTheme';
import {
  AudioSettingsStore,
  type AudioSettings,
} from './AudioSettings';

type AudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

export class AudioManager {
  private context: AudioContext | null = null;
  private effectsGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicInput: GainNode | null = null;
  private musicScheduleId: number | null = null;
  private nextMusicLoopAt = 0;
  private readonly scheduledMusicNodes = new Set<OscillatorNode>();
  private armed = false;
  private activated = false;

  constructor(
    private readonly settingsStore = new AudioSettingsStore(),
    private readonly hostWindow: AudioWindow = window as AudioWindow,
  ) {}

  get settings(): AudioSettings {
    return this.settingsStore.settings;
  }

  get supported(): boolean {
    return Boolean(this.hostWindow.AudioContext ?? this.hostWindow.webkitAudioContext);
  }

  arm(): void {
    if (this.armed) return;
    this.armed = true;
    const activate = () => {
      void this.activate();
      this.hostWindow.removeEventListener('pointerdown', activate);
      this.hostWindow.removeEventListener('keydown', activate);
    };
    this.hostWindow.addEventListener('pointerdown', activate, { once: true });
    this.hostWindow.addEventListener('keydown', activate, { once: true });
    this.hostWindow.document.addEventListener('visibilitychange', () => {
      if (!this.context) return;
      if (this.hostWindow.document.hidden) {
        this.stopMusic();
        void this.context.suspend();
      } else if (this.activated) {
        void this.context.resume().then(() => this.startMusic());
      }
    });
  }

  updateSettings(patch: Partial<AudioSettings>): AudioSettings {
    const next = this.settingsStore.update(patch);
    this.applyVolumes();
    if (next.muted || next.musicVolume <= 0) {
      this.stopMusic();
    } else if (this.activated) {
      this.startMusic();
    }
    return next;
  }

  async activate(): Promise<void> {
    const context = this.ensureContext();
    if (!context) return;
    this.activated = true;
    if (context.state === 'suspended') await context.resume();
    this.applyVolumes();
    this.startMusic();
  }

  play(cue: AudioCue): void {
    if (this.settings.muted || this.settings.effectsVolume <= 0) return;
    const context = this.ensureContext();
    if (!context) return;
    this.activated = true;
    if (context.state === 'suspended') void context.resume();

    const definition = getCueDefinition(cue);
    const now = context.currentTime;
    const noteLength = definition.durationMs / 1000 / definition.frequencies.length;

    definition.frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = now + index * noteLength * 0.72;
      const end = start + Math.max(0.045, noteLength * 1.12);
      oscillator.type = definition.wave;
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(definition.gain, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      oscillator.connect(gain);
      gain.connect(this.effectsGain!);
      oscillator.start(start);
      oscillator.stop(end + 0.02);
    });
  }

  previewEffects(): void {
    void this.activate().then(() => this.play('match'));
  }

  previewMusic(): void {
    void this.activate().then(() => {
      this.stopMusic();
      this.startMusic();
    });
  }

  private ensureContext(): AudioContext | null {
    if (this.context) return this.context;
    const Context = this.hostWindow.AudioContext ?? this.hostWindow.webkitAudioContext;
    if (!Context) return null;

    this.context = new Context();
    this.effectsGain = this.context.createGain();
    this.musicGain = this.context.createGain();
    this.musicInput = this.context.createGain();

    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1800;
    filter.Q.value = 0.8;

    const delay = this.context.createDelay(0.8);
    const feedback = this.context.createGain();
    delay.delayTime.value = 0.32;
    feedback.gain.value = 0.16;

    this.effectsGain.connect(this.context.destination);
    this.musicInput.connect(filter);
    filter.connect(this.musicGain);
    filter.connect(delay);
    delay.connect(this.musicGain);
    delay.connect(feedback);
    feedback.connect(delay);
    this.musicGain.connect(this.context.destination);
    this.applyVolumes();
    return this.context;
  }

  private applyVolumes(): void {
    if (!this.context || !this.effectsGain || !this.musicGain) return;
    const now = this.context.currentTime;
    const muted = this.settings.muted;
    this.effectsGain.gain.setTargetAtTime(
      muted ? 0 : this.settings.effectsVolume,
      now,
      0.025,
    );
    this.musicGain.gain.setTargetAtTime(
      muted ? 0 : this.settings.musicVolume * 0.56,
      now,
      0.12,
    );
  }

  private startMusic(): void {
    if (!this.context || !this.musicInput) return;
    if (this.settings.muted || this.settings.musicVolume <= 0) return;
    if (this.musicScheduleId !== null) return;

    this.nextMusicLoopAt = this.context.currentTime + 0.06;
    this.scheduleMusicAhead();
    this.musicScheduleId = this.hostWindow.setInterval(
      () => this.scheduleMusicAhead(),
      750,
    );
  }

  private stopMusic(): void {
    if (this.musicScheduleId !== null) {
      this.hostWindow.clearInterval(this.musicScheduleId);
      this.musicScheduleId = null;
    }
    for (const oscillator of this.scheduledMusicNodes) {
      try {
        oscillator.stop();
      } catch {
        // The node may already have ended; stopping music must remain harmless.
      }
    }
    this.scheduledMusicNodes.clear();
    this.nextMusicLoopAt = 0;
  }

  private scheduleMusicAhead(): void {
    if (!this.context || !this.musicInput || this.context.state !== 'running') return;
    if (this.settings.muted || this.settings.musicVolume <= 0) return;

    const scheduleHorizon = this.context.currentTime + 2.2;
    const loopDuration = getMusicLoopDurationSeconds(RAVEN_MANOR_THEME);
    while (this.nextMusicLoopAt < scheduleHorizon) {
      this.scheduleThemeLoop(this.nextMusicLoopAt);
      this.nextMusicLoopAt += loopDuration;
    }
  }

  private scheduleThemeLoop(loopStart: number): void {
    if (!this.context || !this.musicInput) return;
    const beatDuration = getBeatDurationSeconds(RAVEN_MANOR_THEME.bpm);

    for (const chord of RAVEN_MANOR_THEME.harmony) {
      const voiceGain = chord.gain / Math.sqrt(chord.frequencies.length);
      for (const frequency of chord.frequencies) {
        this.scheduleMusicTone({
          frequency,
          start: loopStart + chord.beat * beatDuration,
          duration: chord.durationBeats * beatDuration,
          gain: voiceGain,
          wave: 'sine',
          attack: 0.42,
          release: 0.7,
        });
      }
    }

    for (const note of RAVEN_MANOR_THEME.melody) {
      this.scheduleMusicTone({
        frequency: note.frequency,
        start: loopStart + note.beat * beatDuration,
        duration: note.durationBeats * beatDuration,
        gain: note.gain,
        wave: note.wave,
        attack: 0.025,
        release: 0.28,
      });
    }
  }

  private scheduleMusicTone(options: Readonly<{
    frequency: number;
    start: number;
    duration: number;
    gain: number;
    wave: OscillatorType;
    attack: number;
    release: number;
  }>): void {
    if (!this.context || !this.musicInput) return;
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();
    const end = options.start + options.duration;
    const attackEnd = Math.min(end - 0.02, options.start + options.attack);
    const releaseStart = Math.max(attackEnd, end - options.release);

    oscillator.type = options.wave;
    oscillator.frequency.setValueAtTime(options.frequency, options.start);
    envelope.gain.setValueAtTime(0.0001, options.start);
    envelope.gain.exponentialRampToValueAtTime(options.gain, attackEnd);
    envelope.gain.setValueAtTime(options.gain, releaseStart);
    envelope.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(envelope);
    envelope.connect(this.musicInput);
    this.scheduledMusicNodes.add(oscillator);
    oscillator.addEventListener('ended', () => this.scheduledMusicNodes.delete(oscillator), { once: true });
    oscillator.start(options.start);
    oscillator.stop(end + 0.03);
  }
}
