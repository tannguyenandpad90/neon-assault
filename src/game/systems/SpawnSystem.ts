import type { WaveDefinition, WaveEntry, WaveSpawnEntry, WaveBossEntry } from '@game/types';
import { EntityManager } from '@game/core/EntityManager';
import { createEnemy } from '@game/entities/Enemy';
import { WAVES } from '@game/config/waves';
import { WORLD_WIDTH } from '@game/config/game';
import { DIFFICULTY, WAVE_PACING } from '@game/config/balance';
import { Container } from 'pixi.js';

function isSpawnEntry(entry: WaveEntry): entry is WaveSpawnEntry {
  return 'type' in entry;
}

function isBossEntry(entry: WaveEntry): entry is WaveBossEntry {
  return 'boss' in entry;
}

export interface SpawnEvent {
  type: 'boss_spawn' | 'wave_start';
  bossId?: string;
  wave?: number;
}

export class WaveDirector {
  waveIndex = 0;
  elapsed = 0;
  private spawnedEntries = new Set<number>();
  private waveComplete = false;
  private loopCount = 0;
  private bossActive = false;
  private pauseTimer = 0;
  private hasBossWave = false;

  get currentWave(): WaveDefinition {
    if (this.waveIndex < WAVES.length) return WAVES[this.waveIndex];
    return WAVES[WAVES.length - 1];
  }

  get effectiveWaveIndex(): number {
    return this.waveIndex + this.loopCount * WAVES.length;
  }

  setBossDefeated(): void {
    this.bossActive = false;
  }

  update(dt: number, entityManager: EntityManager, enemyLayer: Container): SpawnEvent[] {
    const events: SpawnEvent[] = [];

    // Wave pause
    if (this.pauseTimer > 0) {
      this.pauseTimer -= dt;
      return events;
    }

    this.elapsed += dt;
    const wave = this.currentWave;

    for (let i = 0; i < wave.entries.length; i++) {
      if (this.spawnedEntries.has(i)) continue;
      const entry = wave.entries[i];
      if (this.elapsed >= entry.time) {
        this.spawnedEntries.add(i);
        if (isSpawnEntry(entry)) {
          this.spawnFormation(entry, entityManager, enemyLayer);
        } else if (isBossEntry(entry)) {
          this.bossActive = true;
          this.hasBossWave = true;
          events.push({ type: 'boss_spawn', bossId: entry.boss });
        }
      }
    }

    // Wave complete
    if (this.spawnedEntries.size >= wave.entries.length && !this.waveComplete && !this.bossActive) {
      const enemies = entityManager.getByTag('enemy');
      if (enemies.length === 0) {
        this.waveComplete = true;
        this.advanceWave();
        events.push({ type: 'wave_start', wave: this.waveIndex + 1 });
      }
    }

    return events;
  }

  private advanceWave(): void {
    const wave = this.currentWave;

    // Determine pause duration
    const nextWaveIsBoss = this.peekNextWaveHasBoss();
    if (this.hasBossWave) {
      this.pauseTimer = WAVE_PACING.pauseAfterBoss;
    } else if (nextWaveIsBoss) {
      this.pauseTimer = WAVE_PACING.pauseBeforeBoss;
    } else {
      this.pauseTimer = WAVE_PACING.pauseBetweenWaves;
    }

    this.hasBossWave = false;

    if (this.waveIndex >= WAVES.length - 1 && wave.loop) {
      this.loopCount++;
      this.elapsed = 0;
      this.spawnedEntries.clear();
      this.waveComplete = false;
    } else if (this.waveIndex < WAVES.length - 1) {
      this.waveIndex++;
      this.elapsed = 0;
      this.spawnedEntries.clear();
      this.waveComplete = false;
    }
  }

  private peekNextWaveHasBoss(): boolean {
    const nextIndex = this.waveIndex + 1;
    if (nextIndex >= WAVES.length) return false;
    return WAVES[nextIndex].entries.some(e => isBossEntry(e));
  }

  private spawnFormation(entry: WaveSpawnEntry, entityManager: EntityManager, layer: Container): void {
    const positions = this.getFormationPositions(entry);
    const diffIndex = this.effectiveWaveIndex;
    const speedMult = Math.min(1 + diffIndex * DIFFICULTY.speedMultiplierPerWave, DIFFICULTY.maxSpeedMultiplier);
    const hpMult = Math.min(1 + diffIndex * DIFFICULTY.hpMultiplierPerWave, DIFFICULTY.maxHpMultiplier);

    for (const pos of positions) {
      const enemy = createEnemy(entry.type, pos.x, pos.y);
      enemy.vy *= speedMult;
      enemy.hp = Math.ceil(enemy.hp * hpMult);
      enemy.maxHp = enemy.hp;
      entityManager.add(enemy);
      layer.addChild(enemy.sprite);
    }
  }

  private getFormationPositions(entry: WaveSpawnEntry): { x: number; y: number }[] {
    const { count, formation } = entry;
    const positions: { x: number; y: number }[] = [];
    const margin = 30;
    const spawnY = -30;

    switch (formation) {
      case 'line': {
        const spacing = (WORLD_WIDTH - margin * 2) / (count + 1);
        for (let i = 0; i < count; i++) {
          positions.push({ x: margin + spacing * (i + 1), y: spawnY - i * 8 });
        }
        break;
      }
      case 'v-shape': {
        const cx = entry.x ?? WORLD_WIDTH * 0.5;
        for (let i = 0; i < count; i++) {
          const off = i - (count - 1) * 0.5;
          positions.push({ x: cx + off * 30, y: spawnY - Math.abs(off) * 15 });
        }
        break;
      }
      case 'spread':
        for (let i = 0; i < count; i++) {
          positions.push({ x: margin + Math.random() * (WORLD_WIDTH - margin * 2), y: spawnY - Math.random() * 50 });
        }
        break;
      case 'random':
        for (let i = 0; i < count; i++) {
          positions.push({ x: margin + Math.random() * (WORLD_WIDTH - margin * 2), y: -20 - Math.random() * 80 });
        }
        break;
    }

    return positions;
  }

  reset(): void {
    this.waveIndex = 0;
    this.elapsed = 0;
    this.spawnedEntries.clear();
    this.waveComplete = false;
    this.loopCount = 0;
    this.bossActive = false;
    this.pauseTimer = 0;
    this.hasBossWave = false;
  }
}
