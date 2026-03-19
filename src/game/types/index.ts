import { Container, Graphics } from 'pixi.js';

export type Tag =
  | 'player'
  | 'enemy'
  | 'boss'
  | 'projectile'
  | 'playerProjectile'
  | 'enemyProjectile'
  | 'homingProjectile'
  | 'powerup'
  | 'fx';

export interface Vec2 {
  x: number;
  y: number;
}

export interface HitBox {
  width: number;
  height: number;
}

// --- Typed entity data ---

export interface PlayerData {
  fireCooldown: number;
  bombs: number;
  invincibleTimer: number;
  firepowerLevel: number;
  fireRateMultiplier: number;
  fireRateTimer: number;
  shieldTimer: number;
  shieldActive: boolean;
  magnetTimer: number;
  overdriveTimer: number;
  shotCounter: number;
}

export interface EnemyData {
  enemyType: EnemyType;
  movementType: MovementPattern;
  fireTimer: number;
  fireRate: number;
  spawnX: number;
  elapsed: number;
  hoverTargetY?: number;
  hoverReached?: boolean;
}

export interface BossData {
  bossName: string;
  phaseIndex: number;
  attackIndex: number;
  attackCooldown: number;
  attackElapsed: number;
  attacking: boolean;
  telegraphing: boolean;
  telegraphElapsed: number;
  transitioning: boolean;
  transitionElapsed: number;
  transitionDuration: number;
  moveElapsed: number;
  entryComplete: boolean;
  entryTargetY: number;
  spiralAngle: number;
  sweepAngle: number;
}

export interface ProjectileData {
  owner: 'player' | 'enemy';
}

export interface PowerUpData {
  powerUpType: PowerUpType;
}

export interface FxData {
  lifespan: number;
  elapsed: number;
  maxSize: number;
  color: number;
}

export type EntityData = PlayerData | EnemyData | BossData | ProjectileData | PowerUpData | FxData | Record<string, unknown>;

export interface Entity {
  id: number;
  tags: Set<Tag>;

  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;

  width: number;
  height: number;

  hp: number;
  maxHp: number;
  damage: number;
  scoreValue: number;

  sprite: Container | Graphics;
  alive: boolean;

  data: EntityData;
}

export function playerData(e: Entity): PlayerData {
  return e.data as PlayerData;
}
export function enemyData(e: Entity): EnemyData {
  return e.data as EnemyData;
}
export function bossData(e: Entity): BossData {
  return e.data as BossData;
}
export function powerUpData(e: Entity): PowerUpData {
  return e.data as PowerUpData;
}

export interface CollisionPair {
  a: Entity;
  b: Entity;
}

export interface DeathEvent {
  entity: Entity;
  killedBy: Entity | null;
}

export enum GameState {
  Menu = 'menu',
  Playing = 'playing',
  Paused = 'paused',
  GameOver = 'gameover',
}

export type EnemyType = 'basic' | 'shooter' | 'kamikaze' | 'tank' | 'elite' | 'splitter' | 'sniper' | 'miniboss';

export type MovementPattern = 'linear' | 'sinusoidal' | 'homing' | 'zigzag' | 'stationary' | 'hover';

export type PowerUpType = 'firepower' | 'firerate' | 'shield' | 'heal' | 'bomb' | 'magnet' | 'overdrive';

export interface EnemyConfig {
  hp: number;
  speed: number;
  scoreValue: number;
  width: number;
  height: number;
  color: number;
  movement: MovementPattern;
  fireRate: number;
  damage: number;
  /** If true, drops a power-up on death regardless of random chance. */
  guaranteedDrop?: boolean;
  /** For splitter: type of enemy to spawn on death. */
  splitInto?: EnemyType;
  /** For splitter: how many fragments to spawn. */
  splitCount?: number;
}

export interface WeaponConfig {
  speed: number;
  damage: number;
  cooldown: number;
  width: number;
  height: number;
  color: number;
}

export interface WaveSpawnEntry {
  time: number;
  type: EnemyType;
  count: number;
  formation: 'line' | 'v-shape' | 'random' | 'spread';
  x?: number;
}

export interface WaveBossEntry {
  time: number;
  boss: string;
}

export type WaveEntry = WaveSpawnEntry | WaveBossEntry;

export interface WaveDefinition {
  duration: number;
  entries: WaveEntry[];
  loop?: boolean;
}

export interface Scene {
  name: string;
  setup(): void;
  update(dt: number): void;
  teardown(): void;
}
