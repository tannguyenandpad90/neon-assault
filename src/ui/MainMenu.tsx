import { useGameStore } from '@app/store';
import { getGameBridge } from './GameCanvas';

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'rgba(8, 8, 16, 0.92)',
  zIndex: 20,
};

const buttonStyle: React.CSSProperties = {
  padding: '14px 48px',
  fontSize: 16,
  fontWeight: 600,
  fontFamily: 'inherit',
  letterSpacing: 3,
  color: '#e8d5a3',
  background: 'transparent',
  border: '1px solid #e8d5a3',
  cursor: 'pointer',
  transition: 'all 0.25s',
};

export function MainMenu() {
  const highScore = useGameStore((s) => s.highScore);

  const handleStart = () => {
    getGameBridge().emit('game:start', undefined);
  };

  return (
    <div style={overlayStyle}>
      <div style={{
        fontSize: 48, fontWeight: 800, letterSpacing: 6, color: '#e8d5a3',
        textShadow: '0 0 30px rgba(232, 213, 163, 0.3)', marginBottom: 8,
      }}>
        SKY REIGN
      </div>
      <div style={{ fontSize: 13, color: '#666', letterSpacing: 3, marginBottom: 40 }}>
        ARCADE SHOOTER
      </div>

      {highScore > 0 && (
        <div style={{ fontSize: 13, color: '#888', marginBottom: 24, letterSpacing: 1 }}>
          BEST: <span style={{ color: '#e8d5a3', fontWeight: 700 }}>{highScore.toLocaleString()}</span>
        </div>
      )}

      <button
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(232, 213, 163, 0.1)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(232, 213, 163, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.boxShadow = 'none';
        }}
        onClick={handleStart}
      >
        START GAME
      </button>
      <div style={{ marginTop: 32, fontSize: 11, color: '#444', textAlign: 'center', lineHeight: 1.8 }}>
        WASD — Move &nbsp;&nbsp; SPACE — Fire &nbsp;&nbsp; B — Bomb &nbsp;&nbsp; ESC — Pause
      </div>
    </div>
  );
}
