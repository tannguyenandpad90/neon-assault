import { EntityManager } from '@game/core/EntityManager';
import { WORLD_WIDTH, WORLD_HEIGHT } from '@game/config/game';

const OFF_SCREEN_MARGIN = 60;

export function cleanup(entityManager: EntityManager): void {
  const toRemove: number[] = [];

  for (const entity of entityManager.getAll()) {
    // Remove dead entities
    if (!entity.alive) {
      toRemove.push(entity.id);
      continue;
    }

    // Skip player and bosses from off-screen check
    if (entity.tags.has('player') || entity.tags.has('boss')) continue;

    // Remove off-screen entities
    if (
      entity.x < -OFF_SCREEN_MARGIN ||
      entity.x > WORLD_WIDTH + OFF_SCREEN_MARGIN ||
      entity.y < -OFF_SCREEN_MARGIN ||
      entity.y > WORLD_HEIGHT + OFF_SCREEN_MARGIN
    ) {
      toRemove.push(entity.id);
    }
  }

  for (const id of toRemove) {
    entityManager.remove(id);
  }
}
