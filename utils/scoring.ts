

export type PromptScoreResult = {
  clarity: number;
  specificity: number;
  safety: number;
  overall: number;
};


function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function calculateOverallScore(
  clarity: number,
  specificity: number,
  safety: number,
  weights: { clarity: number; specificity: number; safety: number }
): number {
  const weightedSum = clarity * weights.clarity + specificity * weights.specificity + safety * weights.safety;
  const totalWeight = weights.clarity + weights.specificity + weights.safety;
  const avg = totalWeight > 0 ? weightedSum / totalWeight : 0;
  return clamp(Math.round(avg));
}

export function scorePromptEvaluation(
  clarity: number,
  specificity: number,
  safety: number,
  weights: { clarity: number; specificity: number; safety: number }
): PromptScoreResult {
  const overall = calculateOverallScore(clarity, specificity, safety, weights);

  return {
    clarity: clamp(clarity),
    specificity: clamp(specificity),
    safety: clamp(safety),
    overall,
  };
}


export function generateMockScores(weights: { clarity: number; specificity: number; safety: number }): PromptScoreResult {
  const clarity = Math.floor(Math.random() * 41) + 60; // 60–100
  const specificity = Math.floor(Math.random() * 41) + 60;
  const safety = Math.floor(Math.random() * 41) + 60;

  return scorePromptEvaluation(clarity, specificity, safety, weights);
}
