import { useState, useEffect, useCallback, useRef } from 'react';
import { Grid } from '../components/Grid';
import { normalizeScore } from '../lib/scoring';
import { lerp } from '../lib/utils';
import type { ExerciseProps } from './types';

function getParams(difficulty: number) {
  const t = (difficulty - 1) / 9;
  const size = lerp(3, 6, t);
  const cells = lerp(3, 14, t);
  const viewTime = lerp(4, 2, t);
  return { size, cells, viewTime };
}

function generatePattern(size: number, cells: number): Set<number> {
  const total = size * size;
  const indices = new Set<number>();
  while (indices.size < cells) {
    indices.add(Math.floor(Math.random() * total));
  }
  return indices;
}

export function PatternRecall({ difficulty, onComplete, timeUp }: ExerciseProps) {
  const { size, cells, viewTime } = getParams(difficulty);

  const [highlighted, setHighlighted] = useState<Set<number>>(() => generatePattern(size, cells));
  const [phase, setPhase] = useState<'memorize' | 'recall' | 'feedback'>('memorize');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [round, setRound] = useState(1);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [lastWrong, setLastWrong] = useState(false);
  const [startTime] = useState(Date.now());
  const completedRef = useRef(false);

  // Memorize timer
  useEffect(() => {
    if (phase !== 'memorize') return;
    const id = setTimeout(() => setPhase('recall'), viewTime * 1000);
    return () => clearTimeout(id);
  }, [phase, viewTime, round]);

  // When timeUp becomes true during feedback or between rounds, finalize
  useEffect(() => {
    if (timeUp && !completedRef.current && phase !== 'recall') {
      completedRef.current = true;
      const acc = totalAttempted > 0 ? totalCorrect / totalAttempted : 0;
      onComplete({
        exerciseId: 'pattern-recall',
        difficulty,
        correct: totalCorrect,
        total: totalAttempted,
        accuracy: acc,
        score: normalizeScore(totalCorrect, totalAttempted, difficulty),
        durationMs: Date.now() - startTime,
        rounds: round,
      });
    }
  }, [timeUp, phase, totalCorrect, totalAttempted, round, difficulty, onComplete, startTime]);

  const toggleCell = useCallback((index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const submit = useCallback(() => {
    const correct = [...highlighted].filter((i) => selected.has(i)).length;
    const extra = [...selected].filter((i) => !highlighted.has(i)).length;
    const adjustedCorrect = Math.max(0, correct - extra);
    const passed = adjustedCorrect / cells >= 0.7;

    setTotalCorrect((c) => c + adjustedCorrect);
    setTotalAttempted((t) => t + cells);
    setLastWrong(!passed);
    setPhase('feedback');

    setTimeout(() => {
      if (timeUp) return; // will be caught by effect

      // If wrong, retry with similar pattern (same params); if right, new round
      setSelected(new Set());
      if (passed) {
        setHighlighted(generatePattern(size, cells));
        setRound((r) => r + 1);
      } else {
        // Retry: new pattern but same difficulty
        setHighlighted(generatePattern(size, cells));
      }
      setPhase('memorize');
    }, 1200);
  }, [highlighted, selected, cells, size, timeUp]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4 text-sm text-text-muted">
        <span>Round {round}</span>
        <span>{totalCorrect}/{totalAttempted} correct</span>
        {lastWrong && phase === 'memorize' && (
          <span className="text-warning">Retry!</span>
        )}
      </div>

      {phase === 'feedback' ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-text-muted">
            {lastWrong ? 'Try again with a new pattern...' : 'Nice! Next round...'}
          </p>
          <Grid rows={size} cols={size} highlighted={highlighted} userSelected={selected} mode="result" />
        </div>
      ) : (
        <>
          <p className="text-text-muted text-sm">
            {phase === 'memorize' ? 'Memorize the pattern...' : 'Tap to recreate the pattern'}
          </p>
          <Grid
            rows={size}
            cols={size}
            highlighted={highlighted}
            userSelected={selected}
            mode={phase === 'memorize' ? 'display' : 'input'}
            onCellTap={toggleCell}
          />
          {phase === 'recall' && (
            <button
              onClick={submit}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-lg active:scale-95 transition-transform"
            >
              Submit
            </button>
          )}
        </>
      )}
    </div>
  );
}
