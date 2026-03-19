import { Graphics, Container } from 'pixi.js';

interface ActiveExplosion {
  outer: Graphics;
  inner: Graphics;
  core: Graphics;
  elapsed: number;
  duration: number;
  maxSize: number;
}

const active: ActiveExplosion[] = [];

export function spawnExplosion(
  x: number,
  y: number,
  size: number,
  layer: Container,
  color = 0xff6622,
): void {
  // Pre-build three circle layers at max size, then scale/fade them
  const outer = new Graphics();
  outer.circle(0, 0, 1).fill({ color, alpha: 1 });
  outer.x = x;
  outer.y = y;
  outer.scale.set(0);

  const inner = new Graphics();
  inner.circle(0, 0, 1).fill({ color: 0xffcc44, alpha: 1 });
  inner.x = x;
  inner.y = y;
  inner.scale.set(0);

  const core = new Graphics();
  core.circle(0, 0, 1).fill({ color: 0xffffff, alpha: 1 });
  core.x = x;
  core.y = y;
  core.scale.set(0);

  layer.addChild(outer);
  layer.addChild(inner);
  layer.addChild(core);

  active.push({ outer, inner, core, elapsed: 0, duration: 0.35, maxSize: size });
}

export function updateExplosions(dt: number): void {
  for (let i = active.length - 1; i >= 0; i--) {
    const exp = active[i];
    exp.elapsed += dt;
    const t = exp.elapsed / exp.duration;

    if (t >= 1) {
      destroyExplosion(exp);
      active.splice(i, 1);
      continue;
    }

    // Scale up, fade out — no Graphics redraw needed
    const outerScale = exp.maxSize * t;
    const alpha = 1 - t;

    exp.outer.scale.set(outerScale);
    exp.outer.alpha = alpha * 0.5;

    exp.inner.scale.set(outerScale * 0.5);
    exp.inner.alpha = alpha * 0.8;

    exp.core.scale.set(outerScale * 0.2);
    exp.core.alpha = alpha * 0.6;
  }
}

function destroyExplosion(exp: ActiveExplosion): void {
  for (const g of [exp.outer, exp.inner, exp.core]) {
    if (g.parent) g.parent.removeChild(g);
    g.destroy();
  }
}

export function clearExplosions(): void {
  for (const exp of active) {
    destroyExplosion(exp);
  }
  active.length = 0;
}
