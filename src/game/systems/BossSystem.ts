import type { Entity, WeaponConfig, EnemyType } from '@game/types';
import { bossData } from '@game/types';
import type { BossConfig, BossPhaseConfig, BossAttackPattern } from '@game/config/bosses';
import { EntityManager } from '@game/core/EntityManager';
import { spawnProjectile } from '@game/entities/Projectile';
import { createEnemy } from '@game/entities/Enemy';
import { WORLD_WIDTH, BOSS_ENTRY_SPEED } from '@game/config/game';
import { Container, Graphics } from 'pixi.js';

export interface BossEvent {
  type: 'phase_change' | 'telegraph' | 'attack_start' | 'attack_end' | 'entry_complete';
  phase?: number;
  attackName?: string;
}

function attackToWeapon(attack: BossAttackPattern): WeaponConfig {
  return {
    speed: attack.bulletSpeed,
    damage: attack.bulletDamage,
    cooldown: 0,
    width: attack.bulletSize,
    height: attack.bulletSize,
    color: attack.bulletColor,
  };
}

export class BossController {
  private config: BossConfig;
  private boss: Entity;
  private telegraphGraphic: Graphics | null = null;
  private fxLayer: Container;
  private enemyLayer: Container;

  constructor(boss: Entity, config: BossConfig, fxLayer: Container, enemyLayer: Container) {
    this.boss = boss;
    this.config = config;
    this.fxLayer = fxLayer;
    this.enemyLayer = enemyLayer;
  }

  private get bd() { return bossData(this.boss); }

  get currentPhase(): BossPhaseConfig {
    return this.config.phases[Math.min(this.bd.phaseIndex, this.config.phases.length - 1)];
  }

  get currentAttack(): BossAttackPattern {
    const phase = this.currentPhase;
    return phase.attacks[this.bd.attackIndex % phase.attacks.length];
  }

  update(
    dt: number,
    player: Entity,
    entityManager: EntityManager,
    projectileLayer: Container,
  ): BossEvent[] {
    const events: BossEvent[] = [];
    if (!this.boss.alive) return events;

    const bd = this.bd;

    if (!bd.entryComplete) return this.updateEntry(dt, events);
    if (bd.transitioning) return this.updateTransition(dt, events);

    this.checkPhaseTransition(events);
    this.updateMovement(dt);
    this.updateAttacks(dt, player, entityManager, projectileLayer, events);

    return events;
  }

  // --- Entry ---

  private updateEntry(dt: number, events: BossEvent[]): BossEvent[] {
    const bd = this.bd;
    this.boss.y += BOSS_ENTRY_SPEED * dt;
    this.boss.sprite.y = this.boss.y;
    if (this.boss.y >= bd.entryTargetY) {
      this.boss.y = bd.entryTargetY;
      this.boss.sprite.y = bd.entryTargetY;
      bd.entryComplete = true;
      events.push({ type: 'entry_complete' });
    }
    return events;
  }

  // --- Phase Transition ---

  private checkPhaseTransition(events: BossEvent[]): void {
    const bd = this.bd;
    const hpRatio = this.boss.hp / this.boss.maxHp;

    for (let i = bd.phaseIndex + 1; i < this.config.phases.length; i++) {
      if (hpRatio <= this.config.phases[i].hpThreshold) {
        bd.phaseIndex = i;
        bd.attackIndex = 0;
        bd.attackCooldown = 1.0;
        bd.attacking = false;
        bd.telegraphing = false;

        const phase = this.config.phases[i];
        if (phase.transitionDuration > 0) {
          bd.transitioning = true;
          bd.transitionElapsed = 0;
          bd.transitionDuration = phase.transitionDuration;
        }
        events.push({ type: 'phase_change', phase: i });
        break;
      }
    }
  }

  private updateTransition(dt: number, events: BossEvent[]): BossEvent[] {
    const bd = this.bd;
    bd.transitionElapsed += dt;
    this.boss.sprite.alpha = 0.5 + Math.sin(bd.transitionElapsed * 15) * 0.4;

    if (bd.transitionElapsed > bd.transitionDuration * 0.5) {
      this.boss.sprite.tint = this.currentPhase.color;
    }
    if (bd.transitionElapsed >= bd.transitionDuration) {
      bd.transitioning = false;
      this.boss.sprite.alpha = 1;
      this.boss.sprite.tint = this.currentPhase.color;
    }
    return events;
  }

  // --- Movement ---

