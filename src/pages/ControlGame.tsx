import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ScatterChart, ZAxis } from "recharts";
import { useControlGame } from "@/hooks/useControlGame";

interface ControlGameProps {
  onComplete?: (data: any) => void;
  onGoToCockpit?: () => void;
  mode?: "training" | "measurement";
}

const ControlGame = ({ onComplete, onGoToCockpit, mode = "measurement" }: ControlGameProps) => {
  const navigate = useNavigate();
  const { athleteId } = useParams();
  
  const {
    gameState,
    currentStimulus,
    results,
    reactionTimes,
    trialHistory,
    manualHRV,
    setManualHRV,
    handleStartGame,
    handleScreenClick,
    calculateAverageRT,
    calculateMinRT,
    calculateMaxRT,
    calculateMovingAverage,
  } = useControlGame();

  const handleSaveAndContinue = () => {
    const payload = {
      gameData: {
        avgRT: calculateAverageRT(),
        minRT: calculateMinRT(),
        maxRT: calculateMaxRT(),
        goHits: results.goHits,
        goMisses: results.goMisses,
        noGoErrors: results.noGoErrors,
        trialHistory,
        reactionTimes
      },
      hrvData: manualHRV
    };
    
    if (onComplete) {
      onComplete(payload);
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
        <Button 
          variant="ghost" 
          className="text-white hover:bg-slate-800 mb-4"
          onClick={() => navigate(`/zawodnicy/${athleteId}?tab=dodaj-pomiar`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót
        </Button>
      )}
      
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
        {gameState === "ready" && (
          <Card className="max-w-md w-full border-slate-700 bg-slate-800 animate-scale-in">
            <CardContent className="pt-6 text-center space-y-6">
              <h1 className="text-3xl font-bold text-white mb-2">Wyzwanie Sigma Control</h1>
              <p className="text-lg text-slate-300 leading-relaxed">
                Kliknij ekran, gdy zobaczysz zielone <span className="font-semibold">O</span>. Ignoruj czerwone <span className="font-semibold">X</span>.
              </p>
              <p className="text-sm text-slate-400">Czas trwania: 2 minuty</p>
              <Button size="lg" className="w-full text-lg" onClick={handleStartGame}>Start</Button>
            </CardContent>
          </Card>
        )}

        {gameState === "playing" && (
          <div className="w-full h-screen flex items-center justify-center cursor-pointer select-none" onClick={handleScreenClick}>
            {currentStimulus ? (
              <div className="text-center animate-scale-in">
                {currentStimulus.type === "Go" ? (
                  <div className="text-[200px] font-bold text-green-500">O</div>
                ) : (
                  <div className="text-[200px] font-bold text-red-500">X</div>
                )}
              </div>
            ) : (
              <div className="text-8xl text-slate-600">+</div>
            )}
          </div>
        )}

        {gameState === "finished" && (
          <div className="w-full max-w-4xl space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Wyniki wyzwania Sigma Control</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-slate-700 bg-slate-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">{calculateAverageRT()}</div>
                    <div className="text-sm text-slate-400">Średni czas reakcji (ms)</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-slate-700 bg-slate-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-400 mb-2">{results.goHits}</div>
                    <div className="text-sm text-slate-400">Trafienia</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-slate-700 bg-slate-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-400 mb-2">{results.goMisses}</div>
                    <div className="text-sm text-slate-400">Pominięcia</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-slate-700 bg-slate-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-red-400 mb-2">{results.noGoErrors}</div>
                    <div className="text-sm text-slate-400">Błędy kontroli</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-700 bg-slate-800">
              <CardContent className="pt-6">
                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between">
                    <span>Najszybszy czas:</span>
                    <span className="font-bold">{calculateMinRT()} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Najwolniejszy czas:</span>
                    <span className="font-bold">{calculateMaxRT()} ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Trend czasów reakcji</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={calculateMovingAverage()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="trial" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} labelStyle={{ color: '#cbd5e1' }} />
                    <Line type="monotone" dataKey="avgRT" stroke="#10b981" strokeWidth={2} name="Średni CR" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Rozkład czasów reakcji</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis type="number" dataKey="trial" name="Próba" stroke="#94a3b8" />
                    <YAxis type="number" dataKey="rt" name="CR (ms)" stroke="#94a3b8" />
                    <ZAxis range={[50, 200]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} labelStyle={{ color: '#cbd5e1' }} />
                    <Scatter name="Czas reakcji" data={reactionTimes.map((rt, index) => ({ trial: index + 1, rt }))} fill="#10b981" />
                  </ScatterChart>
                </ResponsiveContainer>
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

export default ControlGame;
