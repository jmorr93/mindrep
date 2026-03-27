import { useNavigate } from 'react-router';
import { useSessionStore } from '../store/useSessionStore';
import { useProgressStore } from '../store/useProgressStore';
import { getExercise } from '../exercises/registry';
import { ScoreCard } from '../components/ScoreCard';

export function Summary() {
  const navigate = useNavigate();
  const { results, reset } = useSessionStore();
  const { personalBests, streak } = useProgressStore();

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 pt-20 px-4">
        <p className="text-text-muted">No session data</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl bg-primary text-white font-bold"
        >
          Go Home
        </button>
      </div>
    );
  }

  const totalScore = Math.round(
    results.reduce((sum, r) => sum + r.score, 0) / results.length,
  );

  const handleDone = () => {
    reset();
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center gap-6 px-4 pt-8">
      <h2 className="text-2xl font-bold">Session Complete!</h2>

      <div className="bg-bg-card border border-border rounded-2xl p-6 text-center shadow-sm">
        <p className="text-text-muted text-sm">Overall Score</p>
        <p className="text-5xl font-bold text-primary mt-1">{totalScore}</p>
        {streak > 0 && (
          <p className="text-accent text-sm mt-2">🔥 {streak} day streak</p>
        )}
      </div>

      <div className="w-full max-w-sm space-y-3">
        {results.map((r) => {
          const ex = getExercise(r.exerciseId);
          return ex ? (
            <ScoreCard
              key={r.exerciseId}
              result={r}
              name={ex.name}
              icon={ex.icon}
              personalBest={personalBests[r.exerciseId] ?? 0}
            />
          ) : null;
        })}
      </div>

      <button
        onClick={handleDone}
        className="w-full max-w-sm py-4 rounded-2xl bg-primary text-white font-bold text-lg active:scale-[0.98] transition-transform"
      >
        Done
      </button>
    </div>
  );
}
