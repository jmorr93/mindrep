import type { ExerciseResult, ExerciseDifficulty, Tier } from '../exercises/types';
import { TIER_RANGES } from '../exercises/types';
import { clamp } from './utils';

export function adjustDifficulty(
  current: ExerciseDifficulty,
  result: ExerciseResult,
  tier: Tier,
): ExerciseDifficulty {
  const { accuracy, score } = result;
  const range = TIER_RANGES[tier];

  let nextLevel = current.currentLevel;

  if (accuracy >= 0.85 && score >= 80) {
    nextLevel += 1;
  } else if (accuracy <= 0.5 || score <= 30) {
    nextLevel -= 1;
  }

  return {
    exerciseId: current.exerciseId,
    currentLevel: clamp(nextLevel, range.min, range.max),
  };
}
