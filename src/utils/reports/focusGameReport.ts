/**
 * Focus Game Report Generation
 * Pure functions for calculating Focus game metrics and generating coach reports
 * Extracted from FocusGame.tsx for reusability and testability
 */

import { FocusTrialResult, FocusCoachReport } from '@/types/gameResults';
import { calculateMedian, calculateIQR, calculateBestStreak } from '@/utils/gameResults';

// Data filtering thresholds
const MIN_RT = 150; // Minimum valid reaction time (falstart threshold)
const MAX_RT = 1500; // Maximum valid reaction time (zawiechy threshold)

/**
 * Filter trials by RT thresholds (150-1500ms)
 * Returns only trials within valid range
 */
export function filterTrials(trials: FocusTrialResult[]): FocusTrialResult[] {
  return trials.filter(t => t.reactionTime >= MIN_RT && t.reactionTime <= MAX_RT);
}

/**
 * Calculate IES (Inverse Efficiency Score)
 * IES = medianRT / (1 - errorRate)
 * Lower is better (faster and more accurate)
 */
export function calculateIES(medianRT: number, errorRate: number): number {
  // Safety: if error rate is 100%, cap at 99% to avoid division by zero
  const safeErrorRate = errorRate >= 1 ? 0.99 : errorRate;
  return medianRT / (1 - safeErrorRate);
}

/**
 * Generate comprehensive coach report with all metrics
 */
export function generateCoachReport(rawTrials: FocusTrialResult[]): FocusCoachReport {
  // Step 1: Filter data (150-1500ms)
  const validTrials = filterTrials(rawTrials);
  
  // Step 2: Separate by trial type
  const congruentTrials = validTrials.filter(t => t.type === 'CONGRUENT');
  const incongruentTrials = validTrials.filter(t => t.type === 'INCONGRUENT');
  
  const congruentCorrect = congruentTrials.filter(t => t.isCorrect);
  const incongruentCorrect = incongruentTrials.filter(t => t.isCorrect);
  
  // Step 3: Calculate RT arrays for correct trials only
  const congruentRTs = congruentCorrect.map(t => t.reactionTime);
  const incongruentRTs = incongruentCorrect.map(t => t.reactionTime);
  const allCorrectRTs = [...congruentRTs, ...incongruentRTs];
  
  // Step 4: Calculate medians
  const medianCongruent = calculateMedian(congruentRTs);
  const medianIncongruent = calculateMedian(incongruentRTs);
  const overallMedian = calculateMedian(allCorrectRTs);
  
  // Step 5: Calculate error rates (as fraction 0.0 - 1.0)
  const congruentErrorRate = congruentTrials.length > 0 
    ? (congruentTrials.length - congruentCorrect.length) / congruentTrials.length 
    : 0;
  const incongruentErrorRate = incongruentTrials.length > 0 
    ? (incongruentTrials.length - incongruentCorrect.length) / incongruentTrials.length 
    : 0;
  
  // Step 6: Calculate IES scores
  const iesCongruent = calculateIES(medianCongruent, congruentErrorRate);
  const iesIncongruent = calculateIES(medianIncongruent, incongruentErrorRate);
  
  // Step 7: Calculate IQR (variability)
  const congruentIQR = calculateIQR(congruentRTs);
  const incongruentIQR = calculateIQR(incongruentRTs);
  
  // Step 8: Calculate player metrics
  const totalCorrect = validTrials.filter(t => t.isCorrect).length;
  const accuracy = validTrials.length > 0 ? (totalCorrect / validTrials.length) * 100 : 0;
  const bestStreak = calculateBestStreak(validTrials);
  
  // Step 9: Calculate interference costs
  const interferenceCostRaw = medianIncongruent - medianCongruent;
  const interferenceCostIES = iesIncongruent - iesCongruent;
  
  return {
    sessionInfo: {
      totalTrials: rawTrials.length,
      validTrials: validTrials.length,
      filteredOut: rawTrials.length - validTrials.length,
      timestamp: new Date().toISOString()
    },
    playerMetrics: {
      accuracy: Math.round(accuracy * 10) / 10, // One decimal
      medianRT: Math.round(overallMedian),
      bestStreak: bestStreak
    },
    coachMetrics: {
      congruent: {
        medianRT: Math.round(medianCongruent),
        errorRate: Math.round(congruentErrorRate * 1000) / 1000, // 3 decimals
        ies: Math.round(iesCongruent),
        validTrials: congruentTrials.length
      },
      incongruent: {
        medianRT: Math.round(medianIncongruent),
        errorRate: Math.round(incongruentErrorRate * 1000) / 1000,
        ies: Math.round(iesIncongruent),
        validTrials: incongruentTrials.length
      },
      variability: {
        congruentIQR: Math.round(congruentIQR),
        incongruentIQR: Math.round(incongruentIQR)
      },
      interferenceCost: {
        rawMs: Math.round(interferenceCostRaw),
        iesDiff: Math.round(interferenceCostIES)
      }
    },
    rawTrials: rawTrials // Keep raw data for detailed analysis
  };
}

/**
 * Export results to JSON format
 */
export function exportToJSON(report: FocusCoachReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Export results to CSV format (trials only)
 */
export function exportToCSV(trials: FocusTrialResult[]): string {
  const headers = ['trialId', 'type', 'stimulusWord', 'stimulusColor', 'userAction', 'isCorrect', 'reactionTime', 'timestamp'];
  const rows = trials.map(trial => [
    trial.trialId,
    trial.type,
    trial.stimulusWord,
    trial.stimulusColor,
    trial.userAction,
    trial.isCorrect,
    trial.reactionTime,
    trial.timestamp
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}
