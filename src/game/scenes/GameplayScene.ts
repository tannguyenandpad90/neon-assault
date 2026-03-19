import { Container, Graphics } from 'pixi.js';
import type { Entity, Scene, PowerUpType, EnemyType } from '@game/types';
import { playerData, bossData, enemyData } from '@game/types';
import { Engine } from '@game/core/Engine';
import { InputManager } from '@game/core/InputManager';
import { EntityManager } from '@game/core/EntityManager';
import { Camera } from '@game/core/Camera';
import { checkCollisions } from '@game/core/CollisionSystem';
import { GameBridge } from '@app/GameBridge';
import { FxCoordinator, SHAKE } from '@game/fx/FxCoordinator';
import { Starfield } from '@game/fx/Starfield';
import { ThrusterFX } from '@game/fx/ThrusterFX';
import { Vignette } from '@game/fx/Vignette';
import { createPlayer } from '@game/entities/Player';
import { createBoss } from '@game/entities/Boss';
import { createEnemy } from '@game/entities/Enemy';
import { createPowerUp } from '@game/entities/PowerUp';
import { updatePlayer } from '@game/systems/PlayerSystem';
import { updateWeapons, resetWeaponState } from '@game/systems/WeaponSystem';
import { updateEnemyBehaviors } from '@game/systems/EnemyBehaviorSystem';
import { processDamage, type DamageResult } from '@game/systems/DamageSystem';
import { processPowerUps } from '@game/systems/PowerUpSystem';
import { ComboTracker } from '@game/systems/ComboSystem';
import { WaveDirector } from '@game/systems/SpawnSystem';
import { BossController } from '@game/systems/BossSystem';
import { updateBomb } from '@game/systems/BombSystem';
import { cleanup } from '@game/systems/CleanupSystem';
import { WORLD_WIDTH, WORLD_HEIGHT, BOSS_DEATH } from '@game/config/game';
import { POWERUP_DROP_CHANCE, POWERUP_DROP_WEIGHTS, MAGNET_PULL_RADIUS, MAGNET_PULL_SPEED } from '@game/config/powerups';
import { ENEMIES } from '@game/config/enemies';
import { BOSS_DREADNOUGHT } from '@game/config/bosses';
import type { BossConfig } from '@game/config/bosses';

const BOSS_REGISTRY: Record<string, BossConfig> = { dreadnought: BOSS_DREADNOUGHT };
const POWERUP_TYPES: PowerUpType[] = ['firepower', 'firerate', 'shield', 'heal', 'bomb', 'magnet', 'overdrive'];

const ENEMY_SHAKE: Partial<Record<EnemyType, { intensity: number; duration: number }>> = {
  tank: SHAKE.EXPLOSION_LG,
  miniboss: SHAKE.EXPLOSION_LG,
  elite: { intensity: 5, duration: 0.25 },
};

export class GameplayScene implements Scene {
  name = 'gameplay';

  private engine: Engine;
  private input: InputManager;
  private entities: EntityManager;
  private camera: Camera;
  private bridge: GameBridge;
  private fx!: FxCoordinator;
  private starfield!: Starfield;
  private thruster!: ThrusterFX;
  private vignette!: Vignette;

  private bgLayer = new Container();
  private entityLayer = new Container();
  private projectileLayer = new Container();
  private fxLayer = new Container();
  private uiLayer = new Container();

  private player!: Entity;
  private shieldRing: Graphics | null = null;
  private combo = new ComboTracker();
  private waveDirector = new WaveDirector();
  private score = 0;

  private bossEntity: Entity | null = null;
  private bossController: BossController | null = null;
  private activeBossConfig: BossConfig | null = null;

  private regularEnemiesCache: Entity[] = [];
  private trailCounter = 0;

  constructor(
    engine: Engine, input: InputManager, entityManager: EntityManager,
    camera: Camera, bridge: GameBridge,
  ) {
    this.engine = engine;
    this.input = input;
    this.entities = entityManager;
    this.camera = camera;
    this.bridge = bridge;
  }

