import { getCueDefinition, type AudioCue } from './AudioCues';
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
  private musicNodes: OscillatorNode[] = [];
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
        void this.context.suspend();
      } else if (this.activated) {
        void this.context.resume();
      }
    });
  }

  updateSettings(patch: Partial<AudioSettings>): AudioSettings {
    const next = this.settingsStore.update(patch);
    this.applyVolumes();
    if (this.activated && !next.muted && next.musicVolume > 0) this.startMusic();
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

  private ensureContext(): AudioContext | null {
    if (this.context) return this.context;
    const Context = this.hostWindow.AudioContext ?? this.hostWindow.webkitAudioContext;
    if (!Context) return null;

    this.context = new Context();
    this.effectsGain = this.context.createGain();
    this.musicGain = this.context.createGain();
    this.effectsGain.connect(this.context.destination);
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
      muted ? 0 : this.settings.musicVolume * 0.18,
      now,
      0.12,
    );
  }

  private startMusic(): void {
    if (!this.context || !this.musicGain || this.musicNodes.length > 0) return;

    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 520;
    filter.Q.value = 0.7;
    filter.connect(this.musicGain);

    const frequencies = [55, 82.5, 110];
    this.musicNodes = frequencies.map((frequency, index) => {
      const oscillator = this.context!.createOscillator();
      const voiceGain = this.context!.createGain();
      oscillator.type = index === 1 ? 'triangle' : 'sine';
      oscillator.frequency.value = frequency;
      oscillator.detune.value = index === 2 ? -7 : index * 4;
      voiceGain.gain.value = index === 0 ? 0.6 : 0.22;
      oscillator.connect(voiceGain);
      voiceGain.connect(filter);
      oscillator.start();
      return oscillator;
    });
  }
}
