import { Graphics, Container } from 'pixi.js';

export class ScreenFlash {
  private overlay: Graphics;
  private timer = 0;
  private duration = 0;
  private intensity = 0;
  private width: number;
  private height: number;

  constructor(parent: Container, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.overlay = new Graphics();
    this.overlay.rect(0, 0, width, height).fill({ color: 0xffffff });
    this.overlay.alpha = 0;
    this.overlay.zIndex = 999;
    parent.addChild(this.overlay);
  }

  flash(color: number, duration = 0.12, intensity = 0.4): void {
    this.overlay.clear();
    this.overlay.rect(0, 0, this.width, this.height).fill({ color });
    this.intensity = intensity;
    this.timer = duration;
    this.duration = duration;
    this.overlay.alpha = intensity;
  }

  update(dt: number): void {
    if (this.timer <= 0) return;
    this.timer -= dt;
    if (this.timer <= 0) {
      this.overlay.alpha = 0;
    } else {
      this.overlay.alpha = this.intensity * (this.timer / this.duration);
    }
  }

  destroy(): void {
    if (this.overlay.parent) this.overlay.parent.removeChild(this.overlay);
    this.overlay.destroy();
  }
}
