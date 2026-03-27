import { useState, useEffect, useCallback, useRef } from 'react';
import { normalizeScore } from '../lib/scoring';
import { randomInt, lerp } from '../lib/utils';
import type { ExerciseProps } from './types';

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

function getParams(difficulty: number) {
  const t = (difficulty - 1) / 9;
  const n = Math.max(1, lerp(1, 4, t));
  const trialsPerRound = lerp(10, 20, t);
  return { n, trialsPerRound };
}

function generateSequence(n: number, trials: number): string[] {
  const seq: string[] = [];
  const matchRate = 0.3;
  for (let i = 0; i < trials; i++) {
    if (i >= n && Math.random() < matchRate) {
      seq.push(seq[i - n]);
    } else {
      seq.push(LETTERS[randomInt(0, LETTERS.length - 1)]);
    }
  }
  return seq;
}

export function NBack({ difficulty, onComplete, timeUp }: ExerciseProps) {
  const { n, trialsPerRound } = getParams(difficulty);
  const [sequence, setSequence] = useState(() => generateSequence(n, trialsPerRound));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responded, setResponded] = useState(false);
  const [roundHits, setRoundHits] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState<'hit' | 'false-alarm' | null>(null);
  const [startTime] = useState(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const completedRef = useRef(false);

  const isMatch = currentIndex >= n && sequence[currentIndex] === sequence[currentIndex - n];

  const finalize = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    const total = totalMatches || 1;
    const acc = total > 0 ? totalCorrect / total : 0;
    onComplete({
      exerciseId: 'nback',
      difficulty,
      correct: totalCorrect,
      total,
      accuracy: acc,
      score: normalizeScore(totalCorrect, total, difficulty),
      durationMs: Date.now() - startTime,
      rounds: round,
    });
  }, [totalCorrect, totalMatches, round, difficulty, onComplete, startTime]);

  // When sequence ends, start new round or finalize
  const endRound = useCallback(() => {
    const roundMatches = sequence.filter((_, i) => i >= n && sequence[i] === sequence[i - n]).length;
    const newTotalCorrect = totalCorrect + roundHits;
    const newTotalMatches = totalMatches + roundMatches;
    setTotalCorrect(newTotalCorrect);
    setTotalMatches(newTotalMatches);

    const passed = roundMatches > 0 ? roundHits / roundMatches >= 0.5 : true;

    if (timeUp) {
      // Will be caught by finalize
      return;
    }

    // Start new round
    setSequence(generateSequence(n, trialsPerRound));
    setCurrentIndex(0);
    setResponded(false);
    setRoundHits(0);
    
    setFeedback(null);
    if (passed) {
      setRound((r) => r + 1);
    }
    // If failed, same round number (retry indicator)
  }, [sequence, n, trialsPerRound, roundHits, totalCorrect, totalMatches, timeUp]);

  const advance = useCallback(() => {
    if (currentIndex + 1 >= sequence.length) {
      endRound();
      return;
    }
    setCurrentIndex((i) => i + 1);
    setResponded(false);
    setFeedback(null);
  }, [currentIndex, sequence.length, endRound]);

  // Auto-advance every 2.5 seconds
  useEffect(() => {
    timerRef.current = setTimeout(advance, 2500);
    return () => clearTimeout(timerRef.current);
  }, [currentIndex, advance]);

  // Finalize on timeUp between trials
  useEffect(() => {
    if (timeUp && !completedRef.current) {
      finalize();
    }
  }, [timeUp, finalize]);

  const handleMatch = useCallback(() => {
    if (responded) return;
    setResponded(true);
    if (isMatch) {
      setRoundHits((h) => h + 1);
      setFeedback('hit');
    } else {

      setFeedback('false-alarm');
    }
  }, [responded, isMatch]);

  return (
    <div className="flex flex-col items-center gap-6 min-h-[40vh] justify-center">
      <div className="flex items-center gap-4 text-sm text-text-muted">
        <span>Round {round}</span>
        <span>{totalCorrect + roundHits} hits</span>
      </div>

      <p className="text-text-muted text-sm">
        Press Match when the letter matches {n} step{n > 1 ? 's' : ''} back
      </p>

      <div
        className={`w-32 h-32 rounded-2xl flex items-center justify-center text-6xl font-bold transition-colors ${
          feedback === 'hit'
            ? 'bg-accent/20 text-accent'
            : feedback === 'false-alarm'
              ? 'bg-danger/20 text-danger'
              : 'bg-bg-card border-2 border-border text-text'
        }`}
      >
        {sequence[currentIndex]}
      </div>

      <button
        onClick={handleMatch}
        disabled={responded}
        className="px-12 py-4 rounded-xl bg-primary text-white font-bold text-xl active:scale-95 transition-transform disabled:opacity-40"
      >
        Match!
      </button>

      <p className="text-text-muted text-xs">
        {currentIndex + 1} / {trialsPerRound} · {n}-back
      </p>
    </div>
  );
}
