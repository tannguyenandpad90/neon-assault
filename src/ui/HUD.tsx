import { useGameStore } from '@app/store';
import { HealthBar } from './components/HealthBar';
import { ScoreDisplay } from './components/ScoreDisplay';
import { ComboDisplay } from './components/ComboDisplay';
import { BombCounter } from './components/BombCounter';
import { BossHealthBar } from './components/BossHealthBar';
import { BuffIndicators } from './components/BuffIndicators';

const hudStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  fontFamily: "'Segoe UI', system-ui, sans-serif",
  zIndex: 10,
};

const topBarStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: '12px 16px',
};

const bottomBarStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 12,
  left: 16,
  right: 16,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export function HUD() {
  const {
    score, hp, maxHp, combo, multiplier, bombs, wave, enemyCount,
    bossActive, bossName, bossHp, bossMaxHp, bossPhase,
    firepowerLevel, shieldActive, magnetTimer, overdriveTimer,
  } = useGameStore();

  return (
    <div style={hudStyle}>
      <div style={topBarStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <HealthBar hp={hp} maxHp={maxHp} />
          <BombCounter bombs={bombs} />
          <BuffIndicators
            firepowerLevel={firepowerLevel}
            shieldActive={shieldActive}
            magnetTimer={magnetTimer}
            overdriveTimer={overdriveTimer}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <ScoreDisplay score={score} />
          <ComboDisplay combo={combo} multiplier={multiplier} />
        </div>
      </div>
      {bossActive && (
        <BossHealthBar name={bossName} hp={bossHp} maxHp={bossMaxHp} phase={bossPhase} />
      )}
      <div style={bottomBarStyle}>
        <span style={{ fontSize: 11, color: '#555' }}>
          WAVE {wave}{!bossActive && enemyCount > 0 ? ` · ${enemyCount} remaining` : ''}
        </span>
        <span style={{ fontSize: 10, color: '#444' }}>WASD move · SPACE fire · B bomb · ESC pause</span>
      </div>
    </div>
  );
}
