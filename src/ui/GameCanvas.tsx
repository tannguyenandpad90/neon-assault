import { useRef, useEffect } from 'react';
import { Game } from '@game/Game';
import { GameBridge } from '@app/GameBridge';

let bridge = new GameBridge();
let gameInstance: Game | null = null;

export function getGameBridge(): GameBridge {
  return bridge;
}

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Fresh bridge + game each mount (handles StrictMode double-mount)
    bridge = new GameBridge();
    const game = new Game(bridge);
    gameInstance = game;

    game.init(container).catch(console.error);

    return () => {
      game.destroy();
      gameInstance = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        inset: 0,
      }}
    />
  );
}

export function getGame(): Game | null {
  return gameInstance;
}
