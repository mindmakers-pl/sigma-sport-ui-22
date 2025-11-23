/**
 * useFocusGame Hook
 * Business logic for Focus (Stroop) game
 * Extracted from FocusGame.tsx for consistency with other game hooks
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { FocusTrial, FocusTrialResult, ColorType } from '@/types/gameResults';

const TOTAL_TRIALS = 80;
const COLORS: ColorType[] = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
const FIXATION_TIME = 500;
const ISI_MIN = 500;
const ISI_MAX = 1500;
const STIMULUS_MAX_TIME = 2000;

const COLOR_MAP: Record<ColorType, string> = {
  RED: "CZERWONY",
  BLUE: "NIEBIESKI",
  GREEN: "ZIELONY",
  YELLOW: "ŻÓŁTY"
};

type GameState = 'ready' | 'playing' | 'finished';
type PhaseState = 'fixation' | 'isi' | 'stimulus';

export function useFocusGame() {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [phaseState, setPhaseState] = useState<PhaseState>('fixation');
  const [trials, setTrials] = useState<FocusTrial[]>([]);
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [results, setResults] = useState<FocusTrialResult[]>([]);
  const [stimulusStartTime, setStimulusStartTime] = useState<number>(0);
  const [buttonsDisabled, setButtonsDisabled] = useState(true);
  const [manualRMSSD, setManualRMSSD] = useState("");
  const [manualHR, setManualHR] = useState("");

  const timeoutRefs = useRef<{ fixation?: number; isi?: number; stimulus?: number }>({});

  // Generate trial sequence with no consecutive identical stimuli
  const generateTrials = useCallback((): FocusTrial[] => {
    const generatedTrials: FocusTrial[] = [];
    const congruentCount = TOTAL_TRIALS / 2;
    const incongruentCount = TOTAL_TRIALS / 2;

    // Generate congruent trials
    for (let i = 0; i < congruentCount; i++) {
      const color = COLORS[i % COLORS.length];
      generatedTrials.push({
        trialId: i + 1,
        type: 'CONGRUENT',
        stimulusWord: COLOR_MAP[color],
        stimulusColor: color
      });
    }

    // Generate incongruent trials with balanced correct answers
    for (let i = 0; i < incongruentCount; i++) {
      const correctColor = COLORS[i % COLORS.length];
      let wrongWord: ColorType;
      do {
        wrongWord = COLORS[Math.floor(Math.random() * COLORS.length)];
      } while (wrongWord === correctColor);
      generatedTrials.push({
        trialId: congruentCount + i + 1,
        type: 'INCONGRUENT',
        stimulusWord: COLOR_MAP[wrongWord],
        stimulusColor: correctColor
      });
    }

    // Shuffle trials with constraint: no consecutive identical stimuli
    let maxAttempts = 100;
    let validSequence = false;
    let shuffledTrials: FocusTrial[] = [];
    while (!validSequence && maxAttempts > 0) {
      shuffledTrials = [...generatedTrials];

      // Fisher-Yates shuffle
      for (let i = shuffledTrials.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledTrials[i], shuffledTrials[j]] = [shuffledTrials[j], shuffledTrials[i]];
      }

      // Check for consecutive identical stimuli
      validSequence = true;
      for (let i = 1; i < shuffledTrials.length; i++) {
        const prev = shuffledTrials[i - 1];
        const curr = shuffledTrials[i];
        if (prev.stimulusWord === curr.stimulusWord && prev.stimulusColor === curr.stimulusColor) {
          validSequence = false;
          break;
        }
      }
      maxAttempts--;
    }

    // Reassign trial IDs after shuffle
    return shuffledTrials.map((trial, index) => ({
      ...trial,
      trialId: index + 1
    }));
  }, []);

  const startTrial = useCallback(() => {
    // Phase 1: Fixation cross
    setPhaseState('fixation');
    setButtonsDisabled(true);
    
    timeoutRefs.current.fixation = window.setTimeout(() => {
      // Phase 2: ISI (blank screen with disabled buttons)
      setPhaseState('isi');
      const isiDuration = ISI_MIN + Math.random() * (ISI_MAX - ISI_MIN);
      
      timeoutRefs.current.isi = window.setTimeout(() => {
        // Phase 3: Stimulus (word displayed, buttons enabled)
        setPhaseState('stimulus');
        setButtonsDisabled(false);
        setStimulusStartTime(Date.now());
      }, isiDuration);
    }, FIXATION_TIME);
  }, []);

  const advanceToNextTrial = useCallback((currentResults: FocusTrialResult[]) => {
    if (currentTrialIndex + 1 < TOTAL_TRIALS) {
      setCurrentTrialIndex(currentTrialIndex + 1);
      startTrial();
    } else {
      setGameState('finished');
    }
  }, [currentTrialIndex, startTrial]);

  const handleColorClick = useCallback((clickedColor: ColorType, event: React.PointerEvent | React.TouchEvent) => {
    event.preventDefault();
    if (buttonsDisabled || phaseState !== 'stimulus') return;

    const reactionTime = Date.now() - stimulusStartTime;
    const currentTrial = trials[currentTrialIndex];
    const isCorrect = clickedColor === currentTrial.stimulusColor;

    const result: FocusTrialResult = {
      trialId: currentTrial.trialId,
      type: currentTrial.type,
      stimulusWord: currentTrial.stimulusWord,
      stimulusColor: currentTrial.stimulusColor,
      userAction: clickedColor,
      isCorrect,
      reactionTime,
      timestamp: Date.now()
    };

    const newResults = [...results, result];
    setResults(newResults);
    setButtonsDisabled(true);
    advanceToNextTrial(newResults);
  }, [buttonsDisabled, phaseState, stimulusStartTime, trials, currentTrialIndex, results, advanceToNextTrial]);

  const handleStartGame = useCallback(() => {
    const newTrials = generateTrials();
    setTrials(newTrials);
    setGameState('playing');
    setCurrentTrialIndex(0);
    setResults([]);
    startTrial();
  }, [generateTrials, startTrial]);

  // Handle stimulus timeout
  useEffect(() => {
    if (phaseState !== 'stimulus' || buttonsDisabled) return;

    timeoutRefs.current.stimulus = window.setTimeout(() => {
      // Record as incorrect with max time
      const currentTrial = trials[currentTrialIndex];
      const result: FocusTrialResult = {
        trialId: currentTrial.trialId,
        type: currentTrial.type,
        stimulusWord: currentTrial.stimulusWord,
        stimulusColor: currentTrial.stimulusColor,
        userAction: 'TIMEOUT',
        isCorrect: false,
        reactionTime: STIMULUS_MAX_TIME,
        timestamp: Date.now()
      };
      const newResults = [...results, result];
      setResults(newResults);
      setButtonsDisabled(true);
      advanceToNextTrial(newResults);
    }, STIMULUS_MAX_TIME);

    return () => {
      if (timeoutRefs.current.stimulus) {
        clearTimeout(timeoutRefs.current.stimulus);
      }
    };
  }, [phaseState, buttonsDisabled, currentTrialIndex, trials, results, advanceToNextTrial]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  return {
    gameState,
    phaseState,
    trials,
    currentTrialIndex,
    results,
    buttonsDisabled,
    manualRMSSD,
    manualHR,
    setManualRMSSD,
    setManualHR,
    handleStartGame,
    handleColorClick,
    totalTrials: TOTAL_TRIALS,
    currentTrial: trials[currentTrialIndex]
  };
}
