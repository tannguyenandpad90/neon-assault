import { useGameStore } from '@app/store';
import { GameScreen } from '@app/types';
import { GameCanvas } from '@ui/GameCanvas';
import { MainMenu } from '@ui/MainMenu';
import { HUD } from '@ui/HUD';
import { PauseOverlay } from '@ui/PauseOverlay';
import { GameOverScreen } from '@ui/GameOverScreen';

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  background: '#0a0a12',
};

export default function App() {
  const screen = useGameStore((s) => s.screen);

  return (
    <div style={containerStyle}>
      <GameCanvas />
      {screen === GameScreen.Menu && <MainMenu />}
      {screen === GameScreen.Playing && <HUD />}
      {screen === GameScreen.Paused && (
        <>
          <HUD />
          <PauseOverlay />
        </>
      )}
      {screen === GameScreen.GameOver && <GameOverScreen />}
    </div>
  );
}
