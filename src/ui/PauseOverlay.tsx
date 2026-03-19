import { getGameBridge } from './GameCanvas';
import { useGameStore } from '@app/store';
import { GameScreen } from '@app/types';

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'rgba(8, 8, 16, 0.85)',
  zIndex: 25,
};

const buttonStyle: React.CSSProperties = {
  padding: '12px 40px',
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'inherit',
  letterSpacing: 2,
  color: '#e8d5a3',
  background: 'transparent',
  border: '1px solid #e8d5a3',
  cursor: 'pointer',
  margin: 6,
};

export function PauseOverlay() {
  const setScreen = useGameStore((s) => s.setScreen);

  const handleResume = () => {
    getGameBridge().emit('game:resume', undefined);
  };

  const handleQuit = () => {
    getGameBridge().emit('game:restart', undefined);
    setScreen(GameScreen.Menu);
  };

  return (
    <div style={overlayStyle}>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#ccc', letterSpacing: 4, marginBottom: 32 }}>
        PAUSED
      </div>
      <button style={buttonStyle} onClick={handleResume}>RESUME</button>
      <button style={{ ...buttonStyle, borderColor: '#666', color: '#888' }} onClick={handleQuit}>
        QUIT TO MENU
      </button>
    </div>
  );
}
