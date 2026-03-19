import { Application, Container } from 'pixi.js';
import { WORLD_WIDTH, WORLD_HEIGHT, BG_COLOR } from '@game/config/game';

export class Engine {
  app: Application;
  stage: Container;
  private container: HTMLElement | null = null;

  constructor() {
    this.app = new Application();
    this.stage = this.app.stage;
  }

  async init(container: HTMLElement): Promise<void> {
    this.container = container;

    await this.app.init({
      width: WORLD_WIDTH,
      height: WORLD_HEIGHT,
      backgroundColor: BG_COLOR,
      antialias: false,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    container.appendChild(this.app.canvas as HTMLCanvasElement);
    this.fitToContainer();

    // Ensure ticker is running (v8 should auto-start, but be explicit)
    if (!this.app.ticker.started) {
      this.app.ticker.start();
    }

    window.addEventListener('resize', this.handleResize);
  }

  private handleResize = (): void => {
    this.fitToContainer();
  };

  private fitToContainer(): void {
    if (!this.container) return;

    const containerWidth = this.container.clientWidth;
    const containerHeight = this.container.clientHeight;

    const scale = Math.min(
      containerWidth / WORLD_WIDTH,
      containerHeight / WORLD_HEIGHT
    );

    const canvas = this.app.canvas as HTMLCanvasElement;
    canvas.style.width = `${WORLD_WIDTH * scale}px`;
    canvas.style.height = `${WORLD_HEIGHT * scale}px`;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
  }

  get ticker() {
    return this.app.ticker;
  }

  get renderer() {
    return this.app.renderer;
  }

  destroy(): void {
    window.removeEventListener('resize', this.handleResize);
    this.app.destroy(true, { children: true });
  }
}
