import { useEffect } from "react";
import { useBackGame } from "@/hooks/useBackGame";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTrainings } from "@/hooks/useTrainings";
import { useToast } from "@/hooks/use-toast";
import { determineGameContext, getGameBackPath } from "@/utils/gameContext";
import { HRVInputFields } from "@/components/game-shared/HRVInputFields";
import { GameResultsButtons } from "@/components/game-shared/GameResultsButtons";

interface MemoGameProps {
  athleteId?: string;
  mode?: 'measurement' | 'training';
  onComplete?: (data: any) => void;
  onGoToCockpit?: () => void;
}

const MemoGame = ({ athleteId: athleteIdProp, mode, onComplete, onGoToCockpit }: MemoGameProps) => {
  const navigate = useNavigate();
  const { athleteId: athleteIdParam } = useParams();
  const athleteId = athleteIdProp || athleteIdParam;
  const { isLibrary, isMeasurement, isTraining } = determineGameContext(athleteId, mode);
  
  // Only call Supabase hooks if NOT in library mode
  const { addTraining } = useTrainings(isLibrary ? undefined : athleteId);
  const { toast } = useToast();

  const {
    gameState,
    setGameState,
    currentTrialIndex,
    trialSequence,
    trialHistory,
    results,
    manualHRV,
    setManualHRV,
    handleStartGame,
    handleResponse,
  } = useBackGame();

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

  const handleSaveAndContinue = async () => {
    if (!results) return;

    const gameData = {
      memo_accuracy_pct: Math.round(results.accuracy),
      memo_median_rt_ms: Math.round(results.medianRT),
      memo_total_trials: trialHistory.length,
      memo_correct_responses: results.hits,
      memo_trials: trialHistory.filter(t => t.trialIndex >= 2).map(trial => ({
        trial: trial.trialIndex,
        rt: trial.reactionTime || 0,
        isCorrect: trial.correct,
        isError: !trial.correct,
      })),
      memo_rmssd_ms: manualHRV.rmssd ? parseFloat(manualHRV.rmssd) : null,
      memo_hr_bpm: manualHRV.hr ? parseFloat(manualHRV.hr) : null,
      memo_game_completed_at: new Date().toISOString(),
    };

    if (!athleteId) {
      console.log('📊 Sigma Memo: Library mode - no save');
      handleExit();
      return;
    }

    const { error } = await addTraining({
      athlete_id: athleteId,
      task_type: 'memo',
      date: new Date().toISOString(),
      results: gameData
    });
    
    if (error) {
      console.error('❌ MemoGame training save error:', error);
      const isRLSError = error.code === '42501' || error.message?.includes('row-level security');
      toast({
        title: "Błąd zapisu",
        description: isRLSError 
          ? "Brak uprawnień do zapisu danych. Skontaktuj się z administratorem." 
          : "Nie udało się zapisać wyniku treningu",
        variant: "destructive",
      });
    } else {
      console.log('✅ MemoGame training saved to Supabase');
      toast({
        title: "Sukces",
        description: "Wynik treningu został zapisany",
      });
      handleExit();
    }
  };

  const getCurrentPosition = () => {
    if (currentTrialIndex < 0 || currentTrialIndex >= trialSequence.length) return -1;
    return trialSequence[currentTrialIndex];
  };

  const renderGrid = () => {
    const currentPos = getCurrentPosition();
    const showStimulus = gameState === 'playing' && currentPos >= 0;

    return (
      <div className="grid grid-cols-3 gap-4 w-80 h-80">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className={`
              border-2 rounded-lg transition-all duration-200
              ${showStimulus && index === currentPos 
                ? 'bg-primary border-primary' 
                : 'bg-background/20 border-muted'
              }
            `}
          />
        ))}
      </div>
    );
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <Button 
          variant="ghost" 
          className="text-white hover:text-white hover:bg-slate-800 mb-4 absolute top-4 left-4 z-50"
          onClick={handleExit}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót
        </Button>
        <Card className="max-w-2xl w-full p-8 space-y-6 bg-slate-900 border-slate-800">
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold text-white">Sigma Memo</h1>
              <p className="text-base text-slate-400">
                Test pamięci roboczej typu 2-Back
              </p>
            </div>

            <div className="space-y-4 text-base">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-white">Jak grać?</h3>
                <ul className="space-y-2 list-disc list-inside text-slate-400">
                  <li>Na ekranie zobaczysz siatkę 3×3 z podświetlającymi się kwadratami</li>
                  <li>Kliknij ekran (lub spację), gdy kwadrat pojawi się <strong>w tym samym miejscu co dwa kroki temu</strong></li>
                  <li>Nie klikaj, jeśli pozycja się nie powtarza</li>
                  <li>Każdy kwadrat pojawia się na krótko, więc bądź czujny</li>
                </ul>
              </div>

              <div className="space-y-2 bg-slate-800/50 p-4 rounded-lg">
                <h3 className="font-semibold text-white">Dlaczego to ważne w sporcie?</h3>
                <p className="text-slate-400">
                  Ten test mierzy pamięć roboczą - umiejętność trzymania informacji w głowie 
                  i stałego jej aktualizowania. W sporcie to jak "bufor taktyczny" - 
                  zapamiętywanie ostatnich akcji, przewidywanie ruchów przeciwnika, 
                  lub realizowanie złożonych schematów gry.
                </p>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <p className="text-sm text-slate-300">
                  <strong className="text-white">Wskazówka:</strong> Pierwsze dwa kwadraty to rozgrzewka - 
                  dopiero od trzeciego możesz zacząć klikać!
                </p>
              </div>
            </div>

            <Button 
              onClick={handleStartGame} 
              size="lg" 
              className="w-full"
            >
              START
            </Button>
          </Card>
      </div>
    );
  }

  if (gameState === 'playing') {
    const progress = ((currentTrialIndex + 1) / trialSequence.length) * 100;

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <div className="w-full h-1 bg-slate-800">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {renderGrid()}
          
          <div className="mt-8 text-center space-y-4">
            <p className="text-slate-400">
              Kliknij, gdy pozycja powtarza się z {currentTrialIndex < 2 ? '...' : 'poprzednich prób'}
            </p>
            <Button 
              onClick={handleResponse}
              size="lg"
              className="min-w-48"
            >
              KLIKNIJ (spacja)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished' && results) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <Card className="max-w-2xl w-full p-8 space-y-6 bg-slate-900 border-slate-800">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-white">Wyniki Sigma Memo</h2>
            <p className="text-slate-400 text-sm">Test pamięci roboczej 2-Back</p>
          </div>

          {/* Athlete view - simple metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-6 rounded-lg text-center">
              <div className="text-4xl font-bold text-primary">
                {isNaN(results.accuracy) ? '0' : Math.round(results.accuracy)}%
              </div>
              <div className="text-sm text-slate-400 mt-2">
                Celność
              </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg text-center">
              <div className="text-4xl font-bold text-primary">
                {Math.round(results.medianRT) || 0}
              </div>
              <div className="text-sm text-slate-400 mt-2">
                Czas reakcji (ms)
              </div>
            </div>
          </div>

          {/* HRV Input Fields */}
          <HRVInputFields
            rmssd={manualHRV.rmssd}
            hr={manualHRV.hr}
            onRmssdChange={(val) => setManualHRV(prev => ({ ...prev, rmssd: val }))}
            onHrChange={(val) => setManualHRV(prev => ({ ...prev, hr: val }))}
            className="space-y-4 pt-4 border-t border-slate-800"
          />

          <GameResultsButtons
            isLibrary={isLibrary}
            isMeasurement={isMeasurement}
            isTraining={isTraining}
            onLibraryComplete={handleExit}
            onMeasurementComplete={handleSaveAndContinue}
            onTrainingEnd={handleExit}
            onTrainingSave={handleSaveAndContinue}
          />
        </Card>
      </div>
    );
  }

  return null;
};

export default MemoGame;
