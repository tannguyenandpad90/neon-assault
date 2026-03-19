import type { Entity } from '@game/types';
import { playerData } from '@game/types';
import { InputManager } from '@game/core/InputManager';
import { EntityManager } from '@game/core/EntityManager';
import { spawnProjectile } from '@game/entities/Projectile';
import { PLAYER_PRIMARY, PLAYER_HOMING, HOMING_INTERVAL } from '@game/config/weapons';
import { INPUT_BUFFER_SECONDS } from '@game/config/game';
import { Container } from 'pixi.js';

let fireBufferTimer = 0;

export function updateWeapons(
  player: Entity,
  input: InputManager,
  dt: number,
  entityManager: EntityManager,
  projectileLayer: Container,
): boolean {
  const pd = playerData(player);

  if (input.isAction('fire')) {
    fireBufferTimer = INPUT_BUFFER_SECONDS;
  } else {
    fireBufferTimer = Math.max(0, fireBufferTimer - dt);
  }

  pd.fireCooldown = Math.max(0, pd.fireCooldown - dt);

  if (fireBufferTimer > 0 && pd.fireCooldown <= 0) {
    const fireRateMult = pd.fireRateMultiplier || 1;
    pd.fireCooldown = PLAYER_PRIMARY.cooldown / fireRateMult;
    fireBufferTimer = 0;

    const effectiveLevel = pd.overdriveTimer > 0 ? 4 : pd.firepowerLevel;
    spawnPlayerBullets(player, effectiveLevel, entityManager, projectileLayer);

    // Homing missile every Nth shot at level 4
    pd.shotCounter++;
    if (effectiveLevel >= 4 && pd.shotCounter % HOMING_INTERVAL === 0) {
      const missile = spawnProjectile(
        player.x, player.y - player.height * 0.5,
        PLAYER_HOMING, 'playerProjectile', entityManager, projectileLayer,
      );
      missile.tags.add('homingProjectile');
    }

    return true;
  }

  return false;
}

export function resetWeaponState(): void {
  fireBufferTimer = 0;
}

function spawnPlayerBullets(
  player: Entity,
  level: number,
  em: EntityManager,
  layer: Container,
): void {
  const y = player.y - player.height * 0.5;
  const x = player.x;
  const cfg = PLAYER_PRIMARY;

  if (level <= 1) {
    spawnProjectile(x, y, cfg, 'playerProjectile', em, layer);
  } else if (level === 2) {
    spawnProjectile(x - 6, y, cfg, 'playerProjectile', em, layer);
    spawnProjectile(x + 6, y, cfg, 'playerProjectile', em, layer);
  } else if (level === 3) {
    spawnProjectile(x, y, cfg, 'playerProjectile', em, layer);
    spawnProjectile(x - 10, y + 4, cfg, 'playerProjectile', em, layer, undefined, -30);
    spawnProjectile(x + 10, y + 4, cfg, 'playerProjectile', em, layer, undefined, 30);
  } else {
    spawnProjectile(x - 5, y, cfg, 'playerProjectile', em, layer);
    spawnProjectile(x + 5, y, cfg, 'playerProjectile', em, layer);
    spawnProjectile(x - 12, y + 4, cfg, 'playerProjectile', em, layer, undefined, -50);
    spawnProjectile(x + 12, y + 4, cfg, 'playerProjectile', em, layer, undefined, 50);
  }
}
