import { useState, useEffect, useRef } from "react";

export type GameState = "ready" | "playing" | "finished";
export type StimulusType = "Go" | "NoGo";
export type Stimulus = { type: StimulusType } | null;

export interface Results {
  goHits: number;
  goMisses: number;
  noGoErrors: number;
}

export interface Trial {
  trialNumber: number;
  type: StimulusType;
  result: 'goHit' | 'goMiss' | 'noGoError' | 'correct';
  reactionTime?: number;
}

const GAME_DURATION_MS = 60000; // 60 sekund

export function useControlGame() {
  const [gameState, setGameState] = useState<GameState>("ready");
  const [currentStimulus, setCurrentStimulus] = useState<Stimulus>(null);
  const [results, setResults] = useState<Results>({
    goHits: 0,
    goMisses: 0,
    noGoErrors: 0,
  });
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [trialHistory, setTrialHistory] = useState<Trial[]>([]);
  const [manualHRV, setManualHRV] = useState<string>("");
  
  const trialCounterRef = useRef<number>(0);
  const [lastTrialStartTime, setLastTrialStartTime] = useState<number | null>(null);
  const currentTrialTypeRef = useRef<StimulusType | null>(null);
  
  const gameTimerRef = useRef<number | null>(null);
  const loopTimerRef = useRef<number | null>(null);
  const stimulusTimerRef = useRef<number | null>(null);
  const omissionTimerRef = useRef<number | null>(null);

  const runGameLoop = () => {
    setCurrentStimulus(null);
    
    loopTimerRef.current = window.setTimeout(() => {
      const random = Math.random();
      const stimulusType: StimulusType = random < 0.8 ? "Go" : "NoGo";
      
      setCurrentStimulus({ type: stimulusType });
      
      const trialStartTime = Date.now();
      setLastTrialStartTime(trialStartTime);
      trialCounterRef.current += 1;
      currentTrialTypeRef.current = stimulusType;
      
      if (stimulusType === "Go") {
        omissionTimerRef.current = window.setTimeout(() => {
          setCurrentStimulus((currentStim) => {
            if (currentStim?.type === "Go") {
              setResults((prev) => ({
                ...prev,
                goMisses: prev.goMisses + 1,
              }));
              
              setTrialHistory((prev) => [
                ...prev,
                {
                  trialNumber: trialCounterRef.current,
                  type: 'Go',
                  result: 'goMiss',
                },
              ]);
            }
            return null;
          });
        }, 500);
      } else {
        stimulusTimerRef.current = window.setTimeout(() => {
          setCurrentStimulus((currentStim) => {
            if (currentStim?.type === "NoGo") {
              setTrialHistory((prev) => [
                ...prev,
                {
                  trialNumber: trialCounterRef.current,
                  type: 'NoGo',
                  result: 'correct',
                },
              ]);
            }
            return null;
          });
        }, 1500);
      }
      
      loopTimerRef.current = window.setTimeout(() => {
        if (gameState === "playing") {
          runGameLoop();
        }
      }, 2000);
    }, 1500);
  };

  const handleSpacePress = () => {
    if (!currentStimulus) return;
    
    const now = Date.now();
    const stimType = currentStimulus.type;
    
    if (stimType === "Go") {
      if (lastTrialStartTime !== null) {
        const rt = now - lastTrialStartTime;
        setReactionTimes((prev) => [...prev, rt]);
        setResults((prev) => ({ ...prev, goHits: prev.goHits + 1 }));
        
        setTrialHistory((prev) => [
          ...prev,
          {
            trialNumber: trialCounterRef.current,
            type: 'Go',
            result: 'goHit',
            reactionTime: rt,
          },
        ]);
      }
      
      if (omissionTimerRef.current !== null) {
        clearTimeout(omissionTimerRef.current);
        omissionTimerRef.current = null;
      }
    } else if (stimType === "NoGo") {
      setResults((prev) => ({ ...prev, noGoErrors: prev.noGoErrors + 1 }));
      
      setTrialHistory((prev) => [
        ...prev,
        {
          trialNumber: trialCounterRef.current,
          type: 'NoGo',
          result: 'noGoError',
        },
      ]);
      
      if (stimulusTimerRef.current !== null) {
        clearTimeout(stimulusTimerRef.current);
        stimulusTimerRef.current = null;
      }
    }
    
    setCurrentStimulus(null);
  };

  const handleStartGame = () => {
    setGameState("playing");
    setResults({ goHits: 0, goMisses: 0, noGoErrors: 0 });
    setReactionTimes([]);
    setTrialHistory([]);
    trialCounterRef.current = 0;
    runGameLoop();

    gameTimerRef.current = window.setTimeout(() => {
      if (loopTimerRef.current !== null) {
        clearTimeout(loopTimerRef.current);
        loopTimerRef.current = null;
      }
      if (omissionTimerRef.current !== null) {
        clearTimeout(omissionTimerRef.current);
        omissionTimerRef.current = null;
      }
      if (stimulusTimerRef.current !== null) {
        clearTimeout(stimulusTimerRef.current);
        stimulusTimerRef.current = null;
      }
      setGameState("finished");
      setCurrentStimulus(null);
    }, GAME_DURATION_MS);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && gameState === "playing") {
        e.preventDefault();
        handleSpacePress();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameState, currentStimulus, lastTrialStartTime]);

  useEffect(() => {
    return () => {
      if (gameTimerRef.current !== null) clearTimeout(gameTimerRef.current);
      if (loopTimerRef.current !== null) clearTimeout(loopTimerRef.current);
      if (omissionTimerRef.current !== null) clearTimeout(omissionTimerRef.current);
      if (stimulusTimerRef.current !== null) clearTimeout(stimulusTimerRef.current);
    };
  }, []);

  const calculateAvgRT = () => {
    if (reactionTimes.length === 0) return 0;
    const sum = reactionTimes.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / reactionTimes.length);
  };

  const calculateMedianRT = () => {
    if (reactionTimes.length === 0) return 0;
    const sorted = [...reactionTimes].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  };

  return {
    gameState,
    currentStimulus,
    results,
    reactionTimes,
    trialHistory,
    manualHRV,
    setManualHRV,
    handleStartGame,
    calculateAvgRT,
    calculateMedianRT,
  };
}
