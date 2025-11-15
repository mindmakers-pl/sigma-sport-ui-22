import { useState } from "react";

export type GameState = "ready" | "playing" | "finished";
export type Color = "red" | "green" | "blue";
export type Word = "CZERWONY" | "ZIELONY" | "NIEBIESKI";

export interface Trial {
  word: Word;
  color: Color;
  type: "congruent" | "incongruent";
}

const MAX_TRIALS = 20;

export const colorMap: Record<Word, Color> = {
  "CZERWONY": "red",
  "ZIELONY": "green",
  "NIEBIESKI": "blue"
};

export const colorStyles: Record<Color, string> = {
  red: "text-red-500",
  green: "text-green-500",
  blue: "text-blue-500"
};

export const colorButtonStyles: Record<Color, string> = {
  red: "bg-red-500 hover:bg-red-600 text-white",
  green: "bg-green-500 hover:bg-green-600 text-white",
  blue: "bg-blue-500 hover:bg-blue-600 text-white"
};

export function useFocusGame() {
  const [gameState, setGameState] = useState<GameState>("ready");
  const [currentTrial, setCurrentTrial] = useState<Trial | null>(null);
  const [congruentTimes, setCongruentTimes] = useState<number[]>([]);
  const [incongruentTimes, setIncongruentTimes] = useState<number[]>([]);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [lastTrialStartTime, setLastTrialStartTime] = useState<number | null>(null);
  const [totalTrials, setTotalTrials] = useState<number>(0);
  const [manualHRV, setManualHRV] = useState<string>("");

  const colors: Color[] = ["red", "green", "blue"];
  const words: Word[] = ["CZERWONY", "ZIELONY", "NIEBIESKI"];

  const runNextTrial = () => {
    if (totalTrials >= MAX_TRIALS) {
      endGame();
      return;
    }

    setTotalTrials((prev) => prev + 1);

    const word = words[Math.floor(Math.random() * words.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const type = colorMap[word] === color ? "congruent" : "incongruent";

    setCurrentTrial({ word, color, type });
    setLastTrialStartTime(Date.now());
  };

  const handleColorClick = (clickedColor: Color) => {
    if (!currentTrial || !lastTrialStartTime) return;

    const correctColor = currentTrial.color;
    const trialType = currentTrial.type;

    if (clickedColor === correctColor) {
      const rt = Date.now() - lastTrialStartTime;
      if (trialType === "congruent") {
        setCongruentTimes((prev) => [...prev, rt]);
      } else {
        setIncongruentTimes((prev) => [...prev, rt]);
      }
    } else {
      setErrorCount((prev) => prev + 1);
    }

    setCurrentTrial(null);
    setTimeout(() => {
      runNextTrial();
    }, 500);
  };

  const endGame = () => {
    setGameState("finished");
  };

  const handleStartGame = () => {
    setCongruentTimes([]);
    setIncongruentTimes([]);
    setErrorCount(0);
    setTotalTrials(0);
    setGameState("playing");
    runNextTrial();
  };

  const calculateAvgCongruentTime = () => {
    if (congruentTimes.length === 0) return 0;
    const sum = congruentTimes.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / congruentTimes.length);
  };

  const calculateAvgIncongruentTime = () => {
    if (incongruentTimes.length === 0) return 0;
    const sum = incongruentTimes.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / incongruentTimes.length);
  };

  const calculateInterferenceEffect = () => {
    return calculateAvgIncongruentTime() - calculateAvgCongruentTime();
  };

  return {
    gameState,
    currentTrial,
    congruentTimes,
    incongruentTimes,
    errorCount,
    totalTrials,
    manualHRV,
    setManualHRV,
    handleStartGame,
    handleColorClick,
    calculateAvgCongruentTime,
    calculateAvgIncongruentTime,
    calculateInterferenceEffect,
  };
}
