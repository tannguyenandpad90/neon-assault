import { COMBO } from '@game/config/balance';

// Combo thresholds: kill count needed to reach each multiplier level.
// x1 at 0 kills, x2 at 2, x3 at 4, x4 at 7, x5 at 10, x6 at 14, x7 at 18, x8 at 23, x9 at 28, x10 at 34
// Early kills ramp fast (x2 by 2nd kill). Late multipliers require sustained chains.
const THRESHOLDS = [0, 2, 4, 7, 10, 14, 18, 23, 28, 34];

export class ComboTracker {
  count = 0;
  multiplier = 1;
  private timer = 0;

  onKill(): void {
    this.count++;
    this.timer = COMBO.decayTime;
    this.multiplier = this.calcMultiplier();
  }

  update(dt: number): void {
    if (this.count === 0) return;

    this.timer -= dt;
    if (this.timer <= 0) {
      this.count = 0;
      this.multiplier = 1;
      this.timer = 0;
    }
  }

  reset(): void {
    this.count = 0;
    this.multiplier = 1;
    this.timer = 0;
  }

  private calcMultiplier(): number {
    const max = Math.min(THRESHOLDS.length, COMBO.maxMultiplier);
    for (let i = max - 1; i >= 0; i--) {
      if (this.count >= THRESHOLDS[i]) return i + 1;
    }
    return 1;
  }
}
