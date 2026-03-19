import type { Vec2 } from '@game/types';

export class Camera {
  offsetX = 0;
  offsetY = 0;

  private shakeIntensity = 0;
  private shakeDuration = 0;
  private shakeElapsed = 0;
  shakeX = 0;
  shakeY = 0;

  shake(intensity: number, duration: number): void {
    if (intensity > this.shakeIntensity) {
      this.shakeIntensity = intensity;
      this.shakeDuration = duration;
      this.shakeElapsed = 0;
    }
  }

  update(dt: number): void {
    if (this.shakeElapsed < this.shakeDuration) {
      this.shakeElapsed += dt;
      const progress = this.shakeElapsed / this.shakeDuration;
      const decay = 1 - progress;
      const magnitude = this.shakeIntensity * decay;

      this.shakeX = (Math.random() * 2 - 1) * magnitude;
      this.shakeY = (Math.random() * 2 - 1) * magnitude;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
      this.shakeIntensity = 0;
    }
  }

  getOffset(): Vec2 {
    return {
      x: this.offsetX + this.shakeX,
      y: this.offsetY + this.shakeY,
    };
  }

  reset(): void {
    this.offsetX = 0;
    this.offsetY = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeElapsed = 0;
  }
}
