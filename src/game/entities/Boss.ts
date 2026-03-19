import type { Entity, BossData } from '@game/types';
import { createEntity } from './Entity';
import type { BossConfig } from '@game/config/bosses';
import { WORLD_WIDTH } from '@game/config/game';

export function createBoss(config: BossConfig): Entity {
  const { width, height, baseColor, hp, scoreValue } = config;

  const data: BossData = {
    bossName: config.name,
    phaseIndex: 0,
    attackIndex: 0,
    attackCooldown: 2.0,
    attackElapsed: 0,
    attacking: false,
    telegraphing: false,
    telegraphElapsed: 0,
    transitioning: false,
    transitionElapsed: 0,
    transitionDuration: 0,
    moveElapsed: 0,
    entryComplete: false,
    entryTargetY: 80,
    spiralAngle: 0,
    sweepAngle: 0,
  };

  return createEntity({
    x: WORLD_WIDTH * 0.5,
    y: -height,
    width,
    height,
    hp,
    maxHp: hp,
    damage: 2,
    scoreValue,
    tags: ['boss', 'enemy'],
    data,
    buildSprite: (g) => {
      const hw = width * 0.5;
      const hh = height * 0.5;

      // Hull
      g.moveTo(0, -hh)
        .lineTo(hw * 0.6, -hh * 0.6)
        .lineTo(hw, -hh * 0.1)
        .lineTo(hw, hh * 0.4)
        .lineTo(hw * 0.5, hh)
        .lineTo(-hw * 0.5, hh)
        .lineTo(-hw, hh * 0.4)
        .lineTo(-hw, -hh * 0.1)
        .lineTo(-hw * 0.6, -hh * 0.6)
        .closePath()
        .fill({ color: baseColor });

      // Armor
      g.rect(-hw * 0.7, -hh * 0.3, width * 0.7, hh * 0.4)
        .fill({ color: baseColor + 0x222222, alpha: 0.6 });

      // Core
      g.circle(0, 0, hw * 0.3).fill({ color: 0xff6644, alpha: 0.8 });
      g.circle(0, 0, hw * 0.15).fill({ color: 0xffcc88 });

      // Wing cannons
      g.rect(-hw - 4, -hh * 0.2, 8, hh * 0.8).fill({ color: 0x666666 });
      g.rect(hw - 4, -hh * 0.2, 8, hh * 0.8).fill({ color: 0x666666 });
    },
  });
}
