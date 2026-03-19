import { Container } from 'pixi.js';
import type { Entity } from '@game/types';
import { Camera } from '@game/core/Camera';
import { ScreenFlash } from './ScreenFlash';
import { applyHitFlash, updateHitFlashes, clearHitFlashes } from './HitFlash';
import { spawnMuzzleFlash, updateMuzzleFlashes, clearMuzzleFlashes } from './MuzzleFlash';
import { spawnExplosion, updateExplosions, clearExplosions } from './ExplosionFX';
import { SHAKE } from './ScreenShake';

export { SHAKE };

interface DeferredExplosion {
  x: number;
  y: number;
  size: number;
  color: number;
  delay: number;
  elapsed: number;
  fired: boolean;
}

export class FxCoordinator {
  private camera: Camera;
  private layer: Container;
  private deferred: DeferredExplosion[] = [];
  private screenFlash: ScreenFlash;

  /** Hitstop: scale applied to dt. 1.0 = normal, 0.0 = frozen. */
  hitstopScale = 1.0;
  private hitstopTimer = 0;
  private hitstopTarget = 1.0;

  constructor(layer: Container, camera: Camera, worldWidth: number, worldHeight: number) {
    this.layer = layer;
    this.camera = camera;
    this.screenFlash = new ScreenFlash(layer, worldWidth, worldHeight);
  }

  // --- One-shot effects ---

  hitFlash(entity: Entity): void {
    applyHitFlash(entity);
  }

  muzzleFlash(x: number, y: number): void {
    spawnMuzzleFlash(x, y, this.layer);
  }

  explosion(x: number, y: number, size: number, color = 0xff6622): void {
    spawnExplosion(x, y, size, this.layer, color);
  }

  shake(preset: { intensity: number; duration: number }): void {
    this.camera.shake(preset.intensity, preset.duration);
  }

  shakeRaw(intensity: number, duration: number): void {
    this.camera.shake(intensity, duration);
  }

  flash(color: number, duration = 0.12, intensity = 0.4): void {
    this.screenFlash.flash(color, duration, intensity);
  }

  /** Slow the game to `scale` speed for `duration` seconds, then return to normal. */
  hitstop(scale: number, duration: number): void {
    this.hitstopScale = scale;
    this.hitstopTarget = 1.0;
    this.hitstopTimer = duration;
  }

  deferExplosion(x: number, y: number, size: number, color: number, delay: number): void {
    this.deferred.push({ x, y, size, color, delay, elapsed: 0, fired: false });
  }

  /** Spawn small trail particles behind a point. */
  trail(x: number, y: number, size: number, color: number): void {
    spawnExplosion(x, y, size, this.layer, color);
  }

  // --- Per-frame update (uses RAW dt, not scaled) ---

  update(dt: number): void {
    // Hitstop recovery
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      if (this.hitstopTimer <= 0) {
        this.hitstopScale = this.hitstopTarget;
      }
    }

    updateHitFlashes(dt);
    updateMuzzleFlashes();
    updateExplosions(dt);
    this.screenFlash.update(dt);
    this.updateDeferred(dt);
  }

  private updateDeferred(dt: number): void {
    for (let i = this.deferred.length - 1; i >= 0; i--) {
      const de = this.deferred[i];
      de.elapsed += dt;
      if (!de.fired && de.elapsed >= de.delay) {
        de.fired = true;
        spawnExplosion(de.x, de.y, de.size, this.layer, de.color);
      }
      if (de.elapsed > de.delay + 0.5) {
        this.deferred.splice(i, 1);
      }
    }
  }

  clear(): void {
    clearHitFlashes();
    clearMuzzleFlashes();
    clearExplosions();
    this.deferred.length = 0;
    this.screenFlash.destroy();
    this.hitstopScale = 1.0;
    this.hitstopTimer = 0;
  }
}
