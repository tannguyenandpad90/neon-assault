import type { WaveDefinition } from '@game/types';

export const WAVES: WaveDefinition[] = [
  // Wave 1: Quick hook
  {
    duration: 10,
    entries: [
      { time: 0, type: 'basic', count: 3, formation: 'v-shape' },
      { time: 2.5, type: 'basic', count: 4, formation: 'line' },
      { time: 5, type: 'basic', count: 5, formation: 'spread' },
      { time: 7, type: 'shooter', count: 1, formation: 'line' },
      { time: 8, type: 'basic', count: 4, formation: 'v-shape' },
    ],
  },

  // Wave 2: Shooters and kamikazes — teaches dodging
  {
    duration: 16,
    entries: [
      { time: 0, type: 'shooter', count: 2, formation: 'line' },
      { time: 3, type: 'basic', count: 5, formation: 'spread' },
      { time: 5, type: 'shooter', count: 3, formation: 'v-shape' },
      { time: 8, type: 'kamikaze', count: 1, formation: 'random' },
      { time: 10, type: 'splitter', count: 2, formation: 'line' },
      { time: 12, type: 'shooter', count: 2, formation: 'spread' },
      { time: 14, type: 'kamikaze', count: 2, formation: 'random' },
    ],
  },

  // Wave 3: New threats — snipers, tank, pre-boss tension
  {
    duration: 18,
    entries: [
      { time: 0, type: 'shooter', count: 3, formation: 'spread' },
      { time: 2, type: 'sniper', count: 1, formation: 'line' },
      { time: 4, type: 'kamikaze', count: 2, formation: 'random' },
      { time: 6, type: 'splitter', count: 3, formation: 'v-shape' },
      { time: 8, type: 'tank', count: 1, formation: 'line' },
      { time: 10, type: 'sniper', count: 2, formation: 'spread' },
      { time: 13, type: 'kamikaze', count: 3, formation: 'random' },
      { time: 15, type: 'basic', count: 4, formation: 'spread' },
    ],
  },

  // Wave 4: Boss — Dreadnought
  {
    duration: 60,
    entries: [
      { time: 0, boss: 'dreadnought' },
    ],
  },

  // Wave 5: Recovery — player feels powerful, first miniboss tease
  {
    duration: 22,
    entries: [
      { time: 0, type: 'basic', count: 6, formation: 'spread' },
      { time: 3, type: 'basic', count: 4, formation: 'v-shape' },
      { time: 6, type: 'shooter', count: 3, formation: 'line' },
      { time: 9, type: 'splitter', count: 3, formation: 'spread' },
      { time: 12, type: 'kamikaze', count: 3, formation: 'random' },
      { time: 14, type: 'elite', count: 1, formation: 'line' },
      { time: 16, type: 'sniper', count: 2, formation: 'line' },
      { time: 19, type: 'kamikaze', count: 2, formation: 'random' },
    ],
  },

  // Wave 6: Full roster + miniboss encounter
  {
    duration: 25,
    entries: [
      { time: 0, type: 'elite', count: 2, formation: 'line' },
      { time: 3, type: 'sniper', count: 2, formation: 'spread' },
      { time: 5, type: 'kamikaze', count: 3, formation: 'random' },
      { time: 7, type: 'splitter', count: 4, formation: 'v-shape' },
      { time: 10, type: 'miniboss', count: 1, formation: 'line' },
      { time: 12, type: 'shooter', count: 3, formation: 'spread' },
      { time: 15, type: 'tank', count: 1, formation: 'line' },
      { time: 18, type: 'elite', count: 2, formation: 'spread' },
      { time: 21, type: 'kamikaze', count: 4, formation: 'random' },
    ],
  },

  // Wave 7: Endless loop — all enemy types, miniboss every cycle
  {
    duration: 25,
    loop: true,
    entries: [
      { time: 0, type: 'elite', count: 2, formation: 'spread' },
      { time: 2, type: 'kamikaze', count: 4, formation: 'random' },
      { time: 4, type: 'sniper', count: 2, formation: 'line' },
      { time: 7, type: 'tank', count: 2, formation: 'line' },
      { time: 9, type: 'splitter', count: 4, formation: 'v-shape' },
      { time: 12, type: 'shooter', count: 4, formation: 'spread' },
      { time: 14, type: 'miniboss', count: 1, formation: 'line' },
      { time: 16, type: 'basic', count: 6, formation: 'spread' },
      { time: 19, type: 'elite', count: 3, formation: 'line' },
      { time: 22, type: 'kamikaze', count: 5, formation: 'random' },
    ],
  },
];
