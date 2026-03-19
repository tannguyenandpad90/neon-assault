import { Graphics, Container } from 'pixi.js';

export class Vignette {
  private graphics: Graphics;

  constructor(parent: Container, width: number, height: number) {
    this.graphics = new Graphics();

    // Top edge
    this.graphics.rect(0, 0, width, 60).fill({ color: 0x000000, alpha: 0.25 });
    this.graphics.rect(0, 0, width, 30).fill({ color: 0x000000, alpha: 0.15 });

    // Bottom edge
    this.graphics.rect(0, height - 60, width, 60).fill({ color: 0x000000, alpha: 0.25 });
    this.graphics.rect(0, height - 30, width, 30).fill({ color: 0x000000, alpha: 0.15 });

    // Left edge
    this.graphics.rect(0, 0, 30, height).fill({ color: 0x000000, alpha: 0.15 });

    // Right edge
    this.graphics.rect(width - 30, 0, 30, height).fill({ color: 0x000000, alpha: 0.15 });

    this.graphics.zIndex = 998;
    parent.addChild(this.graphics);
  }

  destroy(): void {
    if (this.graphics.parent) this.graphics.parent.removeChild(this.graphics);
    this.graphics.destroy();
  }
}
