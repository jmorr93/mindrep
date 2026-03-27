import { useProgressStore } from '../store/useProgressStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { exercises } from '../exercises/registry';
import { TIER_RANGES } from '../exercises/types';

export function Stats() {
  const { history, personalBests, streak, difficulties, tier } = useProgressStore();

  const chartData = history.slice(-30).map((h) => ({
    date: h.date.slice(5),
    score: h.totalScore,
  }));

  return (
    <div className="flex flex-col gap-6 px-4 pt-8">
      <h2 className="text-2xl font-bold">Your Progress</h2>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-bg-card border border-border rounded-xl p-4 text-center shadow-sm">
          <p className="text-text-muted text-sm">Sessions</p>
          <p className="text-3xl font-bold">{history.length}</p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-4 text-center shadow-sm">
          <p className="text-text-muted text-sm">Streak</p>
          <p className="text-3xl font-bold">🔥 {streak}</p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-4 text-center shadow-sm">
          <p className="text-text-muted text-sm">Tier</p>
          <p className="text-3xl font-bold capitalize">{TIER_RANGES[tier].label}</p>
        </div>
      </div>

      {chartData.length > 1 && (
        <div className="bg-bg-card border border-border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-text-muted mb-3">Score History</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }}
                labelStyle={{ color: '#0f172a' }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#C10000"
                strokeWidth={2}
                dot={{ fill: '#C10000', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-sm text-text-muted">Personal Bests & Levels</p>
        {exercises.map((ex) => {
          const best = personalBests[ex.id] ?? 0;
          const level = difficulties.find((d) => d.exerciseId === ex.id)?.currentLevel ?? 1;
          return (
            <div
              key={ex.id}
              className="flex items-center gap-3 bg-bg-card border border-border rounded-xl px-4 py-3 shadow-sm"
            >
              <span className="text-2xl">{ex.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">{ex.name}</p>
                <p className="text-text-muted text-xs">Level {level}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{best}</p>
                <p className="text-text-muted text-xs">best</p>
              </div>
            </div>
          );
        })}
      </div>

      {history.length === 0 && (
        <p className="text-text-muted text-center py-8">
          Complete your first session to see stats!
        </p>
      )}
    </div>
  );
}
