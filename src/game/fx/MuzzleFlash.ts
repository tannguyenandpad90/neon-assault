import { Graphics, Container } from 'pixi.js';

interface Flash {
  sprite: Graphics;
  frames: number;
}

const activeFlashes: Flash[] = [];

export function spawnMuzzleFlash(x: number, y: number, layer: Container): void {
  const g = new Graphics();
  g.circle(0, 0, 6).fill({ color: 0xaaeeff, alpha: 0.8 });
  g.circle(0, 0, 3).fill({ color: 0xffffff, alpha: 0.9 });
  g.x = x;
  g.y = y;
  layer.addChild(g);

  activeFlashes.push({ sprite: g, frames: 3 });
}

export function updateMuzzleFlashes(): void {
  for (let i = activeFlashes.length - 1; i >= 0; i--) {
    const flash = activeFlashes[i];
    flash.frames--;
    if (flash.frames <= 0) {
      if (flash.sprite.parent) {
        flash.sprite.parent.removeChild(flash.sprite);
      }
      flash.sprite.destroy();
      activeFlashes.splice(i, 1);
    }
  }
}

export function clearMuzzleFlashes(): void {
  for (const flash of activeFlashes) {
    if (flash.sprite.parent) {
      flash.sprite.parent.removeChild(flash.sprite);
    }
    flash.sprite.destroy();
  }
  activeFlashes.length = 0;
}
