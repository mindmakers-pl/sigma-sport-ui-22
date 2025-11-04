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
const BASE_SPEED = 1.5; // Bazowa prędkość

interface Ball {
  id: number;
  x_pos: number;
  y_pos: number;
  x_speed: number;
  y_speed: number;
  isTarget: boolean;
  size: number;
  zIndex: number;
}

type GameState = 'ready' | 'highlight' | 'moving' | 'finished' | 'level_complete' | 'retry' | 'final_results';

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
  const [level, setLevel] = useState(1);
  const [mistakes, setMistakes] = useState(0);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Funkcja inicjalizacji kulek z głębią 3D
  const initializeBalls = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const newBalls: Ball[] = [];
    
    // Prędkość zależna od poziomu
    const currentSpeed = BASE_SPEED + (level * 0.3);
    
    for (let i = 0; i < TOTAL_BALLS; i++) {
      // Losowy rozmiar od 15px do 30px (symulacja głębi)
      const size = Math.random() * 15 + 15; // 15-30px
      
      // Prędkość zależna od rozmiaru (większe = szybsze, mniejsze = wolniejsze)
      const speedMultiplier = (size / 30) * currentSpeed;
      
      // Z-index zależny od rozmiaru (większe kulki na pierwszym planie)
      const zIndex = Math.round(size);
      
      newBalls.push({
        id: i,
        x_pos: Math.random() * (containerWidth - size * 2) + size,
        y_pos: Math.random() * (containerHeight - size * 2) + size,
        x_speed: (Math.random() - 0.5) * speedMultiplier * 2,
        y_speed: (Math.random() - 0.5) * speedMultiplier * 2,
        isTarget: false,
        size,
        zIndex
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
    setLevel(1);
    setMistakes(0);
    setBalls([]);
  };

  // Uruchom następną próbę (po poziomie lub błędzie)
  const runNextTrial = () => {
    setGameState('highlight');
    setUserGuesses([]);
    setFinalScore({ correct: 0, total: TARGET_BALLS });
    setBalls([]);
  };

  // Inicjalizuj kulki gdy przejdziemy do stanu highlight
  useEffect(() => {
    if (gameState === 'highlight' && balls.length === 0) {
      const initializedBalls = initializeBalls();
      if (initializedBalls) {
        setBalls(initializedBalls);
      }
    }
  }, [gameState, balls.length, level]);

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
          if (newX <= ball.size / 2) {
            newX = ball.size / 2;
            newSpeedX = -newSpeedX;
          } else if (newX >= containerWidth - ball.size / 2) {
            newX = containerWidth - ball.size / 2;
            newSpeedX = -newSpeedX;
          }

          // Kolizja ze ścianami - góra i dół
          if (newY <= ball.size / 2) {
            newY = ball.size / 2;
            newSpeedY = -newSpeedY;
          } else if (newY >= containerHeight - ball.size / 2) {
            newY = containerHeight - ball.size / 2;
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

    // Jeśli użytkownik wybrał 4 kulki, oceń wynik
    if (newGuesses.length === TARGET_BALLS) {
      // Oblicz wynik
      const correctGuesses = newGuesses.filter(guessId => {
        const ball = balls.find(b => b.id === guessId);
        return ball?.isTarget;
      }).length;

      setFinalScore({ correct: correctGuesses, total: TARGET_BALLS });
      
      // Logika Staircase
      if (correctGuesses === TARGET_BALLS) {
        // Perfekcyjny wynik - następny poziom
        setGameState('level_complete');
        setTimeout(() => {
          setLevel(prev => prev + 1);
          runNextTrial();
        }, 2000);
      } else {
        // Błąd
        if (mistakes === 0) {
          // Pierwszy błąd - powtórz poziom
          setMistakes(1);
          setGameState('retry');
          setTimeout(() => {
            runNextTrial();
          }, 2000);
        } else {
          // Drugi błąd - koniec gry
          setGameState('final_results');
        }
      }
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

  // Pobierz opacity kulki (efekt głębi)
  const getBallOpacity = (ball: Ball) => {
    // Mniejsze kulki (dalej) = mniej przezroczyste
    const opacity = (ball.size - 15) / 15; // 0-1 range
    if (opacity < 0.5) return 'opacity-70';
    return 'opacity-100';
  };

  // Walidacja i zapisanie
  const handleSaveAndContinue = () => {
    if (!hrvInput || isNaN(Number(hrvInput))) return;

    const gameData = {
      type: 'sigma-tracker',
      level: mistakes === 0 ? level : level - 1, // Osiągnięty poziom
      maxLevel: mistakes === 0 ? level : level - 1,
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
              <p className="text-slate-300 text-lg mb-2">
                Test śledzenia wielu obiektów (Multiple Object Tracking)
              </p>
              <p className="text-slate-400 text-sm mb-8">
                Tryb Pomiarowy - Staircase (do błędu)
              </p>
              
              <div className="bg-slate-700/50 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold text-white mb-3">Instrukcje:</h3>
                <ol className="space-y-2 text-slate-300">
                  <li>1. Zapamiętaj 4 zielone kulki (2.5 sekundy)</li>
                  <li>2. Śledź je wzrokiem przez 8 sekund ruchu</li>
                  <li>3. Po zatrzymaniu, kliknij 4 kulki, które były celami</li>
                  <li>4. Gra przyśpiesza z każdym poziomem - graj do błędu!</li>
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

  // Ekran przejściowy - poziom ukończony
  if (gameState === 'level_complete') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-slate-800 border-slate-700">
          <CardContent className="pt-6 space-y-6">
            <div className="text-center animate-fade-in">
              <h2 className="text-4xl font-bold text-green-400 mb-4">
                Poziom {level} ukończony!
              </h2>
              <p className="text-2xl text-white mb-2">
                Wynik: {finalScore.correct}/{finalScore.total}
              </p>
              <p className="text-xl text-slate-300">
                Przygotuj się na szybszy poziom...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ekran przejściowy - powtórz poziom
  if (gameState === 'retry') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-slate-800 border-slate-700">
          <CardContent className="pt-6 space-y-6">
            <div className="text-center animate-fade-in">
              <h2 className="text-4xl font-bold text-orange-400 mb-4">
                Pierwszy błąd
              </h2>
              <p className="text-2xl text-white mb-2">
                Wynik: {finalScore.correct}/{finalScore.total}
              </p>
              <p className="text-xl text-slate-300">
                Spróbuj jeszcze raz na tym samym poziomie...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ekran wyników końcowych
  if (gameState === 'final_results') {
    const achievedLevel = level - 1;
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
                <p className="text-slate-300 mb-2">Osiągnięty Poziom</p>
                <p className="text-5xl font-bold text-white mb-2">
                  Poziom {achievedLevel}
                </p>
                <p className="text-xl text-slate-400">
                  Ostatni wynik: {finalScore.correct}/{finalScore.total}
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
            className="text-slate-300 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>
          
          <div className="text-center">
            {gameState === 'highlight' && (
              <div>
                <p className="text-white font-semibold text-lg">Zapamiętaj zielone kulki...</p>
                <p className="text-slate-400 text-sm mt-1">Poziom {level}</p>
              </div>
            )}
            {gameState === 'moving' && (
              <div>
                <p className="text-white font-semibold text-lg">Śledź wzrokiem!</p>
                <p className="text-slate-400 text-sm mt-1">Poziom {level}</p>
              </div>
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
              ${getBallOpacity(ball)}
              ${gameState === 'finished' && !userGuesses.includes(ball.id) ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
              ${userGuesses.includes(ball.id) ? 'ring-4 ring-white' : ''}
            `}
            style={{
              width: `${ball.size}px`,
              height: `${ball.size}px`,
              left: `${ball.x_pos - ball.size / 2}px`,
              top: `${ball.y_pos - ball.size / 2}px`,
              zIndex: ball.zIndex,
              transform: 'translate(0, 0)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TrackerGame;