  private updateMovement(dt: number): void {
    const bd = this.bd;
    bd.moveElapsed += dt;
    const freq = 0.4 * (this.currentPhase.speed / 40);

    this.boss.x = WORLD_WIDTH * 0.5 + Math.sin(bd.moveElapsed * freq) * WORLD_WIDTH * 0.3;
    this.boss.y = bd.entryTargetY + Math.sin(bd.moveElapsed * 0.8) * 6;
    this.boss.sprite.x = this.boss.x;
    this.boss.sprite.y = this.boss.y;
  }

  // --- Attack State Machine ---

  private updateAttacks(
    dt: number,
    player: Entity,
    em: EntityManager,
    layer: Container,
    events: BossEvent[],
  ): void {
    const bd = this.bd;

    if (!bd.telegraphing && !bd.attacking) {
      bd.attackCooldown -= dt;
      if (bd.attackCooldown <= 0) {
        bd.telegraphing = true;
        bd.telegraphElapsed = 0;
        this.showTelegraph();
        events.push({ type: 'telegraph', attackName: this.currentAttack.name });
      }
      return;
    }

    if (bd.telegraphing) {
      bd.telegraphElapsed += dt;
      this.updateTelegraphVisual(bd.telegraphElapsed);
      if (bd.telegraphElapsed >= this.currentAttack.telegraphDuration) {
        bd.telegraphing = false;
        bd.attacking = true;
        bd.attackElapsed = 0;
        this.hideTelegraph();
        events.push({ type: 'attack_start', attackName: this.currentAttack.name });
      }
      return;
    }

    if (bd.attacking) {
      bd.attackElapsed += dt;
      const attack = this.currentAttack;
      this.executeAttack(attack, bd.attackElapsed, dt, player, em, layer);

      if (bd.attackElapsed >= attack.duration) {
        bd.attacking = false;
        bd.attackCooldown = attack.cooldown;
        bd.attackIndex = (bd.attackIndex + 1) % this.currentPhase.attacks.length;
        events.push({ type: 'attack_end', attackName: attack.name });
      }
    }
  }

  // --- Attack Execution ---

  private executeAttack(
    attack: BossAttackPattern,
    elapsed: number,
    dt: number,
    player: Entity,
    em: EntityManager,
    layer: Container,
  ): void {
    switch (attack.type) {
      case 'aimed_burst':
        this.fireAimedBurst(attack, attackToWeapon(attack), elapsed, player, em, layer);
        break;
      case 'radial':
        this.fireRadial(attack, attackToWeapon(attack), elapsed, em, layer);
        break;
      case 'spiral':
        this.fireSpiral(attack, attackToWeapon(attack), elapsed, dt, em, layer);
        break;
      case 'laser_sweep':
        this.fireLaserSweep(attack, attackToWeapon(attack), elapsed, dt, em, layer);
        break;
      case 'minion_spawn':
        this.spawnMinions(attack, elapsed, em);
        break;
    }
  }

  private fireAimedBurst(
    attack: BossAttackPattern, cfg: WeaponConfig, elapsed: number,
    player: Entity, em: EntityManager, layer: Container,
  ): void {
    const interval = attack.duration / attack.bulletCount;
    const shot = Math.floor(elapsed / interval);
    const prev = Math.floor(Math.max(0, elapsed - 0.017) / interval);
    if (shot <= prev || shot > attack.bulletCount) return;

    const dx = player.x - this.boss.x;
    const dy = player.y - this.boss.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return;

    const base = Math.atan2(dy, dx);
    for (const offset of [-0.15, 0, 0.15]) {
      const a = base + offset;
      spawnProjectile(
        this.boss.x, this.boss.y + this.boss.height * 0.4,
        cfg, 'enemyProjectile', em, layer,
        Math.sin(a) * attack.bulletSpeed, Math.cos(a) * attack.bulletSpeed,
      );
    }
  }

  private fireRadial(
    attack: BossAttackPattern, cfg: WeaponConfig, elapsed: number,
    em: EntityManager, layer: Container,
  ): void {
    if (elapsed >= 0.02) return;
    for (let i = 0; i < attack.bulletCount; i++) {
      const a = (Math.PI * 2 / attack.bulletCount) * i;
      spawnProjectile(
        this.boss.x, this.boss.y, cfg, 'enemyProjectile', em, layer,
        Math.sin(a) * attack.bulletSpeed, Math.cos(a) * attack.bulletSpeed,
      );
    }
  }

