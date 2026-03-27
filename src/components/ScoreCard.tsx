import type { ExerciseResult } from '../exercises/types';

interface ScoreCardProps {
  result: ExerciseResult;
  name: string;
  icon: string;
  personalBest: number;
}

export function ScoreCard({ result, name, icon, personalBest }: ScoreCardProps) {
  const isNewBest = result.score >= personalBest && result.score > 0;

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
      <span className="text-3xl">{icon}</span>
      <div className="flex-1 text-left">
        <p className="font-semibold">{name}</p>
        <p className="text-text-muted text-sm">
          {result.correct}/{result.total} correct · {result.rounds} round{result.rounds !== 1 ? 's' : ''} · Lv {result.difficulty}
        </p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-primary">{result.score}</p>
        {isNewBest && <p className="text-accent text-xs font-semibold">NEW BEST!</p>}
      </div>
    </div>
  );
}
