interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null;

  return (
    <div className="inline-flex items-center gap-2 bg-bg-card border border-border px-4 py-2 rounded-full shadow-sm">
      <span className="text-2xl">🔥</span>
      <span className="text-lg font-bold">{streak} day{streak !== 1 ? 's' : ''}</span>
    </div>
  );
}
