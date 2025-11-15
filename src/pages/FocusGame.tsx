import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useFocusGame, colorStyles, colorButtonStyles } from "@/hooks/useFocusGame";

interface FocusGameProps {
  onComplete?: (data: any) => void;
  onGoToCockpit?: () => void;
}

const FocusGame = ({ onComplete, onGoToCockpit }: FocusGameProps) => {
  const navigate = useNavigate();
  const { athleteId } = useParams();
  
  const {
    gameState,
    currentTrial,
    totalTrials,
    errorCount,
    manualHRV,
    setManualHRV,
    handleStartGame,
    handleColorClick,
    calculateAvgCongruentTime,
    calculateAvgIncongruentTime,
    calculateInterferenceEffect,
  } = useFocusGame();

  const MAX_TRIALS = 20;

  const handleSaveAndContinue = () => {
    const finalPayload = {
      gameData: {
        avgCongruent: calculateAvgCongruentTime(),
        avgIncongruent: calculateAvgIncongruentTime(),
        focusScore: calculateInterferenceEffect(),
        errorCount,
      },
      hrvData: manualHRV
    };
    
    if (onComplete) {
      onComplete(finalPayload);
    } else {
      navigate(`/zawodnicy/${athleteId}?tab=dodaj-pomiar`);
    }
  };

  const handleGoBackToCockpit = () => {
    if (onGoToCockpit) {
      onGoToCockpit();
    } else {
      navigate(`/zawodnicy/${athleteId}?tab=dodaj-pomiar`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      {!onComplete && (
        <Button variant="ghost" className="text-white hover:bg-slate-800 mb-4" onClick={() => navigate(`/zawodnicy/${athleteId}?tab=dodaj-pomiar`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót
        </Button>
      )}
      
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
        {gameState === "ready" && (
          <Card className="max-w-md w-full border-slate-700 bg-slate-800 animate-scale-in">
            <CardContent className="pt-6 text-center space-y-6">
              <h1 className="text-3xl font-bold text-white mb-2">Wyzwanie Sigma Focus</h1>
              <p className="text-lg text-slate-300 leading-relaxed">
                Wybierz przycisk odpowiadający <span className="font-semibold">KOLOROWI NAPISU</span>, ignorując znaczenie słowa. Wykonaj zadanie najszybciej jak potrafisz.
              </p>
              <p className="text-sm text-slate-400">Wyzwanie</p>
              <Button size="lg" className="w-full text-lg" onClick={handleStartGame}>Start</Button>
            </CardContent>
          </Card>
        )}

        {gameState === "playing" && currentTrial && (
          <div className="w-full max-w-2xl animate-fade-in">
            <div className="text-center mb-8">
              <p className="text-white text-lg mb-2">Próba {totalTrials} / {MAX_TRIALS}</p>
            </div>

            <div className="bg-slate-800 rounded-lg p-12 mb-8 text-center">
              <div className={`text-8xl font-bold ${colorStyles[currentTrial.color]} animate-scale-in`}>
                {currentTrial.word}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Button size="lg" className={`h-20 text-xl font-semibold ${colorButtonStyles.red}`} onClick={() => handleColorClick("red")}>Czerwony</Button>
              <Button size="lg" className={`h-20 text-xl font-semibold ${colorButtonStyles.green}`} onClick={() => handleColorClick("green")}>Zielony</Button>
              <Button size="lg" className={`h-20 text-xl font-semibold ${colorButtonStyles.blue}`} onClick={() => handleColorClick("blue")}>Niebieski</Button>
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
            <h2 className="text-3xl font-bold text-white text-center mb-8">Wyniki wyzwania Sigma Focus</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-slate-700 bg-slate-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">{calculateAvgCongruentTime()}</div>
                    <div className="text-sm text-slate-400">Średni CR - Zgodne (ms)</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-slate-700 bg-slate-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-400 mb-2">{calculateAvgIncongruentTime()}</div>
                    <div className="text-sm text-slate-400">Średni CR - Niezgodne (ms)</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-slate-700 bg-slate-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-400 mb-2">{calculateInterferenceEffect()}</div>
                    <div className="text-sm text-slate-400">Wynik Focus (ms)</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-700 bg-slate-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-lg text-slate-300 mb-2">
                    Błędy: <span className="font-bold text-red-400">{errorCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">HRV ręcznie (opcjonalnie)</label>
                  <Input type="text" value={manualHRV} onChange={(e) => setManualHRV(e.target.value)} placeholder="np. 65" className="bg-slate-700 border-slate-600 text-white" />
                </div>
                
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1" onClick={handleGoBackToCockpit}>Wróć do kokpitu</Button>
                  <Button className="flex-1" onClick={handleSaveAndContinue}>Zapisz i idź dalej</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusGame;
