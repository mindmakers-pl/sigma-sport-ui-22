import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ScatterChart, ZAxis } from "recharts";
import { useControlGame } from "@/hooks/useControlGame";
import { determineGameContext, getGameBackPath } from "@/utils/gameContext";
import { useTrainings } from "@/hooks/useTrainings";
import { useToast } from "@/hooks/use-toast";
import { HRVInputFields } from "@/components/game-shared/HRVInputFields";
import { GameResultsButtons } from "@/components/game-shared/GameResultsButtons";

interface ControlGameProps {
  athleteId?: string;
  onComplete?: (data: any) => void;
  onGoToCockpit?: () => void;
  mode?: "training" | "measurement";
}

const ControlGame = ({ athleteId: athleteIdProp, onComplete, onGoToCockpit, mode }: ControlGameProps) => {
  const navigate = useNavigate();
  const { athleteId: athleteIdParam } = useParams();
  const athleteId = athleteIdProp || athleteIdParam;
  const { isLibrary, isMeasurement, isTraining } = determineGameContext(athleteId, mode);
  
  // Only call Supabase hooks if NOT in library mode
  const { addTraining } = useTrainings(isLibrary ? undefined : athleteId);
  const { toast } = useToast();
  
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

  // Unified exit handler
  const handleExit = () => {
    if (onGoToCockpit) {
      onGoToCockpit();
    } else {
      navigate(getGameBackPath(athleteId, mode, isLibrary));
    }
  };

  // ESC key handler
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleExit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleExit]);

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
      hrvData: typeof manualHRV === 'string' ? manualHRV : ''
    };
    
    if (onComplete) {
      onComplete(payload);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <Button 
        variant="ghost" 
        className="text-white hover:text-white hover:bg-slate-800 mb-4 absolute top-4 left-4 z-50"
        onClick={handleExit}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Powrót
      </Button>
      
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

            <HRVInputFields
              rmssd=""
              hr={typeof manualHRV === 'string' ? manualHRV : ''}
              onRmssdChange={() => {}}
              onHrChange={setManualHRV}
            />
            
            <GameResultsButtons
              isLibrary={isLibrary}
              isMeasurement={isMeasurement}
              isTraining={isTraining}
              onLibraryComplete={handleExit}
              onMeasurementComplete={handleSaveAndContinue}
              onTrainingEnd={handleExit}
              onTrainingSave={async () => {
                const gameData = {
                  control_go_hits: results.goHits,
                  control_go_misses: results.goMisses,
                  control_nogo_errors: results.noGoErrors,
                  control_median_rt_ms: calculateAverageRT(),
                  control_total_trials: trialHistory.length,
                  control_trial_history: trialHistory,
                  control_rmssd_ms: typeof manualHRV === 'string' && manualHRV ? parseFloat(manualHRV) : null,
                  control_avg_hr_bpm: null,
                  control_game_completed_at: new Date().toISOString(),
                };
                
                const { error } = await addTraining({
                  athlete_id: athleteId!,
                  task_type: 'control',
                  date: new Date().toISOString(),
                  results: gameData
                });
                
                if (error) {
                  console.error('❌ ControlGame training save error:', error);
                  const isRLSError = error.code === '42501' || error.message?.includes('row-level security');
                  toast({
                    title: "Błąd zapisu",
                    description: isRLSError 
                      ? "Brak uprawnień do zapisu danych. Skontaktuj się z administratorem." 
                      : "Nie udało się zapisać treningu",
                    variant: "destructive",
                  });
                } else {
                  console.log('✅ ControlGame training saved to Supabase');
                  toast({
                    title: "Sukces",
                    description: "Trening został zapisany",
                  });
                  handleExit();
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlGame;
