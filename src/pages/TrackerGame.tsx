import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// Parametry główne
const TOTAL_BALLS = 8;
const TARGET_BALLS = 4;
const GAME_DURATION_MS = 8000; // 8 sekund
const HIGHLIGHT_DURATION_MS = 2500; // 2.5 sekundy
const BALL_SIZE = 60;
const SPEED_RANGE = 3; // Prędkość od -3 do 3

interface Ball {
  id: number;
  x_pos: number;
  y_pos: number;
  x_speed: number;
  y_speed: number;
  isTarget: boolean;
}

type GameState = 'ready' | 'highlight' | 'moving' | 'finished' | 'results';

interface TrackerGameProps {
  onComplete?: (data: any) => void;
  onGoToCockpit?: () => void;
}

const TrackerGame = ({ onComplete, onGoToCockpit }: TrackerGameProps) => {
  const navigate = useNavigate();
  const { athleteId } = useParams();
  const [gameState, setGameState] = useState<GameState>('ready');
  const [balls, setBalls] = useState<Ball[]>([]);
  const [userGuesses, setUserGuesses] = useState<number[]>([]);
  const [finalScore, setFinalScore] = useState({ correct: 0, total: TARGET_BALLS });
  const [hrvInput, setHrvInput] = useState("");
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Funkcja inicjalizacji kulek
  const initializeBalls = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const newBalls: Ball[] = [];
    
    for (let i = 0; i < TOTAL_BALLS; i++) {
      newBalls.push({
        id: i,
        x_pos: Math.random() * (containerWidth - BALL_SIZE * 2) + BALL_SIZE,
        y_pos: Math.random() * (containerHeight - BALL_SIZE * 2) + BALL_SIZE,
        x_speed: (Math.random() - 0.5) * SPEED_RANGE * 2,
        y_speed: (Math.random() - 0.5) * SPEED_RANGE * 2,
        isTarget: false
      });
    }

    // Losowo wybierz 4 kulki jako cele
    const targetIndices = new Set<number>();
    while (targetIndices.size < TARGET_BALLS) {
      targetIndices.add(Math.floor(Math.random() * TOTAL_BALLS));
    }

    targetIndices.forEach(index => {
      newBalls[index].isTarget = true;
    });

    return newBalls;
  };

  // Start gry
  const handleStart = () => {
    setGameState('highlight');
    setUserGuesses([]);
    setFinalScore({ correct: 0, total: TARGET_BALLS });
    setHrvInput("");
  };

  // Inicjalizuj kulki gdy przejdziemy do stanu highlight
  useEffect(() => {
    if (gameState === 'highlight' && balls.length === 0) {
      const initializedBalls = initializeBalls();
      if (initializedBalls) {
        setBalls(initializedBalls);
      }
    }
  }, [gameState, balls.length]);

  // Faza highlight -> moving
  useEffect(() => {
    if (gameState === 'highlight') {
      const timer = setTimeout(() => {
        setGameState('moving');
      }, HIGHLIGHT_DURATION_MS);

      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Faza moving - animacja z kolizjami
  useEffect(() => {
    if (gameState !== 'moving' || !containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const startTime = Date.now();

    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      
      if (elapsedTime >= GAME_DURATION_MS) {
        setGameState('finished');
        return;
      }

      setBalls(prevBalls => {
        return prevBalls.map(ball => {
          let newX = ball.x_pos + ball.x_speed;
          let newY = ball.y_pos + ball.y_speed;
          let newSpeedX = ball.x_speed;
          let newSpeedY = ball.y_speed;

          // Kolizja ze ścianami - lewa i prawa
          if (newX <= BALL_SIZE / 2) {
            newX = BALL_SIZE / 2;
            newSpeedX = -newSpeedX;
          } else if (newX >= containerWidth - BALL_SIZE / 2) {
            newX = containerWidth - BALL_SIZE / 2;
            newSpeedX = -newSpeedX;
          }

          // Kolizja ze ścianami - góra i dół
          if (newY <= BALL_SIZE / 2) {
            newY = BALL_SIZE / 2;
            newSpeedY = -newSpeedY;
          } else if (newY >= containerHeight - BALL_SIZE / 2) {
            newY = containerHeight - BALL_SIZE / 2;
            newSpeedY = -newSpeedY;
          }

          return {
            ...ball,
            x_pos: newX,
            y_pos: newY,
            x_speed: newSpeedX,
            y_speed: newSpeedY
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

  // Obsługa kliknięcia kulki w fazie finished
  const handleBallClick = (ballId: number) => {
    if (gameState !== 'finished' || userGuesses.includes(ballId)) return;
    
    const newGuesses = [...userGuesses, ballId];
    setUserGuesses(newGuesses);

    // Jeśli użytkownik wybrał 4 kulki, przejdź do wyników
    if (newGuesses.length === TARGET_BALLS) {
      // Oblicz wynik
      const correctGuesses = newGuesses.filter(guessId => {
        const ball = balls.find(b => b.id === guessId);
        return ball?.isTarget;
      }).length;

      setFinalScore({ correct: correctGuesses, total: TARGET_BALLS });
      setGameState('results');
    }
  };

  // Pobierz kolor kulki
  const getBallColor = (ball: Ball) => {
    if (gameState === 'highlight') {
      return ball.isTarget ? 'bg-green-400' : 'bg-slate-400';
    }
    
    if (gameState === 'moving') {
      return 'bg-white';
    }

    if (gameState === 'finished') {
      if (userGuesses.includes(ball.id)) {
        return ball.isTarget ? 'bg-green-500' : 'bg-red-500';
      }
      return 'bg-white';
    }

    return 'bg-white';
  };

  // Walidacja i zapisanie
  const handleSaveAndContinue = () => {
    if (!hrvInput || isNaN(Number(hrvInput))) return;

    const gameData = {
      type: 'sigma-tracker',
      score: finalScore.correct,
      total: finalScore.total,
      accuracy: (finalScore.correct / finalScore.total) * 100,
      hrv: Number(hrvInput),
      timestamp: new Date().toISOString()
    };

    if (onComplete) {
      onComplete(gameData);
    } else {
      console.log('Tracker game completed:', gameData);
      navigate('/');
    }
  };

  const handleGoToCockpitClick = () => {
    if (onGoToCockpit) {
      onGoToCockpit();
    } else {
      navigate('/');
    }
  };

  // Ekran ready
  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-slate-800 border-slate-700">
          <CardContent className="pt-6 space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">
                Wyzwanie Sigma Tracker
              </h1>
              <p className="text-slate-300 text-lg mb-8">
                Śledź 4 podświetlone kule. Test potrwa 8 sekund.
              </p>
              
              <div className="bg-slate-700/50 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold text-white mb-3">Instrukcje:</h3>
                <ol className="space-y-2 text-slate-300">
                  <li>1. Zapamiętaj 4 zielone kulki (2.5 sekundy)</li>
                  <li>2. Śledź je wzrokiem przez 8 sekund ruchu</li>
                  <li>3. Po zatrzymaniu, kliknij 4 kulki, które były celami</li>
                </ol>
              </div>

              <Button 
                onClick={handleStart}
                size="lg"
                className="w-full max-w-md bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Start
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ekran wyników
  if (gameState === 'results') {
    const accuracy = Math.round((finalScore.correct / finalScore.total) * 100);
    const isValid = hrvInput && !isNaN(Number(hrvInput)) && Number(hrvInput) > 0;

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-slate-800 border-slate-700">
          <CardContent className="pt-6 space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-6">
                Wynik wyzwania Sigma Tracker
              </h2>

              <div className="bg-slate-700/50 rounded-lg p-8 mb-6">
                <p className="text-slate-300 mb-2">Twój Wynik</p>
                <p className="text-5xl font-bold text-white mb-2">
                  {finalScore.correct} / {finalScore.total}
                </p>
                <p className="text-xl text-slate-400">
                  Dokładność: {accuracy}%
                </p>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-6 mb-6 text-left">
                <Label htmlFor="hrv" className="text-white font-semibold mb-2 block">
                  Powiązany pomiar HRV (ms)
                </Label>
                <Input
                  id="hrv"
                  type="number"
                  value={hrvInput}
                  onChange={(e) => setHrvInput(e.target.value)}
                  placeholder="Wprowadź wartość HRV w milisekundach"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  onClick={handleGoToCockpitClick}
                  className="flex-1 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  Powrót do Kokpitu
                </Button>
                <Button 
                  onClick={handleSaveAndContinue}
                  disabled={!isValid}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Następne Wyzwanie
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ekran gry (highlight, moving, finished)
  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Header z instrukcją */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-slate-800/90 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={handleGoToCockpitClick}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>
          
          <div className="text-center">
            {gameState === 'highlight' && (
              <p className="text-white font-semibold">Zapamiętaj zielone kulki...</p>
            )}
            {gameState === 'moving' && (
              <p className="text-white font-semibold">Śledź wzrokiem!</p>
            )}
            {gameState === 'finished' && (
              <p className="text-white font-semibold">
                Kliknij 4 kulki, które były celami ({userGuesses.length}/{TARGET_BALLS})
              </p>
            )}
          </div>

          <div className="w-24"></div>
        </div>
      </div>

      {/* Obszar gry */}
      <div 
        ref={containerRef}
        className="absolute inset-0 top-16"
      >
        {balls.map(ball => (
          <div
            key={ball.id}
            onClick={() => handleBallClick(ball.id)}
            className={`
              absolute rounded-full transition-colors duration-200
              ${getBallColor(ball)}
              ${gameState === 'finished' && !userGuesses.includes(ball.id) ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
              ${userGuesses.includes(ball.id) ? 'ring-4 ring-white' : ''}
            `}
            style={{
              width: `${BALL_SIZE}px`,
              height: `${BALL_SIZE}px`,
              left: `${ball.x_pos - BALL_SIZE / 2}px`,
              top: `${ball.y_pos - BALL_SIZE / 2}px`,
              transform: 'translate(0, 0)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TrackerGame;
