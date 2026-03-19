import type { Entity } from '@game/types';
import { createEntity } from './Entity';

export function createExplosion(x: number, y: number, size: number, color = 0xff6622): Entity {
  return createEntity({
    x,
    y,
    width: 0,
    height: 0,
    tags: ['fx'],
    data: {
      lifespan: 0.35,
      elapsed: 0,
      maxSize: size,
      color,
    },
    buildSprite: (g) => {
      g.circle(0, 0, size * 0.3)
        .fill({ color, alpha: 0.8 });
      g.circle(0, 0, size * 0.15)
        .fill({ color: 0xffcc44, alpha: 0.5 });
    },
  });
}
