import type { CollisionPair, Entity, PowerUpType } from '@game/types';
import { playerData, powerUpData } from '@game/types';
import { PLAYER_CONFIG } from '@game/config/player';
import { POWERUPS } from '@game/config/powerups';

export interface PowerUpEvent {
  type: PowerUpType;
}

export function processPowerUps(pickupPairs: CollisionPair[], player: Entity): PowerUpEvent[] {
  const events: PowerUpEvent[] = [];
  const pd = playerData(player);

  for (let i = 0; i < pickupPairs.length; i++) {
    const { a } = pickupPairs[i];
    if (!a.tags.has('powerup')) continue;

    const type = powerUpData(a).powerUpType;
    applyPowerUp(pd, player, type);
    events.push({ type });
  }

  return events;
}

function applyPowerUp(pd: ReturnType<typeof playerData>, player: Entity, type: PowerUpType): void {
  const config = POWERUPS[type];

  switch (type) {
    case 'heal':
      player.hp = Math.min(player.maxHp, player.hp + (config.healAmount ?? 1));
      break;
    case 'firepower':
      pd.firepowerLevel = Math.min(pd.firepowerLevel + 1, 4);
      break;
    case 'firerate':
      pd.fireRateMultiplier = 1.8;
      pd.fireRateTimer = config.duration;
      break;
    case 'shield':
      pd.shieldTimer = config.duration;
      pd.shieldActive = true;
      break;
    case 'bomb':
      pd.bombs = Math.min(pd.bombs + 1, PLAYER_CONFIG.bombCount + 2);
      break;
    case 'magnet':
      pd.magnetTimer = config.duration;
      break;
    case 'overdrive':
      pd.overdriveTimer = config.duration;
      pd.fireRateMultiplier = 2.0;
      pd.fireRateTimer = config.duration;
      break;
  }
}
