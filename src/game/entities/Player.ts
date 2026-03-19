import type { Entity, PlayerData } from '@game/types';
import { createEntity } from './Entity';
import { PLAYER_CONFIG } from '@game/config/player';
import { WORLD_WIDTH, WORLD_HEIGHT } from '@game/config/game';

export function createPlayer(): Entity {
  const { width, height, color, thrusterColor, hp, bombCount } = PLAYER_CONFIG;

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
    buildSprite: (g) => {
      g.moveTo(0, -height * 0.5)
        .lineTo(width * 0.5, height * 0.5)
        .lineTo(-width * 0.5, height * 0.5)
        .closePath()
        .fill({ color });

      g.ellipse(0, -height * 0.15, width * 0.15, height * 0.15)
        .fill({ color: 0xffffff, alpha: 0.6 });

      g.rect(-width * 0.3, height * 0.35, width * 0.15, height * 0.2)
        .fill({ color: thrusterColor, alpha: 0.8 });

      g.rect(width * 0.15, height * 0.35, width * 0.15, height * 0.2)
        .fill({ color: thrusterColor, alpha: 0.8 });
    },
  });
}
