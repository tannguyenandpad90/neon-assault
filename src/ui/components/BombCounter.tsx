interface BombCounterProps {
  bombs: number;
}

export function BombCounter({ bombs }: BombCounterProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 12, color: '#aaa' }}>BOMB</span>
      <div style={{ display: 'flex', gap: 3 }}>
        {Array.from({ length: bombs }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#ff44ff',
              boxShadow: '0 0 4px #ff44ff',
            }}
          />
        ))}
      </div>
    </div>
  );
}
