export type SfxKey =
  | 'fire'
  | 'fire_spread'
  | 'hit_enemy'
  | 'hit_player'
  | 'explosion_sm'
  | 'explosion_lg'
  | 'powerup'
  | 'bomb'
  | 'combo_up'
  | 'boss_enter'
  | 'boss_phase'
  | 'boss_death'
  | 'menu_select'
  | 'game_over';

export type MusicTrack = 'menu' | 'gameplay' | 'boss' | 'gameover';

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private muted = false;
  musicVolume = 0.4;
  private sfxVolume = 0.7;
  private currentMusic: MusicTrack | null = null;
  private musicNodes: AudioNode[] = [];
  private fadeInterval: ReturnType<typeof setInterval> | null = null;

  init(): void {
    // Defer AudioContext creation until first user interaction
  }

  private ensureContext(): AudioContext | null {
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.8;
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this.sfxVolume;
        this.sfxGain.connect(this.masterGain);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = this.musicVolume;
        this.musicGain.connect(this.masterGain);
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playSfx(key: SfxKey, volume?: number): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    const vol = volume ?? 1;
    const gain = ctx.createGain();
    gain.gain.value = vol;
    gain.connect(this.sfxGain);

    switch (key) {
      case 'fire': this.synthLaser(ctx, gain, 800, 0.06); break;
      case 'fire_spread': this.synthLaser(ctx, gain, 600, 0.08); break;
      case 'hit_enemy': this.synthHit(ctx, gain, 300, 0.06); break;
      case 'hit_player': this.synthHit(ctx, gain, 150, 0.12); break;
      case 'explosion_sm': this.synthExplosion(ctx, gain, 0.2, 200); break;
      case 'explosion_lg': this.synthExplosion(ctx, gain, 0.4, 120); break;
      case 'powerup': this.synthPowerUp(ctx, gain); break;
      case 'bomb': this.synthBomb(ctx, gain); break;
      case 'combo_up': this.synthCombo(ctx, gain); break;
      case 'boss_enter': this.synthBossEnter(ctx, gain); break;
      case 'boss_phase': this.synthBossPhase(ctx, gain); break;
      case 'boss_death': this.synthBossDeath(ctx, gain); break;
      case 'menu_select': this.synthMenuSelect(ctx, gain); break;
      case 'game_over': this.synthGameOver(ctx, gain); break;
    }
  }

  playMusic(track: MusicTrack): void {
    if (this.currentMusic === track) return;
    this.stopMusic();
    this.currentMusic = track;

    const ctx = this.ensureContext();
    if (!ctx || !this.musicGain) return;

    switch (track) {
      case 'gameplay': this.startGameplayMusic(ctx); break;
      case 'boss': this.startBossMusic(ctx); break;
      case 'menu': this.startMenuMusic(ctx); break;
    }
  }

  stopMusic(): void {
    for (const node of this.musicNodes) {
      try { (node as OscillatorNode).stop?.(); } catch { /* already stopped */ }
      try { node.disconnect(); } catch { /* ok */ }
    }
    this.musicNodes = [];
    this.currentMusic = null;
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
  }

  fadeOutMusic(duration = 1): void {
    if (!this.musicGain) return;
    const startVol = this.musicGain.gain.value;
    const steps = 20;
    const stepTime = (duration * 1000) / steps;
    let step = 0;
    this.fadeInterval = setInterval(() => {
      step++;
      if (this.musicGain) {
        this.musicGain.gain.value = startVol * (1 - step / steps);
      }
      if (step >= steps) {
        this.stopMusic();
        if (this.musicGain) this.musicGain.gain.value = this.musicVolume;
      }
    }, stepTime);
  }

  setSfxVolume(vol: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain) this.sfxGain.gain.value = this.sfxVolume;
  }

  setMusicVolume(vol: number): void {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain) this.musicGain.gain.value = this.musicVolume;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain) this.masterGain.gain.value = muted ? 0 : 0.8;
  }

  isMuted(): boolean { return this.muted; }

  destroy(): void {
    this.stopMusic();
    if (this.ctx) { this.ctx.close(); this.ctx = null; }
  }

  // ─── SFX Synthesizers ───

  private synthLaser(ctx: AudioContext, dest: AudioNode, freq: number, dur: number): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.3, now + dur);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.15, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.exponentialRampToValueAtTime(500, now + dur);

    osc.connect(filter);
    filter.connect(g);
    g.connect(dest);
    osc.start(now);
    osc.stop(now + dur);
  }

  private synthHit(ctx: AudioContext, dest: AudioNode, freq: number, dur: number): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + dur);

    const noise = this.createNoise(ctx, dur);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noise.connect(noiseGain);
    noiseGain.connect(dest);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.2, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(g);
    g.connect(dest);
    osc.start(now);
    osc.stop(now + dur);
  }

  private synthExplosion(ctx: AudioContext, dest: AudioNode, dur: number, startFreq: number): void {
    const now = ctx.currentTime;

    // Noise component
    const noise = this.createNoise(ctx, dur);
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(startFreq * 5, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(100, now + dur);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(dest);

    // Bass thump
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + dur * 0.5);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.25, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.5);

    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start(now);
    osc.stop(now + dur);
  }

  private synthPowerUp(ctx: AudioContext, dest: AudioNode): void {
    const now = ctx.currentTime;
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      const t = now + i * 0.06;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(g);
      g.connect(dest);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  private synthBomb(ctx: AudioContext, dest: AudioNode): void {
    const now = ctx.currentTime;

    // Deep boom
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.6);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.4, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(g);
    g.connect(dest);
    osc.start(now);
    osc.stop(now + 0.6);

    // Noise wash
    const noise = this.createNoise(ctx, 0.5);
    const nf = ctx.createBiquadFilter();
    nf.type = 'lowpass';
    nf.frequency.setValueAtTime(2000, now);
    nf.frequency.exponentialRampToValueAtTime(50, now + 0.5);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.3, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    noise.connect(nf);
    nf.connect(ng);
    ng.connect(dest);
  }

  private synthCombo(ctx: AudioContext, dest: AudioNode): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.1, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(g);
    g.connect(dest);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  private synthBossEnter(ctx: AudioContext, dest: AudioNode): void {
    const now = ctx.currentTime;
    // Ominous rising drone
    [55, 82.5, 110].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq * 0.5, now);
      osc.frequency.linearRampToValueAtTime(freq, now + 1.0);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.linearRampToValueAtTime(800, now + 1.0);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.08, now + 0.3);
      g.gain.setValueAtTime(0.08, now + 0.7);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(filter);
      filter.connect(g);
      g.connect(dest);
      osc.start(now + i * 0.1);
      osc.stop(now + 1.2);
    });
  }

  private synthBossPhase(ctx: AudioContext, dest: AudioNode): void {
    const now = ctx.currentTime;
    // Alarm-like rising tones
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      const t = now + i * 0.15;
      osc.frequency.setValueAtTime(400 + i * 200, t);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(g);
      g.connect(dest);
      osc.start(t);
      osc.stop(t + 0.12);
    }
  }

  private synthBossDeath(ctx: AudioContext, dest: AudioNode): void {
    const now = ctx.currentTime;
    this.synthExplosion(ctx, dest, 0.8, 150);

    // Triumphant rising chord
    [262, 330, 392, 523].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      const t = now + 0.3 + i * 0.08;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.1, t + 0.05);
      g.gain.setValueAtTime(0.1, t + 0.8);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      osc.connect(g);
      g.connect(dest);
      osc.start(t);
      osc.stop(t + 1.5);
    });
  }

  private synthMenuSelect(ctx: AudioContext, dest: AudioNode): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.setValueAtTime(800, now + 0.05);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.1, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(g);
    g.connect(dest);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  private synthGameOver(ctx: AudioContext, dest: AudioNode): void {
    const now = ctx.currentTime;
    // Descending sad tones
    [392, 349, 330, 262].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      const t = now + i * 0.25;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.1, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(g);
      g.connect(dest);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  }

  // ─── Music Generators ───

  private startGameplayMusic(ctx: AudioContext): void {
    if (!this.musicGain) return;

    // Pulsing bass drone
    const bass = ctx.createOscillator();
    bass.type = 'sawtooth';
    bass.frequency.value = 55;
    const bassFilter = ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.value = 200;
    const bassGain = ctx.createGain();
    bassGain.gain.value = 0.12;

    // LFO for pulse
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 2;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.06;
    lfo.connect(lfoGain);
    lfoGain.connect(bassGain.gain);

    bass.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.musicGain);
    bass.start();
    lfo.start();

    // Pad layer
    const pad = ctx.createOscillator();
    pad.type = 'sine';
    pad.frequency.value = 110;
    const pad2 = ctx.createOscillator();
    pad2.type = 'sine';
    pad2.frequency.value = 165;
    const padGain = ctx.createGain();
    padGain.gain.value = 0.04;
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 400;

    pad.connect(padGain);
    pad2.connect(padGain);
    padGain.connect(padFilter);
    padFilter.connect(this.musicGain);
    pad.start();
    pad2.start();

    this.musicNodes.push(bass, lfo, pad, pad2);
  }

  private startBossMusic(ctx: AudioContext): void {
    if (!this.musicGain) return;

    // Aggressive bass
    const bass = ctx.createOscillator();
    bass.type = 'sawtooth';
    bass.frequency.value = 55;
    const bassFilter = ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.value = 300;
    const bassGain = ctx.createGain();
    bassGain.gain.value = 0.15;

    // Fast LFO for urgency
    const lfo = ctx.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 4;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.08;
    lfo.connect(lfoGain);
    lfoGain.connect(bassGain.gain);

    bass.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.musicGain);
    bass.start();
    lfo.start();

    // Dissonant tension layer
    const tension = ctx.createOscillator();
    tension.type = 'sawtooth';
    tension.frequency.value = 82.5; // E2 (minor feel)
    const tension2 = ctx.createOscillator();
    tension2.type = 'sawtooth';
    tension2.frequency.value = 116.5; // Bb2 (tritone)
    const tensionFilter = ctx.createBiquadFilter();
    tensionFilter.type = 'lowpass';
    tensionFilter.frequency.value = 250;
    const tensionGain = ctx.createGain();
    tensionGain.gain.value = 0.05;

    tension.connect(tensionGain);
    tension2.connect(tensionGain);
    tensionGain.connect(tensionFilter);
    tensionFilter.connect(this.musicGain);
    tension.start();
    tension2.start();

    this.musicNodes.push(bass, lfo, tension, tension2);
  }

  private startMenuMusic(ctx: AudioContext): void {
    if (!this.musicGain) return;

    // Ambient pad
    const pad = ctx.createOscillator();
    pad.type = 'sine';
    pad.frequency.value = 110;
    const pad2 = ctx.createOscillator();
    pad2.type = 'sine';
    pad2.frequency.value = 164.8;
    const padGain = ctx.createGain();
    padGain.gain.value = 0.06;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;

    pad.connect(padGain);
    pad2.connect(padGain);
    padGain.connect(filter);
    filter.connect(this.musicGain);
    pad.start();
    pad2.start();

    this.musicNodes.push(pad, pad2);
  }

  // ─── Utilities ───

  private createNoise(ctx: AudioContext, dur: number): AudioBufferSourceNode {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * dur);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.start(ctx.currentTime);
    source.stop(ctx.currentTime + dur);
    return source;
  }
}
