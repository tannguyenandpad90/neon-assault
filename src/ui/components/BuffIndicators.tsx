interface BuffIndicatorsProps {
  firepowerLevel: number;
  shieldActive: boolean;
  magnetTimer: number;
  overdriveTimer: number;
}

const pillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 3,
  padding: '2px 6px',
  borderRadius: 4,
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: 0.5,
};

export function BuffIndicators({ firepowerLevel, shieldActive, magnetTimer, overdriveTimer }: BuffIndicatorsProps) {
  const buffs: { label: string; color: string; bg: string }[] = [];

  if (firepowerLevel >= 2) {
    buffs.push({
      label: `FP ${firepowerLevel}`,
      color: '#ff8800',
      bg: 'rgba(255,136,0,0.15)',
    });
  }
  if (shieldActive) {
    buffs.push({ label: 'SHIELD', color: '#4488ff', bg: 'rgba(68,136,255,0.15)' });
  }
  if (magnetTimer > 0) {
    buffs.push({ label: `MAG ${Math.ceil(magnetTimer)}s`, color: '#44ffcc', bg: 'rgba(68,255,204,0.15)' });
  }
  if (overdriveTimer > 0) {
    buffs.push({ label: `OVR ${Math.ceil(overdriveTimer)}s`, color: '#ff4400', bg: 'rgba(255,68,0,0.15)' });
  }

  if (buffs.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {buffs.map((b) => (
        <div key={b.label} style={{ ...pillStyle, color: b.color, background: b.bg, border: `1px solid ${b.color}33` }}>
          {b.label}
        </div>
      ))}
    </div>
  );
}