  private fireSpiral(
    attack: BossAttackPattern, cfg: WeaponConfig, elapsed: number, dt: number,
    em: EntityManager, layer: Container,
  ): void {
    const bd = this.bd;
    const interval = attack.duration / attack.bulletCount;
    const before = Math.floor(Math.max(0, elapsed - dt) / interval);
    const now = Math.floor(elapsed / interval);

    for (let s = before + 1; s <= now; s++) {
      spawnProjectile(
        this.boss.x, this.boss.y, cfg, 'enemyProjectile', em, layer,
        Math.sin(bd.spiralAngle) * attack.bulletSpeed,
        Math.cos(bd.spiralAngle) * attack.bulletSpeed,
      );
      bd.spiralAngle += 0.5;
    }
  }

  private fireLaserSweep(
    attack: BossAttackPattern, cfg: WeaponConfig, elapsed: number, dt: number,
    em: EntityManager, layer: Container,
  ): void {
    const interval = attack.duration / attack.bulletCount;
    const before = Math.floor(Math.max(0, elapsed - dt) / interval);
    const now = Math.floor(elapsed / interval);
    const arcStart = Math.PI * 0.2;
    const arcRange = Math.PI * 0.6;

    for (let s = before + 1; s <= now; s++) {
      const a = arcStart + (elapsed / attack.duration) * arcRange;
      spawnProjectile(
        this.boss.x, this.boss.y + this.boss.height * 0.3,
        cfg, 'enemyProjectile', em, layer,
        Math.sin(a) * attack.bulletSpeed, Math.cos(a) * attack.bulletSpeed,
      );
    }
  }

  private spawnMinions(attack: BossAttackPattern, elapsed: number, em: EntityManager): void {
    // Spawn all minions at the start of the attack duration
    if (elapsed >= 0.02) return;

    const type = (attack.minionType ?? 'basic') as EnemyType;
    const count = attack.bulletCount;
    const spacing = (WORLD_WIDTH - 60) / (count + 1);

    for (let i = 0; i < count; i++) {
      const x = 30 + spacing * (i + 1);
      const enemy = createEnemy(type, x, this.boss.y + this.boss.height * 0.5 + 10);
      em.add(enemy);
      this.enemyLayer.addChild(enemy.sprite);
    }
  }

  // --- Telegraph ---

  private showTelegraph(): void {
    this.hideTelegraph();
    this.telegraphGraphic = new Graphics();
    this.fxLayer.addChild(this.telegraphGraphic);
  }

  private updateTelegraphVisual(elapsed: number): void {
    if (!this.telegraphGraphic) return;
    const attack = this.currentAttack;
    const progress = elapsed / attack.telegraphDuration;
    const pulse = Math.sin(elapsed * 20) * 0.3 + 0.5;

    this.telegraphGraphic.clear();

    const radius = 20 + progress * 40;
    this.telegraphGraphic
      .circle(this.boss.x, this.boss.y, radius)
      .stroke({ width: 2, color: 0xff4444, alpha: pulse * (1 - progress * 0.5) });

    if (progress > 0.3) {
      const a = pulse * Math.min(1, (progress - 0.3) / 0.3);
      this.telegraphGraphic
        .circle(this.boss.x, this.boss.y - this.boss.height - 12, 8)
        .fill({ color: 0xff2222, alpha: a * 0.6 });
    }

    if (attack.type === 'laser_sweep' && progress > 0.5) {
      const sweepAlpha = (progress - 0.5) * 2 * pulse * 0.2;
      for (let a = Math.PI * 0.2; a <= Math.PI * 0.8; a += 0.3) {
        this.telegraphGraphic
          .circle(this.boss.x + Math.cos(a) * 200, this.boss.y + Math.sin(a) * 200, 2)
          .fill({ color: 0xff2222, alpha: sweepAlpha });
      }
    }

    if (attack.type === 'spiral' && progress > 0.5) {
      this.telegraphGraphic
        .circle(this.boss.x, this.boss.y, 30)
        .fill({ color: 0xff4444, alpha: (progress - 0.5) * 2 * pulse * 0.15 });
    }

    if (attack.type === 'minion_spawn' && progress > 0.3) {
      const a = (progress - 0.3) / 0.7 * pulse * 0.3;
      this.telegraphGraphic
        .rect(this.boss.x - 40, this.boss.y + this.boss.height * 0.3, 80, 4)
        .fill({ color: 0xcc3333, alpha: a });
    }
  }

  private hideTelegraph(): void {
    if (this.telegraphGraphic) {
      if (this.telegraphGraphic.parent) this.telegraphGraphic.parent.removeChild(this.telegraphGraphic);
      this.telegraphGraphic.destroy();
      this.telegraphGraphic = null;
    }
  }

  destroy(): void {
    this.hideTelegraph();
  }
}
