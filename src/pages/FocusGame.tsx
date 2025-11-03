import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

type GameState = "ready" | "playing" | "finished";
type Color = "red" | "green" | "blue";
type Word = "CZERWONY" | "ZIELONY" | "NIEBIESKI";

interface Trial {
  word: Word;
  color: Color;
  type: "congruent" | "incongruent";
}

const FocusGame = () => {
  const navigate = useNavigate();
  const { athleteId } = useParams();
  const MAX_TRIALS = 20;
  
  const [gameState, setGameState] = useState<GameState>("ready");
  const [currentTrial, setCurrentTrial] = useState<Trial | null>(null);
  const [congruentTimes, setCongruentTimes] = useState<number[]>([]);
  const [incongruentTimes, setIncongruentTimes] = useState<number[]>([]);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [lastTrialStartTime, setLastTrialStartTime] = useState<number | null>(null);
  const [totalTrials, setTotalTrials] = useState<number>(0);

  const colors: Color[] = ["red", "green", "blue"];
  const words: Word[] = ["CZERWONY", "ZIELONY", "NIEBIESKI"];
  
  const colorMap: Record<Word, Color> = {
    "CZERWONY": "red",
    "ZIELONY": "green",
    "NIEBIESKI": "blue"
  };

  const colorStyles: Record<Color, string> = {
    red: "text-red-500",
    green: "text-green-500",
    blue: "text-blue-500"
  };

  const colorButtonStyles: Record<Color, string> = {
    red: "bg-red-500 hover:bg-red-600 text-white",
    green: "bg-green-500 hover:bg-green-600 text-white",
    blue: "bg-blue-500 hover:bg-blue-600 text-white"
  };

  const handleStartGame = () => {
    setCongruentTimes([]);
    setIncongruentTimes([]);
    setErrorCount(0);
    setTotalTrials(0);
    setGameState("playing");
    runNextTrial();
  };

  const runNextTrial = () => {
    if (totalTrials >= MAX_TRIALS) {
      endGame();
      return;
    }

    setTotalTrials((prev) => prev + 1);

    // Losuj słowo i kolor
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
      // Poprawne trafienie
      const rt = Date.now() - lastTrialStartTime;
      if (trialType === "congruent") {
        setCongruentTimes((prev) => [...prev, rt]);
      } else {
        setIncongruentTimes((prev) => [...prev, rt]);
      }
    } else {
      // Błąd
      setErrorCount((prev) => prev + 1);
    }

    // Ustaw pusty ekran i zaplanuj kolejną próbę
    setCurrentTrial(null);
    setTimeout(() => {
      runNextTrial();
    }, 500);
  };

  const endGame = () => {
    setGameState("finished");
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

  const calculateFocusScore = () => {
    return calculateAvgIncongruentTime() - calculateAvgCongruentTime();
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
        {gameState === "ready" && (
          <Card className="max-w-md w-full border-slate-700 bg-slate-800 animate-scale-in">
            <CardContent className="pt-6 text-center space-y-6">
              <h1 className="text-3xl font-bold text-white mb-2">Wyzwanie Sigma Focus</h1>
              <p className="text-lg text-slate-300 leading-relaxed">
                Wybierz przycisk odpowiadający <span className="font-semibold">KOLOROWI NAPISU</span>, ignorując znaczenie słowa. Wykonaj zadanie najszybciej jak potrafisz.
              </p>
              <p className="text-sm text-slate-400">
                Test składa się z {MAX_TRIALS} prób
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

        {gameState === "playing" && currentTrial && (
          <div className="w-full max-w-2xl animate-fade-in">
            <div className="text-center mb-8">
              <p className="text-white text-lg mb-2">
                Próba {totalTrials} / {MAX_TRIALS}
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-12 mb-8 text-center">
              <div className={`text-8xl font-bold ${colorStyles[currentTrial.color]} animate-scale-in`}>
                {currentTrial.word}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Button
                size="lg"
                className={`h-20 text-xl font-semibold ${colorButtonStyles.red}`}
                onClick={() => handleColorClick("red")}
              >
                Czerwony
              </Button>
              <Button
                size="lg"
                className={`h-20 text-xl font-semibold ${colorButtonStyles.green}`}
                onClick={() => handleColorClick("green")}
              >
                Zielony
              </Button>
              <Button
                size="lg"
                className={`h-20 text-xl font-semibold ${colorButtonStyles.blue}`}
                onClick={() => handleColorClick("blue")}
              >
                Niebieski
              </Button>
            </div>
          </div>
        )}

        {gameState === "playing" && !currentTrial && (
          <div className="w-full max-w-2xl">
            <div className="bg-slate-800 rounded-lg p-12 text-center">
              <div className="text-4xl text-slate-500">...</div>
            </div>
          </div>
        )}

        {gameState === "finished" && (
          <div className="w-full max-w-4xl space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Wyniki Testu Focus</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Średni Czas Reakcji Zgodne */}
              <Card className="border-slate-700 bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-300">Średni Czas Reakcji (Zgodne)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    {calculateAvgCongruentTime()} ms
                  </div>
                  <p className="text-sm text-slate-400">
                    Próby gdzie słowo i kolor są zgodne
                  </p>
                </CardContent>
              </Card>

              {/* Średni Czas Reakcji Konflikt */}
              <Card className="border-slate-700 bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-300">Średni Czas Reakcji (Konflikt)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-yellow-400 mb-2">
                    {calculateAvgIncongruentTime()} ms
                  </div>
                  <p className="text-sm text-slate-400">
                    Próby gdzie słowo i kolor są niezgodne
                  </p>
                </CardContent>
              </Card>

              {/* Wynik Focus (Efekt Interferencji) */}
              <Card className="border-slate-700 bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-300">Wynik Focus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-orange-400 mb-2">
                    +{calculateFocusScore()} ms
                  </div>
                  <p className="text-sm text-slate-400">
                    Efekt interferencji (różnica czasów)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Błędy */}
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle className="text-lg text-slate-300">Liczba Błędów</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-red-400">
                  {errorCount}
                </div>
                <p className="text-sm text-slate-400 mt-2">
                  Nieprawidłowe odpowiedzi w trakcie testu
                </p>
              </CardContent>
            </Card>

            {/* Przyciski */}
            <div className="flex gap-4 justify-between pt-4">
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate(`/zawodnicy/${athleteId}?tab=dodaj-pomiar`)}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Powrót
              </Button>
              <Button 
                size="lg"
                onClick={() => navigate(`/scan/${athleteId}`)}
                className="flex-1"
              >
                Następne wyzwanie
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusGame;
