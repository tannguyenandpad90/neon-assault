export enum GameScreen {
  Menu = 'menu',
  Playing = 'playing',
  Paused = 'paused',
  GameOver = 'gameover',
}

export interface UISnapshot {
  score: number;
  hp: number;
  maxHp: number;
  combo: number;
  multiplier: number;
  bombs: number;
  wave: number;
  bossActive: boolean;
  bossName: string;
  bossHp: number;
  bossMaxHp: number;
  bossPhase: number;
  // Active buffs
  firepowerLevel: number;
  shieldActive: boolean;
  shieldTimer: number;
  magnetTimer: number;
  overdriveTimer: number;
  // Progress
  enemyCount: number;
}

export interface UIState extends UISnapshot {
  screen: GameScreen;
  finalScore: number;
  finalWave: number;
  highScore: number;
}
