interface ScoreDisplayProps {
  score: number;
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  return (
    <div style={{ fontSize: 18, fontWeight: 700, color: '#e8d5a3', letterSpacing: 1 }}>
      {score.toLocaleString()}
    </div>
  );
}
