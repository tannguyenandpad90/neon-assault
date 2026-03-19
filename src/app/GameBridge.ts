import type { GameEventMap, GameEvent } from '@game/types/events';
import type { UISnapshot } from './types';

type Listener<K extends GameEvent> = (data: GameEventMap[K]) => void;

const DEFAULT_SNAPSHOT: UISnapshot = {
  score: 0,
  hp: 0,
  maxHp: 0,
  combo: 0,
  multiplier: 1,
  bombs: 0,
  wave: 1,
  bossActive: false,
  bossName: '',
  bossHp: 0,
  bossMaxHp: 0,
  bossPhase: 0,
  firepowerLevel: 1,
  shieldActive: false,
  shieldTimer: 0,
  magnetTimer: 0,
  overdriveTimer: 0,
  enemyCount: 0,
};

export class GameBridge {
  private listeners = new Map<string, Set<Listener<never>>>();
  snapshot: UISnapshot = { ...DEFAULT_SNAPSHOT };

  on<K extends GameEvent>(event: K, listener: Listener<K>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as Listener<never>);
  }

  off<K extends GameEvent>(event: K, listener: Listener<K>): void {
    this.listeners.get(event)?.delete(listener as Listener<never>);
  }

  emit<K extends GameEvent>(event: K, data: GameEventMap[K]): void {
    const set = this.listeners.get(event);
    if (set) {
      for (const listener of set) {
        (listener as Listener<K>)(data);
      }
    }
  }

  updateSnapshot(partial: Partial<UISnapshot>): void {
    Object.assign(this.snapshot, partial);
  }

  reset(): void {
    this.snapshot = { ...DEFAULT_SNAPSHOT };
  }

  destroy(): void {
    this.listeners.clear();
  }
}
