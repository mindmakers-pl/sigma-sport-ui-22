// Six Sigma Scoring Algorithm & Validation
// Based on scientific methodology with weighted indicators and response validation

import { SixSigmaQuestionnaire, SixSigmaQuestion, SixSigmaCompetency } from "@/data/sixSigmaQuestionnaires";

export interface QuestionnaireResponse {
  questionId: string;
  value: number; // 1-5 on Likert scale
  // Optional metadata - enriched by QuestionnaireRunner
  questionText?: string;
  competency?: string;
  domain?: 'thoughts' | 'body' | 'behavior';
  type?: 'direct' | 'reverse';
  isKeyIndicator?: boolean;
  weight?: number;
}

export interface CompetencyScore {
  competencyId: string;
  competencyName: string;
  rawScore: number; // Sum of weighted scores
  maxPossibleScore: number; // Maximum possible with weights
  normalizedScore: number; // 0-100 scale
  questionCount: number;
  averageScore: number; // Mean response value
}

export interface ModifierScore {
  modifierId: string;
  modifierName: string;
  rawValue: number; // 1-5
  normalizedScore: number; // 0-100
  impactArea: string[];
}

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  flags: {
    straightLining: boolean; // All answers identical
    reverseInconsistency: boolean; // Reverse questions don't match pattern
    speedingDetected: boolean; // Too fast completion
  };
}

export interface ScoredQuestionnaire {
  questionnaireId: string;
  questionnaireName: string;
  completedAt: string;
  completionTimeSeconds?: number; // Time taken to complete in seconds
  responses: QuestionnaireResponse[];
  competencyScores: CompetencyScore[];
  modifierScores: ModifierScore[];
  validation: ValidationResult;
  overallScore?: number; // Average of all competency scores
}

/**
 * Reverse-score a question: For a 5-point scale, score = 6 - response
 */
function reverseScore(value: number, scale: number = 5): number {
  return (scale + 1) - value;
}

/**
 * Detect straight-lining: All responses identical or near-identical
 */
function detectStraightLining(responses: QuestionnaireResponse[]): boolean {
  if (responses.length === 0) return false;
  
  const values = responses.map(r => r.value);
  const uniqueValues = new Set(values);
  
  // If 90%+ of responses are the same value, flag as straight-lining
  const mostCommon = Array.from(uniqueValues).map(val => ({
    value: val,
    count: values.filter(v => v === val).length
  })).sort((a, b) => b.count - a.count)[0];
  
  const straightLineThreshold = 0.9;
  return (mostCommon.count / responses.length) >= straightLineThreshold;
}

/**
 * Detect reverse question inconsistency
 * Checks if reverse-scored questions show expected pattern
 */
function detectReverseInconsistency(
  responses: QuestionnaireResponse[],
  questions: SixSigmaQuestion[],
  scale: number = 5
): boolean {
  const directQuestions = questions.filter(q => q.type === 'direct');
  const reverseQuestions = questions.filter(q => q.type === 'reverse');
  
  if (directQuestions.length === 0 || reverseQuestions.length === 0) return false;
  
  // Calculate average for direct and reverse (after reversing)
  const directResponses = responses.filter(r => 
    directQuestions.find(q => q.id === r.questionId)
  );
  const reverseResponses = responses.filter(r => 
    reverseQuestions.find(q => q.id === r.questionId)
  );
  
  if (directResponses.length === 0 || reverseResponses.length === 0) return false;
  
  const directAvg = directResponses.reduce((sum, r) => sum + r.value, 0) / directResponses.length;
  const reverseAvg = reverseResponses.reduce((sum, r) => sum + reverseScore(r.value, scale), 0) / reverseResponses.length;
  
  // If direct and reverse averages differ by more than 2 points on 5-point scale, flag inconsistency
  const inconsistencyThreshold = 2.0;
  return Math.abs(directAvg - reverseAvg) > inconsistencyThreshold;
}

/**
 * Score a single competency with weighted Key Indicators
 */
