import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useSessionStore } from '../store/useSessionStore';
import { useProgressStore } from '../store/useProgressStore';
import { getExercise } from '../exercises/registry';
import { ExerciseShell } from '../components/ExerciseShell';
import type { ExerciseResult } from '../exercises/types';

const EXERCISE_TIME = 120;
const TRANSITION_DELAY = 2000;

export function Session() {
  const navigate = useNavigate();
  const { exercises, currentIndex, results, phase, addResult, nextExercise, reset } =
    useSessionStore();
  const { saveSession, getDifficulty } = useProgressStore();

  // Redirect if no session started
  useEffect(() => {
    if (exercises.length === 0) navigate('/', { replace: true });
  }, [exercises, navigate]);

  // Handle session complete
  useEffect(() => {
    if (phase === 'complete' && results.length > 0) {
      saveSession(results);
      navigate('/summary', { replace: true });
    }
  }, [phase, results, saveSession, navigate]);

  const handleExerciseComplete = useCallback(
    (result: ExerciseResult) => {
      addResult(result);
      setTimeout(() => nextExercise(), TRANSITION_DELAY);
    },
    [addResult, nextExercise],
  );

  if (exercises.length === 0) return null;

  const currentExerciseId = exercises[currentIndex];
  const descriptor = getExercise(currentExerciseId);
  if (!descriptor) return null;

  const difficulty = getDifficulty(currentExerciseId);

  return (
    <div className="pt-4">
      <div className="flex items-center justify-between px-4 mb-4">
        <p className="text-text-muted text-sm">
          Exercise {currentIndex + 1} / {exercises.length}
        </p>
        <button
          onClick={() => {
            reset();
            navigate('/', { replace: true });
          }}
          className="text-text-muted text-sm underline"
        >
          Quit
        </button>
      </div>

      <ExerciseShell
        key={`${currentExerciseId}-${currentIndex}`}
        name={descriptor.name}
        description={descriptor.description}
        icon={descriptor.icon}
        difficulty={difficulty}
        timeLimit={EXERCISE_TIME}
        ExerciseComponent={descriptor.component}
        onComplete={handleExerciseComplete}
      />
    </div>
  );
}
