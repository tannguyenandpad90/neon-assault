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
  private mouseDown = false;

  init(): void {
    window.addEventListener('keydown', this.onKeyDown, { capture: true });
    window.addEventListener('keyup', this.onKeyUp, { capture: true });
    window.addEventListener('blur', this.onBlur);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    // Blur focused UI elements so keys always reach the game
    if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }

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

  private onMouseDown = (): void => {
    this.mouseDown = true;
  };

  private onMouseUp = (): void => {
    this.mouseDown = false;
  };

  private onBlur = (): void => {
    this.keys.clear();
    this.justPressed.clear();
    this.mouseDown = false;
  };

  isAction(action: Action): boolean {
    if (!this.enabled) return false;
    // Mouse left-click = fire
    if (action === 'fire' && this.mouseDown) return true;
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
      this.mouseDown = false;
    }
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown, { capture: true } as EventListenerOptions);
    window.removeEventListener('keyup', this.onKeyUp, { capture: true } as EventListenerOptions);
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
  }
}
