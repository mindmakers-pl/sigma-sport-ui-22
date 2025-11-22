import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FocusGameProps {
  onComplete?: (data: any) => void;
  onGoToCockpit?: () => void;
  mode?: "training" | "measurement";
}

type ColorType = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW';

interface Trial {
  trialId: number;
  type: 'CONGRUENT' | 'INCONGRUENT';
  stimulusWord: string;
  stimulusColor: ColorType;
}

interface TrialResult {
  trialId: number;
  type: 'CONGRUENT' | 'INCONGRUENT';
  stimulusWord: string;
  stimulusColor: string;
  userAction: string;
  isCorrect: boolean;
  reactionTime: number;
  timestamp: number;
}

const TOTAL_TRIALS = 80;
const COLORS: ColorType[] = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
const WORDS = ["CZERWONY", "NIEBIESKI", "ZIELONY", "ŻÓŁTY"];
const FIXATION_TIME = 500;
const ISI_MIN = 400;
const ISI_MAX = 800;
const STIMULUS_MAX_TIME = 2000;

const COLOR_MAP: Record<ColorType, string> = {
  RED: "CZERWONY",
  BLUE: "NIEBIESKI",
  GREEN: "ZIELONY",
  YELLOW: "ŻÓŁTY"
};

const COLOR_CLASSES: Record<ColorType, string> = {
  RED: "text-red-500",
  BLUE: "text-blue-500",
  GREEN: "text-green-500",
  YELLOW: "text-yellow-400"
};

