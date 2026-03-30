import { useState, useEffect, useCallback, useRef } from 'react';
import { Grid } from '../components/Grid';
import { normalizeScore } from '../lib/scoring';
import { lerp } from '../lib/utils';
import { useProgressiveDifficulty } from '../hooks/useProgressiveDifficulty';
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

export function PatternRecall({ difficulty, onComplete, timeUp, progressive }: ExerciseProps) {
  const { level, onRoundEnd } = useProgressiveDifficulty(difficulty, progressive);
  const params = getParams(level);

  const [highlighted, setHighlighted] = useState<Set<number>>(() => generatePattern(params.size, params.cells));
  const [phase, setPhase] = useState<'memorize' | 'recall' | 'feedback'>('memorize');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [round, setRound] = useState(1);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [lastWrong, setLastWrong] = useState(false);
  const [startTime] = useState(Date.now());
  const completedRef = useRef(false);
  const currentParamsRef = useRef(params);
  currentParamsRef.current = params;

  // Memorize timer
  useEffect(() => {
    if (phase !== 'memorize') return;
    const id = setTimeout(() => setPhase('recall'), currentParamsRef.current.viewTime * 1000);
    return () => clearTimeout(id);
  }, [phase, round]);

  useEffect(() => {
    if (timeUp && !completedRef.current && phase !== 'recall') {
      completedRef.current = true;
      const acc = totalAttempted > 0 ? totalCorrect / totalAttempted : 0;
      onComplete({
        exerciseId: 'pattern-recall',
        difficulty: level,
        correct: totalCorrect,
        total: totalAttempted,
        accuracy: acc,
        score: normalizeScore(totalCorrect, totalAttempted, level),
        durationMs: Date.now() - startTime,
        rounds: round,
      });
    }
  }, [timeUp, phase, totalCorrect, totalAttempted, round, level, onComplete, startTime]);

  const toggleCell = useCallback((index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const submit = useCallback(() => {
    const p = currentParamsRef.current;
    const correct = [...highlighted].filter((i) => selected.has(i)).length;
    const extra = [...selected].filter((i) => !highlighted.has(i)).length;
    const adjustedCorrect = Math.max(0, correct - extra);
    const passed = adjustedCorrect / p.cells >= 0.7;

    setTotalCorrect((c) => c + adjustedCorrect);
    setTotalAttempted((t) => t + p.cells);
    setLastWrong(!passed);
    onRoundEnd(passed);
    setPhase('feedback');

    setTimeout(() => {
      if (timeUp) return;
      setSelected(new Set());
      // getParams will use updated level from progressive hook on next render
      const nextParams = getParams(progressive ? (passed ? Math.min(level + 1, 10) : Math.max(level - 1, 1)) : level);
      setHighlighted(generatePattern(nextParams.size, nextParams.cells));
      if (passed) setRound((r) => r + 1);
      setPhase('memorize');
    }, 1200);
  }, [highlighted, selected, level, timeUp, onRoundEnd, progressive]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4 text-sm text-text-muted">
        <span>Round {round}</span>
        <span>{totalCorrect}/{totalAttempted} correct</span>
        {progressive && <span className="text-primary font-semibold">Lv {level}</span>}
        {lastWrong && phase === 'memorize' && <span className="text-warning">Retry!</span>}
      </div>

      {phase === 'feedback' ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-text-muted">
            {lastWrong ? 'Try again with a new pattern...' : 'Nice! Next round...'}
          </p>
          <Grid rows={params.size} cols={params.size} highlighted={highlighted} userSelected={selected} mode="result" />
        </div>
      ) : (
        <>
          <p className="text-text-muted text-sm">
            {phase === 'memorize' ? 'Memorize the pattern...' : 'Tap to recreate the pattern'}
          </p>
          <Grid
            rows={params.size}
            cols={params.size}
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
