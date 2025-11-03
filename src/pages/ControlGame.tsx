import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

type GameState = "ready" | "playing" | "finished";
type StimulusType = "Go" | "NoGo";
type Stimulus = { type: StimulusType } | null;

interface Results {
  goHits: number;
  goMisses: number;
  noGoErrors: number;
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
  
  // Czas rozpoczęcia ostatniej próby
  const [lastTrialStartTime, setLastTrialStartTime] = useState<number | null>(null);
  
  // Referencje do timerów (do czyszczenia)
  const gameTimerRef = useRef<number | null>(null);
  const loopTimerRef = useRef<number | null>(null);
  const stimulusTimerRef = useRef<number | null>(null);
  const omissionTimerRef = useRef<number | null>(null);

  // Funkcja rekurencyjna pętli gry
  const runGameLoop = () => {
    // 1. Pusta przerwa (1 sekunda)
    setCurrentStimulus(null);
    
    loopTimerRef.current = window.setTimeout(() => {
      // 2. Losowanie bodźca (80% Go, 20% NoGo)
      const random = Math.random();
      const stimulusType: StimulusType = random < 0.8 ? "Go" : "NoGo";
      
      // 3. Pokazanie bodźca
      setCurrentStimulus({ type: stimulusType });
      
      // 4. Zapisanie czasu rozpoczęcia próby
      const trialStartTime = Date.now();
      setLastTrialStartTime(trialStartTime);
      
      // 5. Timer na omission (tylko dla bodźca 'Go')
      if (stimulusType === "Go") {
        omissionTimerRef.current = window.setTimeout(() => {
          setCurrentStimulus((currentStim) => {
            // Jeśli gracz nie kliknął (bodziec nadal jest 'Go')
            if (currentStim?.type === "Go") {
              setResults((prev) => ({
                ...prev,
                goMisses: prev.goMisses + 1,
              }));
            }
            return null;
          });
        }, 1000);
      }
      
      // 6. Ukrycie bodźca po 1 sekundzie i kontynuacja pętli
      stimulusTimerRef.current = window.setTimeout(() => {
        setCurrentStimulus(null);
        
        // 7. Rekurencja - kolejna próba
        runGameLoop();
      }, 1000);
    }, 1000);
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
        
        return null; // Ukryj bodziec natychmiast
      }
      
      // Przypadek 3: Kliknięcie na pusty ekran (null)
      if (currentStim === null) {
        // Błąd Commission (impulsywność)
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
    setLastTrialStartTime(null);
  };

  // Reset gry
  const handleReset = () => {
    setGameState("ready");
    setCurrentStimulus(null);
    setResults({ goHits: 0, goMisses: 0, noGoErrors: 0 });
    setReactionTimes([]);
    setLastTrialStartTime(null);
  };

  // Obliczanie średniego czasu reakcji
  const calculateAverageRT = () => {
    if (reactionTimes.length === 0) return 0;
    const sum = reactionTimes.reduce((acc, rt) => acc + rt, 0);
    return Math.round(sum / reactionTimes.length);
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
                  <p className="text-slate-400 text-sm mb-1">Średni Czas Reakcji "Go"</p>
                  <p className="text-3xl font-bold text-emerald-300">{calculateAverageRT()} ms</p>
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
              
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => navigate(`/zawodnicy/${athleteId}?tab=dodaj-pomiar`)}
                >
                  Powrót
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full"
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