export default function FocusGame({ onComplete, onGoToCockpit, mode = "training" }: FocusGameProps) {
  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">("ready");
  const [phaseState, setPhaseState] = useState<"fixation" | "isi" | "stimulus">("fixation");
  const [trials, setTrials] = useState<Trial[]>([]);
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [results, setResults] = useState<TrialResult[]>([]);
  const [stimulusStartTime, setStimulusStartTime] = useState<number>(0);
  const [buttonsDisabled, setButtonsDisabled] = useState(true);

  // Generate trial sequence
  const generateTrials = useCallback((): Trial[] => {
    const generatedTrials: Trial[] = [];
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

    // Shuffle trials
    for (let i = generatedTrials.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [generatedTrials[i], generatedTrials[j]] = [generatedTrials[j], generatedTrials[i]];
    }

    // Reassign trial IDs after shuffle
    return generatedTrials.map((trial, index) => ({
      ...trial,
      trialId: index + 1
    }));
  }, []);

  const handleStartGame = () => {
    const newTrials = generateTrials();
    setTrials(newTrials);
    setGameState("playing");
    setCurrentTrialIndex(0);
    setResults([]);
    startTrial();
  };

  const startTrial = useCallback(() => {
    // Phase 1: Fixation cross
    setPhaseState("fixation");
    setButtonsDisabled(true);

    setTimeout(() => {
      // Phase 2: ISI (blank screen with disabled buttons)
      setPhaseState("isi");
      const isiDuration = ISI_MIN + Math.random() * (ISI_MAX - ISI_MIN);

      setTimeout(() => {
        // Phase 3: Stimulus (word displayed, buttons enabled)
        setPhaseState("stimulus");
        setButtonsDisabled(false);
        setStimulusStartTime(Date.now());
      }, isiDuration);
    }, FIXATION_TIME);
  }, []);

  useEffect(() => {
    if (phaseState !== "stimulus" || buttonsDisabled) return;
    
    const timeoutId = setTimeout(() => {
      // Record as incorrect with max time
      const currentTrial = trials[currentTrialIndex];
      const result: TrialResult = {
        trialId: currentTrial.trialId,
        type: currentTrial.type,
        stimulusWord: currentTrial.stimulusWord,
        stimulusColor: currentTrial.stimulusColor,
        userAction: "TIMEOUT",
        isCorrect: false,
        reactionTime: STIMULUS_MAX_TIME,
        timestamp: Date.now()
      };

      const newResults = [...results, result];
      setResults(newResults);
      setButtonsDisabled(true);

      advanceToNextTrial(newResults);
    }, STIMULUS_MAX_TIME);

    return () => clearTimeout(timeoutId);
  }, [phaseState, buttonsDisabled, currentTrialIndex, trials, results]);

  const handleColorClick = (clickedColor: ColorType) => {
    if (buttonsDisabled || phaseState !== "stimulus") return;

    const reactionTime = Date.now() - stimulusStartTime;
    const currentTrial = trials[currentTrialIndex];
    const isCorrect = clickedColor === currentTrial.stimulusColor;

    const result: TrialResult = {
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
    
    // Disable buttons immediately after response
    setButtonsDisabled(true);

    advanceToNextTrial(newResults);
  };

  const advanceToNextTrial = (currentResults: TrialResult[]) => {
    if (currentTrialIndex + 1 < TOTAL_TRIALS) {
      setCurrentTrialIndex(currentTrialIndex + 1);
      startTrial();
    } else {
      finishGame(currentResults);
    }
  };

  const finishGame = (finalResults: TrialResult[]) => {
    setGameState("finished");
    console.log("=== STROOP TEST RESULTS ===");
    console.log(JSON.stringify(finalResults, null, 2));
    
    if (onComplete) {
      onComplete(finalResults);
    }
  };

  useEffect(() => {
    if (gameState === "playing" && currentTrialIndex === 0 && trials.length > 0) {
      startTrial();
    }
  }, [gameState, trials]);

  // Ready screen
  if (gameState === "ready") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-slate-900 rounded-2xl p-12 space-y-8 shadow-2xl">
          <h1 className="text-5xl font-bold text-white text-center mb-6">Sigma Focus</h1>
          
          <div className="space-y-6 text-slate-200 text-lg leading-relaxed">
            <p className="text-xl">
              <span className="font-bold text-white">Twoim zadaniem jest kliknięcie kwadratu w kolorze, którym napisane jest słowo.</span>
            </p>
            
            <p className="text-xl font-semibold text-red-400">
              Ignoruj treść słowa!
            </p>

            <div className="bg-slate-800 rounded-xl p-6 space-y-4 border border-slate-700">
              <p className="font-semibold text-white text-xl">Schemat sterowania:</p>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="space-y-2 text-center">
                  <div className="w-16 h-16 bg-red-500 rounded-lg mx-auto"></div>
                  <div className="w-16 h-16 bg-green-500 rounded-lg mx-auto"></div>
                  <p className="text-sm text-slate-400">Lewa strona</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">SŁOWO</p>
                  <p className="text-sm text-slate-400 mt-2">Środek ekranu</p>
                </div>
                <div className="space-y-2 text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-lg mx-auto"></div>
                  <div className="w-16 h-16 bg-yellow-400 rounded-lg mx-auto"></div>
                  <p className="text-sm text-slate-400">Prawa strona</p>
                </div>
              </div>
            </div>
            
            <p className="text-center text-xl">
              Test składa się z <span className="font-bold text-white">80 prób</span>.
            </p>

            <p className="text-center text-lg text-yellow-400 font-semibold">
              Utrzymaj koncentrację do samego końca!
            </p>
          </div>
          
          <Button 
            size="lg" 
            className="w-full text-2xl py-8 mt-8 bg-primary hover:bg-primary/90"
            onClick={handleStartGame}
          >
            START
          </Button>
        </div>
      </div>
    );
  }

  // Finished screen
  if (gameState === "finished") {
    const avgReactionTime = results.length > 0 
      ? Math.round(results.reduce((sum, r) => sum + r.reactionTime, 0) / results.length)
      : 0;
    const correctCount = results.filter(r => r.isCorrect).length;
    const accuracy = Math.round((correctCount / TOTAL_TRIALS) * 100);

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-slate-900 rounded-2xl p-12 space-y-8 shadow-2xl">
          <h1 className="text-5xl font-bold text-white text-center">Test Zakończony</h1>
          
          <div className="space-y-6 text-center">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <p className="text-slate-400 text-lg mb-2">Średni czas reakcji</p>
              <p className="text-5xl font-bold text-white">{avgReactionTime} ms</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <p className="text-slate-400 mb-2">Dokładność</p>
                <p className="text-3xl font-bold text-white">{accuracy}%</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <p className="text-slate-400 mb-2">Poprawne</p>
                <p className="text-3xl font-bold text-white">{correctCount}/{TOTAL_TRIALS}</p>
              </div>
            </div>
          </div>

          {onGoToCockpit && (
            <Button 
              size="lg" 
              className="w-full text-xl py-6 bg-primary hover:bg-primary/90"
              onClick={onGoToCockpit}
            >
              Powrót do Kokpitu
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Playing screen - 3 column layout
  const currentTrial = trials[currentTrialIndex];
  const progress = ((currentTrialIndex + 1) / TOTAL_TRIALS) * 100;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Very thin progress bar at top */}
      <div className="h-0.5">
        <Progress value={progress} className="h-0.5 rounded-none" />
      </div>

      {/* Main game area - 3 columns */}
      <div className="flex-1 flex flex-row">
        {/* Left Column - Red and Green buttons */}
        <div className="w-1/4 flex flex-col items-center justify-center gap-8 p-8">
          <button
            onClick={() => handleColorClick('RED')}
            disabled={buttonsDisabled}
            className="aspect-square w-40 bg-red-500 rounded-2xl hover:bg-red-600 active:scale-95 transition-all disabled:cursor-not-allowed"
            aria-label="Red"
          />
          <button
            onClick={() => handleColorClick('GREEN')}
            disabled={buttonsDisabled}
            className="aspect-square w-40 bg-green-500 rounded-2xl hover:bg-green-600 active:scale-95 transition-all disabled:cursor-not-allowed"
            aria-label="Green"
          />
        </div>

        {/* Center Column - Stimulus area */}
        <div className="w-1/2 flex items-center justify-center">
          {phaseState === "fixation" && (
            <div className="text-white text-6xl font-bold">+</div>
          )}
          {phaseState === "isi" && (
            <div className="text-white text-6xl font-bold opacity-0">+</div>
          )}
          {phaseState === "stimulus" && currentTrial && (
            <div className={`text-7xl font-bold ${COLOR_CLASSES[currentTrial.stimulusColor]}`}>
              {currentTrial.stimulusWord}
            </div>
          )}
        </div>

        {/* Right Column - Blue and Yellow buttons */}
        <div className="w-1/4 flex flex-col items-center justify-center gap-8 p-8">
          <button
            onClick={() => handleColorClick('BLUE')}
            disabled={buttonsDisabled}
            className="aspect-square w-40 bg-blue-500 rounded-2xl hover:bg-blue-600 active:scale-95 transition-all disabled:cursor-not-allowed"
            aria-label="Blue"
          />
          <button
            onClick={() => handleColorClick('YELLOW')}
            disabled={buttonsDisabled}
            className="aspect-square w-40 bg-yellow-400 rounded-2xl hover:bg-yellow-500 active:scale-95 transition-all disabled:cursor-not-allowed"
            aria-label="Yellow"
          />
        </div>
      </div>
    </div>
  );
}
