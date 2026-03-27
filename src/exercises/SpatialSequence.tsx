import { useState, useEffect, useCallback, useRef } from 'react';
import { normalizeScore } from '../lib/scoring';
import { lerp, randomInt } from '../lib/utils';
import type { ExerciseProps } from './types';

function getParams(difficulty: number) {
  const t = (difficulty - 1) / 9;
  return { sequenceLength: lerp(3, 10, t) };
}

const GRID_SIZE = 3;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

function generateSequence(len: number): number[] {
  const seq: number[] = [];
  while (seq.length < len) {
    const n = randomInt(0, TOTAL_CELLS - 1);
    if (seq[seq.length - 1] !== n) seq.push(n);
  }
  return seq;
}

export function SpatialSequence({ difficulty, onComplete, timeUp }: ExerciseProps) {
  const { sequenceLength } = getParams(difficulty);

  const [sequence, setSequence] = useState(() => generateSequence(sequenceLength));
  const [phase, setPhase] = useState<'watch' | 'replay' | 'feedback'>('watch');
  const [playbackIndex, setPlaybackIndex] = useState(-1);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [round, setRound] = useState(1);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [lastWrong, setLastWrong] = useState(false);
  const [startTime] = useState(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const completedRef = useRef(false);

  // Playback animation
  useEffect(() => {
    if (phase !== 'watch') return;
    let idx = 0;
    setPlaybackIndex(sequence[0]);
    intervalRef.current = setInterval(() => {
      idx++;
      if (idx >= sequence.length) {
        clearInterval(intervalRef.current);
        setPlaybackIndex(-1);
        setPhase('replay');
        return;
      }
      setPlaybackIndex(sequence[idx]);
    }, 800);
    return () => clearInterval(intervalRef.current);
  }, [phase, sequence, round]);

  // Finalize when timeUp
  useEffect(() => {
    if (timeUp && !completedRef.current && phase !== 'replay') {
      completedRef.current = true;
      const acc = totalAttempted > 0 ? totalCorrect / totalAttempted : 0;
      onComplete({
        exerciseId: 'spatial-sequence',
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

  const tapCell = useCallback(
    (index: number) => {
      if (phase !== 'replay') return;
      const next = [...userSequence, index];
      setUserSequence(next);

      if (next.length >= sequence.length) {
        let correct = 0;
        for (let i = 0; i < sequence.length; i++) {
          if (next[i] === sequence[i]) correct++;
        }
        const passed = correct / sequence.length >= 0.7;

        setTotalCorrect((c) => c + correct);
        setTotalAttempted((t) => t + sequence.length);
        setLastWrong(!passed);
        setPhase('feedback');

        setTimeout(() => {
          if (timeUp) return;
          setUserSequence([]);
          if (passed) {
            setSequence(generateSequence(sequenceLength));
            setRound((r) => r + 1);
          } else {
            setSequence(generateSequence(sequenceLength));
          }
          setPhase('watch');
        }, 1200);
      }
    },
    [phase, userSequence, sequence, sequenceLength, timeUp],
  );

  const cellSize = 72;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4 text-sm text-text-muted">
        <span>Round {round}</span>
        <span>{totalCorrect}/{totalAttempted} correct</span>
        {lastWrong && phase === 'watch' && <span className="text-warning">Retry!</span>}
      </div>

      <p className="text-text-muted text-sm">
        {phase === 'watch'
          ? 'Watch the sequence...'
          : phase === 'replay'
            ? `Tap in order (${userSequence.length}/${sequence.length})`
            : lastWrong ? 'Try again...' : 'Nice! Next round...'}
      </p>

      <div
        className="grid gap-3 mx-auto"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)` }}
      >
        {Array.from({ length: TOTAL_CELLS }, (_, i) => {
          const isActive = phase === 'watch' && playbackIndex === i;
          const isUserTapped = phase === 'replay' && userSequence.includes(i);
          const lastTapped = userSequence[userSequence.length - 1] === i;

          let bg = 'bg-bg-card border-2 border-border';
          if (isActive) bg = 'bg-primary';
          else if (lastTapped) bg = 'bg-primary/70';
          else if (isUserTapped) bg = 'bg-primary/30';

          if (phase === 'feedback') {
            const inSeq = sequence.includes(i);
            const inUser = userSequence.includes(i);
            if (inSeq && inUser) bg = 'bg-accent';
            else if (inSeq) bg = 'bg-danger/50';
          }

          return (
            <button
              key={i}
              className={`${bg} rounded-xl transition-colors duration-200 active:scale-95`}
              style={{ width: cellSize, height: cellSize }}
              onClick={() => tapCell(i)}
              disabled={phase !== 'replay'}
            />
          );
        })}
      </div>
    </div>
  );
}
