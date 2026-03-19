/**
 * Asset manifest for sprite/audio loading.
 *
 * Currently the game uses procedural Graphics for all visuals.
 * When ready to integrate real sprites:
 *
 * 1. Drop PNGs into src/assets/sprites/
 * 2. Update this manifest
 * 3. Load in Engine.init() via Pixi's Assets API:
 *    await Assets.load(SPRITE_MANIFEST.map(s => s.src));
 * 4. Replace Graphics-based entity factories with Sprite-based ones
 */

export interface SpriteAsset {
  key: string;
  src: string;
  width?: number;
  height?: number;
}

export interface AudioAsset {
  key: string;
  src: string[];
  sprite?: Record<string, [number, number]>;
}

export const SPRITE_MANIFEST: SpriteAsset[] = [
  // Player
  { key: 'player_ship', src: '/assets/sprites/player.png', width: 32, height: 32 },
  { key: 'player_thrust', src: '/assets/sprites/player_thrust.png', width: 16, height: 8 },

  // Enemies
  { key: 'enemy_basic', src: '/assets/sprites/enemy_basic.png', width: 24, height: 24 },
  { key: 'enemy_shooter', src: '/assets/sprites/enemy_shooter.png', width: 28, height: 28 },
  { key: 'enemy_kamikaze', src: '/assets/sprites/enemy_kamikaze.png', width: 20, height: 20 },
  { key: 'enemy_tank', src: '/assets/sprites/enemy_tank.png', width: 36, height: 36 },
  { key: 'enemy_elite', src: '/assets/sprites/enemy_elite.png', width: 28, height: 28 },

  // Boss
  { key: 'boss_dreadnought', src: '/assets/sprites/boss_dreadnought.png', width: 64, height: 56 },

  // Projectiles
  { key: 'bullet_player', src: '/assets/sprites/bullet_player.png', width: 8, height: 16 },
  { key: 'bullet_enemy', src: '/assets/sprites/bullet_enemy.png', width: 8, height: 8 },

  // FX
  { key: 'explosion_sheet', src: '/assets/sprites/explosion_sheet.png', width: 128, height: 32 },
  { key: 'powerup_glow', src: '/assets/sprites/powerup_glow.png', width: 16, height: 16 },

  // UI
  { key: 'hud_frame', src: '/assets/sprites/hud_frame.png' },
];

export const AUDIO_MANIFEST: AudioAsset[] = [
  {
    key: 'sfx',
    src: ['/assets/audio/sfx.webm', '/assets/audio/sfx.mp3'],
    sprite: {
      fire: [0, 120],
      fire_spread: [200, 150],
      hit_enemy: [400, 100],
      hit_player: [600, 200],
      explosion_sm: [900, 350],
      explosion_lg: [1400, 500],
      powerup: [2000, 300],
      bomb: [2500, 600],
      combo_up: [3200, 200],
      boss_enter: [3500, 1000],
      boss_phase: [4600, 800],
      boss_death: [5500, 1500],
      menu_select: [7100, 150],
      game_over: [7400, 2000],
    },
  },
  { key: 'music_menu', src: ['/assets/audio/menu.webm', '/assets/audio/menu.mp3'] },
  { key: 'music_gameplay', src: ['/assets/audio/gameplay.webm', '/assets/audio/gameplay.mp3'] },
  { key: 'music_boss', src: ['/assets/audio/boss.webm', '/assets/audio/boss.mp3'] },
];
