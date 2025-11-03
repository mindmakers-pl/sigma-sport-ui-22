import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

type GameState = "start" | "playing" | "finished";
type Color = "red" | "green" | "blue";
type Word = "CZERWONY" | "ZIELONY" | "NIEBIESKI";

interface Trial {
  word: Word;
  color: Color;
  isCongruent: boolean;
}

interface Result {
  correct: boolean;
  reactionTime: number;
  isCongruent: boolean;
}

const FocusGame = () => {
  const navigate = useNavigate();
  const { athleteId } = useParams();
  const [gameState, setGameState] = useState<GameState>("start");
  const [currentTrial, setCurrentTrial] = useState<Trial | null>(null);
  const [trialCount, setTrialCount] = useState<number>(0);
  const [results, setResults] = useState<Result[]>([]);
  const [trialStartTime, setTrialStartTime] = useState<number>(0);

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

  const generateTrial = (): Trial => {
    const word = words[Math.floor(Math.random() * words.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const isCongruent = colorMap[word] === color;
    
    return { word, color, isCongruent };
  };

  const startGame = () => {
    setGameState("playing");
    setTrialCount(0);
    setResults([]);
    startNewTrial();
  };

  const startNewTrial = () => {
    const trial = generateTrial();
    setCurrentTrial(trial);
    setTrialStartTime(Date.now());
  };

  const handleColorClick = (selectedColor: Color) => {
    if (!currentTrial || gameState !== "playing") return;

    const reactionTime = Date.now() - trialStartTime;
    const correct = selectedColor === currentTrial.color;

    const result: Result = {
      correct,
      reactionTime,
      isCongruent: currentTrial.isCongruent
    };

    setResults([...results, result]);
    setTrialCount(trialCount + 1);

    if (trialCount + 1 >= 20) {
      setGameState("finished");
      setCurrentTrial(null);
    } else {
      startNewTrial();
    }
  };

  const calculateStats = () => {
    const correctResults = results.filter(r => r.correct);
    const congruentResults = results.filter(r => r.isCongruent);
    const incongruentResults = results.filter(r => !r.isCongruent);
    
    const congruentCorrect = congruentResults.filter(r => r.correct);
    const incongruentCorrect = incongruentResults.filter(r => r.correct);

    const avgCongruentTime = congruentCorrect.length > 0
      ? Math.round(congruentCorrect.reduce((sum, r) => sum + r.reactionTime, 0) / congruentCorrect.length)
      : 0;

    const avgIncongruentTime = incongruentCorrect.length > 0
      ? Math.round(incongruentCorrect.reduce((sum, r) => sum + r.reactionTime, 0) / incongruentCorrect.length)
      : 0;

    return {
      totalCorrect: correctResults.length,
      accuracy: Math.round((correctResults.length / results.length) * 100),
      avgCongruentTime,
      avgIncongruentTime,
      stroopEffect: avgIncongruentTime - avgCongruentTime
    };
  };

  const handleReset = () => {
    setGameState("start");
    setCurrentTrial(null);
    setTrialCount(0);
    setResults([]);
  };

  const stats = gameState === "finished" ? calculateStats() : null;

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
              <h1 className="text-3xl font-bold text-white mb-2">Focus</h1>
              <p className="text-lg text-slate-300 leading-relaxed">
                Kliknij przycisk odpowiadający <span className="font-semibold">KOLOROWI czcionki</span>, nie znaczeniu słowa.
              </p>
              <p className="text-sm text-slate-400">
                Test składa się z 20 prób
              </p>
              <Button 
                size="lg" 
                className="w-full text-lg"
                onClick={startGame}
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
                Próba {trialCount + 1} / 20
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

        {gameState === "finished" && stats && (
          <Card className="max-w-md w-full border-slate-700 bg-slate-800 animate-scale-in">
            <CardContent className="pt-6 text-center space-y-6">
              <h2 className="text-2xl font-bold text-white">Wyniki!</h2>
              <div className="space-y-4 py-4">
                <div>
                  <p className="text-slate-400 mb-2">Poprawne odpowiedzi:</p>
                  <p className="text-4xl font-bold text-primary">{stats.totalCorrect} / 20</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-2">Dokładność:</p>
                  <p className="text-3xl font-bold text-green-500">{stats.accuracy}%</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-1">Próby zgodne:</p>
                    <p className="text-2xl font-bold text-white">{stats.avgCongruentTime} ms</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-1">Próby niezgodne:</p>
                    <p className="text-2xl font-bold text-yellow-500">{stats.avgIncongruentTime} ms</p>
                  </div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Efekt Stroopa:</p>
                  <p className="text-2xl font-bold text-orange-500">+{stats.stroopEffect} ms</p>
                </div>
              </div>
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => {
                    console.log("Zapisz wyniki:", stats);
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

export default FocusGame;
