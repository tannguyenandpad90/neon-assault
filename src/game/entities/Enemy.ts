import type { Entity, EnemyType, EnemyData } from '@game/types';
import { createEntity } from './Entity';
import { ENEMIES } from '@game/config/enemies';
import { createEnemySprite } from '@game/fx/SpriteFactory';

const ENEMY_COLORS: Record<EnemyType, { main: string; accent: string }> = {
  basic: { main: '#cc3333', accent: '#881111' },
  shooter: { main: '#cc8833', accent: '#885522' },
  kamikaze: { main: '#ff4488', accent: '#aa2255' },
  tank: { main: '#7777aa', accent: '#444466' },
  elite: { main: '#bb55dd', accent: '#772299' },
  splitter: { main: '#44cc88', accent: '#228855' },
  sniper: { main: '#44aadd', accent: '#226688' },
  miniboss: { main: '#ee7733', accent: '#994411' },
};

export function createEnemy(type: EnemyType, x: number, y: number): Entity {
  const config = ENEMIES[type];
  const colors = ENEMY_COLORS[type];

  const data: EnemyData = {
    enemyType: type,
    movementType: config.movement,
    fireTimer: Math.random() * config.fireRate,
    fireRate: config.fireRate,
    spawnX: x,
    elapsed: 0,
    hoverTargetY: type === 'sniper' ? 40 + Math.random() * 40 : undefined,
    hoverReached: false,
  };

  return createEntity({
    x,
    y,
    vy: config.speed,
    width: config.width,
    height: config.height,
    hp: config.hp,
    maxHp: config.hp,
    damage: config.damage,
    scoreValue: config.scoreValue,
    tags: ['enemy'],
    data,
    sprite: createEnemySprite(type, config.width + 8, config.height + 8, colors.main, colors.accent),
  });
}
