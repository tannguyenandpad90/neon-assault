import type { SfxKey, MusicTrack } from '@game/audio/AudioManager';

export interface GameEventMap {
  'game:start': undefined;
  'game:pause': undefined;
  'game:resume': undefined;
  'game:restart': undefined;
  'game:over': { score: number; wave: number };
  'score:change': { score: number };
  'hp:change': { hp: number; maxHp: number };
  'combo:change': { combo: number; multiplier: number };
  'bomb:change': { bombs: number };
  'boss:enter': { name: string; maxHp: number };
  'boss:hp': { hp: number; maxHp: number };
  'boss:phase': { phase: number };
  'wave:change': { wave: number };
  'player:hit': undefined;
  'player:death': undefined;
  'enemy:death': { x: number; y: number; scoreValue: number };
  'powerup:pickup': { type: string };
  'sfx': { key: SfxKey; volume?: number };
  'music': { track: MusicTrack } | { action: 'stop' } | { action: 'fadeOut'; duration: number };
}

export type GameEvent = keyof GameEventMap;
