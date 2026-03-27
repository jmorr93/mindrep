interface TimerProps {
  fraction: number;
  seconds: number;
}

export function Timer({ fraction, seconds }: TimerProps) {
  const color =
    fraction > 0.5 ? 'bg-primary' : fraction > 0.2 ? 'bg-warning' : 'bg-danger';

  return (
    <div className="w-full">
      <div className="h-2 rounded-full bg-border overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${color}`}
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
      <p className="text-text-muted text-sm mt-1 text-right font-medium">{seconds}s</p>
    </div>
  );
}
