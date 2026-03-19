import type { Entity, EnemyType, EnemyData } from '@game/types';
import { createEntity } from './Entity';
import { ENEMIES } from '@game/config/enemies';

export function createEnemy(type: EnemyType, x: number, y: number): Entity {
  const config = ENEMIES[type];

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
    buildSprite: (g) => {
      const { width: w, height: h, color } = config;
      const hw = w * 0.5;
      const hh = h * 0.5;

      switch (type) {
        case 'basic':
          g.moveTo(0, -hh).lineTo(hw, 0).lineTo(0, hh).lineTo(-hw, 0).closePath().fill({ color });
          break;

        case 'shooter':
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const px = Math.cos(angle) * hw;
            const py = Math.sin(angle) * hh;
            if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
          }
          g.closePath().fill({ color });
          g.rect(-2, hh * 0.5, 4, hh * 0.6).fill({ color: 0xffffff, alpha: 0.4 });
          break;

        case 'kamikaze':
          g.moveTo(0, hh).lineTo(-hw, -hh).lineTo(0, -hh * 0.3).lineTo(hw, -hh).closePath().fill({ color });
          g.moveTo(-hw * 0.4, -hh).lineTo(0, -hh * 1.5).lineTo(hw * 0.4, -hh).closePath().fill({ color: 0xff4400, alpha: 0.6 });
          break;

        case 'tank':
          g.roundRect(-hw, -hh, w, h, 4).fill({ color });
          g.moveTo(-hw + 3, -hh * 0.3).lineTo(hw - 3, -hh * 0.3).stroke({ width: 1, color: 0x8888aa });
          g.moveTo(-hw + 3, hh * 0.3).lineTo(hw - 3, hh * 0.3).stroke({ width: 1, color: 0x8888aa });
          g.circle(0, 0, hw * 0.4).fill({ color: 0x8888bb });
          break;

        case 'elite':
          for (let i = 0; i < 5; i++) {
            const outerAngle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const innerAngle = outerAngle + Math.PI / 5;
            const ox = Math.cos(outerAngle) * hw;
            const oy = Math.sin(outerAngle) * hh;
            const ix = Math.cos(innerAngle) * hw * 0.4;
            const iy = Math.sin(innerAngle) * hh * 0.4;
            if (i === 0) g.moveTo(ox, oy); else g.lineTo(ox, oy);
            g.lineTo(ix, iy);
          }
          g.closePath().fill({ color });
          break;

        case 'splitter':
          // Cracked orb — circle with fracture lines
          g.circle(0, 0, hw).fill({ color });
          g.moveTo(-hw * 0.3, -hh * 0.6).lineTo(hw * 0.2, hh * 0.5).stroke({ width: 1, color: 0xffffff, alpha: 0.5 });
          g.moveTo(hw * 0.4, -hh * 0.3).lineTo(-hw * 0.1, hh * 0.6).stroke({ width: 1, color: 0xffffff, alpha: 0.4 });
          g.circle(0, 0, hw * 0.35).fill({ color: 0x66eebb, alpha: 0.4 });
          break;

        case 'sniper':
          // Tall narrow shape — scope + barrel
          g.rect(-hw * 0.4, -hh, hw * 0.8, h).fill({ color });
          // Scope lens
          g.circle(0, -hh * 0.5, hw * 0.35).fill({ color: 0x88eeff, alpha: 0.7 });
          // Long barrel
          g.rect(-1.5, hh * 0.3, 3, hh * 0.8).fill({ color: 0xffffff, alpha: 0.5 });
          break;

        case 'miniboss':
          // Armored octagon with glowing core
          for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i - Math.PI / 8;
            const ox = Math.cos(angle) * hw;
            const oy = Math.sin(angle) * hh;
            if (i === 0) g.moveTo(ox, oy); else g.lineTo(ox, oy);
          }
          g.closePath().fill({ color });
          // Armor ring
          g.circle(0, 0, hw * 0.7).stroke({ width: 2, color: 0xffaa44, alpha: 0.6 });
          // Core
          g.circle(0, 0, hw * 0.3).fill({ color: 0xff8844, alpha: 0.9 });
          g.circle(0, 0, hw * 0.15).fill({ color: 0xffcc88 });
          break;
      }
    },
  });
}
