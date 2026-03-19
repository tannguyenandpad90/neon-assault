import { Graphics, Container } from 'pixi.js';

export class Vignette {
  private graphics: Graphics;

  constructor(parent: Container, width: number, height: number) {
    this.graphics = new Graphics();

    // Dark edges via concentric rectangles with increasing alpha
    const steps = 8;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const inset = (1 - t) * Math.min(width, height) * 0.4;
      const alpha = t * t * 0.35;
      this.graphics.rect(0, 0, width, height)
        .fill({ color: 0x000000, alpha: 0 });
      // Top edge
      this.graphics.rect(0, 0, width, inset * 0.5)
        .fill({ color: 0x000000, alpha: alpha * 0.5 });
      // Bottom edge
      this.graphics.rect(0, height - inset * 0.5, width, inset * 0.5)
        .fill({ color: 0x000000, alpha: alpha * 0.5 });
      // Left edge
      this.graphics.rect(0, 0, inset * 0.3, height)
        .fill({ color: 0x000000, alpha: alpha * 0.4 });
      // Right edge
      this.graphics.rect(width - inset * 0.3, 0, inset * 0.3, height)
        .fill({ color: 0x000000, alpha: alpha * 0.4 });
    }

    this.graphics.zIndex = 998;
    parent.addChild(this.graphics);
  }

  destroy(): void {
    if (this.graphics.parent) this.graphics.parent.removeChild(this.graphics);
    this.graphics.destroy();
  }
}
