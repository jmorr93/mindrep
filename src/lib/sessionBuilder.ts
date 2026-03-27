import type { ExerciseId } from '../exercises/types';
import { shuffle, dateSeed, todayString } from './utils';

const ALL_EXERCISES: ExerciseId[] = [
  'nback',
  'digit-span',
  'pattern-recall',
  'mental-math',
  'word-list',
  'spatial-sequence',
];

export function buildSession(completedSessions: number): ExerciseId[] {
  const excludedIndex = completedSessions % ALL_EXERCISES.length;
  const selected = ALL_EXERCISES.filter((_, i) => i !== excludedIndex);
  return shuffle(selected, dateSeed(todayString()));
}
