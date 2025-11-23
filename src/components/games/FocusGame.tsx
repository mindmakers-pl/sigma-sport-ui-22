import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { determineGameContext } from "@/utils/gameContext";
import { useTrainings } from "@/hooks/useTrainings";
import { useToast } from "@/hooks/use-toast";
import { useFocusGame } from "@/hooks/useFocusGame";
import { generateCoachReport, filterTrials } from "@/utils/reports/focusGameReport";
import { calculateMedian } from "@/utils/gameResults";
import { HRVInputFields } from "@/components/game-shared/HRVInputFields";
import { GameResultsButtons } from "@/components/game-shared/GameResultsButtons";
import type { GameProps, ColorType } from "@/types/gameResults";

const COLOR_CLASSES: Record<ColorType, string> = {
  RED: "text-red-500",
  BLUE: "text-blue-500",
  GREEN: "text-green-500",
  YELLOW: "text-yellow-400"
};

export default function FocusGame({
  athleteId: athleteIdProp,
  onComplete,
  onGoToCockpit,
  mode = "training"
}: GameProps) {
  const navigate = useNavigate();
  const { athleteId: athleteIdParam } = useParams();
  const athleteId = athleteIdProp || athleteIdParam;
  const { addTraining } = useTrainings(athleteId);
  const { toast } = useToast();
  const { isLibrary, isMeasurement, isTraining } = determineGameContext(athleteId, mode);

  // Use custom hook for game logic
  const {
    gameState,
    phaseState,
    trials,
    currentTrialIndex,
    results,
    buttonsDisabled,
    manualRMSSD,
    manualHR,
    setManualRMSSD,
    setManualHR,
    handleStartGame,
    handleColorClick,
    totalTrials,
    currentTrial
  } = useFocusGame();

  const [coachReport, setCoachReport] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Generate coach report when game finishes
  useEffect(() => {
    if (gameState === 'finished' && results.length > 0 && !coachReport) {
      const report = generateCoachReport(results);
      setCoachReport(report);
      console.log("=== SIGMA FOCUS - COACH REPORT ===");
      console.log(JSON.stringify(report, null, 2));
    }
  }, [gameState, results, coachReport]);

  const handleLibraryComplete = () => {
    navigate('/biblioteka?tab=wyzwania');
  };

  const handleMeasurementComplete = () => {
    if (!coachReport) return;
    
    const validTrials = filterTrials(results);
    const correctCount = validTrials.filter(r => r.isCorrect).length;
    const accuracy = Math.round(correctCount / validTrials.length * 100);
    const congruentResults = validTrials.filter(r => r.type === 'CONGRUENT' && r.isCorrect).map(r => r.reactionTime);
    const incongruentResults = validTrials.filter(r => r.type === 'INCONGRUENT' && r.isCorrect).map(r => r.reactionTime);
    const medianCongruent = Math.round(calculateMedian(congruentResults));
    const medianIncongruent = Math.round(calculateMedian(incongruentResults));
    const concentrationCost = medianIncongruent - medianCongruent;

    const gameData = {
      accuracy: accuracy,
      totalTrials: totalTrials,
      correctCount: correctCount,
      coachReport: coachReport,
      focus_trials: results,
      focus_median_congruent_ms: medianCongruent,
      focus_median_incongruent_ms: medianIncongruent,
      focus_concentration_cost_ms: concentrationCost,
      focus_accuracy_pct: accuracy,
      focus_correct_count: correctCount,
      focus_total_trials: totalTrials,
      focus_valid_trials: validTrials.length,
      focus_coach_report: coachReport,
      focus_rmssd_ms: manualRMSSD ? parseFloat(manualRMSSD) : null,
      focus_avg_hr_bpm: manualHR ? parseFloat(manualHR) : null
    };
    
    if (onComplete) {
      onComplete(gameData);
    }
  };

  const handleTrainingEnd = () => {
    navigate(`/zawodnicy/${athleteId}?tab=trening`);
  };

  const handleTrainingSave = async () => {
    if (!coachReport) return;
    
    setIsSaving(true);
    const validTrials = filterTrials(results);
    const correctCount = validTrials.filter(r => r.isCorrect).length;
    const accuracy = Math.round(correctCount / validTrials.length * 100);
    const congruentResults = validTrials.filter(r => r.type === 'CONGRUENT' && r.isCorrect).map(r => r.reactionTime);
    const incongruentResults = validTrials.filter(r => r.type === 'INCONGRUENT' && r.isCorrect).map(r => r.reactionTime);
    const medianCongruent = Math.round(calculateMedian(congruentResults));
    const medianIncongruent = Math.round(calculateMedian(incongruentResults));
    const concentrationCost = medianIncongruent - medianCongruent;

    const gameData = {
      accuracy: accuracy,
      totalTrials: totalTrials,
      correctCount: correctCount,
      coachReport: coachReport,
      focus_trials: results,
      focus_median_congruent_ms: medianCongruent,
      focus_median_incongruent_ms: medianIncongruent,
      focus_concentration_cost_ms: concentrationCost,
      focus_accuracy_pct: accuracy,
      focus_correct_count: correctCount,
      focus_total_trials: totalTrials,
      focus_valid_trials: validTrials.length,
      focus_coach_report: coachReport,
      focus_rmssd_ms: manualRMSSD ? parseFloat(manualRMSSD) : null,
      focus_avg_hr_bpm: manualHR ? parseFloat(manualHR) : null
    };
    
    const { error } = await addTraining({
      athlete_id: athleteId!,
      task_type: 'focus',
      date: new Date().toISOString(),
      results: gameData
    });
    
    setIsSaving(false);
    
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
      navigate(`/zawodnicy/${athleteId}?tab=trening`);
    }
  };

  // Ready screen
  if (gameState === "ready") {
    return (
      <div className="min-h-screen bg-slate-950 p-4">
        {!onComplete && (
          <Button variant="ghost" className="text-white hover:bg-slate-800 mb-4" onClick={() => navigate(`/zawodnicy/${athleteId}?tab=dodaj-pomiar`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>
        )}
        
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="max-w-3xl w-full bg-slate-900 rounded-2xl p-12 space-y-8 shadow-2xl">
            <h1 className="text-5xl font-bold text-white text-center mb-6">Wyzwanie Sigma Focus</h1>
            
            <div className="space-y-6 text-slate-200 leading-relaxed text-center animate-fade-in">
              <p className="text-lg">
                Na ekranie pojawi się napis z nazwą koloru (np. "CZERWONY"). Twoim zadaniem jest kliknąć w kwadrat w kolorze wyświetlonego napisu. Zrób to jak najszybciej potrafisz unikając błędów.
              </p>
              
              <p className="text-lg font-semibold text-red-400">
                Ignoruj treść słowa!
              </p>

              <div className="bg-slate-800 rounded-xl p-6 space-y-4 border border-slate-700">
                <p className="font-semibold text-sm text-slate-400">Schemat sterowania:</p>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="space-y-2 text-center">
                    <div className="w-16 h-16 bg-red-500 rounded-lg mx-auto"></div>
                    <div className="w-16 h-16 bg-green-500 rounded-lg mx-auto"></div>
                    <p className="text-sm text-slate-400">Lewa strona</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-white">SŁOWO</p>
                    <p className="text-sm text-slate-400 mt-2">Środek ekranu</p>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-lg mx-auto"></div>
                    <div className="w-16 h-16 bg-yellow-400 rounded-lg mx-auto"></div>
                    <p className="text-sm text-slate-400">Prawa strona</p>
                  </div>
                </div>
              </div>
              
              <p className="text-center text-lg">
                Wyzwanie składa się z <span className="font-bold text-white">80 prób</span>.
              </p>

              <p className="text-center text-lg text-yellow-400 font-semibold">
                Utrzymaj koncentrację do samego końca!
              </p>
            </div>
            
            <Button size="lg" className="w-full text-2xl py-8 mt-8 bg-primary hover:bg-primary/90" onClick={handleStartGame}>
              START
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Finished screen
  if (gameState === "finished" && coachReport) {
    // Use FILTERED data for display (150-1500ms)
    const validTrials = filterTrials(results);
    const correctCount = validTrials.filter(r => r.isCorrect).length;
    const accuracy = Math.round(correctCount / validTrials.length * 100);

    // Calculate median reaction times for congruent and incongruent (filtered, correct only)
    const congruentResults = validTrials.filter(r => r.type === 'CONGRUENT' && r.isCorrect).map(r => r.reactionTime);
    const incongruentResults = validTrials.filter(r => r.type === 'INCONGRUENT' && r.isCorrect).map(r => r.reactionTime);
    const medianCongruent = Math.round(calculateMedian(congruentResults));
    const medianIncongruent = Math.round(calculateMedian(incongruentResults));
    const overallMedian = Math.round(calculateMedian(validTrials.filter(r => r.isCorrect).map(r => r.reactionTime)));
    const concentrationCost = medianIncongruent - medianCongruent;
    const chartScale = Math.max(medianCongruent, medianIncongruent);
    const trendData = validTrials.map((r, idx) => ({
      trial: idx + 1,
      reactionTime: r.reactionTime,
      type: r.type,
      isCorrect: r.isCorrect
    }));
    
    return (
      <div className="min-h-screen bg-slate-950 p-4">
        {!onComplete && (
          <Button variant="ghost" className="text-white hover:bg-slate-800 mb-4" onClick={() => navigate(`/zawodnicy/${athleteId}?tab=dodaj-pomiar`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>
        )}
        
        <div className="flex items-center justify-center" style={{minHeight: 'calc(100vh - 80px)'}}>
          <Card className="max-w-4xl w-full border-slate-700 bg-slate-800 animate-scale-in">
            <CardContent className="pt-6 space-y-6">
              <h2 className="text-xl font-semibold text-white text-center mb-6">
                Wynik wyzwania Sigma Focus
              </h2>
              
              <div className="space-y-4">
                {/* Top Section: Overall Median + Accuracy */}
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm mb-2">Twój czas reakcji (mediana)</p>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <p className="text-3xl font-bold text-primary">{overallMedian} ms</p>
                      <p className="text-xs text-slate-500">dla wszystkich poprawnych trafień</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-green-400">{accuracy}%</p>
                      <p className="text-xs text-slate-500">Celność ({correctCount}/{validTrials.length})</p>
                    </div>
                  </div>
                </div>

                {/* Middle Section: Comparison */}
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Czas reakcji w zależności od trudności</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <p className="text-slate-300 text-sm font-medium">Typ trafienia:</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 font-semibold">ŁATWY</span>
                          <span className="text-slate-200 font-bold">{medianCongruent} ms</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-6 overflow-hidden">
                          <div className="bg-green-600 h-full rounded-full transition-all duration-500" style={{width: `${medianCongruent / chartScale * 100}%`}} />
                        </div>
                        <p className="text-xs text-slate-500">kolor jak tekst</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 font-semibold">TRUDNE</span>
                          <span className="text-slate-200 font-bold">{medianIncongruent} ms</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-6 overflow-hidden">
                          <div className="bg-red-600 h-full rounded-full transition-all duration-500" style={{width: `${medianIncongruent / chartScale * 100}%`}} />
                        </div>
                        <p className="text-xs text-slate-500">zmyłki</p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center pl-4 border-l border-slate-600">
                      <p className="text-slate-400 text-sm mb-2">Różnica</p>
                      <p className="text-3xl font-bold text-yellow-400 mb-2">+{concentrationCost} ms</p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Im mniejsza, tym lepiej ignorujesz zakłócacze.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trend Chart */}
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Krzywa koncentracji</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="trial" stroke="#94a3b8" label={{value: 'Numer próby', position: 'insideBottom', offset: -5, fill: '#94a3b8'}} />
                        <YAxis stroke="#94a3b8" label={{value: 'Czas reakcji (ms)', angle: -90, position: 'insideLeft', fill: '#94a3b8'}} />
                        <Tooltip contentStyle={{backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px'}} labelStyle={{color: '#e2e8f0'}} itemStyle={{color: '#e2e8f0'}} formatter={(value: any, name: any, props: any) => {
                          const type = props.payload.type === 'CONGRUENT' ? 'ŁATWY' : 'TRUDNE';
                          const correct = props.payload.isCorrect ? '✓' : '✗';
                          return [`${value} ms (${type}) ${correct}`, 'Czas reakcji'];
                        }} />
                        <Legend wrapperStyle={{paddingTop: '10px'}} formatter={value => <span style={{color: '#e2e8f0'}}>{value}</span>} />
                        <Line type="monotone" dataKey="reactionTime" stroke="#3b82f6" strokeWidth={2} dot={(props: any) => {
                          const {cx, cy, payload} = props;
                          const color = payload.type === 'CONGRUENT' ? '#22c55e' : '#ef4444';
                          const size = payload.isCorrect ? 4 : 6;
                          const opacity = payload.isCorrect ? 0.6 : 1;
                          return <circle key={`trial-${payload.trialNumber || `${cx}-${cy}`}`} cx={cx} cy={cy} r={size} fill={color} opacity={opacity} stroke={payload.isCorrect ? 'none' : '#fbbf24'} strokeWidth={payload.isCorrect ? 0 : 2} />;
                        }} name="Czas reakcji" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 flex gap-4 justify-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-slate-400">Łatwy (zgodny)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-slate-400">Trudny (niezgodny)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border-2 border-yellow-400"></div>
                      <span className="text-slate-400">Błąd</span>
                    </div>
                  </div>
                </div>

                {/* HRV Input Fields */}
                <HRVInputFields
                  rmssd={manualRMSSD}
                  hr={manualHR}
                  onRmssdChange={setManualRMSSD}
                  onHrChange={setManualHR}
                  className="bg-slate-700/50 p-4 rounded-lg"
                />
              </div>

              <GameResultsButtons
                isLibrary={isLibrary}
                isMeasurement={isMeasurement}
                isTraining={isTraining}
                onLibraryComplete={handleLibraryComplete}
                onMeasurementComplete={handleMeasurementComplete}
                onTrainingEnd={handleTrainingEnd}
                onTrainingSave={handleTrainingSave}
                isSaving={isSaving}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Playing screen - 3 column layout
  const progress = (currentTrialIndex + 1) / totalTrials * 100;
  
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative">
      {/* Back button in top-left corner */}
      {mode === "training" && onGoToCockpit && (
        <button onClick={onGoToCockpit} className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors z-10">
          ← Powrót
        </button>
      )}

      {/* Very thin progress bar at top */}
      <div className="h-0.5">
        <Progress value={progress} className="h-0.5 rounded-none" />
      </div>

      {/* Main game area - 3 columns */}
      <div className="flex-1 flex flex-row">
        {/* Left Column - Red and Green buttons */}
        <div className="w-1/4 flex flex-col items-center justify-center gap-8 p-8">
          <button 
            onPointerDown={e => handleColorClick('RED', e)} 
            onTouchStart={e => handleColorClick('RED', e)} 
            disabled={buttonsDisabled} 
            className="aspect-square w-40 bg-red-500 rounded-2xl hover:bg-red-600 active:scale-95 transition-all disabled:cursor-not-allowed" 
            aria-label="Red" 
          />
          <button 
            onPointerDown={e => handleColorClick('GREEN', e)} 
            onTouchStart={e => handleColorClick('GREEN', e)} 
            disabled={buttonsDisabled} 
            className="aspect-square w-40 bg-green-500 rounded-2xl hover:bg-green-600 active:scale-95 transition-all disabled:cursor-not-allowed" 
            aria-label="Green" 
          />
        </div>

        {/* Center Column - Stimulus area */}
        <div className="w-1/2 flex items-center justify-center">
          {phaseState === "fixation" && (
            <div className="text-white text-6xl font-bold">+</div>
          )}
          {phaseState === "isi" && (
            <div className="text-white text-6xl font-bold opacity-0">+</div>
          )}
          {phaseState === "stimulus" && currentTrial && (
            <div className={`text-7xl font-bold ${COLOR_CLASSES[currentTrial.stimulusColor]}`}>
              {currentTrial.stimulusWord}
            </div>
          )}
        </div>

        {/* Right Column - Blue and Yellow buttons */}
        <div className="w-1/4 flex flex-col items-center justify-center gap-8 p-8">
          <button 
            onPointerDown={e => handleColorClick('BLUE', e)} 
            onTouchStart={e => handleColorClick('BLUE', e)} 
            disabled={buttonsDisabled} 
            className="aspect-square w-40 bg-blue-500 rounded-2xl hover:bg-blue-600 active:scale-95 transition-all disabled:cursor-not-allowed" 
            aria-label="Blue" 
          />
          <button 
            onPointerDown={e => handleColorClick('YELLOW', e)} 
            onTouchStart={e => handleColorClick('YELLOW', e)} 
            disabled={buttonsDisabled} 
            className="aspect-square w-40 bg-yellow-400 rounded-2xl hover:bg-yellow-500 active:scale-95 transition-all disabled:cursor-not-allowed" 
            aria-label="Yellow" 
          />
        </div>
      </div>
    </div>
  );
}
