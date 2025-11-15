import { useState, useEffect, useRef } from "react";

const TOTAL_BALLS = 8;
const TARGET_BALLS = 4;
const GAME_DURATION_MS = 8000;
const HIGHLIGHT_DURATION_MS = 2500;
const BASE_SPEED = 1.5;
const CONTAINER_SIZE = 600;
const Z_MIN = 0;
const Z_MAX = 100;

export interface Ball {
  id: number;
  x_pos: number;
  y_pos: number;
  z_pos: number;
  x_speed: number;
  y_speed: number;
  z_speed: number;
  isTarget: boolean;
}

export type GameState = 'ready' | 'highlight' | 'moving' | 'finished' | 'level_complete' | 'retry' | 'final_results';

export function useTrackerGame() {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [balls, setBalls] = useState<Ball[]>([]);
  const [userGuesses, setUserGuesses] = useState<number[]>([]);
  const [finalScore, setFinalScore] = useState({ correct: 0, total: TARGET_BALLS });
  const [hrvInput, setHrvInput] = useState("");
  const [level, setLevel] = useState(1);
  const [mistakes, setMistakes] = useState(0);
  const animationRef = useRef<number>();

  const initializeBalls = () => {
    const newBalls: Ball[] = [];
    const currentSpeed = BASE_SPEED + (level * 0.3);
    
    for (let i = 0; i < TOTAL_BALLS; i++) {
      newBalls.push({
        id: i,
        x_pos: Math.random() * CONTAINER_SIZE,
        y_pos: Math.random() * CONTAINER_SIZE,
        z_pos: Math.random() * Z_MAX,
        x_speed: (Math.random() - 0.5) * currentSpeed * 2,
        y_speed: (Math.random() - 0.5) * currentSpeed * 2,
        z_speed: (Math.random() - 0.5) * currentSpeed * 2,
        isTarget: false,
      });
    }

    const targetIndices = new Set<number>();
    while (targetIndices.size < TARGET_BALLS) {
      targetIndices.add(Math.floor(Math.random() * TOTAL_BALLS));
    }

    targetIndices.forEach(index => {
      newBalls[index].isTarget = true;
    });

    return newBalls;
  };

  const handleStart = () => {
    setGameState('highlight');
    setUserGuesses([]);
    setFinalScore({ correct: 0, total: TARGET_BALLS });
    setHrvInput("");
    setLevel(1);
    setMistakes(0);
    setBalls([]);
  };

  const runNextTrial = () => {
    setGameState('highlight');
    setUserGuesses([]);
    setFinalScore({ correct: 0, total: TARGET_BALLS });
    setBalls([]);
  };

  useEffect(() => {
    if (gameState === 'highlight' && balls.length === 0) {
      const initializedBalls = initializeBalls();
      if (initializedBalls) {
        setBalls(initializedBalls);
      }
    }
  }, [gameState, balls.length, level]);

  useEffect(() => {
    if (gameState === 'highlight') {
      const timer = setTimeout(() => {
        setGameState('moving');
      }, HIGHLIGHT_DURATION_MS);

      return () => clearTimeout(timer);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'moving') {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed >= GAME_DURATION_MS) {
        setGameState('finished');
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        return;
      }

      setBalls((prevBalls) => {
        return prevBalls.map((ball) => {
          let newX = ball.x_pos + ball.x_speed;
          let newY = ball.y_pos + ball.y_speed;
          let newZ = ball.z_pos + ball.z_speed;
          
          let newXSpeed = ball.x_speed;
          let newYSpeed = ball.y_speed;
          let newZSpeed = ball.z_speed;

          if (newX <= 0 || newX >= CONTAINER_SIZE) {
            newXSpeed = -ball.x_speed;
            newX = Math.max(0, Math.min(CONTAINER_SIZE, newX));
          }
          if (newY <= 0 || newY >= CONTAINER_SIZE) {
            newYSpeed = -ball.y_speed;
            newY = Math.max(0, Math.min(CONTAINER_SIZE, newY));
          }
          if (newZ <= Z_MIN || newZ >= Z_MAX) {
            newZSpeed = -ball.z_speed;
            newZ = Math.max(Z_MIN, Math.min(Z_MAX, newZ));
          }

          return {
            ...ball,
            x_pos: newX,
            y_pos: newY,
            z_pos: newZ,
            x_speed: newXSpeed,
            y_speed: newYSpeed,
            z_speed: newZSpeed,
          };
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState]);

  const toggleBallGuess = (ballId: number) => {
    setUserGuesses((prev) => {
      if (prev.includes(ballId)) {
        return prev.filter((id) => id !== ballId);
      } else {
        if (prev.length < TARGET_BALLS) {
          return [...prev, ballId];
        }
        return prev;
      }
    });
  };

  const calculateScore = () => {
    const targetIds = balls.filter((b) => b.isTarget).map((b) => b.id);
    const correctGuesses = userGuesses.filter((id) => targetIds.includes(id)).length;
    return { correct: correctGuesses, total: TARGET_BALLS };
  };

  const handleSubmitGuess = () => {
    const score = calculateScore();
    setFinalScore(score);

    if (score.correct === TARGET_BALLS) {
      setLevel((prev) => prev + 1);
      setGameState('level_complete');
    } else {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (newMistakes >= 3) {
        setGameState('final_results');
      } else {
        setGameState('retry');
      }
    }
  };

  return {
    gameState,
    balls,
    userGuesses,
    finalScore,
    hrvInput,
    level,
    mistakes,
    setHrvInput,
    handleStart,
    runNextTrial,
    toggleBallGuess,
    handleSubmitGuess,
  };
}
