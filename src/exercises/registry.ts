import type { ExerciseDescriptor } from './types';
import { NBack } from './NBack';
import { DigitSpan } from './DigitSpan';
import { PatternRecall } from './PatternRecall';
import { MentalMath } from './MentalMath';
import { WordListRecall } from './WordListRecall';
import { SpatialSequence } from './SpatialSequence';

export const exercises: ExerciseDescriptor[] = [
  {
    id: 'nback',
    name: 'N-Back',
    description: 'Press Match when the current letter matches the one from N steps ago',
    icon: '🔄',
    component: NBack,
    minDifficulty: 1,
    maxDifficulty: 10,
  },
  {
    id: 'digit-span',
    name: 'Digit Span',
    description: 'Remember and recall the sequence of digits shown to you',
    icon: '🔢',
    component: DigitSpan,
    minDifficulty: 1,
    maxDifficulty: 10,
  },
  {
    id: 'pattern-recall',
    name: 'Pattern Recall',
    description: 'Memorize the highlighted cells and recreate the pattern',
    icon: '🔲',
    component: PatternRecall,
    minDifficulty: 1,
    maxDifficulty: 10,
  },
  {
    id: 'mental-math',
    name: 'Mental Math',
    description: 'Keep a running total as operations are applied one by one',
    icon: '🧮',
    component: MentalMath,
    minDifficulty: 1,
    maxDifficulty: 10,
  },
  {
    id: 'word-list',
    name: 'Word Recall',
    description: 'Study a list of words, then recall as many as you can',
    icon: '📝',
    component: WordListRecall,
    minDifficulty: 1,
    maxDifficulty: 10,
  },
  {
    id: 'spatial-sequence',
    name: 'Spatial Sequence',
    description: 'Watch the sequence of squares lighting up, then replay it',
    icon: '📍',
    component: SpatialSequence,
    minDifficulty: 1,
    maxDifficulty: 10,
  },
];

export function getExercise(id: string): ExerciseDescriptor | undefined {
  return exercises.find((e) => e.id === id);
}
