import type { Entity, BossData } from '@game/types';
import { createEntity } from './Entity';
import type { BossConfig } from '@game/config/bosses';
import { WORLD_WIDTH } from '@game/config/game';
import { createBossSprite } from '@game/fx/SpriteFactory';

export function createBoss(config: BossConfig): Entity {
  const { width, height, hp, scoreValue } = config;

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
    sprite: createBossSprite(width, height),
  });
}
