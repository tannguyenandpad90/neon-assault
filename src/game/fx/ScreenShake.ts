export const SHAKE = {
  HIT: { intensity: 3, duration: 0.15 },
  EXPLOSION: { intensity: 4, duration: 0.2 },
  EXPLOSION_LG: { intensity: 6, duration: 0.3 },
  BOMB: { intensity: 8, duration: 0.4 },
  BOSS_HIT: { intensity: 6, duration: 0.3 },
} as const;

export type ShakePreset = typeof SHAKE[keyof typeof SHAKE];
