export const DIFFICULTY = {
  speedMultiplierPerWave: 0.10,
  hpMultiplierPerWave: 0.15,
  spawnRateMultiplierPerWave: 0.06,
  maxSpeedMultiplier: 2.2,
  maxHpMultiplier: 3.0,
} as const;

export const COMBO = {
  decayTime: 2.5,
  maxMultiplier: 10,
} as const;

export const SCORE = {
  killBase: 100,
} as const;

export const WAVE_PACING = {
  pauseBetweenWaves: 1.5,
  pauseBeforeBoss: 2.5,
  pauseAfterBoss: 3.0,
} as const;
