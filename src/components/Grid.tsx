interface GridProps {
  rows: number;
  cols: number;
  highlighted: Set<number>;
  userSelected?: Set<number>;
  mode: 'display' | 'input' | 'playback' | 'result';
  activePlayback?: number | null;
  onCellTap?: (index: number) => void;
}

export function Grid({
  rows,
  cols,
  highlighted,
  userSelected = new Set(),
  mode,
  activePlayback = null,
  onCellTap,
}: GridProps) {
  const total = rows * cols;
  const cellSize = Math.min(56, Math.floor(320 / Math.max(rows, cols)));

  return (
    <div
      className="grid gap-2 mx-auto"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
      }}
    >
      {Array.from({ length: total }, (_, i) => {
        let bg = 'bg-bg-card border-2 border-border';

        if (mode === 'display' && highlighted.has(i)) {
          bg = 'bg-primary border-2 border-primary';
        } else if (mode === 'playback' && activePlayback === i) {
          bg = 'bg-primary border-2 border-primary';
        } else if (mode === 'input' && userSelected.has(i)) {
          bg = 'bg-primary border-2 border-primary';
        } else if (mode === 'result') {
          if (highlighted.has(i) && userSelected.has(i)) {
            bg = 'bg-accent border-2 border-accent';
          } else if (highlighted.has(i) && !userSelected.has(i)) {
            bg = 'bg-danger border-2 border-danger';
          } else if (!highlighted.has(i) && userSelected.has(i)) {
            bg = 'bg-warning border-2 border-warning';
          }
        }

        return (
          <button
            key={i}
            className={`${bg} rounded-lg transition-colors duration-200 hover:border-primary/50 active:scale-95`}
            style={{ width: cellSize, height: cellSize, minWidth: 48, minHeight: 48 }}
            onClick={() => mode === 'input' && onCellTap?.(i)}
            disabled={mode !== 'input'}
          />
        );
      })}
    </div>
  );
}
