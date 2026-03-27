import { useNavigate } from 'react-router';
import { useProgressStore } from '../store/useProgressStore';
import { useSessionStore } from '../store/useSessionStore';
import { buildSession } from '../lib/sessionBuilder';
import { getExercise } from '../exercises/registry';
import { StreakBadge } from '../components/StreakBadge';
import type { Tier } from '../exercises/types';
import { TIER_RANGES } from '../exercises/types';

const TIERS: { value: Tier; color: string; desc: string }[] = [
  { value: 'easy', color: 'bg-primary-light', desc: 'Gentle start' },
  { value: 'medium', color: 'bg-primary', desc: 'Real challenge' },
  { value: 'hard', color: 'bg-[#8B0000]', desc: 'Push your limits' },
];

export function Home() {
  const navigate = useNavigate();
  const { streak, history, lastSessionDate, tier, setTier } = useProgressStore();
  const { startSession } = useSessionStore();
  const getDifficulty = useProgressStore((s) => s.getDifficulty);

  const todaysExercises = buildSession(history.length);
  const today = new Date().toISOString().slice(0, 10);
  const completedToday = lastSessionDate === today;

  const handleStart = () => {
    startSession(todaysExercises);
    navigate('/session');
  };

  return (
    <div className="flex flex-col items-center gap-8 px-4 pt-12">
      <h1 className="text-4xl font-bold tracking-tight">MindRep</h1>
      <p className="text-text-muted text-center max-w-xs">
        Your 10-minute daily brain workout
      </p>

      <StreakBadge streak={streak} />

      {/* Tier Selector */}
      <div className="w-full max-w-xs">
        <p className="text-sm text-text-muted mb-2">Difficulty level:</p>
        <div className="grid grid-cols-3 gap-2">
          {TIERS.map((t) => {
            const isActive = tier === t.value;
            const range = TIER_RANGES[t.value];
            return (
              <button
                key={t.value}
                onClick={() => setTier(t.value)}
                className={`rounded-xl py-3 px-2 text-center transition-all ${
                  isActive
                    ? `${t.color} text-white font-bold scale-[1.02]`
                    : 'bg-bg-card border border-border text-text-muted hover:bg-bg-card-hover'
                }`}
              >
                <p className="text-sm font-semibold">{range.label}</p>
                <p className={`text-xs mt-0.5 ${isActive ? 'text-white/70' : 'text-text-muted'}`}>
                  {t.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <p className="text-sm text-text-muted">Today's exercises:</p>
        {todaysExercises.map((id) => {
          const ex = getExercise(id);
          if (!ex) return null;
          const level = getDifficulty(id);
          return (
            <div
              key={id}
              className="flex items-center gap-3 bg-bg-card border border-border rounded-xl px-4 py-3 shadow-sm"
            >
              <span className="text-2xl">{ex.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">{ex.name}</p>
              </div>
              <span className="text-text-muted text-xs">Lv {level}</span>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleStart}
        className="w-full max-w-xs py-4 rounded-2xl bg-primary text-white font-bold text-lg active:scale-[0.98] transition-transform shadow-md hover:bg-primary-light"
      >
        {completedToday ? 'Train Again' : 'Start Training'}
      </button>

      {history.length > 0 && (
        <p className="text-text-muted text-sm">
          {history.length} session{history.length !== 1 ? 's' : ''} completed
        </p>
      )}
    </div>
  );
}
