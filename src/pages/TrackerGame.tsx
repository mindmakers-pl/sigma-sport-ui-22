import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTrackerGame } from "@/hooks/useTrackerGame";

interface TrackerGameProps {
  onComplete?: (data: any) => void;
  onGoToCockpit?: () => void;
}

const TrackerGame = ({ onComplete, onGoToCockpit }: TrackerGameProps) => {
  const navigate = useNavigate();
  const { athleteId } = useParams();
  
  const {
    gameState, balls, userGuesses, finalScore, level, mistakes, hrvInput, setHrvInput, containerRef,
    handleStart, handleBallClick, getBallColor, getBallScale, getBallZIndex, getBallBlur, getBallOpacity,
  } = useTrackerGame();

  const TARGET_BALLS = 4;

  const handleSaveAndContinue = () => {
    const payload = { gameData: { level, finalScore, mistakes }, hrvData: hrvInput };
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
        <Button variant="ghost" className="text-white hover:bg-slate-800 mb-4" onClick={() => navigate(`/zawodnicy/${athleteId}?tab=dodaj-pomiar`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót
        </Button>
      )}
      
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
                <div>
                  <Label className="text-slate-300">HRV ręcznie (opcjonalnie)</Label>
                  <Input type="text" value={hrvInput} onChange={(e) => setHrvInput(e.target.value)} placeholder="np. 65" className="bg-slate-700 border-slate-600 text-white mt-2" />
                </div>
                
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1" onClick={handleGoBackToCockpit}>Wróć do kokpitu</Button>
                  <Button className="flex-1" onClick={handleSaveAndContinue}>Zapisz i idź dalej</Button>
                </div>
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
