import type { ComponentType } from 'react';

export type ExerciseId =
  | 'nback'
  | 'digit-span'
  | 'pattern-recall'
  | 'mental-math'
  | 'word-list'
  | 'spatial-sequence';

export interface ExerciseProps {
  difficulty: number;
  onComplete: (result: ExerciseResult) => void;
  timeLimit: number;
  /** When true, exercise should finish its current round and call onComplete */
  timeUp: boolean;
  /** When true, difficulty increases on success and decreases on failure within the exercise */
  progressive: boolean;
}

export interface ExerciseDescriptor {
  id: ExerciseId;
  name: string;
  description: string;
  icon: string;
  component: ComponentType<ExerciseProps>;
  minDifficulty: number;
  maxDifficulty: number;
}

export interface ExerciseResult {
  exerciseId: ExerciseId;
  difficulty: number;
  correct: number;
  total: number;
  accuracy: number;
  score: number;
  durationMs: number;
  rounds: number;
}

export interface DailyRecord {
  date: string;
  exerciseResults: ExerciseResult[];
  totalScore: number;
}

export interface ExerciseDifficulty {
  exerciseId: ExerciseId;
  currentLevel: number;
}

export type Tier = 'easy' | 'medium' | 'hard' | 'progressive';

export const TIER_RANGES: Record<Tier, { min: number; max: number; label: string }> = {
  easy: { min: 1, max: 3, label: 'Easy' },
  medium: { min: 4, max: 7, label: 'Medium' },
  hard: { min: 8, max: 10, label: 'Hard' },
  progressive: { min: 1, max: 10, label: 'Progressive' },
};
