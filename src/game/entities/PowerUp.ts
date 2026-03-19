import type { Entity, PowerUpType, PowerUpData } from '@game/types';
import { createEntity } from './Entity';
import { POWERUPS, POWERUP_SIZE, POWERUP_SPEED } from '@game/config/powerups';

export function createPowerUp(type: PowerUpType, x: number, y: number): Entity {
  const config = POWERUPS[type];

  const data: PowerUpData = { powerUpType: type };

  return createEntity({
    x,
    y,
    vy: POWERUP_SPEED,
    width: POWERUP_SIZE,
    height: POWERUP_SIZE,
    tags: ['powerup'],
    data,
    buildSprite: (g) => {
      const r = POWERUP_SIZE * 0.5;
      // Outer glow
      g.circle(0, 0, r * 1.6).fill({ color: config.color, alpha: 0.25 });
      // Main body
      g.circle(0, 0, r).fill({ color: config.color });
      // Inner highlight
      g.circle(-r * 0.2, -r * 0.2, r * 0.35).fill({ color: 0xffffff, alpha: 0.5 });

      // Type-specific icon hint
      if (type === 'magnet') {
        // U-shape magnet hint
        g.moveTo(-r * 0.3, -r * 0.3).lineTo(-r * 0.3, r * 0.2).lineTo(r * 0.3, r * 0.2).lineTo(r * 0.3, -r * 0.3)
          .stroke({ width: 1.5, color: 0xffffff, alpha: 0.7 });
      } else if (type === 'overdrive') {
        // Lightning bolt hint
        g.moveTo(r * 0.1, -r * 0.4).lineTo(-r * 0.15, 0).lineTo(r * 0.15, 0).lineTo(-r * 0.1, r * 0.4)
          .stroke({ width: 1.5, color: 0xffffff, alpha: 0.8 });
      }
    },
  });
}
