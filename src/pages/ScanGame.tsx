import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

type GameState = "ready" | "playing" | "transition" | "finished";
type Shape = "circle" | "square" | "triangle" | "diamond" | "hexagon";
type Color = "black" | "gray" | "white" | "emerald" | "violet";

interface GridItem {
  shape: Shape;
  color: Color;
  isTarget: boolean;
}

const MAX_TRIALS = 10;

interface ScanGameProps {
  onComplete?: (taskName: string, result: any) => void;
}

const ScanGame = ({ onComplete }: ScanGameProps) => {
  const navigate = useNavigate();
  const { athleteId } = useParams();
  const [gameState, setGameState] = useState<GameState>("ready");
  const [currentTrial, setCurrentTrial] = useState<number>(1);
  const [resultsList, setResultsList] = useState<number[]>([]);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [grid, setGrid] = useState<GridItem[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);

  const setupTrial = () => {
    const shapes: Shape[] = ["circle", "square", "triangle", "diamond", "hexagon"];
    const colors: Color[] = ["black", "gray", "white", "emerald", "violet"];
    
    // Stwórz tablicę 100 elementów z dystraktorami
    const newGrid: GridItem[] = Array(100).fill(null).map(() => {
      let shape: Shape;
      let color: Color;
      
      // Losuj kształt i kolor, ale wykluczaj kombinację circle + emerald
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

    // Losowa pozycja dla celu (Zielone Koło)
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
      // Kliknięto cel (Zielone Koło)
      const reactionTime = Date.now() - startTime;
      setResultsList(prev => [...prev, reactionTime]);
      
      const nextTrial = currentTrial + 1;
      setCurrentTrial(nextTrial);
      
      if (nextTrial > MAX_TRIALS) {
        setGameState("finished");
        console.log("Gra zakończona - zapisano wynik automatycznie");
      } else {
        // Przejście do ciemnego ekranu między próbami
        setGameState("transition");
        const transitionTime = Math.random() * 2500 + 500; // 500-3000ms
        setTimeout(() => {
          setupTrial();
        }, transitionTime);
      }
    } else {
      // Kliknięto dystraktor
      setErrorCount(prev => prev + 1);
    }
  };

  const getShapeClass = (item: GridItem) => {
    const colorMap = {
      black: "bg-slate-900",
      gray: "bg-slate-500",
      white: "bg-white border border-slate-400",
      emerald: "bg-emerald-300",
      violet: "bg-violet-50 border border-violet-200",
    };

    const baseClass = "w-[85%] h-[85%] transition-transform duration-150";
    const colorClass = colorMap[item.color];

    switch (item.shape) {
      case "circle":
        return `${baseClass} ${colorClass} rounded-full`;
      case "square":
        return `${baseClass} ${colorClass}`;
      case "triangle":
        return `${baseClass} ${colorClass} clip-triangle`;
      case "diamond":
        return `${baseClass} ${colorClass} rotate-45`;
      case "hexagon":
        return `${baseClass} ${colorClass} clip-hexagon`;
      default:
        return `${baseClass} ${colorClass}`;
    }
  };

  const calculateStats = () => {
    if (resultsList.length === 0) return { average: 0, median: 0, accuracy: 0 };

    const average = Math.round(resultsList.reduce((a, b) => a + b, 0) / resultsList.length);
    
    const sorted = [...resultsList].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? Math.round((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2)
      : sorted[Math.floor(sorted.length / 2)];
    
    const accuracy = Math.round(((MAX_TRIALS / (MAX_TRIALS + errorCount)) * 100));

    return { average, median, accuracy };
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <Button 
        variant="ghost" 
        className="text-white hover:bg-slate-800 mb-4"
        onClick={() => {
          if (onComplete) {
            onComplete('scan', {
              average: calculateStats().average,
              median: calculateStats().median,
              accuracy: calculateStats().accuracy,
              errors: errorCount,
              results: resultsList
            });
          } else {
            navigate(`/zawodnicy/${athleteId}?tab=dodaj-pomiar`);
          }
        }}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Powrót do Dodaj pomiar
      </Button>
      
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
        {gameState === "ready" && (
          <Card className="max-w-md w-full border-slate-700 bg-slate-800 animate-scale-in">
            <CardContent className="pt-6 text-center space-y-6">
              <h1 className="text-3xl font-bold text-white mb-2">Scan</h1>
              <p className="text-lg text-slate-300 leading-relaxed">
                Znajdź <span className="text-green-500 font-semibold">Zielone Koło</span> tak szybko, jak potrafisz
              </p>
              <p className="text-sm text-slate-400">
                Przeprowadzisz {MAX_TRIALS} prób
              </p>
              <Button 
                size="lg" 
                className="w-full text-lg"
                onClick={handleStartGame}
              >
                Start
              </Button>
            </CardContent>
          </Card>
        )}

        {gameState === "playing" && (
          <div className="w-full max-w-4xl animate-fade-in">
            <div className="mb-4 text-center">
              <p className="text-white text-xl font-semibold">
                Próba {currentTrial} / {MAX_TRIALS}
              </p>
            </div>
            <div className="grid grid-cols-10 gap-3 bg-slate-800 p-6 rounded-lg">
              {grid.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleClick(item.isTarget)}
                  className="aspect-square hover:scale-110 transition-transform duration-150 flex items-center justify-center"
                >
                  <div className={getShapeClass(item)} />
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === "transition" && (
          <div className="w-full max-w-4xl animate-fade-in">
            <div className="h-96 flex items-center justify-center">
              <div className="w-4 h-4 bg-slate-600 rounded-full animate-pulse" />
            </div>
          </div>
        )}

        {gameState === "finished" && (
          <Card className="max-w-md w-full border-slate-700 bg-slate-800 animate-scale-in">
            <CardContent className="pt-6 text-center space-y-6">
              <h2 className="text-2xl font-bold text-white">Wynik wyzwania Sigma Scan</h2>
              
              <div className="space-y-4 py-4">
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">Średni Czas Reakcji</p>
                  <p className="text-3xl font-bold text-primary">{calculateStats().average} ms</p>
                </div>
                
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">Mediana Czasu Reakcji</p>
                  <p className="text-3xl font-bold text-primary">{calculateStats().median} ms</p>
                </div>
                
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">Celność</p>
                  <p className="text-3xl font-bold text-green-500">{calculateStats().accuracy}%</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Błędy: {errorCount} / Próby: {MAX_TRIALS}
                  </p>
                </div>
              </div>

              <div className="pt-2 pb-2 border-t border-slate-700">
                <p className="text-green-400 text-sm">✓ Zapisaliśmy Twój wynik</p>
              </div>

              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => {
                    if (onComplete) {
                      onComplete('scan', {
                        average: calculateStats().average,
                        median: calculateStats().median,
                        accuracy: calculateStats().accuracy,
                        errors: errorCount,
                        results: resultsList
                      });
                    } else {
                      navigate(`/zawodnicy/${athleteId}?tab=dodaj-pomiar`);
                    }
                  }}
                >
                  Powrót
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full"
                  onClick={handleStartGame}
                >
                  Rozpocznij kolejny pomiar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ScanGame;
