import type { SfxKey } from './AudioManager';

/**
 * Maps game events to sound effect keys.
 * Used by GameplayScene to trigger audio at the right moments.
 */
export const SOUND_MAP: Record<string, SfxKey> = {
  'player:fire': 'fire',
  'player:fire_spread': 'fire_spread',
  'player:hit': 'hit_player',
  'player:death': 'game_over',
  'enemy:hit': 'hit_enemy',
  'enemy:death': 'explosion_sm',
  'boss:enter': 'boss_enter',
  'boss:phase': 'boss_phase',
  'boss:death': 'boss_death',
  'powerup:pickup': 'powerup',
  'bomb:use': 'bomb',
  'combo:up': 'combo_up',
};
