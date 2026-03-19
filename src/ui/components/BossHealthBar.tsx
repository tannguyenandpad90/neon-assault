interface BossHealthBarProps {
  name: string;
  hp: number;
  maxHp: number;
  phase: number;
}

export function BossHealthBar({ name, hp, maxHp, phase }: BossHealthBarProps) {
  const pct = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  const color = phase === 0 ? '#c66' : '#f44';

  return (
    <div
      style={{
        position: 'absolute',
        top: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 280,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 3,
          color: '#c44',
          marginBottom: 4,
          textShadow: '0 0 8px rgba(200,50,50,0.4)',
        }}
      >
        {name} {phase > 0 && `— PHASE ${phase + 1}`}
      </div>
      <div
        style={{
          width: '100%',
          height: 8,
          background: '#1a0a0a',
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid #442222',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${color}, ${phase === 0 ? '#a44' : '#c22'})`,
            transition: 'width 0.15s',
            borderRadius: 3,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
      </div>
    </div>
  );
}
