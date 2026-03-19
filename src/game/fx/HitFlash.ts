import type { Entity } from '@game/types';

interface ActiveFlash {
  entity: Entity;
  originalTint: number;
  remaining: number;
}

const FLASH_DURATION = 0.08;
const activeFlashes: ActiveFlash[] = [];

export function applyHitFlash(entity: Entity): void {
  // Don't stack flashes on the same entity
  for (const flash of activeFlashes) {
    if (flash.entity.id === entity.id) {
      flash.remaining = FLASH_DURATION;
      return;
    }
  }

  const originalTint = (entity.sprite.tint ?? 0xffffff) as number;
  activeFlashes.push({ entity, originalTint, remaining: FLASH_DURATION });
  entity.sprite.tint = 0xffffff;
}

export function updateHitFlashes(dt: number): void {
  for (let i = activeFlashes.length - 1; i >= 0; i--) {
    const flash = activeFlashes[i];

    // Guard: entity was destroyed
    if (!flash.entity.alive) {
      activeFlashes.splice(i, 1);
      continue;
    }

    flash.remaining -= dt;
    if (flash.remaining <= 0) {
      flash.entity.sprite.tint = flash.originalTint;
      activeFlashes.splice(i, 1);
    }
  }
}

export function clearHitFlashes(): void {
  for (const flash of activeFlashes) {
    if (flash.entity.alive) {
      flash.entity.sprite.tint = flash.originalTint;
    }
  }
  activeFlashes.length = 0;
}
