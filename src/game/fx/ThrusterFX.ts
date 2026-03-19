import { Graphics, Container } from 'pixi.js';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

const MAX_PARTICLES = 60;
const COLORS = [0xff6622, 0xff4400, 0xffaa44, 0xff8833];

export class ThrusterFX {
  private layer: Container;
  private graphics: Graphics;
  private particles: Particle[] = [];
  private spawnTimer = 0;

  constructor(layer: Container) {
    this.layer = layer;
    this.graphics = new Graphics();
    this.layer.addChild(this.graphics);
  }

  emit(x: number, y: number, vx: number, vy: number, intensity: number): void {
    this.spawnTimer += intensity;

    while (this.spawnTimer >= 1 && this.particles.length < MAX_PARTICLES) {
      this.spawnTimer -= 1;
      const spread = 3 + intensity * 2;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + Math.random() * 4,
        vx: vx * 0.1 + (Math.random() - 0.5) * spread,
        vy: vy * 0.1 + 40 + Math.random() * 60 + intensity * 20,
        life: 0.15 + Math.random() * 0.2,
        maxLife: 0.15 + Math.random() * 0.2,
        size: 1 + Math.random() * 2,
      });
    }
  }

  update(dt: number): void {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.size *= 0.97;
    }

    // Redraw all particles in one batch
    this.graphics.clear();
    for (const p of this.particles) {
      const t = p.life / p.maxLife;
      const color = COLORS[Math.floor((1 - t) * (COLORS.length - 1))];
      this.graphics.circle(p.x, p.y, p.size)
        .fill({ color, alpha: t * 0.8 });
    }
  }

  clear(): void {
    this.particles.length = 0;
    this.graphics.clear();
  }

  destroy(): void {
    this.clear();
    if (this.graphics.parent) this.graphics.parent.removeChild(this.graphics);
    this.graphics.destroy();
  }
}
