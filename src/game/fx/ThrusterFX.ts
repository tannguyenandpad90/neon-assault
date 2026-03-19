import { Graphics, Container } from 'pixi.js';

interface Particle {
  graphic: Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

const POOL_SIZE = 40;

export class ThrusterFX {
  private pool: Graphics[] = [];
  private active: Particle[] = [];
  private spawnTimer = 0;

  constructor(layer: Container) {

    // Pre-build particle graphics
    for (let i = 0; i < POOL_SIZE; i++) {
      const g = new Graphics();
      g.circle(0, 0, 1.5).fill({ color: 0xff6622 });
      g.visible = false;
      layer.addChild(g);
      this.pool.push(g);
    }
  }

  emit(x: number, y: number, vx: number, _vy: number, intensity: number): void {
    this.spawnTimer += intensity * 0.3;

    while (this.spawnTimer >= 1 && this.pool.length > 0) {
      this.spawnTimer -= 1;
      const g = this.pool.pop()!;
      g.visible = true;
      g.x = x + (Math.random() - 0.5) * 8;
      g.y = y + Math.random() * 4;
      g.alpha = 0.8;
      g.scale.set(0.8 + Math.random() * 0.6);

      // Color tint: orange → yellow based on randomness
      g.tint = Math.random() > 0.5 ? 0xff6622 : 0xffaa44;

      const life = 0.12 + Math.random() * 0.18;
      this.active.push({
        graphic: g,
        vx: vx * 0.1 + (Math.random() - 0.5) * 4,
        vy: 40 + Math.random() * 50 + intensity * 15,
        life,
        maxLife: life,
      });
    }
  }

  update(dt: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      p.life -= dt;
      if (p.life <= 0) {
        p.graphic.visible = false;
        this.pool.push(p.graphic);
        this.active.splice(i, 1);
        continue;
      }
      p.graphic.x += p.vx * dt;
      p.graphic.y += p.vy * dt;
      const t = p.life / p.maxLife;
      p.graphic.alpha = t * 0.8;
      p.graphic.scale.set(t * 0.8);
    }
  }

  clear(): void {
    for (const p of this.active) {
      p.graphic.visible = false;
      this.pool.push(p.graphic);
    }
    this.active.length = 0;
  }

  destroy(): void {
    this.clear();
    for (const g of this.pool) {
      if (g.parent) g.parent.removeChild(g);
      g.destroy();
    }
    this.pool.length = 0;
  }
}
