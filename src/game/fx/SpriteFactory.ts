import { Texture, Sprite } from 'pixi.js';

/**
 * Generates high-quality sprite textures using Canvas 2D.
 * Canvas gives us smooth gradients, glow, and anti-aliased shapes
 * that look much better than PixiJS Graphics polygons.
 */

const cache = new Map<string, Texture>();
const scale = 2; // Retina

function getTexture(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void): Texture {
  if (cache.has(key)) return cache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);
  draw(ctx);

  const texture = Texture.from(canvas);
  cache.set(key, texture);
  return texture;
}

function makeSprite(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void): Sprite {
  const texture = getTexture(key, w, h, draw);
  const sprite = new Sprite(texture);
  sprite.width = w;
  sprite.height = h;
  sprite.anchor.set(0.5);
  return sprite;
}

// ─── Player Ship ───

export function createPlayerSprite(): Sprite {
  return makeSprite('player', 32, 36, (ctx) => {
    const cx = 16, cy = 18;

    // Engine glow
    const engineGlow = ctx.createRadialGradient(cx, cy + 14, 0, cx, cy + 14, 12);
    engineGlow.addColorStop(0, 'rgba(100,180,255,0.4)');
    engineGlow.addColorStop(1, 'rgba(100,180,255,0)');
    ctx.fillStyle = engineGlow;
    ctx.fillRect(0, cy + 2, 32, 18);

    // Wings
    ctx.beginPath();
    ctx.moveTo(cx, 2);
    ctx.lineTo(cx + 5, 10);
    ctx.lineTo(cx + 14, 18);
    ctx.lineTo(cx + 12, 28);
    ctx.lineTo(cx + 6, 32);
    ctx.lineTo(cx - 6, 32);
    ctx.lineTo(cx - 12, 28);
    ctx.lineTo(cx - 14, 18);
    ctx.lineTo(cx - 5, 10);
    ctx.closePath();

    const bodyGrad = ctx.createLinearGradient(0, 0, 32, 0);
    bodyGrad.addColorStop(0, '#1a5588');
    bodyGrad.addColorStop(0.3, '#44aaee');
    bodyGrad.addColorStop(0.5, '#66ccff');
    bodyGrad.addColorStop(0.7, '#44aaee');
    bodyGrad.addColorStop(1, '#1a5588');
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Body center stripe
    ctx.beginPath();
    ctx.moveTo(cx, 3);
    ctx.lineTo(cx + 3, 12);
    ctx.lineTo(cx + 3, 30);
    ctx.lineTo(cx - 3, 30);
    ctx.lineTo(cx - 3, 12);
    ctx.closePath();
    ctx.fillStyle = '#2277bb';
    ctx.fill();

    // Cockpit
    const cockpitGrad = ctx.createRadialGradient(cx, 10, 0, cx, 10, 5);
    cockpitGrad.addColorStop(0, '#ffffff');
    cockpitGrad.addColorStop(0.3, '#aaeeff');
    cockpitGrad.addColorStop(1, '#4488cc');
    ctx.beginPath();
    ctx.ellipse(cx, 10, 4, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = cockpitGrad;
    ctx.fill();

    // Wing accents
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - 10, 20);
    ctx.lineTo(cx - 4, 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 10, 20);
    ctx.lineTo(cx + 4, 14);
    ctx.stroke();

    // Engine nozzles
    ctx.fillStyle = '#224466';
    ctx.fillRect(cx - 7, 29, 4, 5);
    ctx.fillRect(cx + 3, 29, 4, 5);

    // Engine inner glow
    const nozzleGlow = ctx.createLinearGradient(0, 30, 0, 36);
    nozzleGlow.addColorStop(0, 'rgba(100,200,255,0.6)');
    nozzleGlow.addColorStop(1, 'rgba(100,200,255,0)');
    ctx.fillStyle = nozzleGlow;
    ctx.fillRect(cx - 6, 31, 2, 4);
    ctx.fillRect(cx + 4, 31, 2, 4);
  });
}

