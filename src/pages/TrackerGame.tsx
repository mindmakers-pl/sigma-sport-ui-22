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
const CONTAINER_SIZE = 600; // Rozmiar kontenera gry (600x600px)
const Z_MIN = 0;
const Z_MAX = 100;

interface Ball {
  id: number;
  x_pos: number;
  y_pos: number;
  z_pos: number;
  x_speed: number;
  y_speed: number;
  z_speed: number;
  isTarget: boolean;
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
    const newBalls: Ball[] = [];
    
    // Prędkość zależna od poziomu (Staircase)
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

  // Faza moving - animacja z kolizjami 3D
  useEffect(() => {
    if (gameState !== 'moving') return;
    
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
          let newZ = ball.z_pos + ball.z_speed;
          let newSpeedX = ball.x_speed;
          let newSpeedY = ball.y_speed;
          let newSpeedZ = ball.z_speed;

          // Kolizja ze ścianami - lewa i prawa (X)
          if (newX <= 0 || newX >= CONTAINER_SIZE) {
            newSpeedX = -newSpeedX;
            newX = newX <= 0 ? 0 : CONTAINER_SIZE;
          }

          // Kolizja ze ścianami - góra i dół (Y)
          if (newY <= 0 || newY >= CONTAINER_SIZE) {
            newSpeedY = -newSpeedY;
            newY = newY <= 0 ? 0 : CONTAINER_SIZE;
          }

          // Kolizja ze ścianami - tył i przód (Z) - NOWA LOGIKA 3D
          if (newZ <= Z_MIN || newZ >= Z_MAX) {
            newSpeedZ = -newSpeedZ;
            newZ = newZ <= Z_MIN ? Z_MIN : Z_MAX;
          }

          return {
            ...ball,
            x_pos: newX,
            y_pos: newY,
            z_pos: newZ,
            x_speed: newSpeedX,
            y_speed: newSpeedY,
            z_speed: newSpeedZ
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
      return 'bg-green-400';
    }

    if (gameState === 'finished') {
      if (userGuesses.includes(ball.id)) {
        return ball.isTarget ? 'bg-green-500' : 'bg-red-500';
      }
      return 'bg-green-400';
    }

    return 'bg-green-400';
  };

  // Oblicz skalę kulki na podstawie z_pos (symulacja 3D)
  const getBallScale = (ball: Ball) => {
    return 0.5 + (ball.z_pos / Z_MAX) * 0.5; // 0.5 do 1.0
  };

  // Oblicz z-index kulki na podstawie z_pos
  const getBallZIndex = (ball: Ball) => {
    return Math.round(ball.z_pos);
  };

  // Oblicz blur na podstawie z_pos (dalsze kulki bardziej rozmyte)
  const getBallBlur = (ball: Ball) => {
    const blurAmount = ((Z_MAX - ball.z_pos) / Z_MAX) * 3; // 0 do 3px
    return blurAmount;
  };

  // Oblicz intensywność glow na podstawie z_pos
  const getBallGlow = (ball: Ball) => {
    const intensity = (ball.z_pos / Z_MAX); // 0 do 1
    return intensity;
  };

  // Oblicz aktualne tempo
  const getCurrentSpeed = () => {
    return BASE_SPEED + (level * 0.3);
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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Header z instrukcją */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-slate-800/90 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleGoToCockpitClick}
              className="text-white hover:text-white hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Powrót
            </Button>
            
            {/* Wskaźnik tempa */}
            <div className="text-left">
              <p className="text-xs text-green-400 font-mono">CURRENT SPEED: {getCurrentSpeed().toFixed(1)}</p>
            </div>
          </div>
          
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

          <div className="w-32"></div>
        </div>
      </div>

      {/* Kontener gry 600x600px */}
      <div 
        ref={containerRef}
        className="relative"
        style={{
          width: `${CONTAINER_SIZE}px`,
          height: `${CONTAINER_SIZE}px`,
        }}
      >
        {/* Wireframe sześcianu 3D (tło, z-index: 0) */}
        <svg
          className="absolute inset-0"
          style={{ zIndex: 0 }}
          width={CONTAINER_SIZE}
          height={CONTAINER_SIZE}
          viewBox={`0 0 ${CONTAINER_SIZE} ${CONTAINER_SIZE}`}
        >
          {/* Tylna ściana (z = 0) */}
          <rect
            x="100"
            y="100"
            width="400"
            height="400"
            fill="none"
            stroke="#374151"
            strokeWidth="1"
          />
          {/* Przednia ściana (z = 100) */}
          <rect
            x="0"
            y="0"
            width={CONTAINER_SIZE}
            height={CONTAINER_SIZE}
            fill="none"
            stroke="#374151"
            strokeWidth="2"
          />
          {/* Linie łączące (perspektywa) */}
          <line x1="0" y1="0" x2="100" y2="100" stroke="#374151" strokeWidth="1" />
          <line x1={CONTAINER_SIZE} y1="0" x2="500" y2="100" stroke="#374151" strokeWidth="1" />
          <line x1="0" y1={CONTAINER_SIZE} x2="100" y2="500" stroke="#374151" strokeWidth="1" />
          <line x1={CONTAINER_SIZE} y1={CONTAINER_SIZE} x2="500" y2="500" stroke="#374151" strokeWidth="1" />
        </svg>

        {/* Kulki */}
        {balls.map(ball => {
          const scale = getBallScale(ball);
          const zIndex = getBallZIndex(ball);
          const blur = getBallBlur(ball);
          const glow = getBallGlow(ball);
          const baseSize = 30; // Bazowy rozmiar kulki

          return (
            <div
              key={ball.id}
              onClick={() => handleBallClick(ball.id)}
              className={`
                absolute rounded-full transition-colors duration-200
                ${getBallColor(ball)}
                ${gameState === 'finished' && !userGuesses.includes(ball.id) ? 'cursor-pointer' : ''}
                ${userGuesses.includes(ball.id) ? 'ring-4 ring-white' : ''}
              `}
              style={{
                width: `${baseSize}px`,
                height: `${baseSize}px`,
                left: `${ball.x_pos}px`,
                top: `${ball.y_pos}px`,
                transform: `translate(-50%, -50%) scale(${scale})`,
                zIndex: zIndex,
                filter: `blur(${blur}px)`,
                boxShadow: `
                  0 0 ${20 * glow}px ${10 * glow}px rgba(34, 197, 94, ${0.4 * glow}),
                  0 0 ${40 * glow}px ${20 * glow}px rgba(34, 197, 94, ${0.3 * glow}),
                  0 0 ${60 * glow}px ${30 * glow}px rgba(34, 197, 94, ${0.2 * glow}),
                  inset 0 0 ${10 * glow}px rgba(255, 255, 255, ${0.3 * glow})
                `,
                background: `radial-gradient(circle at 30% 30%, rgba(134, 239, 172, ${0.9 * glow}), rgb(34, 197, 94))`,
              }}
            />
          );
        })}
      </div>

      {/* Kropki poziomu pod kontenerem */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {Array.from({ length: Math.max(level, 10) }).map((_, idx) => (
          <div
            key={idx}
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${idx < level ? 'bg-green-400 scale-110' : 'bg-slate-700'}
            `}
            style={{
              boxShadow: idx < level ? '0 0 8px 2px rgba(34, 197, 94, 0.5)' : 'none'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TrackerGame;