  setup(): void {
    this.entities.clear();
    this.combo.reset();
    this.waveDirector.reset();
    this.score = 0;
    this.bossEntity = null;
    this.bossController = null;
    this.activeBossConfig = null;
    this.regularEnemiesCache = [];
    this.trailCounter = 0;
    resetWeaponState();

    this.bgLayer.removeChildren();
    this.entityLayer.removeChildren();
    this.projectileLayer.removeChildren();
    this.fxLayer.removeChildren();
    this.uiLayer.removeChildren();

    this.engine.stage.addChild(this.bgLayer);
    this.engine.stage.addChild(this.entityLayer);
    this.engine.stage.addChild(this.projectileLayer);
    this.engine.stage.addChild(this.fxLayer);
    this.engine.stage.addChild(this.uiLayer);

    this.starfield = new Starfield(this.bgLayer, WORLD_WIDTH, WORLD_HEIGHT);
    this.fx = new FxCoordinator(this.fxLayer, this.camera, WORLD_WIDTH, WORLD_HEIGHT);
    this.thruster = new ThrusterFX(this.fxLayer);
    this.vignette = new Vignette(this.uiLayer, WORLD_WIDTH, WORLD_HEIGHT);

    this.player = createPlayer();
    this.entities.add(this.player);
    this.entityLayer.addChild(this.player.sprite);

    this.shieldRing = new Graphics();
    this.shieldRing.circle(0, 0, this.player.width * 0.8)
      .stroke({ width: 2, color: 0x4488ff, alpha: 0.6 });
    this.shieldRing.visible = false;
    this.entityLayer.addChild(this.shieldRing);

    this.sfx('music', { track: 'gameplay' });
    this.syncBridge();
  }

  update(rawDt: number): void {
    const dt = rawDt * this.fx.hitstopScale;

    this.starfield.update(dt);
    this.updatePlayerPhase(dt);
    this.updateEnemyPhase(dt);
    this.updateSpawnPhase(dt);
    this.updateMovementPhase(dt);
    this.updateHomingProjectiles(dt);
    this.updateMagnetPull(dt);

    const pairs = checkCollisions(this.entities);
    const damageResult = processDamage(pairs);
    if (this.handleDamageResult(damageResult)) return;
    this.handlePowerUps(damageResult);

    const prevMult = this.combo.multiplier;
    this.combo.update(dt);
    if (this.combo.multiplier > prevMult) this.sfx('sfx', { key: 'combo_up' });

    this.fx.update(rawDt);
    this.thruster.update(rawDt);
    this.updateShieldRing();

    cleanup(this.entities);

    this.camera.update(rawDt);
    const offset = this.camera.getOffset();
    this.engine.stage.x = offset.x;
    this.engine.stage.y = offset.y;

    this.syncBridge();
  }

  teardown(): void {
    this.destroyBoss();
    this.entities.clear();

    this.engine.stage.removeChild(this.bgLayer);
    this.engine.stage.removeChild(this.entityLayer);
    this.engine.stage.removeChild(this.projectileLayer);
    this.engine.stage.removeChild(this.fxLayer);
    this.engine.stage.removeChild(this.uiLayer);

    if (this.shieldRing) { this.shieldRing.destroy(); this.shieldRing = null; }

    this.fx.clear();
    this.thruster.destroy();
    this.vignette.destroy();
    this.regularEnemiesCache = [];
    this.camera.reset();
    this.engine.stage.x = 0;
    this.engine.stage.y = 0;

    this.sfx('music', { action: 'stop' });
  }

  // ─── Phases ───

