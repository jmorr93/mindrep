export function normalizeScore(
  correct: number,
  total: number,
  difficulty: number,
): number {
  if (total === 0) return 0;
  const accuracy = correct / total;
  const difficultyMultiplier = 0.5 + (difficulty / 10) * 0.5;
  return Math.round(accuracy * difficultyMultiplier * 100);
}
