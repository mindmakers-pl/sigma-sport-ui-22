/**
 * Centralized TypeScript interfaces for all game results
 * This file serves as the single source of truth for game-related types
 */

// ============= Common Types =============

export type GameMode = 'measurement' | 'training' | 'library';

export interface GameProps {
  athleteId?: string;
  mode?: 'measurement' | 'training';
  onComplete?: (data: any) => void;
  onGoToCockpit?: () => void;
}

export interface HRVData {
  rmssd?: string;
  hr?: string;
}

// ============= Focus Game Types =============

export type ColorType = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW';
export type TrialType = 'CONGRUENT' | 'INCONGRUENT';

export interface FocusTrial {
  trialId: number;
  type: TrialType;
  stimulusWord: string;
  stimulusColor: ColorType;
}

export interface FocusTrialResult {
  trialId: number;
  type: TrialType;
  stimulusWord: string;
  stimulusColor: string;
  userAction: string;
  isCorrect: boolean;
  reactionTime: number;
  timestamp: number;
}

export interface FocusCoachReport {
  sessionInfo: {
    totalTrials: number;
    validTrials: number;
    filteredOut: number;
    timestamp: string;
  };
  playerMetrics: {
    accuracy: number;
    medianRT: number;
    bestStreak: number;
  };
  coachMetrics: {
    congruent: {
      medianRT: number;
      errorRate: number;
      ies: number;
      validTrials: number;
    };
    incongruent: {
      medianRT: number;
      errorRate: number;
      ies: number;
      validTrials: number;
    };
    variability: {
      congruentIQR: number;
      incongruentIQR: number;
    };
    interferenceCost: {
      rawMs: number;
      iesDiff: number;
    };
  };
  rawTrials: FocusTrialResult[];
}

// ============= Memo Game Types =============

export interface MemoTrialHistory {
  trialIndex: number;
  position: number;
  isTarget: boolean;
  isLure: boolean;
  userResponded: boolean;
  reactionTime: number | null;
  correct: boolean;
  timestamp: number;
}

export interface MemoResults {
  hits: number;
  misses: number;
  falseAlarms: number;
  correctRejections: number;
  accuracy: number;
  medianRT: number;
  dPrime: number;
  responseBias: number;
}

// ============= Control Game Types =============

export type StimulusType = 'Go' | 'NoGo';

export interface ControlResults {
  goHits: number;
  goMisses: number;
  noGoErrors: number;
}

export interface ControlTrial {
  trialNumber: number;
  type: StimulusType;
  result: 'goHit' | 'goMiss' | 'noGoError' | 'correct';
  reactionTime?: number;
}

// ============= Tracker Game Types =============

export interface TrackerBall {
  id: number;
  x_pos: number;
  y_pos: number;
  z_pos: number;
  x_speed: number;
  y_speed: number;
  z_speed: number;
  isTarget: boolean;
}

export interface TrackerScore {
  correct: number;
  total: number;
}

// ============= Scan Game Types =============

export interface ScanClickRecord {
  number: number;
  timestamp: number;
  wasCorrect: boolean;
}

export interface ScanGameResult {
  totalClicks: number;
  correctClicks: number;
  accuracy: number;
  avgReactionTime: number;
  clickHistory: ScanClickRecord[];
}
