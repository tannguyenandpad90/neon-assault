import type { Scene } from '@game/types';

export class SceneManager {
  private currentScene: Scene | null = null;

  loadScene(scene: Scene): void {
    if (this.currentScene) {
      this.currentScene.teardown();
    }
    this.currentScene = scene;
    this.currentScene.setup();
  }

  update(dt: number): void {
    if (this.currentScene) {
      this.currentScene.update(dt);
    }
  }

  get active(): Scene | null {
    return this.currentScene;
  }

  teardown(): void {
    if (this.currentScene) {
      this.currentScene.teardown();
      this.currentScene = null;
    }
  }
}
