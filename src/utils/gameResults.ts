/**
 * Shared utility functions for game result calculations
 * These functions are used across multiple game components to ensure consistency
 */

import { FocusTrialResult } from '@/types/gameResults';

// ============= Statistical Calculations =============

/**
 * Calculate median from array of numbers
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
}

/**
 * Calculate mean (average) from array of numbers
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate standard deviation
 */
export function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = calculateMean(values);
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = calculateMean(squaredDiffs);
  return Math.sqrt(variance);
}

/**
 * Calculate IQR (Interquartile Range) - measure of variability
 */
export function calculateIQR(values: number[]): number {
  if (values.length < 4) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  return sorted[q3Index] - sorted[q1Index];
}

/**
 * Calculate percentile value
 */
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

// ============= Reaction Time Filtering =============

/**
 * Filter reaction times by min/max thresholds
 * Removes outliers (too fast = false starts, too slow = lapses)
 */
export function filterReactionTimes<T extends { reactionTime: number }>(
  trials: T[],
  minRT: number = 150,
  maxRT: number = 1500
): T[] {
  return trials.filter(trial => 
    trial.reactionTime >= minRT && trial.reactionTime <= maxRT
  );
}

/**
 * Filter Focus game trials by RT thresholds (150-1500ms)
 */
export function filterFocusTrials(trials: FocusTrialResult[]): FocusTrialResult[] {
  return filterReactionTimes(trials, 150, 1500);
}

// ============= Accuracy Calculations =============

/**
 * Calculate accuracy percentage
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * Calculate accuracy with one decimal place
 */
export function calculateAccuracyPrecise(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 1000) / 10; // One decimal
}

// ============= Performance Streaks =============

/**
 * Calculate longest streak of consecutive correct trials
 */
export function calculateBestStreak<T extends { isCorrect?: boolean; correct?: boolean }>(
  trials: T[]
): number {
  let maxStreak = 0;
  let currentStreak = 0;
  
  for (const trial of trials) {
    const isCorrect = trial.isCorrect ?? trial.correct ?? false;
    if (isCorrect) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return maxStreak;
}

// ============= Result Formatting =============

/**
 * Format milliseconds to display value
 */
export function formatMilliseconds(ms: number): string {
  return `${Math.round(ms)} ms`;
}

/**
 * Format percentage to display value
 */
export function formatPercentage(percentage: number, decimals: number = 0): string {
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Format score ratio (e.g., "45/80")
 */
export function formatScore(correct: number, total: number): string {
  return `${correct}/${total}`;
}

// ============= Data Validation =============

/**
 * Check if value is a valid number
 */
export function isValidNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Safe parse float with fallback
 */
export function safeParseFloat(value: string | number | null | undefined, fallback: number = 0): number {
  if (value === null || value === undefined) return fallback;
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return isValidNumber(parsed) ? parsed : fallback;
}

/**
 * Safe parse int with fallback
 */
export function safeParseInt(value: string | number | null | undefined, fallback: number = 0): number {
  if (value === null || value === undefined) return fallback;
  const parsed = typeof value === 'string' ? parseInt(value, 10) : Math.floor(value);
  return isValidNumber(parsed) ? parsed : fallback;
}
