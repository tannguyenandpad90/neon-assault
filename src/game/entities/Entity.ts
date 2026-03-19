import { Graphics } from 'pixi.js';
import type { Entity, Tag, EntityData } from '@game/types';

interface CreateEntityConfig {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  width: number;
  height: number;
  hp?: number;
  maxHp?: number;
  damage?: number;
  scoreValue?: number;
  tags: Tag[];
  data?: EntityData;
  buildSprite: (g: Graphics) => void;
}

export function createEntity(config: CreateEntityConfig): Entity {
  const g = new Graphics();
  config.buildSprite(g);
  g.x = config.x;
  g.y = config.y;

  const hp = config.hp ?? 1;

  return {
    id: 0,
    tags: new Set(config.tags),
    x: config.x,
    y: config.y,
    vx: config.vx ?? 0,
    vy: config.vy ?? 0,
    rotation: 0,
    width: config.width,
    height: config.height,
    hp,
    maxHp: config.maxHp ?? hp,
    damage: config.damage ?? 0,
    scoreValue: config.scoreValue ?? 0,
    sprite: g,
    alive: true,
    data: config.data ?? {},
  };
}
