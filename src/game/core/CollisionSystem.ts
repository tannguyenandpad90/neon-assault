import type { Entity, CollisionPair, Tag } from '@game/types';
import { EntityManager } from './EntityManager';

interface CollisionRule {
  tagA: Tag;
  tagB: Tag;
}

const COLLISION_RULES: CollisionRule[] = [
  { tagA: 'playerProjectile', tagB: 'enemy' },
  { tagA: 'playerProjectile', tagB: 'boss' },
  { tagA: 'enemyProjectile', tagB: 'player' },
  { tagA: 'enemy', tagB: 'player' },
  { tagA: 'boss', tagB: 'player' },
  { tagA: 'powerup', tagB: 'player' },
];

function aabbOverlap(a: Entity, b: Entity): boolean {
  const ax = a.x - a.width * 0.5;
  const ay = a.y - a.height * 0.5;
  const bx = b.x - b.width * 0.5;
  const by = b.y - b.height * 0.5;

  return (
    ax < bx + b.width &&
    ax + a.width > bx &&
    ay < by + b.height &&
    ay + a.height > by
  );
}

// Reusable output array — cleared each frame, no allocation after first call
const pairsBuffer: CollisionPair[] = [];

export function checkCollisions(entityManager: EntityManager): CollisionPair[] {
  pairsBuffer.length = 0;

  for (const rule of COLLISION_RULES) {
    const groupA = entityManager.getByTag(rule.tagA);
    const groupB = entityManager.getByTag(rule.tagB);

    for (let i = 0; i < groupA.length; i++) {
      const a = groupA[i];
      if (!a.alive) continue;
      for (let j = 0; j < groupB.length; j++) {
        const b = groupB[j];
        if (!b.alive || a.id === b.id) continue;
        if (aabbOverlap(a, b)) {
          pairsBuffer.push({ a, b });
        }
      }
    }
  }

  return pairsBuffer;
}
