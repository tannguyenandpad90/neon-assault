import { useEffect, useState } from 'react';

interface ComboDisplayProps {
  combo: number;
  multiplier: number;
}

export function ComboDisplay({ combo, multiplier }: ComboDisplayProps) {
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (multiplier >= 2) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 200);
      return () => clearTimeout(t);
    }
  }, [multiplier]);

  if (combo < 2) return null;

  const color = multiplier >= 6 ? '#f44' : multiplier >= 3 ? '#fa4' : '#4cf';

  return (
    <div
      style={{
        fontSize: 14,
        fontWeight: 700,
        color,
        textShadow: `0 0 8px currentColor`,
        transition: 'color 0.2s, transform 0.15s',
        transform: pop ? 'scale(1.3)' : 'scale(1)',
      }}
    >
      {combo} HIT ×{multiplier}
    </div>
  );
}
