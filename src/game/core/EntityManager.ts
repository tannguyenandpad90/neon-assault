import type { Entity, Tag } from '@game/types';
import { MAX_ENTITIES } from '@game/config/game';

export class EntityManager {
  private entities = new Map<number, Entity>();
  private nextId = 1;

  // Cached tag groups — invalidated on add/remove
  private tagCache = new Map<Tag, Entity[]>();
  private tagCacheDirty = true;

  add(entity: Entity): Entity {
    if (this.entities.size >= MAX_ENTITIES) {
      console.warn('EntityManager: max entities reached');
      return entity;
    }
    entity.id = this.nextId++;
    this.entities.set(entity.id, entity);
    this.tagCacheDirty = true;
    return entity;
  }

  remove(id: number): void {
    const entity = this.entities.get(id);
    if (entity) {
      if (entity.sprite.parent) {
        entity.sprite.parent.removeChild(entity.sprite);
      }
      entity.sprite.destroy();
      this.entities.delete(id);
      this.tagCacheDirty = true;
    }
  }

  get(id: number): Entity | undefined {
    return this.entities.get(id);
  }

  getByTag(tag: Tag): Entity[] {
    this.rebuildCacheIfNeeded();
    return this.tagCache.get(tag) ?? [];
  }

  /**
   * Iterate entities with a tag without allocating.
   * Use this in hot paths instead of getByTag().
   */
  *iterateTag(tag: Tag): IterableIterator<Entity> {
    for (const entity of this.entities.values()) {
      if (entity.tags.has(tag)) {
        yield entity;
      }
    }
  }

  /**
   * Iterate ALL entities without allocating an array.
   */
  *iterate(): IterableIterator<Entity> {
    yield* this.entities.values();
  }

  getAll(): Entity[] {
    return Array.from(this.entities.values());
  }

  /**
   * Execute a callback for each entity. Zero allocation.
   */
  forEach(fn: (entity: Entity) => void): void {
    for (const entity of this.entities.values()) {
      fn(entity);
    }
  }

  get count(): number {
    return this.entities.size;
  }

  clear(): void {
    for (const entity of this.entities.values()) {
      if (entity.sprite.parent) {
        entity.sprite.parent.removeChild(entity.sprite);
      }
      entity.sprite.destroy();
    }
    this.entities.clear();
    this.tagCache.clear();
    this.tagCacheDirty = false;
  }

  private rebuildCacheIfNeeded(): void {
    if (!this.tagCacheDirty) return;

    this.tagCache.clear();

    for (const entity of this.entities.values()) {
      for (const tag of entity.tags) {
        let list = this.tagCache.get(tag);
        if (!list) {
          list = [];
          this.tagCache.set(tag, list);
        }
        list.push(entity);
      }
    }

    this.tagCacheDirty = false;
  }

  invalidateCache(): void {
    this.tagCacheDirty = true;
  }
}
