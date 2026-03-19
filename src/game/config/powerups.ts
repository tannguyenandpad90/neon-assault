import type { PowerUpType } from '@game/types';

export interface PowerUpConfig {
  color: number;
  duration: number;
  healAmount?: number;
}

export const POWERUPS: Record<PowerUpType, PowerUpConfig> = {
  firepower: { color: 0xff8800, duration: 10 },
  firerate: { color: 0xffff00, duration: 8 },
  shield: { color: 0x4488ff, duration: 8 },
  heal: { color: 0x44ff44, duration: 0, healAmount: 2 },
  bomb: { color: 0xff44ff, duration: 0 },
  magnet: { color: 0x44ffcc, duration: 10 },
  overdrive: { color: 0xff4400, duration: 6 },
};

export const POWERUP_DROP_CHANCE = 0.18;
export const POWERUP_SPEED = 60;
export const POWERUP_SIZE = 12;

export const MAGNET_PULL_RADIUS = 160;
export const MAGNET_PULL_SPEED = 300;

export const POWERUP_DROP_WEIGHTS = {
  // Order: firepower, firerate, shield, heal, bomb, magnet, overdrive
  values: [4, 3, 2, 2, 2, 1, 1] as readonly number[],
  total: 15,
} as const;
