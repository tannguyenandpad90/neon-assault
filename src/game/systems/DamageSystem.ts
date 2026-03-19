import type { CollisionPair, DeathEvent, Entity } from '@game/types';
import { playerData } from '@game/types';
import { PLAYER_CONFIG } from '@game/config/player';

export interface DamageResult {
  deaths: DeathEvent[];
  playerHit: boolean;
  scoreGained: number;
  bossHits: Entity[];
  powerUpPickups: CollisionPair[];
}

export function processDamage(pairs: CollisionPair[]): DamageResult {
  const result: DamageResult = {
    deaths: [],
    playerHit: false,
    scoreGained: 0,
    bossHits: [],
    powerUpPickups: [],
  };

  for (let i = 0; i < pairs.length; i++) {
    const { a, b } = pairs[i];
    if (!a.alive || !b.alive) continue;

    // Player projectile hits enemy/boss
    if (a.tags.has('playerProjectile') && (b.tags.has('enemy') || b.tags.has('boss'))) {
      b.hp -= a.damage;
      a.alive = false;

      if (b.tags.has('boss') && b.alive) {
        result.bossHits.push(b);
      }

      if (b.hp <= 0) {
        b.alive = false;
        result.deaths.push({ entity: b, killedBy: a });
        result.scoreGained += b.scoreValue;
      }
    }

    // Enemy projectile hits player
    if (a.tags.has('enemyProjectile') && b.tags.has('player')) {
      if (canDamagePlayer(b)) {
        applyPlayerDamage(b);
        result.playerHit = true;
        if (b.hp <= 0) {
          b.alive = false;
          result.deaths.push({ entity: b, killedBy: a });
        }
      }
      a.alive = false;
    }

    // Regular enemy body hits player
    if (a.tags.has('enemy') && !a.tags.has('boss') && b.tags.has('player')) {
      if (canDamagePlayer(b)) {
        applyPlayerDamage(b, a.damage);
        result.playerHit = true;
        if (b.hp <= 0) {
          b.alive = false;
          result.deaths.push({ entity: b, killedBy: a });
        }
      }
      a.alive = false;
      result.deaths.push({ entity: a, killedBy: b });
      result.scoreGained += a.scoreValue;
    }

    // Boss body hits player
    if (a.tags.has('boss') && b.tags.has('player')) {
      if (canDamagePlayer(b)) {
        applyPlayerDamage(b, a.damage);
        result.playerHit = true;
        if (b.hp <= 0) {
          b.alive = false;
          result.deaths.push({ entity: b, killedBy: a });
        }
      }
    }

    // Powerup pickup (collected here, applied by caller)
    if (a.tags.has('powerup') && b.tags.has('player')) {
      result.powerUpPickups.push(pairs[i]);
      a.alive = false;
    }
  }

  return result;
}

function canDamagePlayer(player: Entity): boolean {
  const pd = playerData(player);
  return pd.invincibleTimer <= 0 && !pd.shieldActive;
}

function applyPlayerDamage(player: Entity, damage = 1): void {
  const pd = playerData(player);
  if (pd.shieldActive) {
    pd.shieldTimer = 0;
    pd.shieldActive = false;
    return;
  }
  player.hp -= damage;
  pd.invincibleTimer = PLAYER_CONFIG.invincibilityDuration;
}
