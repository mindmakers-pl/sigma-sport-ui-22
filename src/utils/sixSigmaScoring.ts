// Six Sigma Scoring Algorithm

export interface QuestionnaireResponse {
  questionId: string;
  value: number; // 1-5 or 1-7
  competence: string;
  reversed: boolean;
  keyIndicator?: boolean;
}

export interface CompetenceScore {
  competence: string;
  rawScore: number;
  normalizedScore: number; // 0-100
  percentile?: number;
}

export interface HexagonData {
  competence: string;
  score: number; // 0-100
}

export interface MoodModifiers {
  sen: number;
  stres: number;
  zdrowie: number;
  atmosfera: number;
  dieta: number;
  flow: number;
}

export interface SixSigmaResults {
  hexagon: HexagonData[];
  competenceScores: CompetenceScore[];
  moodModifiers?: MoodModifiers;
  overallScore: number;
  warnings: string[];
  straightLiningDetected: boolean;
}

/**
 * Score reversal for reversed questions
 * Formula: Wynik = 6 - Odpowiedź (for 5-point scale)
 * or: Wynik = 8 - Odpowiedź (for 7-point scale)
 */
export function applyReversalScore(value: number, scaleType: 5 | 7): number {
  if (scaleType === 5) {
    return 6 - value;
  } else {
    return 8 - value;
  }
}

/**
 * Calculate normalized score per competence
 * Key Indicators have weight x1.5
 */
export function calculateCompetenceScore(
  responses: QuestionnaireResponse[],
  competenceName: string,
  scaleType: 5 | 7
): CompetenceScore {
  const competenceResponses = responses.filter(r => r.competence === competenceName);
  
  let weightedSum = 0;
  let totalWeight = 0;

  competenceResponses.forEach(response => {
    let score = response.value;
    
    // Apply reversal if needed
    if (response.reversed) {
      score = applyReversalScore(score, scaleType);
    }

    // Apply Key Indicator weight
    const weight = response.keyIndicator ? 1.5 : 1.0;
    weightedSum += score * weight;
    totalWeight += weight;
  });

  const rawScore = weightedSum / totalWeight;
  
  // Normalize to 0-100 scale
  const maxScore = scaleType;
  const normalizedScore = ((rawScore - 1) / (maxScore - 1)) * 100;

  return {
    competence: competenceName,
    rawScore,
    normalizedScore: Math.round(normalizedScore)
  };
}

/**
 * Detect straight-lining (zawodnik klikał wszędzie to samo)
 */
export function detectStraightLining(responses: QuestionnaireResponse[]): boolean {
  const values = responses.map(r => r.value);
  const uniqueValues = new Set(values);
  
  // If all responses are the same value, it's straight-lining
  if (uniqueValues.size === 1) {
    return true;
  }
  
  // If >80% responses are the same value, suspicious
  const mostCommonValue = [...uniqueValues].reduce((a, b) => 
    values.filter(v => v === a).length >= values.filter(v => v === b).length ? a : b
  );
  const frequency = values.filter(v => v === mostCommonValue).length / values.length;
  
  return frequency > 0.8;
}

/**
 * Calculate mood modifiers from Six Sigma Mood
 */
export function calculateMoodModifiers(moodResponses: QuestionnaireResponse[]): MoodModifiers {
  const getMoodScore = (comp: string) => {
    const response = moodResponses.find(r => r.competence === comp);
    return response ? response.value : 3; // Default neutral
  };

  return {
    sen: getMoodScore('Sen'),
    stres: getMoodScore('Stres'),
    zdrowie: getMoodScore('Zdrowie'),
    atmosfera: getMoodScore('Atmosfera'),
    dieta: getMoodScore('Dieta'),
    flow: getMoodScore('Flow')
  };
}

/**
 * Main scoring function
 */
export function scoreSixSigma(
  responses: QuestionnaireResponse[],
  moodResponses: QuestionnaireResponse[] | undefined,
  scaleType: 5 | 7
): SixSigmaResults {
  const competences = ['Aktywacja', 'Kontrola', 'Reset', 'Fokus', 'Pewność', 'Determinacja'];
  
  const straightLining = detectStraightLining(responses);
  const warnings: string[] = [];

  if (straightLining) {
    warnings.push('Wykryto możliwe bezmyślne klikanie. Wyniki mogą być niewiarygodne.');
  }

  // Calculate scores per competence
  const competenceScores = competences.map(comp => 
    calculateCompetenceScore(responses, comp, scaleType)
  );

  // Prepare hexagon data
  const hexagon: HexagonData[] = competenceScores.map(cs => ({
    competence: cs.competence,
    score: cs.normalizedScore
  }));

  // Overall score (average of all competences)
  const overallScore = Math.round(
    competenceScores.reduce((sum, cs) => sum + cs.normalizedScore, 0) / competenceScores.length
  );

  // Mood modifiers (if provided)
  const moodModifiers = moodResponses ? calculateMoodModifiers(moodResponses) : undefined;

  // Add warnings based on mood
  if (moodModifiers) {
    if (moodModifiers.sen < 3) {
      warnings.push('Niski wynik w regeneracji może wpływać na Aktywację.');
    }
    if (moodModifiers.stres < 3) {
      warnings.push('Wysoki stres pozasportowy może obniżać Fokus.');
    }
    if (moodModifiers.zdrowie < 3) {
      warnings.push('Problemy zdrowotne mogą wpływać na Kontrolę Emocji i Pewność.');
    }
    if (moodModifiers.atmosfera < 3) {
      warnings.push('Problemy w drużynie mogą obniżać Pewność Siebie.');
    }
    if (moodModifiers.flow < 3) {
      warnings.push('Niski poziom satysfakcji ze sportu może wskazywać na wypalenie.');
    }
  }

  return {
    hexagon,
    competenceScores,
    moodModifiers,
    overallScore,
    warnings,
    straightLiningDetected: straightLining
  };
}
