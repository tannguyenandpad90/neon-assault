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
  marginTop: 24,
};

export function GameOverScreen() {
  const { finalScore, finalWave, highScore } = useGameStore();
  const isNewRecord = finalScore >= highScore && finalScore > 0;

  const handleRestart = () => {
    getGameBridge().emit('game:restart', undefined);
  };

  return (
    <div style={overlayStyle}>
      <div style={{ fontSize: 36, fontWeight: 800, color: '#c44', letterSpacing: 3, marginBottom: 8 }}>
        GAME OVER
      </div>

      {isNewRecord && (
        <div style={{
          fontSize: 14, fontWeight: 700, color: '#e8d5a3', letterSpacing: 3, marginTop: 8,
          textShadow: '0 0 12px rgba(232,213,163,0.5)',
          animation: 'pulse 1s ease-in-out infinite',
        }}>
          NEW RECORD!
        </div>
      )}

      <div style={{ fontSize: 28, fontWeight: 700, color: '#e8d5a3', marginTop: 16 }}>
        {finalScore.toLocaleString()}
      </div>
      <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>
        Wave {finalWave} reached
      </div>

      {!isNewRecord && highScore > 0 && (
        <div style={{ fontSize: 12, color: '#555', marginTop: 8 }}>
          BEST: {highScore.toLocaleString()}
        </div>
      )}

      <button style={buttonStyle} onClick={handleRestart}>
        PLAY AGAIN
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
