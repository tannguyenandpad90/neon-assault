import type { Entity } from '@game/types';
import { playerData } from '@game/types';
import { InputManager } from '@game/core/InputManager';
import { EntityManager } from '@game/core/EntityManager';
import { PLAYER_CONFIG } from '@game/config/player';

export interface BombResult {
  triggered: boolean;
  kills: number;
  scoreGained: number;
}

export function updateBomb(
  player: Entity,
  input: InputManager,
  entityManager: EntityManager,
): BombResult {
  const result: BombResult = { triggered: false, kills: 0, scoreGained: 0 };
  const pd = playerData(player);

  if (!input.isActionJustPressed('bomb') || pd.bombs <= 0) return result;

  pd.bombs--;
  result.triggered = true;

  const enemies = entityManager.getByTag('enemy');
  for (const enemy of enemies) {
    if (enemy.tags.has('boss')) {
      enemy.hp -= PLAYER_CONFIG.bombDamage;
      if (enemy.hp <= 0) {
        enemy.alive = false;
        result.kills++;
        result.scoreGained += enemy.scoreValue;
      }
    } else {
      enemy.alive = false;
      result.kills++;
      result.scoreGained += enemy.scoreValue;
    }
  }

  const enemyBullets = entityManager.getByTag('enemyProjectile');
  for (const bullet of enemyBullets) {
    bullet.alive = false;
  }

  return result;
}
