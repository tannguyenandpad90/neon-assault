import { Graphics, Container } from 'pixi.js';

interface Star {
  graphic: Graphics;
  speed: number;
}

interface Nebula {
  graphic: Graphics;
  y: number;
  x: number;
  speed: number;
}

const STAR_COLORS = [0xffffff, 0xaaccff, 0xffccaa, 0xccddff, 0xffeedd];

export class Starfield {
  private layer: Container;
  private width: number;
  private height: number;
  private stars: Star[] = [];
  private nebulae: Nebula[] = [];

  constructor(layer: Container, width: number, height: number) {
    this.layer = layer;
    this.width = width;
    this.height = height;

    // Background
    const bg = new Graphics();
    bg.rect(0, 0, width, height).fill({ color: 0x050510 });
    bg.rect(0, 0, width, height * 0.3).fill({ color: 0x0a0a22, alpha: 0.3 });
    bg.rect(0, height * 0.7, width, height * 0.3).fill({ color: 0x0a0518, alpha: 0.3 });
    layer.addChild(bg);

    this.createNebulae();
    this.createStars();
  }

  private createStars(): void {
    const layers = [
      { count: 40, speedMin: 15, speedMax: 35, sizeMin: 0.3, sizeMax: 0.8, brightMin: 0.15, brightMax: 0.35 },
      { count: 30, speedMin: 40, speedMax: 80, sizeMin: 0.5, sizeMax: 1.2, brightMin: 0.3, brightMax: 0.6 },
      { count: 18, speedMin: 90, speedMax: 140, sizeMin: 1.0, sizeMax: 2.0, brightMin: 0.5, brightMax: 0.9 },
    ];

    for (const def of layers) {
      for (let i = 0; i < def.count; i++) {
        const speed = def.speedMin + Math.random() * (def.speedMax - def.speedMin);
        const size = def.sizeMin + Math.random() * (def.sizeMax - def.sizeMin);
        const brightness = def.brightMin + Math.random() * (def.brightMax - def.brightMin);
        const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];

        // Pre-built graphic — never redrawn
        const g = new Graphics();
        g.circle(0, 0, size).fill({ color, alpha: brightness });
        g.x = Math.random() * this.width;
        g.y = Math.random() * this.height;
        this.layer.addChild(g);
        this.stars.push({ graphic: g, speed });
      }
    }
  }

  private createNebulae(): void {
    const configs = [
      { x: 120, y: 200, size: 100, color: 0x2244aa, alpha: 0.04, speed: 8 },
      { x: 350, y: 500, size: 120, color: 0x6622aa, alpha: 0.035, speed: 12 },
      { x: 80, y: 650, size: 90, color: 0x224488, alpha: 0.03, speed: 6 },
      { x: 400, y: 100, size: 80, color: 0x882244, alpha: 0.03, speed: 10 },
      { x: 240, y: 350, size: 140, color: 0x443388, alpha: 0.025, speed: 5 },
    ];

    for (const cfg of configs) {
      const g = new Graphics();
      for (let r = cfg.size; r > 10; r -= 15) {
        g.circle(0, 0, r).fill({ color: cfg.color, alpha: cfg.alpha * (r / cfg.size) });
      }
      g.x = cfg.x;
      g.y = cfg.y;
      this.layer.addChild(g);
      this.nebulae.push({ graphic: g, x: cfg.x, y: cfg.y, speed: cfg.speed });
    }
  }

  update(dt: number): void {
    // Move star graphics (position only, no redraw)
    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      star.graphic.y += star.speed * dt;
      if (star.graphic.y > this.height + 5) {
        star.graphic.y = -5;
        star.graphic.x = Math.random() * this.width;
      }
    }

    // Scroll nebulae
    for (const neb of this.nebulae) {
      neb.y += neb.speed * dt;
      if (neb.y > this.height + 150) {
        neb.y = -150;
        neb.x = 50 + Math.random() * (this.width - 100);
      }
      neb.graphic.x = neb.x;
      neb.graphic.y = neb.y;
    }
  }
}
