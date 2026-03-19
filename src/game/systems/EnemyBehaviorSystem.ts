import type { Entity, EnemyData } from '@game/types';
import { enemyData } from '@game/types';
import { EntityManager } from '@game/core/EntityManager';
import { spawnProjectile } from '@game/entities/Projectile';
import { ENEMY_BASIC_SHOT, SNIPER_SHOT } from '@game/config/weapons';
import { WORLD_WIDTH } from '@game/config/game';
import { Container } from 'pixi.js';

export function updateEnemyBehaviors(
  enemies: Entity[],
  player: Entity,
  dt: number,
  entityManager: EntityManager,
  projectileLayer: Container,
): void {
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    if (!enemy.alive) continue;

    const ed = enemyData(enemy);
    ed.elapsed += dt;

    updateMovement(enemy, ed, player);
    updateFiring(enemy, ed, dt, player, entityManager, projectileLayer);
  }
}

function updateMovement(enemy: Entity, ed: EnemyData, player: Entity): void {
  switch (ed.movementType) {
    case 'linear':
      break;

    case 'sinusoidal':
      enemy.x = ed.spawnX + Math.sin(ed.elapsed * 2) * 40;
      enemy.sprite.x = enemy.x;
      break;

    case 'homing': {
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) {
        const speed = Math.sqrt(enemy.vx * enemy.vx + enemy.vy * enemy.vy) || 180;
        enemy.vx = (dx / dist) * speed;
        enemy.vy = (dy / dist) * speed;
      }
      enemy.rotation = Math.atan2(enemy.vy, enemy.vx) + Math.PI * 0.5;
      enemy.sprite.rotation = enemy.rotation;
      break;
    }

    case 'zigzag': {
      const phase = Math.floor(ed.elapsed / 1.2) % 2;
      enemy.vx = phase === 0 ? 100 : -100;
      if (enemy.x < 20) enemy.vx = 100;
      if (enemy.x > WORLD_WIDTH - 20) enemy.vx = -100;
      break;
    }

    case 'stationary':
      enemy.vx = 0;
      enemy.vy = 0;
      break;

    case 'hover': {
      const targetY = ed.hoverTargetY ?? 50;
      if (!ed.hoverReached) {
        if (enemy.y >= targetY) {
          enemy.y = targetY;
          enemy.vy = 0;
          ed.hoverReached = true;
        }
      } else {
        // Slow horizontal drift
        enemy.vy = 0;
        enemy.vx = Math.sin(ed.elapsed * 0.6) * 30;
      }
      break;
    }
  }
}

function updateFiring(
  enemy: Entity,
  ed: EnemyData,
  dt: number,
  player: Entity,
  entityManager: EntityManager,
  layer: Container,
): void {
  if (ed.fireRate <= 0) return;

  ed.fireTimer -= dt;
  if (ed.fireTimer <= 0) {
    ed.fireTimer = ed.fireRate;

    if (ed.enemyType === 'sniper') {
      fireSniper(enemy, player, entityManager, layer);
    } else {
      fireAtPlayer(enemy, player, entityManager, layer);
    }
  }
}

function fireAtPlayer(
  enemy: Entity,
  player: Entity,
  entityManager: EntityManager,
  layer: Container,
): void {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return;

  const speed = ENEMY_BASIC_SHOT.speed;
  spawnProjectile(
    enemy.x, enemy.y + enemy.height * 0.5,
    ENEMY_BASIC_SHOT, 'enemyProjectile', entityManager, layer,
    (dy / dist) * speed, (dx / dist) * speed,
  );
}

function fireSniper(
  enemy: Entity,
  player: Entity,
  entityManager: EntityManager,
  layer: Container,
): void {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return;

  const speed = SNIPER_SHOT.speed;
  spawnProjectile(
    enemy.x, enemy.y + enemy.height * 0.5,
    SNIPER_SHOT, 'enemyProjectile', entityManager, layer,
    (dy / dist) * speed, (dx / dist) * speed,
  );
}