// ─── Enemy Sprites ───

export function createEnemySprite(type: string, w: number, h: number, color: string, accentColor: string): Sprite {
  const key = `enemy_${type}`;
  return makeSprite(key, w, h, (ctx) => {
    const cx = w / 2, cy = h / 2;

    // Outer glow
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
    glow.addColorStop(0, color + '33');
    glow.addColorStop(1, color + '00');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    switch (type) {
      case 'basic':
        drawDiamond(ctx, cx, cy, w * 0.45, h * 0.45, color, accentColor);
        break;
      case 'shooter':
        drawHexagon(ctx, cx, cy, w * 0.45, color, accentColor);
        drawBarrel(ctx, cx, cy + h * 0.25, 2, h * 0.3);
        break;
      case 'kamikaze':
        drawArrow(ctx, cx, cy, w * 0.45, h * 0.45, color, accentColor);
        break;
      case 'tank':
        drawTank(ctx, cx, cy, w * 0.45, h * 0.45, color, accentColor);
        break;
      case 'elite':
        drawStar(ctx, cx, cy, w * 0.45, color, accentColor);
        break;
      case 'splitter':
        drawSplitter(ctx, cx, cy, w * 0.4, color, accentColor);
        break;
      case 'sniper':
        drawSniper(ctx, cx, cy, w * 0.35, h * 0.45, color, accentColor);
        break;
      case 'miniboss':
        drawMiniboss(ctx, cx, cy, w * 0.45, color, accentColor);
        break;
    }
  });
}

function drawDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, color: string, accent: string): void {
  ctx.beginPath();
  ctx.moveTo(cx, cy - ry);
  ctx.lineTo(cx + rx, cy);
  ctx.lineTo(cx, cy + ry);
  ctx.lineTo(cx - rx, cy);
  ctx.closePath();
  const grad = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
  grad.addColorStop(0, accent);
  grad.addColorStop(0.5, color);
  grad.addColorStop(1, accent);
  ctx.fillStyle = grad;
  ctx.fill();
  // Core
  ctx.beginPath();
  ctx.arc(cx, cy, rx * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = '#ffaa88';
  ctx.fill();
}

function drawHexagon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, accent: string): void {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, color);
  grad.addColorStop(1, accent);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,200,100,0.5)';
  ctx.fill();
}

function drawBarrel(ctx: CanvasRenderingContext2D, cx: number, y: number, w: number, h: number): void {
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(cx - w, y, w * 2, h);
}

function drawArrow(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, color: string, accent: string): void {
  ctx.beginPath();
  ctx.moveTo(cx, cy + ry);
  ctx.lineTo(cx - rx, cy - ry);
  ctx.lineTo(cx, cy - ry * 0.3);
  ctx.lineTo(cx + rx, cy - ry);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, cy - ry, 0, cy + ry);
  grad.addColorStop(0, accent);
  grad.addColorStop(1, color);
  ctx.fillStyle = grad;
  ctx.fill();
  // Flame
  const flameGrad = ctx.createLinearGradient(0, cy - ry, 0, cy - ry * 1.6);
  flameGrad.addColorStop(0, '#ff4400');
  flameGrad.addColorStop(1, 'rgba(255,68,0,0)');
  ctx.beginPath();
  ctx.moveTo(cx - rx * 0.4, cy - ry);
  ctx.lineTo(cx, cy - ry * 1.6);
  ctx.lineTo(cx + rx * 0.4, cy - ry);
  ctx.fillStyle = flameGrad;
  ctx.fill();
}

