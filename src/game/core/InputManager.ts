type Action = 'up' | 'down' | 'left' | 'right' | 'fire' | 'bomb' | 'pause';

const ACTION_KEYS: Record<Action, string[]> = {
  up: ['w', 'W', 'ArrowUp'],
  down: ['s', 'S', 'ArrowDown'],
  left: ['a', 'A', 'ArrowLeft'],
  right: ['d', 'D', 'ArrowRight'],
  fire: [' ', 'j', 'J'],
  bomb: ['b', 'B', 'k', 'K'],
  pause: ['Escape', 'p', 'P'],
};

export class InputManager {
  private keys = new Map<string, boolean>();
  private justPressed = new Map<string, boolean>();
  private enabled = true;

  init(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (!this.keys.get(e.key)) {
      this.justPressed.set(e.key, true);
    }
    this.keys.set(e.key, true);

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.set(e.key, false);
  };

  private onBlur = (): void => {
    this.keys.clear();
    this.justPressed.clear();
  };

  isAction(action: Action): boolean {
    if (!this.enabled) return false;
    return ACTION_KEYS[action].some(key => this.keys.get(key) === true);
  }

  isActionJustPressed(action: Action): boolean {
    if (!this.enabled) return false;
    return ACTION_KEYS[action].some(key => this.justPressed.get(key) === true);
  }

  endFrame(): void {
    this.justPressed.clear();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.keys.clear();
      this.justPressed.clear();
    }
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
  }
}
