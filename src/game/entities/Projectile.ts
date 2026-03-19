import type { Entity, Tag, WeaponConfig } from '@game/types';
import { createEntity } from './Entity';
import { EntityManager } from '@game/core/EntityManager';
import { Container } from 'pixi.js';

export function createProjectile(
  x: number,
  y: number,
  config: WeaponConfig,
  ownerTag: 'playerProjectile' | 'enemyProjectile',
  vy?: number,
  vx?: number,
): Entity {
  const tags: Tag[] = ['projectile', ownerTag];
  const isPlayer = ownerTag === 'playerProjectile';

  return createEntity({
    x,
    y,
    vx: vx ?? 0,
    vy: vy ?? (isPlayer ? -config.speed : config.speed),
    width: config.width,
    height: config.height,
    damage: config.damage,
    tags,
    buildSprite: (g) => {
      g.roundRect(
        -config.width * 0.5,
        -config.height * 0.5,
        config.width,
        config.height,
        config.width * 0.3,
      ).fill({ color: config.color });

      g.circle(0, 0, config.width)
        .fill({ color: config.color, alpha: 0.3 });
    },
  });
}

/**
 * Create a projectile, register it, and add it to the display layer.
 * Single call replaces the 3-line pattern duplicated across WeaponSystem,
 * EnemyBehaviorSystem, and BossSystem.
 */
export function spawnProjectile(
  x: number,
  y: number,
  config: WeaponConfig,
  ownerTag: 'playerProjectile' | 'enemyProjectile',
  entityManager: EntityManager,
  layer: Container,
  vy?: number,
  vx?: number,
): Entity {
  const bullet = createProjectile(x, y, config, ownerTag, vy, vx);
  entityManager.add(bullet);
  layer.addChild(bullet.sprite);
  return bullet;
}
