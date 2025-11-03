import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

type GameState = "start" | "playing" | "finished";
type Symbol = "O" | "X" | null;

const ControlGame = () => {
  const navigate = useNavigate();
  const { athleteId } = useParams();
  const [gameState, setGameState] = useState<GameState>("start");
  const [currentSymbol, setCurrentSymbol] = useState<Symbol>(null);
  const [correctHits, setCorrectHits] = useState<number>(0);
  const [falseAlarms, setFalseAlarms] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(120);

  useEffect(() => {
    if (gameState !== "playing") return;

    // Timer odliczający czas gry
    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setGameState("finished");
          setCurrentSymbol(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Pokazywanie symboli co 1.5s
    const symbolInterval = setInterval(() => {
      const random = Math.random();
      // 80% szans na O, 20% na X
      setCurrentSymbol(random < 0.8 ? "O" : "X");
    }, 1500);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(symbolInterval);
    };
  }, [gameState]);

  const initializeGame = () => {
    setGameState("playing");
    setCurrentSymbol(null);
    setCorrectHits(0);
    setFalseAlarms(0);
    setTimeLeft(120);
  };

  const handleSymbolClick = () => {
    if (!currentSymbol || gameState !== "playing") return;

    if (currentSymbol === "O") {
      setCorrectHits((prev) => prev + 1);
    } else if (currentSymbol === "X") {
      setFalseAlarms((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setGameState("start");
    setCurrentSymbol(null);
    setCorrectHits(0);
    setFalseAlarms(0);
    setTimeLeft(120);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <Button 
        variant="ghost" 
        className="text-white hover:bg-slate-800 mb-4"
        onClick={() => navigate(`/zawodnicy/${athleteId}?tab=dodaj-pomiar`)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Powrót do Dodaj pomiar
      </Button>
      
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
        {gameState === "start" && (
        <Card className="max-w-md w-full border-slate-700 bg-slate-800 animate-scale-in">
          <CardContent className="pt-6 text-center space-y-6">
            <h1 className="text-3xl font-bold text-white mb-2">Control</h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Klikaj na <span className="text-green-500 font-semibold">ZIELONE 'O'</span>.
              <br />
              NIE KLIKAJ na <span className="text-red-500 font-semibold">CZERWONE 'X'</span>.
              <br />
              Test potrwa 2 minuty.
            </p>
            <Button 
              size="lg" 
              className="w-full text-lg"
              onClick={initializeGame}
            >
              Start
            </Button>
          </CardContent>
        </Card>
      )}

      {gameState === "playing" && (
        <div className="w-full max-w-4xl animate-fade-in text-center">
          <div className="mb-8">
            <p className="text-white text-2xl font-semibold">
              Pozostały czas: {formatTime(timeLeft)}
            </p>
          </div>
          
          <div 
            className="min-h-[400px] flex items-center justify-center cursor-pointer"
            onClick={handleSymbolClick}
          >
            {currentSymbol === "O" && (
              <div className="text-green-500 text-[200px] font-bold animate-scale-in">
                O
              </div>
            )}
            {currentSymbol === "X" && (
              <div className="text-red-500 text-[200px] font-bold animate-scale-in">
                X
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <Card className="border-slate-700 bg-slate-800">
              <CardContent className="pt-4 text-center">
                <p className="text-slate-400 text-sm">Poprawne trafienia</p>
                <p className="text-green-500 text-3xl font-bold">{correctHits}</p>
              </CardContent>
            </Card>
            <Card className="border-slate-700 bg-slate-800">
              <CardContent className="pt-4 text-center">
                <p className="text-slate-400 text-sm">Fałszywe alarmy</p>
                <p className="text-red-500 text-3xl font-bold">{falseAlarms}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {gameState === "finished" && (
        <Card className="max-w-md w-full border-slate-700 bg-slate-800 animate-scale-in">
          <CardContent className="pt-6 text-center space-y-6">
            <h2 className="text-2xl font-bold text-white">Wyniki!</h2>
            <div className="space-y-6 py-4">
              <div>
                <p className="text-slate-400 mb-2">Poprawne trafienia:</p>
                <p className="text-4xl font-bold text-green-500">{correctHits}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-2">Fałszywe alarmy:</p>
                <p className="text-4xl font-bold text-red-500">{falseAlarms}</p>
              </div>
            </div>
            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => {
                  console.log("Zapisz wyniki:", { correctHits, falseAlarms });
                }}
              >
                Zapisz Wynik
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="w-full"
                onClick={handleReset}
              >
                Zagraj Ponownie
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
};

export default ControlGame;
