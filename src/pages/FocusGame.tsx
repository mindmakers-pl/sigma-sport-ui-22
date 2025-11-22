import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
const ISI_MIN = 500;
const ISI_MAX = 1500;
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
  // Mock results for demonstration
  const mockResults: TrialResult[] = Array.from({ length: 80 }, (_, i) => ({
    trialId: i + 1,
    type: i % 2 === 0 ? 'CONGRUENT' : 'INCONGRUENT',
    stimulusWord: WORDS[i % 4],
    stimulusColor: COLORS[i % 4],
    userAction: COLORS[i % 4],
    isCorrect: Math.random() > 0.1, // 90% accuracy
    reactionTime: i % 2 === 0 ? 450 + Math.random() * 100 : 580 + Math.random() * 150,
    timestamp: Date.now() + i * 3000
  }));

  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">("finished");
  const [phaseState, setPhaseState] = useState<"fixation" | "isi" | "stimulus">("fixation");
  const [trials, setTrials] = useState<Trial[]>([]);
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [results, setResults] = useState<TrialResult[]>(mockResults);
  const [stimulusStartTime, setStimulusStartTime] = useState<number>(0);
  const [buttonsDisabled, setButtonsDisabled] = useState(true);
  const [manualRMSSD, setManualRMSSD] = useState("");
  const [manualHR, setManualHR] = useState("");

  // Generate trial sequence with no consecutive identical stimuli
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

    // Shuffle trials with constraint: no consecutive identical stimuli
    let maxAttempts = 100;
    let validSequence = false;
    let shuffledTrials: Trial[] = [];

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

  const handleColorClick = (clickedColor: ColorType, event: React.PointerEvent | React.TouchEvent) => {
    event.preventDefault();
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
    const correctCount = results.filter(r => r.isCorrect).length;
    const accuracy = Math.round((correctCount / TOTAL_TRIALS) * 100);

    // Calculate median reaction times for congruent and incongruent
    const congruentResults = results.filter(r => r.type === 'CONGRUENT' && r.isCorrect).map(r => r.reactionTime).sort((a, b) => a - b);
    const incongruentResults = results.filter(r => r.type === 'INCONGRUENT' && r.isCorrect).map(r => r.reactionTime).sort((a, b) => a - b);
    
    const medianCongruent = congruentResults.length > 0 
      ? congruentResults[Math.floor(congruentResults.length / 2)]
      : 0;
    const medianIncongruent = incongruentResults.length > 0
      ? incongruentResults[Math.floor(incongruentResults.length / 2)]
      : 0;
    
    const concentrationCost = medianIncongruent - medianCongruent;

    // Calculate max for chart scale
    const maxTime = Math.max(medianCongruent, medianIncongruent);
    const chartScale = maxTime > 0 ? maxTime * 1.2 : 1000;

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-slate-700 bg-slate-800 animate-scale-in">
          <CardContent className="pt-6 text-center space-y-6">
            <h2 className="text-3xl font-bold text-white">Wynik wyzwania Sigma Focus</h2>
            
            <div className="space-y-4 py-4">
              {/* Median Reaction Time */}
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-slate-400 text-sm mb-1">Twój Czas Reakcji (Mediana)</p>
                <p className="text-3xl font-bold text-primary">
                  {Math.round((medianCongruent + medianIncongruent) / 2)} ms
                </p>
              </div>

              {/* Bar Chart Comparison */}
              <div className="bg-slate-700/50 p-6 rounded-lg space-y-4">
                <p className="text-slate-400 text-sm mb-4">Porównanie trudności</p>
                
                <div className="space-y-4">
                  {/* Congruent Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-green-400 font-semibold">ŁATWE</span>
                      <span className="text-white font-bold">{medianCongruent} ms</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-8 overflow-hidden">
                      <div 
                        className="bg-green-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(medianCongruent / chartScale) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">Bez konfliktu</p>
                  </div>

                  {/* Incongruent Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-red-400 font-semibold">TRUDNE</span>
                      <span className="text-white font-bold">{medianIncongruent} ms</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-8 overflow-hidden">
                      <div 
                        className="bg-red-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(medianIncongruent / chartScale) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">Z konfliktem</p>
                  </div>
                </div>

                {/* Concentration Cost */}
                <div className="mt-4 pt-4 border-t border-slate-600">
                  <p className="text-slate-400 text-sm mb-1">Koszt Koncentracji</p>
                  <p className="text-2xl font-bold text-yellow-400">+{concentrationCost} ms</p>
                </div>
              </div>

              {/* Accuracy */}
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-slate-400 text-sm mb-1">Celność</p>
                <p className="text-3xl font-bold text-green-500">{accuracy}%</p>
                <p className="text-xs text-slate-500 mt-1">
                  Poprawne: {correctCount} / {TOTAL_TRIALS}
                </p>
              </div>

              {/* HRV Input Fields */}
              <div className="bg-slate-700/50 p-4 rounded-lg space-y-3">
                <p className="text-slate-400 text-sm mb-3">Powiązany pomiar HRV (opcjonalnie)</p>
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={manualRMSSD}
                    onChange={(e) => setManualRMSSD(e.target.value)}
                    placeholder="Średnie rMSSD (ms)"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Input
                    type="number"
                    value={manualHR}
                    onChange={(e) => setManualHR(e.target.value)}
                    placeholder="Średnie HR (bpm)"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Wprowadź wartości zmierzone podczas tego wyzwania
                </p>
              </div>
            </div>

            {mode === "measurement" && (
              <div className="pt-2 pb-2 border-t border-slate-700">
                <p className="text-green-400 text-sm">✓ Zapisaliśmy Twój wynik</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const gameData = {
                    medianCongruent,
                    medianIncongruent,
                    concentrationCost,
                    accuracy,
                    correctCount,
                    results,
                    rMSSD: manualRMSSD,
                    HR: manualHR
                  };
                  if (onGoToCockpit) onGoToCockpit();
                  if (onComplete) onComplete(gameData);
                }}
              >
                Powrót
              </Button>
              <Button 
                size="lg" 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  const gameData = {
                    medianCongruent,
                    medianIncongruent,
                    concentrationCost,
                    accuracy,
                    correctCount,
                    results,
                    rMSSD: manualRMSSD,
                    HR: manualHR
                  };
                  if (onComplete) onComplete(gameData);
                }}
              >
                Następne Wyzwanie
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Playing screen - 3 column layout
  const currentTrial = trials[currentTrialIndex];
  const progress = ((currentTrialIndex + 1) / TOTAL_TRIALS) * 100;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative">
      {/* Back button in top-left corner */}
      {onGoToCockpit && (
        <button
          onClick={onGoToCockpit}
          className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors z-10"
        >
          ← Powrót
        </button>
      )}

      {/* Very thin progress bar at top */}
      <div className="h-0.5">
        <Progress value={progress} className="h-0.5 rounded-none" />
      </div>

      {/* Main game area - 3 columns */}
      <div className="flex-1 flex flex-row">
        {/* Left Column - Red and Green buttons */}
        <div className="w-1/4 flex flex-col items-center justify-center gap-8 p-8">
          <button
            onPointerDown={(e) => handleColorClick('RED', e)}
            onTouchStart={(e) => handleColorClick('RED', e)}
            disabled={buttonsDisabled}
            className="aspect-square w-40 bg-red-500 rounded-2xl hover:bg-red-600 active:scale-95 transition-all disabled:cursor-not-allowed"
            aria-label="Red"
          />
          <button
            onPointerDown={(e) => handleColorClick('GREEN', e)}
            onTouchStart={(e) => handleColorClick('GREEN', e)}
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
            onPointerDown={(e) => handleColorClick('BLUE', e)}
            onTouchStart={(e) => handleColorClick('BLUE', e)}
            disabled={buttonsDisabled}
            className="aspect-square w-40 bg-blue-500 rounded-2xl hover:bg-blue-600 active:scale-95 transition-all disabled:cursor-not-allowed"
            aria-label="Blue"
          />
          <button
            onPointerDown={(e) => handleColorClick('YELLOW', e)}
            onTouchStart={(e) => handleColorClick('YELLOW', e)}
            disabled={buttonsDisabled}
            className="aspect-square w-40 bg-yellow-400 rounded-2xl hover:bg-yellow-500 active:scale-95 transition-all disabled:cursor-not-allowed"
            aria-label="Yellow"
          />
        </div>
      </div>
    </div>
  );
}
