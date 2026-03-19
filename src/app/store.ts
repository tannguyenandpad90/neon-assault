import { create } from 'zustand';
import { GameScreen, type UIState } from './types';
import type { GameBridge } from './GameBridge';

const LS_HIGH_SCORE = 'skyreign_highscore';

function loadHighScore(): number {
  try { return parseInt(localStorage.getItem(LS_HIGH_SCORE) ?? '0', 10) || 0; }
  catch { return 0; }
}

function saveHighScore(score: number): void {
  try { localStorage.setItem(LS_HIGH_SCORE, String(score)); }
  catch { /* noop */ }
}

export interface GameStore extends UIState {
  setScreen: (screen: GameScreen) => void;
  syncFromBridge: (bridge: GameBridge) => void;
  setGameOver: (score: number, wave: number) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  screen: GameScreen.Menu,
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
  finalScore: 0,
  finalWave: 0,
  highScore: loadHighScore(),

  setScreen: (screen) => set({ screen }),

  syncFromBridge: (bridge) => {
    const s = bridge.snapshot;
    set({
      score: s.score,
      hp: s.hp,
      maxHp: s.maxHp,
      combo: s.combo,
      multiplier: s.multiplier,
      bombs: s.bombs,
      wave: s.wave,
      bossActive: s.bossActive,
      bossName: s.bossName,
      bossHp: s.bossHp,
      bossMaxHp: s.bossMaxHp,
      bossPhase: s.bossPhase,
      firepowerLevel: s.firepowerLevel,
      shieldActive: s.shieldActive,
      shieldTimer: s.shieldTimer,
      magnetTimer: s.magnetTimer,
      overdriveTimer: s.overdriveTimer,
      enemyCount: s.enemyCount,
    });
  },

  setGameOver: (score, wave) => {
    const prev = get().highScore;
    const isNew = score > prev;
    if (isNew) saveHighScore(score);
    set({
      screen: GameScreen.GameOver,
      finalScore: score,
      finalWave: wave,
      highScore: isNew ? score : prev,
    });
  },
}));
