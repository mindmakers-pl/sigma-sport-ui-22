import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useTrainings } from "@/hooks/useTrainings";
import { determineGameContext, getGameBackPath } from "@/utils/gameContext";
import { useToast } from "@/hooks/use-toast";
import { HRVInputFields } from "@/components/game-shared/HRVInputFields";

type GameState = "ready" | "playing" | "finished";

interface ClickRecord {
  number: number;
  timestamp: number;
  wasCorrect: boolean;
}

interface ScanGameProps {
  athleteId?: string;
  onComplete?: (data: any) => void;
  onGoToCockpit?: () => void;
  mode?: "training" | "measurement";
}

const GAME_DURATION = 60; // 60 seconds
const GRID_SIZE = 64; // 8x8 grid (0-63)

const ScanGame = ({ athleteId: athleteIdProp, onComplete, onGoToCockpit, mode }: ScanGameProps) => {
  const navigate = useNavigate();
  const { athleteId: athleteIdParam } = useParams();
  const athleteId = athleteIdProp || athleteIdParam;
  const { isLibrary, isMeasurement, isTraining } = determineGameContext(athleteId, mode);
  
  // Only call Supabase hooks if NOT in library mode
  const { trainings, addTraining } = useTrainings(isLibrary ? undefined : athleteId);
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<GameState>("ready");
  const [gridNumbers, setGridNumbers] = useState<number[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(new Set());
  const [clickHistory, setClickHistory] = useState<ClickRecord[]>([]);
  const [nextExpected, setNextExpected] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  const [manualRMSSD, setManualRMSSD] = useState<string>("");
  const [manualHR, setManualHR] = useState<string>("");

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

  // Generate random grid
  const generateGrid = () => {
    const numbers = Array.from({ length: GRID_SIZE }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    return numbers;
  };

  // Timer effect
  useEffect(() => {
    if (gameState !== "playing") return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  const handleStartGame = () => {
    setGridNumbers(generateGrid());
    setSelectedNumbers(new Set());
    setClickHistory([]);
    setNextExpected(0);
    setTimeLeft(GAME_DURATION);
    setStartTime(Date.now());
    setGameState("playing");
  };

  const handleNumberClick = (number: number) => {
    if (gameState !== "playing") return;

    const newSelected = new Set(selectedNumbers);
    
    // Toggle selection
    if (newSelected.has(number)) {
      // Unclick - remove from selection
      newSelected.delete(number);
      setSelectedNumbers(newSelected);
      return;
    }

    // Click - add to selection
    newSelected.add(number);
    setSelectedNumbers(newSelected);

    const wasCorrect = number === nextExpected;
    
    setClickHistory(prev => [...prev, {
      number,
      timestamp: Date.now(),
      wasCorrect
    }]);

    if (wasCorrect) {
      setNextExpected(prev => prev + 1);
    }
  };

  const calculateResult = () => {
    // Find the highest correct sequential number
    let maxCorrect = -1;
    for (let i = 0; i < GRID_SIZE; i++) {
      if (selectedNumbers.has(i)) {
        maxCorrect = i;
      } else {
        break; // sequence broken
      }
    }

    // Find skipped numbers
    const skippedNumbers: number[] = [];
    for (let i = 0; i <= maxCorrect; i++) {
      if (!selectedNumbers.has(i)) {
        skippedNumbers.push(i);
      }
    }

    // Count error clicks (clicked but not in correct sequence)
    const errorClicks = clickHistory.filter(c => !c.wasCorrect && selectedNumbers.has(c.number)).length;

    return {
      maxNumber: maxCorrect,
      correctClicks: maxCorrect + 1,
      errorClicks,
      skippedNumbers,
      totalClicks: clickHistory.length,
      duration: GAME_DURATION
    };
  };

  const getPreviousResults = () => {
    // Get previous results from Supabase
    if (!trainings || trainings.length === 0) return [];

    const scanResults = trainings
      .filter((t) => t.task_type === 'scan')
      .map((t) => (t.results as any)?.scan_max_number_reached)
      .filter((r) => r !== undefined && r !== null)
      .slice(-5); // Last 5 results

    return scanResults;
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
          <Card className="max-w-2xl w-full border-slate-700 bg-slate-800 animate-scale-in">
            <CardContent className="pt-6 space-y-6">
              <h1 className="text-2xl font-semibold text-white text-center mb-4">Siatka Koncentracji</h1>
              
              <div className="bg-slate-700/50 p-6 rounded-lg space-y-4 text-slate-200">
                <p className="text-lg leading-relaxed">
                  Przed Tobą tabela 8 na 8 pól, w których zapisane są różne dwucyfrowe liczby od <span className="font-bold text-white">00 do 63</span> (każda liczba dokładnie raz).
                </p>
                <p className="text-lg leading-relaxed">
                  Twoim celem jest znaleźć <span className="font-bold text-green-400">jak najdłuższy ciąg kolejnych liczb</span> zaczynając od 00 i idąc w górę: 00, 01, 02, 03, itd.
                </p>
                <p className="text-lg leading-relaxed">
                  Po znalezieniu i naciśnięciu <span className="font-bold text-white">00</span>, szukasz <span className="font-bold text-white">01</span>, potem <span className="font-bold text-white">02</span>, i tak dalej, w jak najkrótszym czasie.
                </p>
                <p className="text-lg leading-relaxed">
                  Będziesz mieć na to dokładnie <span className="font-bold text-yellow-400">1 minutę (60 sekund)</span>.
                </p>
                <p className="text-lg leading-relaxed font-semibold text-green-400">
                  Nie pomijaj numerów, poluj kolejno i szukaj do skutku.
                </p>
              </div>

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
          <div className="w-full max-w-5xl animate-fade-in">
            <div className="mb-4 text-center">
              <div className="flex items-center justify-between max-w-md mx-auto">
                <div className="text-white">
                  <span className="text-sm text-slate-400">Szukasz:</span>
                  <span className="text-3xl font-bold ml-2 text-green-400">
                    {nextExpected.toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="text-white">
                  <span className="text-sm text-slate-400">Czas:</span>
                  <span className="text-3xl font-bold ml-2 text-yellow-400">
                    {timeLeft}s
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-8 gap-2 bg-slate-800 p-4 rounded-lg">
              {gridNumbers.map((number, index) => {
                const isSelected = selectedNumbers.has(number);
                return (
                  <button
                    key={index}
                    onClick={() => handleNumberClick(number)}
                    className={`
                      aspect-square
                      bg-slate-700 hover:bg-slate-600
                      rounded
                      flex items-center justify-center
                      text-2xl
                      transition-all duration-150
                      ${isSelected ? 'text-slate-500' : 'text-slate-300'}
                    `}
                  >
                    {number.toString().padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {gameState === "finished" && (
          <Card className="max-w-lg w-full border-slate-700 bg-slate-800 animate-scale-in">
            <CardContent className="pt-6 text-center space-y-6">
              <h2 className="text-xl font-semibold text-white">Wynik Siatki Koncentracji</h2>
              
              <div className="space-y-4 py-4">
                <div className="bg-slate-700/50 p-6 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">Najwyższa osiągnięta liczba</p>
                  <p className="text-5xl font-bold text-green-400">
                    {calculateResult().maxNumber >= 0 
                      ? calculateResult().maxNumber.toString().padStart(2, '0')
                      : '--'}
                  </p>
                  <p className="text-sm text-slate-400 mt-2">
                    Poprawnie zaznaczonych: {calculateResult().correctClicks}
                  </p>
                </div>

                {getPreviousResults().length > 0 && (
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm mb-3">Twoje ostatnie wyniki</p>
                    <div className="flex gap-2 justify-center flex-wrap">
                      {getPreviousResults().map((result: number, idx: number) => (
                        <div key={idx} className="bg-slate-600 px-3 py-1 rounded text-white font-mono">
                          {result.toString().padStart(2, '0')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {calculateResult().skippedNumbers.length > 0 && (
                  <div className="bg-amber-900/20 border border-amber-700/50 p-4 rounded-lg">
                    <p className="text-amber-400 text-sm mb-2">Pominięte liczby</p>
                    <p className="text-amber-300 font-mono">
                      {calculateResult().skippedNumbers.map(n => n.toString().padStart(2, '0')).join(', ')}
                    </p>
                  </div>
                )}

                {/* HRV Input */}
                <HRVInputFields 
                  rmssd={manualRMSSD}
                  hr={manualHR}
                  onRmssdChange={setManualRMSSD}
                  onHrChange={setManualHR}
                />
              </div>

              {isLibrary && (
                <Button 
                  size="lg"
                  className="w-full"
                  onClick={handleExit}
                >
                  Zakończ
                </Button>
              )}

              {isMeasurement && (
                <>
                  <div className="pt-2 pb-2 border-t border-slate-700">
                    <p className="text-green-400 text-sm">✓ Zapisaliśmy Twój wynik</p>
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      const result = calculateResult();
                      const gameData = {
                        scan_max_number_reached: result.maxNumber,
                        scan_duration_s: result.duration,
                        scan_correct_clicks: result.correctClicks,
                        scan_error_clicks: result.errorClicks,
                        scan_skipped_numbers: result.skippedNumbers,
                        scan_rmssd_ms: manualRMSSD ? parseFloat(manualRMSSD) : null,
                        scan_avg_hr_bpm: manualHR ? parseFloat(manualHR) : null,
                        scan_raw_clicks: clickHistory
                      };
                      
                      if (onComplete) {
                        onComplete(gameData);
                      }
                    }}
                  >
                    Następne Wyzwanie
                  </Button>
                </>
              )}

              {isTraining && (
                <div className="flex gap-3">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="flex-1"
                    onClick={handleExit}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Zakończ
                  </Button>
                  <Button 
                    size="lg" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={async () => {
                      const result = calculateResult();
                      const gameData = {
                        scan_max_number_reached: result.maxNumber,
                        scan_duration_s: result.duration,
                        scan_correct_clicks: result.correctClicks,
                        scan_error_clicks: result.errorClicks,
                        scan_skipped_numbers: result.skippedNumbers,
                        scan_rmssd_ms: manualRMSSD ? parseFloat(manualRMSSD) : null,
                        scan_avg_hr_bpm: manualHR ? parseFloat(manualHR) : null,
                        scan_game_completed_at: new Date().toISOString(),
                      };
                      
                      const { error } = await addTraining({
                        athlete_id: athleteId!,
                        task_type: 'scan',
                        date: new Date().toISOString(),
                        results: gameData
                      });
                      
                      if (error) {
                        console.error('❌ ScanGame training save error:', error);
                        toast({
                          title: "Błąd",
                          description: "Nie udało się zapisać treningu",
                          variant: "destructive",
                        });
                      } else {
                        console.log('✅ ScanGame training saved to Supabase');
                        toast({
                          title: "Sukces",
                          description: "Trening został zapisany",
                        });
                        handleExit();
                      }
                    }}
                  >
                    Zapisz trening
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ScanGame;
