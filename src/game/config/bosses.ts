export interface BossAttackPattern {
  name: string;
  type: 'spiral' | 'aimed_burst' | 'radial' | 'laser_sweep' | 'minion_spawn';
  bulletCount: number;
  bulletSpeed: number;
  bulletDamage: number;
  bulletColor: number;
  bulletSize: number;
  duration: number;
  cooldown: number;
  telegraphDuration: number;
  /** For minion_spawn: enemy type to spawn. */
  minionType?: string;
}

export interface BossPhaseConfig {
  hpThreshold: number;
  speed: number;
  attacks: BossAttackPattern[];
  transitionDuration: number;
  color: number;
}

export interface BossConfig {
  name: string;
  hp: number;
  width: number;
  height: number;
  baseColor: number;
  scoreValue: number;
  phases: BossPhaseConfig[];
}

export const BOSS_DREADNOUGHT: BossConfig = {
  name: 'DREADNOUGHT',
  hp: 60,
  width: 56,
  height: 48,
  baseColor: 0x884422,
  scoreValue: 5000,
  phases: [
    {
      hpThreshold: 1.0,
      speed: 45,
      color: 0x884422,
      transitionDuration: 0,
      attacks: [
        {
          name: 'aimed_burst',
          type: 'aimed_burst',
          bulletCount: 4,
          bulletSpeed: 190,
          bulletDamage: 1,
          bulletColor: 0xff6644,
          bulletSize: 6,
          duration: 0.7,
          cooldown: 1.2,
          telegraphDuration: 0.35,
        },
        {
          name: 'radial',
          type: 'radial',
          bulletCount: 14,
          bulletSpeed: 130,
          bulletDamage: 1,
          bulletColor: 0xffaa44,
          bulletSize: 5,
          duration: 0.1,
          cooldown: 2.2,
          telegraphDuration: 0.5,
        },
      ],
    },
    {
      hpThreshold: 0.45,
      speed: 65,
      color: 0xcc4422,
      transitionDuration: 1.5,
      attacks: [
        {
          name: 'spiral',
          type: 'spiral',
          bulletCount: 28,
          bulletSpeed: 150,
          bulletDamage: 1,
          bulletColor: 0xff4444,
          bulletSize: 5,
          duration: 2.0,
          cooldown: 2.5,
          telegraphDuration: 0.7,
        },
        {
          name: 'minion_spawn',
          type: 'minion_spawn',
          bulletCount: 3,
          bulletSpeed: 0,
          bulletDamage: 0,
          bulletColor: 0xcc3333,
          bulletSize: 0,
          duration: 0.5,
          cooldown: 4.0,
          telegraphDuration: 0.6,
          minionType: 'basic',
        },
        {
          name: 'aimed_burst_fast',
          type: 'aimed_burst',
          bulletCount: 5,
          bulletSpeed: 230,
          bulletDamage: 1,
          bulletColor: 0xff6644,
          bulletSize: 6,
          duration: 0.6,
          cooldown: 0.8,
          telegraphDuration: 0.25,
        },
        {
          name: 'laser_sweep',
          type: 'laser_sweep',
          bulletCount: 35,
          bulletSpeed: 260,
          bulletDamage: 1,
          bulletColor: 0xff2222,
          bulletSize: 4,
          duration: 1.5,
          cooldown: 3.0,
          telegraphDuration: 0.8,
        },
      ],
    },
  ],
};
