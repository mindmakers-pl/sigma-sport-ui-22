import { useState, useEffect, useRef } from 'react';

export type GameState = 'ready' | 'instructions' | 'playing' | 'finished';

export interface Trial {
  trialIndex: number;
  position: number; // 0-8 for 3x3 grid
  isTarget: boolean; // matches position from 2 trials ago
  isLure: boolean; // matches position from 1 trial ago
  userResponded: boolean;
  reactionTime: number | null;
  correct: boolean;
  timestamp: number;
}

export interface Results {
  hits: number;
  misses: number;
  falseAlarms: number;
  correctRejections: number;
  accuracy: number;
  medianRT: number;
  dPrime: number;
  responseBias: number;
}

export const useBackGame = () => {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [currentTrialIndex, setCurrentTrialIndex] = useState(-1);
  const [trialSequence, setTrialSequence] = useState<number[]>([]);
  const [trialHistory, setTrialHistory] = useState<Trial[]>([]);
  const [results, setResults] = useState<Results | null>(null);
  const [manualHRV, setManualHRV] = useState({ rmssd: '', hr: '' });

  const trialStartTimeRef = useRef<number>(0);
  const stimulusTimeoutRef = useRef<NodeJS.Timeout>();
  const isiTimeoutRef = useRef<NodeJS.Timeout>();
  const responseWindowRef = useRef<boolean>(false);

  // Generate trial sequence with targets and lures
  const generateTrialSequence = (): number[] => {
    const sequence: number[] = [];
    const totalTrials = 22; // 2 initial + 20 scoreable
    
    // First two trials - random, no targets possible
    sequence.push(Math.floor(Math.random() * 9));
    sequence.push(Math.floor(Math.random() * 9));

    // Generate remaining trials with controlled targets and lures
    let targetCount = 0;
    let lureCount = 0;
    const targetGoal = 8; // ~35% of 20 scoreable trials
    const lureGoal = 4; // ~20% of 20 scoreable trials

    for (let i = 2; i < totalTrials; i++) {
      const needTarget = targetCount < targetGoal && Math.random() < 0.35;
      const needLure = !needTarget && lureCount < lureGoal && Math.random() < 0.25;

      if (needTarget) {
        // Target: same as 2 trials ago
        sequence.push(sequence[i - 2]);
        targetCount++;
      } else if (needLure) {
        // Lure: same as 1 trial ago
        sequence.push(sequence[i - 1]);
        lureCount++;
      } else {
        // Random position that's different from last 2
        let newPos;
        do {
          newPos = Math.floor(Math.random() * 9);
        } while (newPos === sequence[i - 1] || newPos === sequence[i - 2]);
        sequence.push(newPos);
      }
    }

    return sequence;
  };

  const handleStartGame = () => {
    const sequence = generateTrialSequence();
    setTrialSequence(sequence);
    setTrialHistory([]);
    setCurrentTrialIndex(0);
    setResults(null);
    setGameState('playing');
    startTrial(0, sequence);
  };

  const startTrial = (index: number, sequence: number[]) => {
    if (index >= sequence.length) {
      finishGame();
      return;
    }

    // Show stimulus
    responseWindowRef.current = true;
    trialStartTimeRef.current = Date.now();

    // Hide stimulus after 500ms
    stimulusTimeoutRef.current = setTimeout(() => {
      responseWindowRef.current = false;
      
      // ISI period (2000ms)
      isiTimeoutRef.current = setTimeout(() => {
        // Move to next trial
        const nextIndex = index + 1;
        setCurrentTrialIndex(nextIndex);
        if (nextIndex < sequence.length) {
          startTrial(nextIndex, sequence);
        } else {
          finishGame();
        }
      }, 2000);
    }, 500);
  };

  const handleResponse = () => {
    if (gameState !== 'playing' || !responseWindowRef.current) return;

    const reactionTime = Date.now() - trialStartTimeRef.current;
    const position = trialSequence[currentTrialIndex];
    const isTarget = currentTrialIndex >= 2 && trialSequence[currentTrialIndex - 2] === position;
    const isLure = currentTrialIndex >= 1 && trialSequence[currentTrialIndex - 1] === position;

    const trial: Trial = {
      trialIndex: currentTrialIndex,
      position,
      isTarget,
      isLure,
      userResponded: true,
      reactionTime,
      correct: isTarget,
      timestamp: Date.now(),
    };

    setTrialHistory(prev => [...prev, trial]);
    responseWindowRef.current = false; // Prevent multiple responses
  };

  const recordNoResponse = (trialIndex: number) => {
    const position = trialSequence[trialIndex];
    const isTarget = trialIndex >= 2 && trialSequence[trialIndex - 2] === position;
    const isLure = trialIndex >= 1 && trialSequence[trialIndex - 1] === position;

    const trial: Trial = {
      trialIndex,
      position,
      isTarget,
      isLure,
      userResponded: false,
      reactionTime: null,
      correct: !isTarget, // Correct rejection if not target
      timestamp: Date.now(),
    };

    setTrialHistory(prev => [...prev, trial]);
  };

  const finishGame = () => {
    // Record any missing trials (no response recorded)
    const recordedIndices = new Set(trialHistory.map(t => t.trialIndex));
    const missingTrials: Trial[] = [];
    
    for (let i = 2; i < trialSequence.length; i++) { // Start from 2 (first scoreable)
      if (!recordedIndices.has(i)) {
        const position = trialSequence[i];
        const isTarget = trialSequence[i - 2] === position;
        const isLure = trialSequence[i - 1] === position;
        
        missingTrials.push({
          trialIndex: i,
          position,
          isTarget,
          isLure,
          userResponded: false,
          reactionTime: null,
          correct: !isTarget,
          timestamp: Date.now(),
        });
      }
    }

    const allTrials = [...trialHistory, ...missingTrials].sort((a, b) => a.trialIndex - b.trialIndex);
    const scoreableTrials = allTrials.filter(t => t.trialIndex >= 2); // First 2 are not scoreable

    // Calculate results
    const hits = scoreableTrials.filter(t => t.isTarget && t.userResponded).length;
    const misses = scoreableTrials.filter(t => t.isTarget && !t.userResponded).length;
    const falseAlarms = scoreableTrials.filter(t => !t.isTarget && t.userResponded).length;
    const correctRejections = scoreableTrials.filter(t => !t.isTarget && !t.userResponded).length;

    const accuracy = ((hits + correctRejections) / scoreableTrials.length) * 100;

    const hitRTs = scoreableTrials
      .filter(t => t.isTarget && t.userResponded && t.reactionTime !== null)
      .map(t => t.reactionTime!);
    const medianRT = hitRTs.length > 0 ? calculateMedian(hitRTs) : 0;

    // Calculate d-prime (sensitivity)
    const hitRate = Math.max(0.01, Math.min(0.99, hits / (hits + misses || 1)));
    const faRate = Math.max(0.01, Math.min(0.99, falseAlarms / (falseAlarms + correctRejections || 1)));
    const dPrime = zScore(hitRate) - zScore(faRate);

    // Calculate response bias (c)
    const responseBias = -0.5 * (zScore(hitRate) + zScore(faRate));

    const calculatedResults: Results = {
      hits,
      misses,
      falseAlarms,
      correctRejections,
      accuracy,
      medianRT,
      dPrime,
      responseBias,
    };

    setResults(calculatedResults);
    setTrialHistory(allTrials);
    setGameState('finished');
  };

  const calculateMedian = (values: number[]): number => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  };

  const zScore = (p: number): number => {
    // Approximation of inverse normal CDF (z-score from probability)
    const a1 = -39.6968302866538, a2 = 220.946098424521, a3 = -275.928510446969;
    const a4 = 138.357751867269, a5 = -30.6647980661472, a6 = 2.50662827745924;
    const b1 = -54.4760987982241, b2 = 161.585836858041, b3 = -155.698979859887;
    const b4 = 66.8013118877197, b5 = -13.2806815528857;
    const c1 = -7.78489400243029e-3, c2 = -0.322396458041136, c3 = -2.40075827716184;
    const c4 = -2.54973253934373, c5 = 4.37466414146497, c6 = 2.93816398269878;
    const d1 = 7.78469570904146e-3, d2 = 0.32246712907004, d3 = 2.445134137143;
    const d4 = 3.75440866190742;
    const p_low = 0.02425, p_high = 1 - p_low;
    
    let q, r;
    if (p < p_low) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
        ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    } else if (p <= p_high) {
      q = p - 0.5;
      r = q * q;
      return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
        (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
    } else {
      q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
        ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    }
  };

  // Keyboard listener for spacebar
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameState === 'playing') {
        e.preventDefault();
        handleResponse();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, currentTrialIndex, trialSequence]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (stimulusTimeoutRef.current) clearTimeout(stimulusTimeoutRef.current);
      if (isiTimeoutRef.current) clearTimeout(isiTimeoutRef.current);
    };
  }, []);

  return {
    gameState,
    setGameState,
    currentTrialIndex,
    trialSequence,
    trialHistory,
    results,
    manualHRV,
    setManualHRV,
    handleStartGame,
    handleResponse,
  };
};
