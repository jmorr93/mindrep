import { useState, useEffect, useCallback, useRef } from 'react';
import { normalizeScore } from '../lib/scoring';
import { lerp } from '../lib/utils';
import { getRandomWords } from '../lib/words';
import type { ExerciseProps } from './types';

function getParams(difficulty: number) {
  const t = (difficulty - 1) / 9;
  const wordCount = lerp(5, 15, t);
  const viewTime = lerp(15, 8, t);
  return { wordCount, viewTime };
}

export function WordListRecall({ difficulty, onComplete, timeUp }: ExerciseProps) {
  const { wordCount, viewTime } = getParams(difficulty);
  const [words, setWords] = useState(() => getRandomWords(wordCount));
  const [phase, setPhase] = useState<'study' | 'recall' | 'feedback'>('study');
  const [input, setInput] = useState('');
  const [recalled, setRecalled] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [lastWrong, setLastWrong] = useState(false);
  const [lastWords, setLastWords] = useState<string[]>([]);
  const [lastRecalled, setLastRecalled] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(viewTime);
  const [startTime] = useState(Date.now());
  const completedRef = useRef(false);

  // Study countdown
  useEffect(() => {
    if (phase !== 'study') return;
    if (countdown <= 0) {
      setPhase('recall');
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, countdown]);

  // Finalize when timeUp and not in recall
  useEffect(() => {
    if (timeUp && !completedRef.current && phase !== 'recall') {
      completedRef.current = true;
      const acc = totalAttempted > 0 ? totalCorrect / totalAttempted : 0;
      onComplete({
        exerciseId: 'word-list',
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

  const addWord = useCallback(() => {
    const word = input.trim().toLowerCase();
    if (word && !recalled.includes(word)) {
      setRecalled((r) => [...r, word]);
    }
    setInput('');
  }, [input, recalled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addWord();
      }
    },
    [addWord],
  );

  const submit = useCallback(() => {
    const correct = recalled.filter((w) =>
      words.some((target) => target.toLowerCase() === w),
    ).length;
    const passed = correct / words.length >= 0.5;

    setTotalCorrect((c) => c + correct);
    setTotalAttempted((t) => t + words.length);
    setLastWrong(!passed);
    setLastWords([...words]);
    setLastRecalled([...recalled]);
    setPhase('feedback');

    setTimeout(() => {
      if (timeUp) return;
      setRecalled([]);
      setInput('');
      setCountdown(viewTime);
      if (passed) {
        setWords(getRandomWords(wordCount));
        setRound((r) => r + 1);
      } else {
        // Retry with new words same count
        setWords(getRandomWords(wordCount));
      }
      setPhase('study');
    }, 2000);
  }, [recalled, words, wordCount, viewTime, timeUp]);

  if (phase === 'study') {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-4 text-sm text-text-muted">
          <span>Round {round}</span>
          <span>{totalCorrect}/{totalAttempted} correct</span>
          {lastWrong && <span className="text-warning">Retry!</span>}
        </div>
        <p className="text-text-muted text-sm">
          Memorize these words ({countdown}s)
        </p>
        <div className="flex flex-wrap gap-3 justify-center max-w-sm">
          {words.map((w, i) => (
            <span key={i} className="bg-bg-card border border-border px-4 py-2 rounded-lg font-semibold shadow-sm">
              {w}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'feedback') {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-text-muted">
          {lastWrong ? 'Try again with new words...' : 'Nice! Next round...'}
        </p>
        <div className="flex flex-wrap gap-2 justify-center max-w-sm">
          {lastWords.map((w, i) => {
            const wasRecalled = lastRecalled.some((r) => r === w.toLowerCase());
            return (
              <span
                key={i}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  wasRecalled ? 'bg-accent/20 text-accent' : 'bg-danger/20 text-danger'
                }`}
              >
                {w} {wasRecalled ? '✓' : '✗'}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-4 text-sm text-text-muted">
        <span>Round {round}</span>
        <span>{totalCorrect}/{totalAttempted} correct</span>
      </div>
      <p className="text-text-muted text-sm">
        Type the words you remember ({recalled.length} recalled)
      </p>

      <div className="flex gap-2 w-full max-w-xs">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a word..."
          autoFocus
          className="flex-1 bg-bg-card border border-border rounded-xl px-4 py-3 text-text outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={addWord}
          disabled={!input.trim()}
          className="px-4 py-3 bg-bg-card border border-border rounded-xl font-bold active:scale-95 disabled:opacity-30"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2 max-w-sm justify-center">
        {recalled.map((w, i) => (
          <span key={i} className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-sm">
            {w}
          </span>
        ))}
      </div>

      <button
        onClick={submit}
        className="px-8 py-3 rounded-xl bg-primary text-white font-bold active:scale-95 transition-transform"
      >
        Done
      </button>
    </div>
  );
}
