import type { Entity, PlayerData } from '@game/types';
import { createEntity } from './Entity';
import { PLAYER_CONFIG } from '@game/config/player';
import { WORLD_WIDTH, WORLD_HEIGHT } from '@game/config/game';

export function createPlayer(): Entity {
  const { width, height, hp, bombCount } = PLAYER_CONFIG;
  const color = 0x44bbff;
  const accent = 0x2288dd;
  const cockpit = 0x88eeff;

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
      const hw = width * 0.5;
      const hh = height * 0.5;

      // Wing glow
      g.circle(-hw * 0.6, hh * 0.2, 4).fill({ color, alpha: 0.15 });
      g.circle(hw * 0.6, hh * 0.2, 4).fill({ color, alpha: 0.15 });

      // Main hull
      g.moveTo(0, -hh)
        .lineTo(hw * 0.3, -hh * 0.3)
        .lineTo(hw, hh * 0.3)
        .lineTo(hw * 0.6, hh)
        .lineTo(-hw * 0.6, hh)
        .lineTo(-hw, hh * 0.3)
        .lineTo(-hw * 0.3, -hh * 0.3)
        .closePath()
        .fill({ color });

      // Central stripe
      g.moveTo(0, -hh * 0.8)
        .lineTo(hw * 0.15, -hh * 0.2)
        .lineTo(hw * 0.15, hh * 0.8)
        .lineTo(-hw * 0.15, hh * 0.8)
        .lineTo(-hw * 0.15, -hh * 0.2)
        .closePath()
        .fill({ color: accent });

      // Cockpit
      g.ellipse(0, -hh * 0.3, hw * 0.2, hh * 0.18)
        .fill({ color: cockpit, alpha: 0.8 });
      g.ellipse(0, -hh * 0.3, hw * 0.1, hh * 0.08)
        .fill({ color: 0xffffff, alpha: 0.5 });

      // Wing tips
      g.moveTo(-hw, hh * 0.3).lineTo(-hw * 1.15, hh * 0.5).lineTo(-hw * 0.8, hh * 0.15).closePath()
        .fill({ color: accent });
      g.moveTo(hw, hh * 0.3).lineTo(hw * 1.15, hh * 0.5).lineTo(hw * 0.8, hh * 0.15).closePath()
        .fill({ color: accent });

      // Engine nozzles
      g.rect(-hw * 0.45, hh * 0.75, hw * 0.25, hh * 0.25).fill({ color: 0x336688 });
      g.rect(hw * 0.2, hh * 0.75, hw * 0.25, hh * 0.25).fill({ color: 0x336688 });
    },
  });
}
