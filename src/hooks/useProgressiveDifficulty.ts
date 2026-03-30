import { useState, useCallback } from 'react';
import { clamp } from '../lib/utils';

export function useProgressiveDifficulty(
  baseDifficulty: number,
  progressive: boolean,
) {
  const [level, setLevel] = useState(progressive ? 1 : baseDifficulty);

  const onRoundEnd = useCallback(
    (passed: boolean) => {
      if (!progressive) return;
      setLevel((l) => clamp(passed ? l + 1 : l - 1, 1, 10));
    },
    [progressive],
  );

  return { level, onRoundEnd };
}
