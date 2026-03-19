import type { Entity } from '@game/types';
import { playerData } from '@game/types';
import { InputManager } from '@game/core/InputManager';
import { PLAYER_CONFIG } from '@game/config/player';
import { WORLD_WIDTH, WORLD_HEIGHT } from '@game/config/game';

const DEAD_ZONE = 2;

export function updatePlayer(player: Entity, input: InputManager, dt: number): void {
  const { speed, acceleration, deceleration } = PLAYER_CONFIG;
  const pd = playerData(player);

  let ix = 0;
  let iy = 0;
  if (input.isAction('up')) iy -= 1;
  if (input.isAction('down')) iy += 1;
  if (input.isAction('left')) ix -= 1;
  if (input.isAction('right')) ix += 1;

  if (ix !== 0 && iy !== 0) {
    const inv = 1 / Math.SQRT2;
    ix *= inv;
    iy *= inv;
  }

  const hasInput = ix !== 0 || iy !== 0;

  if (hasInput) {
    const targetVx = ix * speed;
    const targetVy = iy * speed;
    player.vx = smoothApproach(player.vx, targetVx, acceleration, dt);
    player.vy = smoothApproach(player.vy, targetVy, acceleration, dt);
  } else {
    const decay = Math.exp(-deceleration * dt / speed);
    player.vx *= decay;
    player.vy *= decay;
    if (Math.abs(player.vx) < DEAD_ZONE) player.vx = 0;
    if (Math.abs(player.vy) < DEAD_ZONE) player.vy = 0;
  }

  player.x += player.vx * dt;
  player.y += player.vy * dt;

  const hw = player.width * 0.5;
  const hh = player.height * 0.5;
  if (player.x < hw) { player.x = hw; player.vx = 0; }
  if (player.x > WORLD_WIDTH - hw) { player.x = WORLD_WIDTH - hw; player.vx = 0; }
  if (player.y < hh) { player.y = hh; player.vy = 0; }
  if (player.y > WORLD_HEIGHT - hh) { player.y = WORLD_HEIGHT - hh; player.vy = 0; }

  player.sprite.x = player.x;
  player.sprite.y = player.y;
  player.sprite.rotation = (player.vx / speed) * 0.18;

  // --- Buff timers ---

  if (pd.invincibleTimer > 0) {
    pd.invincibleTimer = Math.max(0, pd.invincibleTimer - dt);
    player.sprite.alpha = Math.sin(pd.invincibleTimer * 20) > 0 ? 1 : 0.3;
  } else {
    player.sprite.alpha = 1;
  }

  if (pd.shieldTimer > 0) {
    pd.shieldTimer = Math.max(0, pd.shieldTimer - dt);
    pd.shieldActive = pd.shieldTimer > 0;
  } else {
    pd.shieldActive = false;
  }

  if (pd.fireRateTimer > 0) {
    pd.fireRateTimer = Math.max(0, pd.fireRateTimer - dt);
    if (pd.fireRateTimer <= 0) {
      pd.fireRateMultiplier = 1;
    }
  }

  if (pd.magnetTimer > 0) {
    pd.magnetTimer = Math.max(0, pd.magnetTimer - dt);
  }

  if (pd.overdriveTimer > 0) {
    pd.overdriveTimer = Math.max(0, pd.overdriveTimer - dt);
  }
}

function smoothApproach(current: number, target: number, rate: number, dt: number): number {
  const diff = target - current;
  if (Math.abs(diff) < DEAD_ZONE) return target;
  return current + diff * Math.min(1, rate * dt / Math.abs(diff));
}
