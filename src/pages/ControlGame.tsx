import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ScatterChart, ZAxis } from "recharts";

type GameState = "ready" | "playing" | "finished";
type StimulusType = "Go" | "NoGo";
type Stimulus = { type: StimulusType } | null;

interface Results {
  goHits: number;
  goMisses: number;
  noGoErrors: number;
}

interface Trial {
  trialNumber: number;
  type: StimulusType;
  result: 'goHit' | 'goMiss' | 'noGoError' | 'correct';
  reactionTime?: number;
}

const ControlGame = () => {
  const navigate = useNavigate();
  const { athleteId } = useParams();
  
  // Stan gry
  const [gameState, setGameState] = useState<GameState>("ready");
  
  // Aktualny bodziec
  const [currentStimulus, setCurrentStimulus] = useState<Stimulus>(null);
  
  // Wyniki
  const [results, setResults] = useState<Results>({
    goHits: 0,
    goMisses: 0,
    noGoErrors: 0,
  });
  
  // Czasy reakcji (tylko dla poprawnych 'Go')
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  
  // Historia wszystkich prób (do wykresu)
  const [trialHistory, setTrialHistory] = useState<Trial[]>([]);
  
  // Licznik prób
  const trialCounterRef = useRef<number>(0);
  
  // Czas rozpoczęcia ostatniej próby
  const [lastTrialStartTime, setLastTrialStartTime] = useState<number | null>(null);
  
  // Typ aktualnej próby (do zapisania w historii)
  const currentTrialTypeRef = useRef<StimulusType | null>(null);
  
  // Referencje do timerów (do czyszczenia)
  const gameTimerRef = useRef<number | null>(null);
  const loopTimerRef = useRef<number | null>(null);
  const stimulusTimerRef = useRef<number | null>(null);
  const omissionTimerRef = useRef<number | null>(null);

  // Funkcja rekurencyjna pętli gry
  const runGameLoop = () => {
    // 1. Pusta przerwa (ISI: 1.5 sekundy)
    setCurrentStimulus(null);
    
    loopTimerRef.current = window.setTimeout(() => {
      // 2. Losowanie bodźca (80% Go, 20% NoGo)
      const random = Math.random();
      const stimulusType: StimulusType = random < 0.8 ? "Go" : "NoGo";
      
      // 3. Pokazanie bodźca
      setCurrentStimulus({ type: stimulusType });
      
      // 4. Zapisanie czasu rozpoczęcia próby i typu próby
      const trialStartTime = Date.now();
      setLastTrialStartTime(trialStartTime);
      trialCounterRef.current += 1;
      currentTrialTypeRef.current = stimulusType;
      
      // 5. Timer na omission (tylko dla bodźca 'Go' - 500ms)
      if (stimulusType === "Go") {
        omissionTimerRef.current = window.setTimeout(() => {
          setCurrentStimulus((currentStim) => {
            // Jeśli gracz nie kliknął (bodziec nadal jest 'Go')
            if (currentStim?.type === "Go") {
              setResults((prev) => ({
                ...prev,
                goMisses: prev.goMisses + 1,
              }));
              
              // Zapisz w historii jako goMiss
              setTrialHistory((prev) => [
                ...prev,
                {
                  trialNumber: trialCounterRef.current,
                  type: 'Go',
                  result: 'goMiss',
                },
              ]);
            }
            return null;
          });
        }, 500);
      } else {
        // Dla NoGo - jeśli nie kliknął, to dobrze (correct)
        omissionTimerRef.current = window.setTimeout(() => {
          setCurrentStimulus((currentStim) => {
            if (currentStim?.type === "NoGo") {
              // Zapisz w historii jako correct
              setTrialHistory((prev) => [
                ...prev,
                {
                  trialNumber: trialCounterRef.current,
                  type: 'NoGo',
                  result: 'correct',
                },
              ]);
            }
            return null;
          });
        }, 500);
      }
      
      // 6. Ukrycie bodźca po 500ms i kontynuacja pętli
      stimulusTimerRef.current = window.setTimeout(() => {
        setCurrentStimulus(null);
        
        // 7. Rekurencja - kolejna próba
        runGameLoop();
      }, 500);
    }, 1500);
  };

  // Funkcja zakończenia gry
  const endGame = () => {
    // Anuluj wszystkie timery
    if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
    if (stimulusTimerRef.current) clearTimeout(stimulusTimerRef.current);
    if (omissionTimerRef.current) clearTimeout(omissionTimerRef.current);
    if (gameTimerRef.current) clearTimeout(gameTimerRef.current);
    
    setGameState("finished");
    setCurrentStimulus(null);
  };

  // Główny useEffect - zarządzanie stanem gry
  useEffect(() => {
    if (gameState !== "playing") return;

    // Natychmiastowe uruchomienie pętli gry
    runGameLoop();

    // Timer na 2 minuty (120 sekund)
    gameTimerRef.current = window.setTimeout(() => {
      endGame();
    }, 120000);

    // Funkcja czyszcząca
    return () => {
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      if (stimulusTimerRef.current) clearTimeout(stimulusTimerRef.current);
      if (omissionTimerRef.current) clearTimeout(omissionTimerRef.current);
      if (gameTimerRef.current) clearTimeout(gameTimerRef.current);
    };
  }, [gameState]);

  // Obsługa kliknięć ekranu
  const handleScreenClick = () => {
    if (gameState !== "playing") return;

    setCurrentStimulus((currentStim) => {
      // Przypadek 1: Kliknięcie na 'Go' (zielone 'O')
      if (currentStim?.type === "Go") {
        // Poprawne trafienie
        const rt = Date.now() - (lastTrialStartTime || Date.now());
        setReactionTimes((prev) => [...prev, rt]);
        setResults((prev) => ({
          ...prev,
          goHits: prev.goHits + 1,
        }));
        
        // Zapisz w historii jako goHit
        setTrialHistory((prev) => [
          ...prev,
          {
            trialNumber: trialCounterRef.current,
            type: 'Go',
            result: 'goHit',
            reactionTime: rt,
          },
        ]);
        
        // Anuluj timer omission
        if (omissionTimerRef.current) {
          clearTimeout(omissionTimerRef.current);
          omissionTimerRef.current = null;
        }
        
        return null; // Ukryj bodziec natychmiast
      }
      
      // Przypadek 2: Kliknięcie na 'NoGo' (czerwone 'X')
      if (currentStim?.type === "NoGo") {
        // Błąd Commission (impulsywność)
        setResults((prev) => ({
          ...prev,
          noGoErrors: prev.noGoErrors + 1,
        }));
        
        // Zapisz w historii jako noGoError
        setTrialHistory((prev) => [
          ...prev,
          {
            trialNumber: trialCounterRef.current,
            type: 'NoGo',
            result: 'noGoError',
          },
        ]);
        
        // Anuluj timer omission dla NoGo
        if (omissionTimerRef.current) {
          clearTimeout(omissionTimerRef.current);
          omissionTimerRef.current = null;
        }
        
        return null; // Ukryj bodziec natychmiast
      }
      
      // Przypadek 3: Kliknięcie na pusty ekran (null)
      if (currentStim === null) {
        // Błąd Commission (impulsywność) - nie zapisujemy w historii, bo to nie jest oficjalna próba
        setResults((prev) => ({
          ...prev,
          noGoErrors: prev.noGoErrors + 1,
        }));
      }
      
      return currentStim;
    });
  };

  // Inicjalizacja gry
  const initializeGame = () => {
    setGameState("playing");
    setCurrentStimulus(null);
    setResults({ goHits: 0, goMisses: 0, noGoErrors: 0 });
    setReactionTimes([]);
    setTrialHistory([]);
    setLastTrialStartTime(null);
    trialCounterRef.current = 0;
    currentTrialTypeRef.current = null;
  };

  // Reset gry
  const handleReset = () => {
    setGameState("ready");
    setCurrentStimulus(null);
    setResults({ goHits: 0, goMisses: 0, noGoErrors: 0 });
    setReactionTimes([]);
    setTrialHistory([]);
    setLastTrialStartTime(null);
    trialCounterRef.current = 0;
    currentTrialTypeRef.current = null;
  };

  // Obliczanie średniego czasu reakcji
  const calculateAverageRT = () => {
    if (reactionTimes.length === 0) return 0;
    const sum = reactionTimes.reduce((acc, rt) => acc + rt, 0);
    return Math.round(sum / reactionTimes.length);
  };

  // Obliczanie najszybszej i najwolniejszej reakcji
  const calculateMinRT = () => {
    if (reactionTimes.length === 0) return 0;
    return Math.round(Math.min(...reactionTimes));
  };

  const calculateMaxRT = () => {
    if (reactionTimes.length === 0) return 0;
    return Math.round(Math.max(...reactionTimes));
  };

  // Obliczanie średniej kroczącej dla wykresu trendu
  const calculateMovingAverage = (windowSize: number = 5) => {
    const goHits = trialHistory.filter(t => t.result === 'goHit' && t.reactionTime);
    if (goHits.length === 0) return [];
    
    const movingAvg: Array<{ trialNumber: number; avgRT: number }> = [];
    
    for (let i = 0; i < goHits.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(goHits.length, i + Math.ceil(windowSize / 2));
      const window = goHits.slice(start, end);
      
      const sum = window.reduce((acc, trial) => acc + (trial.reactionTime || 0), 0);
      const avg = sum / window.length;
      
      movingAvg.push({
        trialNumber: goHits[i].trialNumber,
        avgRT: Math.round(avg)
      });
    }
    
    return movingAvg;
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
        {/* Ekran startowy */}
        {gameState === "ready" && (
          <Card className="max-w-md w-full border-slate-700 bg-slate-800 animate-scale-in">
            <CardContent className="pt-6 text-center space-y-6">
              <h1 className="text-3xl font-bold text-white mb-2">Test Control</h1>
              <p className="text-lg text-slate-300 leading-relaxed">
                Klikaj ekran tak szybko, jak potrafisz, gdy zobaczysz <span className="text-emerald-300 font-semibold">ZIELONE 'O'</span>.
                <br />
                <br />
                NIE KLIKAJ, gdy zobaczysz <span className="text-red-500 font-semibold">CZERWONE 'X'</span>.
                <br />
                <br />
                Test potrwa 2 minuty.
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

        {/* Ekran gry */}
        {gameState === "playing" && (
          <div 
            className="w-full h-full min-h-[600px] flex items-center justify-center cursor-pointer animate-fade-in"
            onClick={handleScreenClick}
          >
            {currentStimulus?.type === "Go" && (
              <div className="text-emerald-300 text-[250px] font-bold animate-scale-in leading-none">
                O
              </div>
            )}
            {currentStimulus?.type === "NoGo" && (
              <div className="text-red-500 text-[250px] font-bold animate-scale-in leading-none">
                X
              </div>
            )}
          </div>
        )}

        {/* Ekran wyników */}
        {gameState === "finished" && (
          <Card className="max-w-md w-full border-slate-700 bg-slate-800 animate-scale-in">
            <CardContent className="pt-6 text-center space-y-6">
              <h2 className="text-2xl font-bold text-white">Wynik wyzwania Sigma Control</h2>
              <p className="text-emerald-400 text-sm">✅ Zapisaliśmy Twój wynik</p>
              
              <div className="space-y-4 py-4">
                <div className="bg-slate-900 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-2">Średni Czas Reakcji "Go"</p>
                  <p className="text-3xl font-bold text-emerald-300 mb-3">{calculateAverageRT()} ms</p>
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-slate-500">Najszybsza: </span>
                      <span className="text-emerald-400 font-semibold">{calculateMinRT()} ms</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Najwolniejsza: </span>
                      <span className="text-amber-400 font-semibold">{calculateMaxRT()} ms</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-900 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Błędy Przeoczenia (Omission)</p>
                  <p className="text-3xl font-bold text-amber-400">{results.goMisses}</p>
                </div>
                
                <div className="bg-slate-900 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Błędy Impulsywności (Commission)</p>
                  <p className="text-3xl font-bold text-red-400">{results.noGoErrors}</p>
                </div>
              </div>
              
              {/* Wykres trendu */}
              <div className="bg-slate-900 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-4">Trend Czasów Reakcji</p>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="trialNumber" 
                      type="number"
                      stroke="#94a3b8"
                      label={{ value: 'Próby', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
                    />
                    <YAxis 
                      stroke="#94a3b8"
                      label={{ value: 'ms', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#94a3b8' }}
                      formatter={(value: any, name: string) => {
                        if (name === 'avgRT') return [`${value} ms`, 'Średnia krocząca'];
                        return [`${value} ms`, 'Czas reakcji'];
                      }}
                    />
                    
                    {/* Warstwa 1: Punkty - wszystkie pojedyncze próby (mniejsze, jaśniejsze) */}
                    <Scatter 
                      data={trialHistory.filter(t => t.result === 'goHit')} 
                      fill="#6ee7b7" 
                      fillOpacity={0.4}
                      shape="circle"
                    >
                      <ZAxis range={[20, 20]} />
                    </Scatter>
                    
                    {/* Błędy przeoczenia - małe kropki na dole */}
                    <Scatter 
                      data={trialHistory.filter(t => t.result === 'goMiss').map(t => ({ ...t, reactionTime: 0 }))} 
                      fill="#fbbf24" 
                      fillOpacity={0.6}
                      shape="circle"
                    >
                      <ZAxis range={[20, 20]} />
                    </Scatter>
                    
                    {/* Błędy impulsywności - małe czerwone kropki na dole */}
                    <Scatter 
                      data={trialHistory.filter(t => t.result === 'noGoError').map(t => ({ ...t, reactionTime: 0 }))} 
                      fill="#f87171" 
                      fillOpacity={0.6}
                      shape="circle"
                    >
                      <ZAxis range={[20, 20]} />
                    </Scatter>
                    
                    {/* Warstwa 2: Linia trendu - średnia krocząca (grubsza linia) */}
                    <Line 
                      data={calculateMovingAverage(5)}
                      type="monotone"
                      dataKey="avgRT"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={false}
                      name="Średnia krocząca"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  size="lg" 
                  className="flex-1"
                  onClick={() => navigate(`/zawodnicy/${athleteId}?tab=dodaj-pomiar`)}
                >
                  Powrót
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(`/focus/${athleteId}`)}
                >
                  Następne wyzwanie
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ControlGame;
