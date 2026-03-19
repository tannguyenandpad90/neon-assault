import type { WeaponConfig } from '@game/types';

export const PLAYER_PRIMARY: WeaponConfig = {
  speed: 620,
  damage: 1,
  cooldown: 0.11,
  width: 4,
  height: 12,
  color: 0x88ddff,
};

export const PLAYER_HOMING: WeaponConfig = {
  speed: 280,
  damage: 2,
  cooldown: 0,
  width: 6,
  height: 6,
  color: 0x44ffaa,
};

/** Fires every N primary shots at firepower level 4. */
export const HOMING_INTERVAL = 4;

export const ENEMY_BASIC_SHOT: WeaponConfig = {
  speed: 240,
  damage: 1,
  cooldown: 2.0,
  width: 5,
  height: 5,
  color: 0xff4444,
};

export const SNIPER_SHOT: WeaponConfig = {
  speed: 380,
  damage: 1,
  cooldown: 2.0,
  width: 3,
  height: 14,
  color: 0x44ddff,
};
