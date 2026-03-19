import type { Entity, Tag, WeaponConfig } from '@game/types';
import { createEntity } from './Entity';
import { EntityManager } from '@game/core/EntityManager';
import { PLAYER_HOMING } from '@game/config/weapons';
import { createPlayerBulletSprite, createEnemyBulletSprite, createHomingSprite } from '@game/fx/SpriteFactory';
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

  // Choose sprite based on weapon type
  let sprite;
  if (isPlayer && config === PLAYER_HOMING) {
    sprite = createHomingSprite();
  } else if (isPlayer) {
    sprite = createPlayerBulletSprite();
  } else {
    sprite = createEnemyBulletSprite();
  }

  return createEntity({
    x,
    y,
    vx: vx ?? 0,
    vy: vy ?? (isPlayer ? -config.speed : config.speed),
    width: config.width,
    height: config.height,
    damage: config.damage,
    tags,
    sprite,
  });
}

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
