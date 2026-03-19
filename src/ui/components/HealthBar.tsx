interface HealthBarProps {
  hp: number;
  maxHp: number;
}

export function HealthBar({ hp, maxHp }: HealthBarProps) {
  const pct = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  const color = pct > 60 ? '#4c4' : pct > 30 ? '#cc4' : '#c44';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, color: '#aaa', minWidth: 24 }}>HP</span>
      <div
        style={{
          width: 100,
          height: 10,
          background: '#222',
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid #333',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            transition: 'width 0.2s, background 0.3s',
            borderRadius: 2,
          }}
        />
      </div>
      <span style={{ fontSize: 11, color: '#888', minWidth: 30 }}>
        {hp}/{maxHp}
      </span>
    </div>
  );
}
