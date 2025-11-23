import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTrackerGame } from "@/hooks/useTrackerGame";
import { determineGameContext, getGameBackPath } from "@/utils/gameContext";
import { useTrainings } from "@/hooks/useTrainings";
import { useToast } from "@/hooks/use-toast";
import { HRVInputFields } from "@/components/game-shared/HRVInputFields";
import { GameResultsButtons } from "@/components/game-shared/GameResultsButtons";

interface TrackerGameProps {
  athleteId?: string;
  onComplete?: (data: any) => void;
  onGoToCockpit?: () => void;
  mode?: "training" | "measurement";
}

const TrackerGame = ({ athleteId: athleteIdProp, onComplete, onGoToCockpit, mode }: TrackerGameProps) => {
  const navigate = useNavigate();
  const { athleteId: athleteIdParam } = useParams();
  const athleteId = athleteIdProp || athleteIdParam;
  const { isLibrary, isMeasurement, isTraining } = determineGameContext(athleteId, mode);
  
  // Only call Supabase hooks if NOT in library mode
  const { addTraining } = useTrainings(isLibrary ? undefined : athleteId);
  const { toast } = useToast();
  
  const {
    gameState, balls, userGuesses, finalScore, level, mistakes, hrvInput, setHrvInput, containerRef,
    handleStart, handleBallClick, getBallColor, getBallScale, getBallZIndex, getBallBlur, getBallOpacity,
  } = useTrackerGame();

  const TARGET_BALLS = 4;

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
    const payload = { gameData: { level, finalScore, mistakes }, hrvData: hrvInput };
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
        {gameState === 'ready' && (
          <Card className="max-w-md w-full border-slate-700 bg-slate-800 animate-scale-in">
            <CardContent className="pt-6 text-center space-y-6">
              <h1 className="text-3xl font-bold text-white mb-2">Wyzwanie Sigma Tracker</h1>
              <p className="text-lg text-slate-300 leading-relaxed">
                Śledź wzrokiem 4 białe kulki w przestrzeni 3D. Po zakończeniu ruchu wskaż, które kulki były celami.
              </p>
              <p className="text-sm text-slate-400">Poziomy: Staircase (zwiększana prędkość)</p>
              <Button size="lg" className="w-full text-lg" onClick={handleStart}>Start</Button>
            </CardContent>
          </Card>
        )}

        {gameState === 'level_complete' && (
          <Card className="max-w-md w-full border-slate-700 bg-slate-800 animate-scale-in">
            <CardContent className="pt-6 text-center space-y-6">
              <h2 className="text-2xl font-bold text-green-400 mb-4">Poziom {level} ukończony!</h2>
              <p className="text-lg text-slate-300">Perfekcyjny wynik! Przechodzisz do poziomu {level + 1}.</p>
            </CardContent>
          </Card>
        )}

        {gameState === 'retry' && (
          <Card className="max-w-md w-full border-slate-700 bg-slate-800 animate-scale-in">
            <CardContent className="pt-6 text-center space-y-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">Spróbuj ponownie</h2>
              <p className="text-lg text-slate-300">Błąd! Powtarzam poziom {level}.</p>
            </CardContent>
          </Card>
        )}

        {gameState === 'final_results' && (
          <div className="w-full max-w-4xl space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Wyniki wyzwania Sigma Tracker</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-slate-700 bg-slate-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-400 mb-2">{level}</div>
                    <div className="text-sm text-slate-400">Ostatni poziom</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-slate-700 bg-slate-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">{finalScore.correct}/{finalScore.total}</div>
                    <div className="text-sm text-slate-400">Ostatni wynik</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-700 bg-slate-800">
              <CardContent className="pt-6 space-y-4">
                <HRVInputFields
                  rmssd=""
                  hr={hrvInput}
                  onRmssdChange={() => {}}
                  onHrChange={setHrvInput}
                />
                
                <GameResultsButtons
                  isLibrary={isLibrary}
                  isMeasurement={isMeasurement}
                  isTraining={isTraining}
                  onLibraryComplete={handleExit}
                  onMeasurementComplete={handleSaveAndContinue}
                  onTrainingEnd={handleExit}
                  onTrainingSave={async () => {
                    const payload = { 
                      gameData: { level, finalScore, mistakes }, 
                      hrvData: hrvInput 
                    };
                    
                    const { error } = await addTraining({
                      athlete_id: athleteId!,
                      task_type: 'tracker',
                      date: new Date().toISOString(),
                      results: payload
                    });
                    
                    if (error) {
                      toast({
                        title: "Błąd",
                        description: "Nie udało się zapisać treningu",
                        variant: "destructive",
                      });
                    } else {
                      toast({
                        title: "Sukces",
                        description: "Trening został zapisany",
                      });
                      handleExit();
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {(gameState === 'highlight' || gameState === 'moving' || gameState === 'finished') && (
          <div className="relative">
            <div className="text-center mb-4 text-white">
              <p className="text-xl font-bold">Poziom {level}</p>
              {gameState === 'highlight' && <p className="text-sm text-slate-400">Zapamiętaj białe kulki...</p>}
              {gameState === 'moving' && <p className="text-sm text-slate-400">Śledź kulki wzrokiem</p>}
              {gameState === 'finished' && <p className="text-sm text-slate-400">Wskaż {TARGET_BALLS} cele ({userGuesses.length}/{TARGET_BALLS})</p>}
            </div>

            <div ref={containerRef} className="relative bg-slate-800 rounded-lg overflow-hidden" style={{ width: '600px', height: '600px', border: '2px solid #475569', perspective: '1000px' }}>
              <svg className="absolute inset-0 pointer-events-none" width="600" height="600" style={{ opacity: 0.1 }}>
                {[0, 150, 300, 450, 600].map((y, i) => (
                  <line key={`h-${i}`} x1="0" y1={y} x2="600" y2={y} stroke="#94a3b8" strokeWidth="1" />
                ))}
                {[0, 150, 300, 450, 600].map((x, i) => (
                  <line key={`v-${i}`} x1={x} y1="0" x2={x} y2="600" stroke="#94a3b8" strokeWidth="1" />
                ))}
              </svg>

              {balls.map(ball => {
                const scale = getBallScale(ball);
                const size = 30 * scale;
                
                return (
                  <div
                    key={ball.id}
                    className={`absolute rounded-full ${getBallColor(ball)} transition-colors duration-200 ${
                      gameState === 'finished' ? 'cursor-pointer hover:ring-4 hover:ring-white' : ''
                    }`}
                    style={{
                      left: `${ball.x_pos}px`,
                      top: `${ball.y_pos}px`,
                      width: `${size}px`,
                      height: `${size}px`,
                      transform: `translate(-50%, -50%) scale(${scale})`,
                      zIndex: getBallZIndex(ball),
                      filter: `blur(${getBallBlur(ball)}px)`,
                      opacity: getBallOpacity(ball),
                    }}
                    onClick={() => gameState === 'finished' && handleBallClick(ball.id)}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackerGame;
