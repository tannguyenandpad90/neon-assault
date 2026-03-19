import type { Entity } from '@game/types';

/**
 * Apply velocity to position for a batch of entities.
 * For hot-path usage, prefer inlining the loop in the scene
 * to avoid the array allocation from getAll().
 */
export function updateMovement(entities: Entity[], dt: number): void {
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    if (!entity.alive || entity.tags.has('player')) continue;

    entity.x += entity.vx * dt;
    entity.y += entity.vy * dt;
    entity.sprite.x = entity.x;
    entity.sprite.y = entity.y;

    if (entity.rotation !== 0) {
      entity.sprite.rotation = entity.rotation;
    }
  }
}
