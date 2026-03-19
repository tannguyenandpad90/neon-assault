export const WORLD_WIDTH = 480;
export const WORLD_HEIGHT = 720;
export const BG_COLOR = 0x0a0a18;
export const MAX_ENTITIES = 512;

export const STARFIELD = {
  count: 80,
  speedMin: 30,
  speedMax: 120,
} as const;

export const BOSS_DEATH = {
  explosionCount: 12,
  explosionSpread: 25,
  explosionBaseSize: 20,
  explosionSizeVariance: 15,
  explosionStaggerDelay: 0.05,
  centralExplosionSize: 60,
  shakeIntensity: 12,
  shakeDuration: 0.8,
  colors: [0xff6622, 0xffcc44] as readonly number[],
  drops: ['firepower', 'heal', 'bomb'] as const,
} as const;

export const BOSS_ENTRY_SPEED = 50;

export const INPUT_BUFFER_SECONDS = 0.05;