  private updatePlayerPhase(dt: number): void {
    updatePlayer(this.player, this.input, dt);

    // Thruster particles
    const hasInput = this.input.isAction('up') || this.input.isAction('down') ||
                     this.input.isAction('left') || this.input.isAction('right');
    const intensity = hasInput ? 3 : 0.5;
    this.thruster.emit(
      this.player.x, this.player.y + this.player.height * 0.45,
      this.player.vx, this.player.vy, intensity,
    );

    const fired = updateWeapons(this.player, this.input, dt, this.entities, this.projectileLayer);
    if (fired) {
      const pd = playerData(this.player);
      this.fx.muzzleFlash(this.player.x, this.player.y - this.player.height * 0.5);
      this.sfx('sfx', { key: pd.firepowerLevel >= 3 || pd.overdriveTimer > 0 ? 'fire_spread' : 'fire' });
    }

    const bombResult = updateBomb(this.player, this.input, this.entities);
    if (bombResult.triggered) {
      this.fx.shake(SHAKE.BOMB);
      this.fx.flash(0xffffff, 0.15, 0.5);
      this.fx.explosion(WORLD_WIDTH * 0.5, WORLD_HEIGHT * 0.5, WORLD_WIDTH, 0xffffff);
      this.score += bombResult.scoreGained * this.combo.multiplier;
      this.sfx('sfx', { key: 'bomb' });
      this.bridge.emit('bomb:change', { bombs: playerData(this.player).bombs });
      for (let i = 0; i < bombResult.kills; i++) this.combo.onKill();
    }
  }

