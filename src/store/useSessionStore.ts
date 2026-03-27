import { create } from 'zustand';
import type { ExerciseId, ExerciseResult } from '../exercises/types';

type SessionPhase = 'idle' | 'instruction' | 'active' | 'transition' | 'complete';

interface SessionState {
  exercises: ExerciseId[];
  currentIndex: number;
  results: ExerciseResult[];
  phase: SessionPhase;
  startedAt: number | null;

  startSession: (exercises: ExerciseId[]) => void;
  setPhase: (phase: SessionPhase) => void;
  addResult: (result: ExerciseResult) => void;
  nextExercise: () => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  exercises: [],
  currentIndex: 0,
  results: [],
  phase: 'idle',
  startedAt: null,

  startSession: (exercises) =>
    set({ exercises, currentIndex: 0, results: [], phase: 'instruction', startedAt: Date.now() }),

  setPhase: (phase) => set({ phase }),

  addResult: (result) =>
    set((s) => ({ results: [...s.results, result] })),

  nextExercise: () => {
    const s = get();
    if (s.currentIndex < s.exercises.length - 1) {
      set({ currentIndex: s.currentIndex + 1, phase: 'instruction' });
    } else {
      set({ phase: 'complete' });
    }
  },

  reset: () =>
    set({ exercises: [], currentIndex: 0, results: [], phase: 'idle', startedAt: null }),
}));
