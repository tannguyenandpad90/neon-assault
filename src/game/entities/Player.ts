import type { Entity, PlayerData } from '@game/types';
import { createEntity } from './Entity';
import { PLAYER_CONFIG } from '@game/config/player';
import { WORLD_WIDTH, WORLD_HEIGHT } from '@game/config/game';
import { createPlayerSprite } from '@game/fx/SpriteFactory';

export function createPlayer(): Entity {
  const { width, height, hp, bombCount } = PLAYER_CONFIG;

  const data: PlayerData = {
    fireCooldown: 0,
    bombs: bombCount,
    invincibleTimer: 0,
    firepowerLevel: 1,
    fireRateMultiplier: 1,
    fireRateTimer: 0,
    shieldTimer: 0,
    shieldActive: false,
    magnetTimer: 0,
    overdriveTimer: 0,
    shotCounter: 0,
  };

  return createEntity({
    x: WORLD_WIDTH * 0.5,
    y: WORLD_HEIGHT * 0.82,
    width,
    height,
    hp,
    maxHp: hp,
    damage: 1,
    tags: ['player'],
    data,
    sprite: createPlayerSprite(),
  });
}