  private updateEnemyPhase(dt: number): void {
    this.regularEnemiesCache.length = 0;
    for (const e of this.entities.iterateTag('enemy')) {
      if (!e.tags.has('boss')) this.regularEnemiesCache.push(e);
    }
    updateEnemyBehaviors(this.regularEnemiesCache, this.player, dt, this.entities, this.projectileLayer);

    if (this.bossController && this.bossEntity?.alive) {
      const bossEvents = this.bossController.update(dt, this.player, this.entities, this.projectileLayer);
      for (const evt of bossEvents) {
        if (evt.type === 'phase_change') {
          this.fx.shake(SHAKE.BOSS_HIT);
          this.fx.flash(0xff2222, 0.2, 0.3);
          this.fx.hitstop(0.15, 0.3);
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI * 2 / 6) * i;
            this.fx.explosion(this.bossEntity.x + Math.cos(a) * 30, this.bossEntity.y + Math.sin(a) * 30, 25, 0xff4422);
          }
          this.sfx('sfx', { key: 'boss_phase' });
          this.bridge.emit('boss:phase', { phase: evt.phase ?? 0 });
        }
        if (evt.type === 'entry_complete') {
          this.sfx('sfx', { key: 'boss_enter' });
          this.sfx('music', { track: 'boss' });
          this.bridge.emit('boss:enter', { name: this.activeBossConfig?.name ?? 'BOSS', maxHp: this.bossEntity.maxHp });
        }
      }
    }
  }

  private updateSpawnPhase(dt: number): void {
    const events = this.waveDirector.update(dt, this.entities, this.entityLayer);
    for (const evt of events) {
      if (evt.type === 'boss_spawn') this.spawnBoss(evt.bossId!);
      if (evt.type === 'wave_start') this.bridge.emit('wave:change', { wave: evt.wave! });
    }
  }

  private updateMovementPhase(dt: number): void {
    for (const entity of this.entities.iterate()) {
      if (!entity.alive || entity.tags.has('player')) continue;
      entity.x += entity.vx * dt;
      entity.y += entity.vy * dt;
      entity.sprite.x = entity.x;
      entity.sprite.y = entity.y;
      if (entity.rotation !== 0) entity.sprite.rotation = entity.rotation;
    }
  }

  private updateHomingProjectiles(dt: number): void {
    this.trailCounter++;
    for (const proj of this.entities.iterateTag('homingProjectile')) {
      if (!proj.alive) continue;
      if (this.trailCounter % 3 === 0) this.fx.trail(proj.x, proj.y, 3, 0x44ffaa);

      let nearestDist = Infinity;
      let nearestEnemy: Entity | null = null;
      for (const enemy of this.entities.iterateTag('enemy')) {
        if (!enemy.alive) continue;
        const dx = enemy.x - proj.x, dy = enemy.y - proj.y;
        const d = dx * dx + dy * dy;
        if (d < nearestDist) { nearestDist = d; nearestEnemy = enemy; }
      }
      if (nearestEnemy) {
        const dx = nearestEnemy.x - proj.x, dy = nearestEnemy.y - proj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          const speed = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
          const turn = 5.0 * dt;
          proj.vx += (dx / dist) * speed * turn;
          proj.vy += (dy / dist) * speed * turn;
          const ns = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
          if (ns > 0) { proj.vx = (proj.vx / ns) * speed; proj.vy = (proj.vy / ns) * speed; }
        }
      }
    }
  }

  private updateMagnetPull(dt: number): void {
    const pd = playerData(this.player);
    if (pd.magnetTimer <= 0) return;
    const rSq = MAGNET_PULL_RADIUS * MAGNET_PULL_RADIUS;
    for (const pu of this.entities.iterateTag('powerup')) {
      if (!pu.alive) continue;
      const dx = this.player.x - pu.x, dy = this.player.y - pu.y;
      const dSq = dx * dx + dy * dy;
      if (dSq < rSq && dSq > 1) {
        const d = Math.sqrt(dSq), pull = MAGNET_PULL_SPEED * dt;
        pu.x += (dx / d) * pull; pu.y += (dy / d) * pull;
        pu.sprite.x = pu.x; pu.sprite.y = pu.y;
      }
    }
  }

  // ─── Collision ───

  private handleDamageResult(result: DamageResult): boolean {
    if (result.playerHit) {
      this.fx.shake(SHAKE.HIT);
      this.fx.hitFlash(this.player);
      this.fx.flash(0xff0000, 0.1, 0.25);
      this.sfx('sfx', { key: 'hit_player' });
      this.bridge.emit('player:hit', undefined);
      this.bridge.emit('hp:change', { hp: this.player.hp, maxHp: this.player.maxHp });
      if (this.player.hp <= 0) {
        this.fx.flash(0xff0000, 0.5, 0.6);
        this.sfx('sfx', { key: 'game_over' });
        this.sfx('music', { action: 'fadeOut', duration: 1.5 });
        this.bridge.emit('game:over', { score: this.score, wave: this.waveDirector.waveIndex + 1 });
        return true;
      }
    }
    for (let i = 0; i < result.bossHits.length; i++) {
      this.fx.hitFlash(result.bossHits[i]);
      this.sfx('sfx', { key: 'hit_enemy', volume: 0.3 });
    }
    for (const death of result.deaths) {
      if (death.entity.tags.has('boss')) this.handleBossDeath(death.entity);
      else if (death.entity.tags.has('enemy')) this.handleEnemyDeath(death.entity);
    }
    this.score += result.scoreGained * this.combo.multiplier;
    return false;
  }

  private handleEnemyDeath(enemy: Entity): void {
    const ed = enemyData(enemy);
    const config = ENEMIES[ed.enemyType];
    this.fx.explosion(enemy.x, enemy.y, enemy.width * 1.5);
    this.fx.shake(ENEMY_SHAKE[ed.enemyType] ?? SHAKE.EXPLOSION);
    this.sfx('sfx', { key: 'explosion_sm' });
    this.combo.onKill();
    if (config.splitInto && config.splitCount) this.spawnSplitFragments(enemy.x, enemy.y, config.splitInto, config.splitCount);
    if (config.guaranteedDrop || Math.random() < POWERUP_DROP_CHANCE) this.dropPowerUp(enemy.x, enemy.y);
  }

  private spawnSplitFragments(x: number, y: number, type: EnemyType, count: number): void {
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 / count) * i + Math.PI * 0.25;
      const f = createEnemy(type, x + Math.cos(a) * 15, y + Math.sin(a) * 15);
      f.vx = Math.cos(a) * 60;
      this.entities.add(f);
      this.entityLayer.addChild(f.sprite);
    }
  }

  private handlePowerUps(damageResult: DamageResult): void {
    const events = processPowerUps(damageResult.powerUpPickups, this.player);
    const pd = playerData(this.player);
    for (const evt of events) {
      this.sfx('sfx', { key: 'powerup' });
      this.bridge.emit('powerup:pickup', { type: evt.type });
      if (evt.type === 'heal' || evt.type === 'shield') this.bridge.emit('hp:change', { hp: this.player.hp, maxHp: this.player.maxHp });
      if (evt.type === 'bomb') this.bridge.emit('bomb:change', { bombs: pd.bombs });
    }
  }

  // ─── Visuals ───

  private updateShieldRing(): void {
    if (!this.shieldRing) return;
    const pd = playerData(this.player);
    this.shieldRing.visible = pd.shieldActive;
    if (pd.shieldActive) {
      this.shieldRing.x = this.player.x;
      this.shieldRing.y = this.player.y;
      this.shieldRing.alpha = 0.4 + Math.sin(pd.shieldTimer * 8) * 0.3;
    }
  }

  // ─── Boss ───

  private spawnBoss(bossId: string): void {
    const config = BOSS_REGISTRY[bossId];
    if (!config) return;
    this.activeBossConfig = config;
    this.bossEntity = createBoss(config);
    this.entities.add(this.bossEntity);
    this.entityLayer.addChild(this.bossEntity.sprite);
    this.bossController = new BossController(this.bossEntity, config, this.fxLayer, this.entityLayer);
  }

  private handleBossDeath(boss: Entity): void {
    const { x: cx, y: cy } = boss;
    const d = BOSS_DEATH;
    for (let i = 0; i < d.explosionCount; i++) {
      const a = (Math.PI * 2 / d.explosionCount) * i;
      const dist = 10 + Math.random() * d.explosionSpread;
      this.fx.deferExplosion(cx + Math.cos(a) * dist, cy + Math.sin(a) * dist, d.explosionBaseSize + Math.random() * d.explosionSizeVariance, d.colors[i % d.colors.length], i * d.explosionStaggerDelay);
    }
    this.fx.explosion(cx, cy, d.centralExplosionSize, 0xffffff);
    this.fx.shakeRaw(d.shakeIntensity, d.shakeDuration);
    this.fx.flash(0xffffff, 0.3, 0.5);
    this.fx.hitstop(0.1, 0.5);
    this.sfx('sfx', { key: 'boss_death' });
    this.sfx('music', { track: 'gameplay' });
    this.combo.onKill();
    for (let i = 0; i < d.drops.length; i++) {
      const pu = createPowerUp(d.drops[i], cx + (i - 1) * 20, cy);
      this.entities.add(pu); this.entityLayer.addChild(pu.sprite);
    }
    this.waveDirector.setBossDefeated();
    this.destroyBoss();
  }

  private destroyBoss(): void {
    if (this.bossController) { this.bossController.destroy(); this.bossController = null; }
    this.bossEntity = null; this.activeBossConfig = null;
  }

  // ─── Helpers ───

  private dropPowerUp(x: number, y: number): void {
    const w = POWERUP_DROP_WEIGHTS;
    let roll = Math.random() * w.total;
    let type: PowerUpType = 'heal';
    for (let i = 0; i < POWERUP_TYPES.length; i++) { roll -= w.values[i]; if (roll <= 0) { type = POWERUP_TYPES[i]; break; } }
    const pu = createPowerUp(type, x, y);
    this.entities.add(pu); this.entityLayer.addChild(pu.sprite);
  }

  private sfx<K extends 'sfx' | 'music'>(event: K, data: import('@game/types/events').GameEventMap[K]): void {
    this.bridge.emit(event, data);
  }

  private syncBridge(): void {
    const pd = playerData(this.player);
    const bossAlive = this.bossEntity != null && this.bossEntity.alive;
    let enemyCount = 0;
    for (const e of this.entities.iterateTag('enemy')) { if (e.alive && !e.tags.has('boss')) enemyCount++; }
    this.bridge.updateSnapshot({
      score: this.score, hp: this.player.hp, maxHp: this.player.maxHp,
      combo: this.combo.count, multiplier: this.combo.multiplier, bombs: pd.bombs,
      wave: this.waveDirector.waveIndex + 1,
      bossActive: bossAlive, bossName: this.activeBossConfig?.name ?? '',
      bossHp: this.bossEntity?.hp ?? 0, bossMaxHp: this.bossEntity?.maxHp ?? 0,
      bossPhase: bossAlive ? bossData(this.bossEntity!).phaseIndex : 0,
      firepowerLevel: pd.overdriveTimer > 0 ? 4 : pd.firepowerLevel,
      shieldActive: pd.shieldActive, shieldTimer: pd.shieldTimer,
      magnetTimer: pd.magnetTimer, overdriveTimer: pd.overdriveTimer, enemyCount,
    });
  }
}
