import { Graphics, Container } from 'pixi.js';

export class ScreenFlash {
  private overlay: Graphics;
  private timer = 0;
  private duration = 0;

  constructor(parent: Container, width: number, height: number) {
    this.overlay = new Graphics();
    this.overlay.rect(0, 0, width, height).fill({ color: 0xffffff });
    this.overlay.alpha = 0;
    this.overlay.zIndex = 999;
    parent.addChild(this.overlay);
  }

  flash(color: number, duration = 0.12, intensity = 0.4): void {
    this.overlay.clear();
    this.overlay.rect(0, 0, this.overlay.parent?.width ?? 480, this.overlay.parent?.height ?? 720)
      .fill({ color });
    this.overlay.alpha = intensity;
    this.timer = duration;
    this.duration = duration;
  }

  update(dt: number): void {
    if (this.timer <= 0) return;
    this.timer -= dt;
    this.overlay.alpha = Math.max(0, (this.timer / this.duration) * this.overlay.alpha);
    if (this.timer <= 0) {
      this.overlay.alpha = 0;
    }
  }

  destroy(): void {
    if (this.overlay.parent) this.overlay.parent.removeChild(this.overlay);
    this.overlay.destroy();
  }
}
