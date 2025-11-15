import { useState } from "react";

export type GameState = "ready" | "playing" | "transition" | "finished";
export type Shape = "circle" | "square" | "triangle" | "diamond" | "hexagon";
export type Color = "black" | "gray" | "white" | "emerald" | "violet";

export interface GridItem {
  shape: Shape;
  color: Color;
  isTarget: boolean;
}

const MAX_TRIALS = 10;

export function useScanGame() {
  const [gameState, setGameState] = useState<GameState>("ready");
  const [currentTrial, setCurrentTrial] = useState<number>(1);
  const [resultsList, setResultsList] = useState<number[]>([]);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [grid, setGrid] = useState<GridItem[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [manualHRV, setManualHRV] = useState<string>("");

  const setupTrial = () => {
    const shapes: Shape[] = ["circle", "square", "triangle", "diamond", "hexagon"];
    const colors: Color[] = ["black", "gray", "white", "emerald", "violet"];
    
    const newGrid: GridItem[] = Array(100).fill(null).map(() => {
      let shape: Shape;
      let color: Color;
      
      do {
        shape = shapes[Math.floor(Math.random() * shapes.length)];
        color = colors[Math.floor(Math.random() * colors.length)];
      } while (shape === "circle" && color === "emerald");
      
      return {
        shape,
        color,
        isTarget: false,
      };
    });

    const targetIndex = Math.floor(Math.random() * 100);
    newGrid[targetIndex] = {
      shape: "circle",
      color: "emerald",
      isTarget: true,
    };

    setGrid(newGrid);
    setGameState("playing");
    setStartTime(Date.now());
  };

  const handleStartGame = () => {
    setGameState("playing");
    setCurrentTrial(1);
    setResultsList([]);
    setErrorCount(0);
    setupTrial();
  };

  const handleClick = (isTarget: boolean) => {
    if (gameState !== "playing" || startTime === null) return;

    if (isTarget) {
      const reactionTime = Date.now() - startTime;
      setResultsList(prev => [...prev, reactionTime]);
      
      const nextTrial = currentTrial + 1;
      setCurrentTrial(nextTrial);
      
      if (nextTrial > MAX_TRIALS) {
        setGameState("finished");
      } else {
        setGameState("transition");
        const transitionTime = Math.random() * 2500 + 500;
        setTimeout(() => {
          setupTrial();
        }, transitionTime);
      }
    } else {
      setErrorCount(prev => prev + 1);
    }
  };

  const calculateAvgRT = () => {
    if (resultsList.length === 0) return 0;
    const sum = resultsList.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / resultsList.length);
  };

  return {
    gameState,
    currentTrial,
    resultsList,
    errorCount,
    grid,
    manualHRV,
    setManualHRV,
    handleStartGame,
    handleClick,
    calculateAvgRT,
  };
}
