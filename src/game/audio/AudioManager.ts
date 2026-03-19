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

export type MusicTrack =
  | 'menu'
  | 'gameplay'
  | 'boss'
  | 'gameover';

/**
 * Audio manager with typed hooks for Howler.js integration.
 *
 * Integration guide:
 * 1. Install howler: `yarn add howler @types/howler`
 * 2. Create sprite sheet JSON for SFX
 * 3. Replace stub methods with Howl instances
 * 4. Call AudioManager.init() in Game.ts after engine.init()
 */
export class AudioManager {
  private sfxVolume = 0.7;
  musicVolume = 0.4;
  private muted = false;
  private currentMusic: MusicTrack | null = null;

  // Howler instances would be stored here
  // private sfxHowl: Howl | null = null;
  // private musicHowls: Map<MusicTrack, Howl> = new Map();

  init(): void {
    // Load sound sprite sheet
    // this.sfxHowl = new Howl({ src: ['/assets/audio/sfx.webm', '/assets/audio/sfx.mp3'], sprite: { ... } });
    // Load music tracks
    // this.musicHowls.set('gameplay', new Howl({ src: ['/assets/audio/gameplay.webm'], loop: true }));
  }

  playSfx(key: SfxKey, volume?: number): void {
    if (this.muted) return;
    const vol = (volume ?? 1) * this.sfxVolume;
    void key;
    void vol;
    // this.sfxHowl?.play(key);
    // const id = this.sfxHowl?.play(key);
    // if (id !== undefined) this.sfxHowl?.volume(vol, id);
  }

  playMusic(track: MusicTrack): void {
    if (this.currentMusic === track) return;
    this.stopMusic();
    this.currentMusic = track;
    // const howl = this.musicHowls.get(track);
    // if (howl) { howl.volume(this.musicVolume); howl.play(); }
  }

  stopMusic(): void {
    // if (this.currentMusic) { this.musicHowls.get(this.currentMusic)?.stop(); }
    this.currentMusic = null;
  }

  fadeOutMusic(duration = 1): void {
    void duration;
    // if (this.currentMusic) { this.musicHowls.get(this.currentMusic)?.fade(this.musicVolume, 0, duration * 1000); }
  }

  setSfxVolume(vol: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  setMusicVolume(vol: number): void {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    // Update currently playing music
    // if (this.currentMusic) { this.musicHowls.get(this.currentMusic)?.volume(this.musicVolume); }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    // Howler.mute(muted);
  }

  isMuted(): boolean {
    return this.muted;
  }

  destroy(): void {
    this.stopMusic();
    // this.sfxHowl?.unload();
    // for (const howl of this.musicHowls.values()) howl.unload();
  }
}
