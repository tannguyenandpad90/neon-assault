import { Engine } from './core/Engine';
import { InputManager } from './core/InputManager';
import { EntityManager } from './core/EntityManager';
import { Camera } from './core/Camera';
import { SceneManager } from './core/SceneManager';
import { AudioManager } from './audio/AudioManager';
import { GameplayScene } from './scenes/GameplayScene';
import { GameBridge } from '@app/GameBridge';
import { GameScreen } from '@app/types';
import { useGameStore } from '@app/store';

export class Game {
  private engine = new Engine();
  private input = new InputManager();
  private entityManager = new EntityManager();
  private camera = new Camera();
  private sceneManager = new SceneManager();
  private audio = new AudioManager();
  private bridge: GameBridge;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private running = false;
  private tickerBound = false;

  constructor(bridge: GameBridge) {
    this.bridge = bridge;
  }

  async init(container: HTMLElement): Promise<void> {
    await this.engine.init(container);
    this.input.init();
    this.audio.init();

    // Game lifecycle events
    this.bridge.on('game:start', () => this.startGame());
    this.bridge.on('game:pause', () => this.pause());
    this.bridge.on('game:resume', () => this.resume());
    this.bridge.on('game:restart', () => this.startGame());
    this.bridge.on('game:over', (data) => {
      this.running = false;
      useGameStore.getState().setGameOver(data.score, data.wave);
    });

    // Audio events — decoupled from scene logic
    this.bridge.on('sfx', (data) => {
      this.audio.playSfx(data.key, data.volume);
    });
    this.bridge.on('music', (data) => {
      if ('track' in data) {
        this.audio.playMusic(data.track);
      } else if (data.action === 'stop') {
        this.audio.stopMusic();
      } else if (data.action === 'fadeOut') {
        this.audio.fadeOutMusic(data.duration);
      }
    });
  }

  private startGame(): void {
    this.sceneManager.teardown();
    this.bridge.reset();

    const scene = new GameplayScene(
      this.engine,
      this.input,
      this.entityManager,
      this.camera,
      this.bridge,
    );

    this.sceneManager.loadScene(scene);
    this.running = true;
    this.input.setEnabled(true);
    useGameStore.getState().setScreen(GameScreen.Playing);

    if (!this.tickerBound) {
      this.engine.ticker.add(this.gameLoop);
      this.tickerBound = true;
    }

    if (this.syncInterval) clearInterval(this.syncInterval);
    this.syncInterval = setInterval(() => {
      if (this.running) {
        useGameStore.getState().syncFromBridge(this.bridge);
      }
    }, 50);
  }

  private gameLoop = (): void => {
    if (!this.running) return;
    const dt = Math.min(this.engine.ticker.deltaMS / 1000, 0.05);

    if (this.input.isActionJustPressed('pause')) {
      this.bridge.emit('game:pause', undefined);
      this.input.endFrame();
      return;
    }

    this.sceneManager.update(dt);
    this.input.endFrame();
  };

  private pause(): void {
    this.running = false;
    this.input.setEnabled(false);
    useGameStore.getState().setScreen(GameScreen.Paused);
  }

  private resume(): void {
    this.running = true;
    this.input.setEnabled(true);
    useGameStore.getState().setScreen(GameScreen.Playing);
  }

  destroy(): void {
    if (this.syncInterval) clearInterval(this.syncInterval);
    if (this.tickerBound) {
      this.engine.ticker.remove(this.gameLoop);
      this.tickerBound = false;
    }
    this.sceneManager.teardown();
    this.input.destroy();
    this.audio.destroy();
    this.engine.destroy();
    this.bridge.destroy();
  }
}
