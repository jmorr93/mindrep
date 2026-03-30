import { useState, useEffect, useCallback } from 'react';
import { Timer } from './Timer';
import { useCountdown } from '../hooks/useCountdown';
import type { ExerciseResult, ExerciseProps } from '../exercises/types';
import type { ComponentType } from 'react';

interface ExerciseShellProps {
  name: string;
  description: string;
  icon: string;
  difficulty: number;
  timeLimit: number;
  progressive: boolean;
  ExerciseComponent: ComponentType<ExerciseProps>;
  onComplete: (result: ExerciseResult) => void;
}

type Phase = 'instruction' | 'active' | 'done';

export function ExerciseShell({
  name,
  description,
  icon,
  difficulty,
  timeLimit,
  progressive,
  ExerciseComponent,
  onComplete,
}: ExerciseShellProps) {
  const [phase, setPhase] = useState<Phase>('instruction');
  const [instructionCount, setInstructionCount] = useState(4);
  const [timeUp, setTimeUp] = useState(false);

  // Instruction countdown
  useEffect(() => {
    if (phase !== 'instruction') return;
    if (instructionCount <= 0) {
      setPhase('active');
      return;
    }
    const id = setTimeout(() => setInstructionCount((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, instructionCount]);

  const handleTimeUp = useCallback(() => {
    setTimeUp(true);
  }, []);

  const timer = useCountdown(timeLimit, handleTimeUp);

  // Start timer when active
  useEffect(() => {
    if (phase === 'active') timer.start();
  }, [phase]);

  const handleComplete = useCallback(
    (result: ExerciseResult) => {
      timer.pause();
      setPhase('done');
      onComplete(result);
    },
    [onComplete, timer],
  );

  if (phase === 'instruction') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <span className="text-6xl">{icon}</span>
        <h2 className="text-2xl font-bold">{name}</h2>
        <p className="text-text-muted text-center max-w-sm">{description}</p>
        <p className="text-text-muted text-sm">
          {progressive ? 'Progressive mode — starts easy, gets harder' : `Level ${difficulty}`}
        </p>
        <div className="text-6xl font-bold text-primary">
          {instructionCount > 0 ? instructionCount : 'Go!'}
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="text-5xl">✓</span>
        <p className="text-xl text-accent font-semibold">Time's up!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-2">
      <Timer fraction={timer.fraction} seconds={timer.seconds} />
      <ExerciseComponent
        difficulty={difficulty}
        onComplete={handleComplete}
        timeLimit={timeLimit}
        timeUp={timeUp}
        progressive={progressive}
      />
    </div>
  );
}
