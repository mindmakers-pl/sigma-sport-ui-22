import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

type GameState = "start" | "playing" | "finished";

const ScanGame = () => {
  const navigate = useNavigate();
  const { athleteId } = useParams();
  const [gameState, setGameState] = useState<GameState>("start");
  const [grid, setGrid] = useState<Array<{ type: "circle" | "square"; isTarget: boolean }>>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number>(0);

  const initializeGame = () => {
    // Stwórz tablicę 100 elementów
    const newGrid: Array<{ type: "circle" | "square"; isTarget: boolean }> = Array(100).fill(null).map(() => ({
      type: "circle",
      isTarget: false,
    }));

    // Losowa pozycja dla czerwonego kwadratu
    const targetIndex = Math.floor(Math.random() * 100);
    newGrid[targetIndex] = {
      type: "square",
      isTarget: true,
    };

    setGrid(newGrid);
    setStartTime(Date.now());
    setGameState("playing");
  };

  const handleItemClick = (isTarget: boolean) => {
    if (!isTarget || gameState !== "playing") return;

    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    setReactionTime(timeTaken);
    setGameState("finished");
  };

  const handleReset = () => {
    setGameState("start");
    setReactionTime(0);
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
            <h1 className="text-3xl font-bold text-white mb-2">Scan</h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Znajdź <span className="text-red-500 font-semibold">Czerwony Kwadrat</span> tak szybko, jak potrafisz
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
        <div className="w-full max-w-4xl animate-fade-in">
          <div className="grid grid-cols-10 gap-2 bg-slate-800 p-4 rounded-lg">
            {grid.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemClick(item.isTarget)}
                className="aspect-square hover:scale-110 transition-transform duration-150"
              >
                {item.type === "circle" ? (
                  <div className="w-full h-full rounded-full bg-slate-600 hover:bg-slate-500" />
                ) : (
                  <div className="w-full h-full bg-red-500 hover:bg-red-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === "finished" && (
        <Card className="max-w-md w-full border-slate-700 bg-slate-800 animate-scale-in">
          <CardContent className="pt-6 text-center space-y-6">
            <h2 className="text-2xl font-bold text-white">Wynik!</h2>
            <div className="py-8">
              <p className="text-slate-400 mb-2">Twój Czas:</p>
              <p className="text-5xl font-bold text-primary">{reactionTime} ms</p>
            </div>
            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => {
                  // Tutaj dodasz logikę zapisu
                  console.log("Zapisz wynik:", reactionTime);
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

export default ScanGame;
