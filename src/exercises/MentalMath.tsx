import { useState, useCallback, useEffect, useRef } from 'react';
import { normalizeScore } from '../lib/scoring';
import { randomInt, lerp } from '../lib/utils';
import type { ExerciseProps } from './types';

type Op = '+' | '−';

interface Problem {
  display: string;
  answer: number;
}

function generateChain(difficulty: number): Problem[] {
  const t = (difficulty - 1) / 9;
  const chainLength = lerp(3, 8, t);
  const maxNum = lerp(9, 30, t);
  const problems: Problem[] = [];

  let running = randomInt(2, maxNum);
  problems.push({ display: `Start: ${running}`, answer: running });

  for (let i = 1; i < chainLength; i++) {
    const ops: Op[] = ['+', '−'];
    const op = ops[randomInt(0, difficulty >= 4 ? 1 : 0)];
    const num = randomInt(1, Math.min(maxNum, op === '−' ? Math.max(1, running - 1) : maxNum));
    const answer = op === '+' ? running + num : running - num;
    problems.push({ display: `${op} ${num}`, answer });
    running = answer;
  }

  return problems;
}

export function MentalMath({ difficulty, onComplete, timeUp }: ExerciseProps) {
  const [chain, setChain] = useState(() => generateChain(difficulty));
  const [step, setStep] = useState(1);
  const [userAnswer, setUserAnswer] = useState('');
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [round, setRound] = useState(1);
  const [lastWrong, setLastWrong] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [startTime] = useState(Date.now());
  const completedRef = useRef(false);

  // Finalize when timeUp and not mid-feedback
  useEffect(() => {
    if (timeUp && !completedRef.current && feedback === null) {
      completedRef.current = true;
      const acc = totalAttempted > 0 ? totalCorrect / totalAttempted : 0;
      onComplete({
        exerciseId: 'mental-math',
        difficulty,
        correct: totalCorrect,
        total: totalAttempted,
        accuracy: acc,
        score: normalizeScore(totalCorrect, totalAttempted, difficulty),
        durationMs: Date.now() - startTime,
        rounds: round,
      });
    }
  }, [timeUp, feedback, totalCorrect, totalAttempted, round, difficulty, onComplete, startTime]);

  const submit = useCallback(() => {
    const num = parseInt(userAnswer, 10);
    const isCorrect = num === chain[step].answer;

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setTotalCorrect((c) => c + (isCorrect ? 1 : 0));
    setTotalAttempted((t) => t + 1);

    setTimeout(() => {
      setFeedback(null);
      setUserAnswer('');

      if (timeUp) return;

      if (step + 1 >= chain.length) {
        // Chain complete — start new chain
        if (isCorrect) {
          setChain(generateChain(difficulty));
          setStep(1);
          setRound((r) => r + 1);
          setLastWrong(false);
        } else {
          // Failed this chain, retry with new chain same difficulty
          setChain(generateChain(difficulty));
          setStep(1);
          setLastWrong(true);
        }
      } else {
        if (isCorrect) {
          setStep((s) => s + 1);
          setLastWrong(false);
        } else {
          // Wrong answer mid-chain — restart chain with new numbers
          setChain(generateChain(difficulty));
          setStep(1);
          setLastWrong(true);
        }
      }
    }, 800);
  }, [userAnswer, chain, step, difficulty, timeUp]);

  const handleKey = useCallback((d: string) => {
    if (d === 'del') {
      setUserAnswer((s) => s.slice(0, -1));
    } else if (d === '-') {
      setUserAnswer((s) => (s.startsWith('-') ? s.slice(1) : '-' + s));
    } else {
      setUserAnswer((s) => s + d);
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-4 text-sm text-text-muted">
        <span>Round {round}</span>
        <span>{totalCorrect}/{totalAttempted} correct</span>
        {lastWrong && <span className="text-warning">Retry!</span>}
      </div>

      <p className="text-text-muted text-sm">
        Keep a running total — what's the result?
      </p>

      <div className="bg-bg-card border border-border rounded-xl p-6 min-w-[200px] text-center shadow-sm">
        <p className="text-text-muted text-sm mb-1">{chain[0].display}</p>
        {chain.slice(1, step + 1).map((p, i) => (
          <p key={i} className="text-2xl font-bold">{p.display}</p>
        ))}
      </div>

      <p className="text-text-muted text-sm">= ?</p>

      <div
        className={`text-4xl font-bold min-h-[56px] px-4 py-2 rounded-xl min-w-[120px] text-center transition-colors ${
          feedback === 'correct'
            ? 'bg-accent/20 text-accent'
            : feedback === 'wrong'
              ? 'bg-danger/20 text-danger'
              : 'bg-bg-card border border-border'
        }`}
      >
        {feedback === 'correct' ? '✓' : feedback === 'wrong' ? `${chain[step].answer}` : userAnswer || '–'}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {['1', '2', '3', '-', '4', '5', '6', 'del', '7', '8', '9', '0'].map((d) => (
          <button
            key={d}
            onClick={() => handleKey(d)}
            disabled={feedback !== null}
            className="w-14 h-14 bg-bg-card border border-border rounded-xl text-lg font-bold active:scale-95 transition-all disabled:opacity-30"
          >
            {d === 'del' ? '⌫' : d === '-' ? '±' : d}
          </button>
        ))}
      </div>

      <button
        onClick={submit}
        disabled={userAnswer === '' || feedback !== null}
        className="px-8 py-3 rounded-xl bg-primary text-white font-bold active:scale-95 transition-transform disabled:opacity-30"
      >
        Submit
      </button>
    </div>
  );
}