function drawTank(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, color: string, accent: string): void {
  // Body
  roundRect(ctx, cx - rx, cy - ry, rx * 2, ry * 2, 4);
  const grad = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
  grad.addColorStop(0, accent);
  grad.addColorStop(0.5, color);
  grad.addColorStop(1, accent);
  ctx.fillStyle = grad;
  ctx.fill();
  // Armor lines
  ctx.strokeStyle = 'rgba(150,150,200,0.4)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(cx - rx + 3, cy - ry * 0.3);
  ctx.lineTo(cx + rx - 3, cy - ry * 0.3);
  ctx.moveTo(cx - rx + 3, cy + ry * 0.3);
  ctx.lineTo(cx + rx - 3, cy + ry * 0.3);
  ctx.stroke();
  // Turret
  ctx.beginPath();
  ctx.arc(cx, cy, rx * 0.35, 0, Math.PI * 2);
  const turretGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx * 0.35);
  turretGrad.addColorStop(0, '#aaaacc');
  turretGrad.addColorStop(1, '#666688');
  ctx.fillStyle = turretGrad;
  ctx.fill();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, accent: string): void {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const outerA = (Math.PI * 2 / 5) * i - Math.PI / 2;
    const innerA = outerA + Math.PI / 5;
    ctx.lineTo(cx + Math.cos(outerA) * r, cy + Math.sin(outerA) * r);
    ctx.lineTo(cx + Math.cos(innerA) * r * 0.4, cy + Math.sin(innerA) * r * 0.4);
  }
  ctx.closePath();
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, color);
  grad.addColorStop(1, accent);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,200,255,0.6)';
  ctx.fill();
}

function drawSplitter(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, accent: string): void {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, color);
  grad.addColorStop(1, accent);
  ctx.fillStyle = grad;
  ctx.fill();
  // Fracture lines
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.3, cy - r * 0.6);
  ctx.lineTo(cx + r * 0.2, cy + r * 0.5);
  ctx.moveTo(cx + r * 0.4, cy - r * 0.3);
  ctx.lineTo(cx - r * 0.1, cy + r * 0.6);
  ctx.stroke();
  // Inner glow
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(100,255,200,0.4)';
  ctx.fill();
}

function drawSniper(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, color: string, accent: string): void {
  // Tall body
  ctx.beginPath();
  ctx.moveTo(cx, cy - ry);
  ctx.lineTo(cx + rx, cy - ry * 0.3);
  ctx.lineTo(cx + rx * 0.7, cy + ry);
  ctx.lineTo(cx - rx * 0.7, cy + ry);
  ctx.lineTo(cx - rx, cy - ry * 0.3);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, cy - ry, 0, cy + ry);
  grad.addColorStop(0, color);
  grad.addColorStop(1, accent);
  ctx.fillStyle = grad;
  ctx.fill();
  // Scope lens
  ctx.beginPath();
  ctx.arc(cx, cy - ry * 0.4, rx * 0.4, 0, Math.PI * 2);
  const lensGrad = ctx.createRadialGradient(cx, cy - ry * 0.4, 0, cx, cy - ry * 0.4, rx * 0.4);
  lensGrad.addColorStop(0, '#ffffff');
  lensGrad.addColorStop(0.3, '#88eeff');
  lensGrad.addColorStop(1, '#226688');
  ctx.fillStyle = lensGrad;
  ctx.fill();
  // Barrel
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(cx - 1, cy + ry * 0.3, 2, ry * 0.8);
}

function drawMiniboss(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, accent: string): void {
  // Octagon
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 / 8) * i - Math.PI / 8;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, color);
  grad.addColorStop(1, accent);
  ctx.fillStyle = grad;
  ctx.fill();
  // Armor ring
  ctx.strokeStyle = 'rgba(255,170,68,0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2);
  ctx.stroke();
  // Core
  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.3);
  coreGrad.addColorStop(0, '#ffcc88');
  coreGrad.addColorStop(1, '#ff8844');
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = coreGrad;
  ctx.fill();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Projectile Sprites ───

