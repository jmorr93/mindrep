import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyRecord, ExerciseDifficulty, ExerciseId, ExerciseResult, Tier } from '../exercises/types';
import { TIER_RANGES } from '../exercises/types';
import { adjustDifficulty } from '../lib/difficulty';
import { todayString } from '../lib/utils';

const ALL_EXERCISE_IDS: ExerciseId[] = [
  'nback', 'digit-span', 'pattern-recall',
  'mental-math', 'word-list', 'spatial-sequence',
];

interface ProgressState {
  history: DailyRecord[];
  difficulties: ExerciseDifficulty[];
  streak: number;
  lastSessionDate: string | null;
  personalBests: Record<string, number>;
  tier: Tier;

  saveSession: (results: ExerciseResult[]) => void;
  getDifficulty: (id: ExerciseId) => number;
  setTier: (tier: Tier) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      history: [],
      difficulties: ALL_EXERCISE_IDS.map((id) => ({ exerciseId: id, currentLevel: 1 })),
      streak: 0,
      lastSessionDate: null,
      personalBests: {},
      tier: 'easy',

      getDifficulty: (id: ExerciseId) => {
        const state = get();
        const d = state.difficulties.find((d) => d.exerciseId === id);
        const level = d?.currentLevel ?? TIER_RANGES[state.tier].min;
        const range = TIER_RANGES[state.tier];
        return Math.max(range.min, Math.min(range.max, level));
      },

      setTier: (tier: Tier) => {
        const range = TIER_RANGES[tier];
        set({
          tier,
          difficulties: ALL_EXERCISE_IDS.map((id) => ({
            exerciseId: id,
            currentLevel: range.min,
          })),
        });
      },

      saveSession: (results: ExerciseResult[]) => {
        const today = todayString();
        const state = get();

        let newStreak = state.streak;
        if (state.lastSessionDate === today) {
          // Already saved today, don't double count
        } else {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().slice(0, 10);
          newStreak = state.lastSessionDate === yesterdayStr ? state.streak + 1 : 1;
        }

        const newDifficulties = state.difficulties.map((d) => {
          const result = results.find((r) => r.exerciseId === d.exerciseId);
          return result ? adjustDifficulty(d, result, state.tier) : d;
        });

        const newBests = { ...state.personalBests };
        for (const r of results) {
          const current = newBests[r.exerciseId] ?? 0;
          if (r.score > current) newBests[r.exerciseId] = r.score;
        }

        const totalScore = Math.round(
          results.reduce((sum, r) => sum + r.score, 0) / results.length,
        );

        const record: DailyRecord = { date: today, exerciseResults: results, totalScore };

        const existingIndex = state.history.findIndex((h) => h.date === today);
        const newHistory = [...state.history];
        if (existingIndex >= 0) {
          newHistory[existingIndex] = record;
        } else {
          newHistory.push(record);
        }

        set({
          history: newHistory,
          difficulties: newDifficulties,
          streak: newStreak,
          lastSessionDate: today,
          personalBests: newBests,
        });
      },
    }),
    { name: 'mindrep-progress' },
  ),
);
