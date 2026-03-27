import { useState, useEffect, useCallback, useRef } from 'react';
import { normalizeScore } from '../lib/scoring';
import { randomInt, lerp } from '../lib/utils';
import type { ExerciseProps } from './types';

function getParams(difficulty: number) {
  const t = (difficulty - 1) / 9;
  const length = lerp(3, 12, t);
  const backward = difficulty >= 6;
  return { length, backward };
}

function generateDigits(length: number): number[] {
  return Array.from({ length }, () => randomInt(0, 9));
}

export function DigitSpan({ difficulty, onComplete, timeUp }: ExerciseProps) {
  const { length, backward } = getParams(difficulty);

  const [digits, setDigits] = useState(() => generateDigits(length));
  const [phase, setPhase] = useState<'show' | 'input' | 'feedback'>('show');
  const [showIndex, setShowIndex] = useState(0);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [round, setRound] = useState(1);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [lastWrong, setLastWrong] = useState(false);
  const [lastTarget, setLastTarget] = useState<number[]>([]);
  const [lastUserAnswer, setLastUserAnswer] = useState<number[]>([]);
  const [startTime] = useState(Date.now());
  const completedRef = useRef(false);

  // Show digits one at a time
  useEffect(() => {
    if (phase !== 'show') return;
    if (showIndex >= digits.length) {
      setPhase('input');
      return;
    }
    const id = setTimeout(() => setShowIndex((i) => i + 1), 1000);
    return () => clearTimeout(id);
  }, [phase, showIndex, digits.length]);

  // Finalize when timeUp and not mid-input
  useEffect(() => {
    if (timeUp && !completedRef.current && phase !== 'input') {
      completedRef.current = true;
      const acc = totalAttempted > 0 ? totalCorrect / totalAttempted : 0;
      onComplete({
        exerciseId: 'digit-span',
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

  const addDigit = useCallback((d: number) => {
    setUserInput((prev) => [...prev, d]);
  }, []);

  const removeDigit = useCallback(() => {
    setUserInput((prev) => prev.slice(0, -1));
  }, []);

  const submit = useCallback(() => {
    const target = backward ? [...digits].reverse() : digits;
    let correct = 0;
    for (let i = 0; i < target.length; i++) {
      if (userInput[i] === target[i]) correct++;
    }
    const passed = correct / digits.length >= 0.7;

    setTotalCorrect((c) => c + correct);
    setTotalAttempted((t) => t + digits.length);
    setLastWrong(!passed);
    setLastTarget(target);
    setLastUserAnswer([...userInput]);
    setPhase('feedback');

    setTimeout(() => {
      if (timeUp) return;
      setUserInput([]);
      setShowIndex(0);
      if (passed) {
        setDigits(generateDigits(length));
        setRound((r) => r + 1);
      } else {
        // Retry: new digits, same length
        setDigits(generateDigits(length));
      }
      setPhase('show');
    }, 1500);
  }, [digits, userInput, backward, length, timeUp]);

  if (phase === 'show') {
    return (
      <div className="flex flex-col items-center justify-center gap-6 min-h-[40vh]">
        <div className="flex items-center gap-4 text-sm text-text-muted">
          <span>Round {round}</span>
          {lastWrong && <span className="text-warning">Retry!</span>}
        </div>
        <p className="text-text-muted text-sm">
          Remember these digits{backward ? ' (enter backwards)' : ''}
        </p>
        <div className="text-7xl font-bold text-primary">
          {showIndex < digits.length ? digits[showIndex] : ''}
        </div>
        <p className="text-text-muted text-xs">
          {Math.min(showIndex + 1, digits.length)} / {digits.length}
        </p>
      </div>
    );
  }

  if (phase === 'feedback') {
    return (
      <div className="flex flex-col items-center gap-4 min-h-[40vh] justify-center">
        <p className="text-sm text-text-muted">
          {lastWrong ? 'Try again...' : 'Nice! Next round...'}
        </p>
        <div className="flex gap-2">
          {lastTarget.map((d, i) => (
            <span
              key={i}
              className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold ${
                lastUserAnswer[i] === d ? 'bg-accent text-white' : 'bg-danger text-white'
              }`}
            >
              {lastUserAnswer[i] ?? '–'}
            </span>
          ))}
        </div>
        <div className="flex gap-2 text-text-muted">
          {lastTarget.map((d, i) => (
            <span key={i} className="w-10 text-center text-sm">{d}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4 text-sm text-text-muted">
        <span>Round {round}</span>
        <span>{totalCorrect}/{totalAttempted} correct</span>
      </div>
      <p className="text-text-muted text-sm">
        Enter digits {backward ? 'in reverse order' : 'in order'}
      </p>

      <div className="flex gap-2 min-h-[48px] items-center">
        {userInput.map((d, i) => (
          <span key={i} className="w-10 h-10 bg-bg-card border border-border rounded-lg flex items-center justify-center font-bold">
            {d}
          </span>
        ))}
        {userInput.length < digits.length && (
          <span className="w-10 h-10 border-2 border-dashed border-text-muted/30 rounded-lg" />
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => (
          <button
            key={d}
            onClick={() => addDigit(d)}
            disabled={userInput.length >= digits.length}
            className="w-14 h-14 bg-bg-card border border-border rounded-xl text-xl font-bold active:scale-95 active:bg-primary/20 transition-all disabled:opacity-30"
          >
            {d}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={removeDigit}
          disabled={userInput.length === 0}
          className="px-6 py-3 rounded-xl bg-bg-card border border-border text-text-muted font-semibold disabled:opacity-30"
        >
          Delete
        </button>
        <button
          onClick={submit}
          disabled={userInput.length === 0}
          className="px-8 py-3 rounded-xl bg-primary text-white font-bold active:scale-95 transition-transform disabled:opacity-30"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