export function createPlayerBulletSprite(): Sprite {
  return makeSprite('bullet_player', 8, 16, (ctx) => {
    const grad = ctx.createLinearGradient(4, 0, 4, 16);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#88ddff');
    grad.addColorStop(1, '#4488cc');
    ctx.fillStyle = grad;
    roundRect(ctx, 1, 0, 6, 14, 3);
    ctx.fill();

    // Glow
    const glow = ctx.createRadialGradient(4, 4, 0, 4, 4, 6);
    glow.addColorStop(0, 'rgba(136,221,255,0.5)');
    glow.addColorStop(1, 'rgba(136,221,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 8, 12);
  });
}

export function createEnemyBulletSprite(): Sprite {
  return makeSprite('bullet_enemy', 8, 8, (ctx) => {
    const grad = ctx.createRadialGradient(4, 4, 0, 4, 4, 4);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#ff6644');
    grad.addColorStop(1, '#cc2200');
    ctx.beginPath();
    ctx.arc(4, 4, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Glow
    const glow = ctx.createRadialGradient(4, 4, 0, 4, 4, 5);
    glow.addColorStop(0, 'rgba(255,100,68,0.4)');
    glow.addColorStop(1, 'rgba(255,100,68,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 8, 8);
  });
}

export function createHomingSprite(): Sprite {
  return makeSprite('bullet_homing', 10, 10, (ctx) => {
    const grad = ctx.createRadialGradient(5, 5, 0, 5, 5, 5);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#44ffaa');
    grad.addColorStop(1, '#228855');
    ctx.beginPath();
    ctx.arc(5, 5, 4, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    const glow = ctx.createRadialGradient(5, 5, 0, 5, 5, 6);
    glow.addColorStop(0, 'rgba(68,255,170,0.4)');
    glow.addColorStop(1, 'rgba(68,255,170,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 10, 10);
  });
}

// ─── Boss Sprite ───

export function createBossSprite(w: number, h: number): Sprite {
  return makeSprite('boss_dreadnought', w + 16, h + 8, (ctx) => {
    const cx = (w + 16) / 2, cy = (h + 8) / 2;

    // Hull glow
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.6);
    glow.addColorStop(0, 'rgba(255,100,50,0.15)');
    glow.addColorStop(1, 'rgba(255,100,50,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w + 16, h + 8);

    // Main hull
    ctx.beginPath();
    ctx.moveTo(cx, 4);
    ctx.lineTo(cx + w * 0.3, cy * 0.4);
    ctx.lineTo(cx + w * 0.5, cy * 0.7);
    ctx.lineTo(cx + w * 0.5, cy + h * 0.15);
    ctx.lineTo(cx + w * 0.25, cy + h * 0.4);
    ctx.lineTo(cx - w * 0.25, cy + h * 0.4);
    ctx.lineTo(cx - w * 0.5, cy + h * 0.15);
    ctx.lineTo(cx - w * 0.5, cy * 0.7);
    ctx.lineTo(cx - w * 0.3, cy * 0.4);
    ctx.closePath();

    const hullGrad = ctx.createLinearGradient(cx - w * 0.5, 0, cx + w * 0.5, 0);
    hullGrad.addColorStop(0, '#553311');
    hullGrad.addColorStop(0.3, '#aa6633');
    hullGrad.addColorStop(0.5, '#cc7744');
    hullGrad.addColorStop(0.7, '#aa6633');
    hullGrad.addColorStop(1, '#553311');
    ctx.fillStyle = hullGrad;
    ctx.fill();

    // Armor plating
    ctx.fillStyle = 'rgba(150,100,70,0.3)';
    ctx.fillRect(cx - w * 0.35, cy - h * 0.1, w * 0.7, h * 0.2);

    // Core
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.12);
    coreGrad.addColorStop(0, '#ffcc88');
    coreGrad.addColorStop(0.5, '#ff6644');
    coreGrad.addColorStop(1, '#cc3322');
    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // Wing cannons
    ctx.fillStyle = '#666666';
    ctx.fillRect(cx - w * 0.55, cy - h * 0.08, 6, h * 0.3);
    ctx.fillRect(cx + w * 0.55 - 6, cy - h * 0.08, 6, h * 0.3);

    // Cannon tips
    ctx.fillStyle = '#ff4422';
    ctx.fillRect(cx - w * 0.55, cy + h * 0.2, 6, 3);
    ctx.fillRect(cx + w * 0.55 - 6, cy + h * 0.2, 6, 3);
  });
}