function scoreCompetency(
  competency: SixSigmaCompetency,
  responses: QuestionnaireResponse[],
  scale: number = 5
): CompetencyScore {
  let rawScore = 0;
  let maxPossibleScore = 0;
  let totalResponses = 0;
  let sumForAverage = 0;
  
  competency.questions.forEach(question => {
    const response = responses.find(r => r.questionId === question.id);
    if (!response) return;
    
    const weight = question.weight || 1.0;
    const value = question.type === 'reverse' 
      ? reverseScore(response.value, scale)
      : response.value;
    
    rawScore += value * weight;
    maxPossibleScore += scale * weight;
    sumForAverage += value;
    totalResponses++;
  });
  
  const normalizedScore = maxPossibleScore > 0 
    ? (rawScore / maxPossibleScore) * 100 
    : 0;
  
  const averageScore = totalResponses > 0 
    ? sumForAverage / totalResponses 
    : 0;
  
  return {
    competencyId: competency.id,
    competencyName: competency.name,
    rawScore,
    maxPossibleScore,
    normalizedScore: Math.round(normalizedScore * 10) / 10, // Round to 1 decimal
    questionCount: totalResponses,
    averageScore: Math.round(averageScore * 10) / 10
  };
}

/**
 * Score modifiers (contextual factors)
 */
function scoreModifiers(
  questionnaire: SixSigmaQuestionnaire,
  responses: QuestionnaireResponse[]
): ModifierScore[] {
  if (!questionnaire.modifiers) return [];
  
  return questionnaire.modifiers.map(modifier => {
    const response = responses.find(r => r.questionId === modifier.id);
    const rawValue = response?.value || 0;
    const normalizedScore = ((rawValue - 1) / (questionnaire.scale - 1)) * 100;
    
    return {
      modifierId: modifier.id,
      modifierName: modifier.name,
      rawValue,
      normalizedScore: Math.round(normalizedScore * 10) / 10,
      impactArea: modifier.impactArea
    };
  });
}

/**
 * Main scoring function
 */
export function scoreQuestionnaire(
  questionnaire: SixSigmaQuestionnaire,
  responses: QuestionnaireResponse[],
  completionTimeSeconds?: number
): ScoredQuestionnaire {
  // Flatten all questions from all competencies
  const allQuestions = questionnaire.competencies.flatMap(c => c.questions);
  
  // Validation
  const straightLining = detectStraightLining(responses);
  const reverseInconsistency = detectReverseInconsistency(responses, allQuestions, questionnaire.scale);
  const speedingDetected = completionTimeSeconds ? completionTimeSeconds < 60 : false; // Less than 1 min suspicious
  
  const warnings: string[] = [];
  if (straightLining) warnings.push('Wykryto identyczne odpowiedzi - wyniki mogą być niewiarygodne');
  if (reverseInconsistency) warnings.push('Niespójność między pytaniami pozytywnymi i negatywnymi');
  if (speedingDetected) warnings.push('Kwestionariusz wypełniony zbyt szybko');
  
  const validation: ValidationResult = {
    isValid: !straightLining && !reverseInconsistency && !speedingDetected,
    warnings,
    flags: {
      straightLining,
      reverseInconsistency,
      speedingDetected
    }
  };
  
  // Score competencies
  const competencyScores = questionnaire.competencies.map(competency =>
    scoreCompetency(competency, responses, questionnaire.scale)
  );
  
  // Score modifiers
  const modifierScores = scoreModifiers(questionnaire, responses);
  
  // Calculate overall score (average of competencies)
  const overallScore = competencyScores.length > 0
    ? Math.round((competencyScores.reduce((sum, c) => sum + c.normalizedScore, 0) / competencyScores.length) * 10) / 10
    : 0;
  
  return {
    questionnaireId: questionnaire.id,
    questionnaireName: questionnaire.name,
    completedAt: new Date().toISOString(),
    completionTimeSeconds,
    responses,
    competencyScores,
    modifierScores,
    validation,
    overallScore
  };
}

/**
 * Helper: Get interpretation based on normalized score (0-100)
 */
export function getScoreInterpretation(normalizedScore: number): string {
  if (normalizedScore >= 80) return 'Wysoki';
  if (normalizedScore >= 60) return 'Powyżej średniej';
  if (normalizedScore >= 40) return 'Średni';
  if (normalizedScore >= 20) return 'Poniżej średniej';
  return 'Niski';
}

/**
 * Helper: Get modifier impact interpretation
 */
export function getModifierImpact(normalizedScore: number): 'positive' | 'neutral' | 'negative' {
  if (normalizedScore >= 60) return 'positive';
  if (normalizedScore >= 40) return 'neutral';
  return 'negative';
}
