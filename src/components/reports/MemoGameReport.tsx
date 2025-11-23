import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MemoGameReportProps {
  results: {
    memo_accuracy_pct: number;
    memo_median_rt_ms: number;
    memo_hits: number;
    memo_misses: number;
    memo_false_alarms: number;
    memo_correct_rejections: number;
    memo_d_prime: number;
    memo_response_bias: number;
    memo_trials?: any[];
    memo_rmssd_ms?: number;
    memo_hr_bpm?: number;
  };
  variant: 'athlete' | 'coach';
}

export default function MemoGameReport({ results, variant }: MemoGameReportProps) {
  const accuracy = results.memo_accuracy_pct;
  const medianRT = results.memo_median_rt_ms;
  const dPrime = results.memo_d_prime;
  const responseBias = results.memo_response_bias;
  
  // Calculate performance level based on d'
  const getPerformanceLevel = () => {
    if (dPrime >= 3.0) return { level: "Ekspert", color: "text-green-400", description: "Wybitna pamięć robocza!" };
    if (dPrime >= 2.0) return { level: "Zaawansowany", color: "text-blue-400", description: "Bardzo dobry wynik!" };
    if (dPrime >= 1.0) return { level: "Średnio-zaawansowany", color: "text-yellow-400", description: "Dobry poziom, ćwicz dalej!" };
    return { level: "Początkujący", color: "text-orange-400", description: "Potrzebujesz więcej treningu" };
  };

  const performance = getPerformanceLevel();
  
  // Bias interpretation
  const getBiasInterpretation = () => {
    if (responseBias > 0.3) return { text: "Ostrożny", color: "text-blue-400", desc: "Rzadziej klikasz" };
    if (responseBias < -0.3) return { text: "Impulsywny", color: "text-orange-400", desc: "Często klikasz" };
    return { text: "Zrównoważony", color: "text-green-400", desc: "Dobra równowaga" };
  };

  const biasInfo = getBiasInterpretation();

  if (variant === 'athlete') {
    return (
      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div>
                <p className="text-slate-400 text-sm mb-2">Twój wynik celności</p>
                <div className="text-6xl font-bold text-primary">
                  {Math.round(accuracy)}%
                </div>
              </div>
              
              <div className={`text-xl font-semibold ${performance.color}`}>
                {performance.level}
              </div>
              <p className="text-slate-300">{performance.description}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-400">{results.memo_hits}</div>
              <p className="text-slate-400 text-sm mt-1">Trafienia ✓</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-400">{results.memo_correct_rejections}</div>
              <p className="text-slate-400 text-sm mt-1">Prawidłowe odrzucenia</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-yellow-400">{results.memo_misses}</div>
              <p className="text-slate-400 text-sm mt-1">Pominięcia</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-red-400">{results.memo_false_alarms}</div>
              <p className="text-slate-400 text-sm mt-1">Fałszywe alarmy</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Średni czas reakcji</span>
                <span className="text-white font-bold">{medianRT} ms</span>
              </div>
              <Progress value={Math.max(0, 100 - (medianRT / 10))} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <h3 className="text-white font-semibold mb-3">💡 Co to znaczy?</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Sigma Memo to test pamięci roboczej - sprawdza, jak dobrze pamiętasz, co było "dwa kroki wstecz". 
              W sporcie taka pamięć pomaga zapamiętywać akcje przeciwnika i przewidywać jego ruchy!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Coach variant
  const totalTrials = results.memo_hits + results.memo_misses + results.memo_false_alarms + results.memo_correct_rejections;
  const hitRate = totalTrials > 0 ? ((results.memo_hits / (results.memo_hits + results.memo_misses)) * 100).toFixed(1) : '0.0';
  const faRate = totalTrials > 0 ? ((results.memo_false_alarms / (results.memo_false_alarms + results.memo_correct_rejections)) * 100).toFixed(1) : '0.0';
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-primary">{Math.round(accuracy)}%</div>
            <p className="text-slate-400 text-xs mt-2">Overall Accuracy</p>
            <p className="text-slate-500 text-xs mt-1">{totalTrials} trials</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-green-400">{dPrime.toFixed(2)}</div>
            <p className="text-slate-400 text-xs mt-2">d' (Sensitivity)</p>
            <p className="text-slate-500 text-xs mt-1">Signal detection</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <div className={`text-4xl font-bold ${biasInfo.color}`}>{responseBias.toFixed(2)}</div>
            <p className="text-slate-400 text-xs mt-2">Response Bias (c)</p>
            <p className="text-slate-500 text-xs mt-1">{biasInfo.text}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <h3 className="text-white font-semibold mb-4">Signal Detection Theory Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm mb-1">Hit Rate</p>
              <p className="text-2xl font-bold text-green-400">{hitRate}%</p>
              <p className="text-slate-500 text-xs mt-1">{results.memo_hits} hits / {results.memo_hits + results.memo_misses} signals</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">False Alarm Rate</p>
              <p className="text-2xl font-bold text-red-400">{faRate}%</p>
              <p className="text-slate-500 text-xs mt-1">{results.memo_false_alarms} FA / {results.memo_false_alarms + results.memo_correct_rejections} noise</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <h3 className="text-white font-semibold mb-3">Confusion Matrix</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-green-900/30 border border-green-700 rounded p-3 text-center">
                <p className="text-green-400 font-bold text-xl">{results.memo_hits}</p>
                <p className="text-slate-400 text-xs">Hits (TP)</p>
              </div>
              <div className="bg-yellow-900/30 border border-yellow-700 rounded p-3 text-center">
                <p className="text-yellow-400 font-bold text-xl">{results.memo_misses}</p>
                <p className="text-slate-400 text-xs">Misses (FN)</p>
              </div>
              <div className="bg-red-900/30 border border-red-700 rounded p-3 text-center">
                <p className="text-red-400 font-bold text-xl">{results.memo_false_alarms}</p>
                <p className="text-slate-400 text-xs">False Alarms (FP)</p>
              </div>
              <div className="bg-blue-900/30 border border-blue-700 rounded p-3 text-center">
                <p className="text-blue-400 font-bold text-xl">{results.memo_correct_rejections}</p>
                <p className="text-slate-400 text-xs">Correct Rej. (TN)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <h3 className="text-white font-semibold mb-3">Reaction Time</h3>
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-sm">Median RT</p>
                <p className="text-3xl font-bold text-blue-400">{medianRT} ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {results.memo_rmssd_ms && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <h3 className="text-white font-semibold mb-3">Dane fizjologiczne</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm">rMSSD</p>
                <p className="text-2xl font-bold text-blue-400">{results.memo_rmssd_ms} ms</p>
              </div>
              {results.memo_hr_bpm && (
                <div>
                  <p className="text-slate-400 text-sm">HR</p>
                  <p className="text-2xl font-bold text-pink-400">{results.memo_hr_bpm} bpm</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <h3 className="text-white font-semibold mb-3">📊 Interpretacja dla trenera</h3>
          <div className="space-y-2 text-sm text-slate-300">
            <p><strong>d' (d-prime, {dPrime.toFixed(2)}):</strong> Miara czułości dyskryminacji sygnału od szumu. Wyższe d' = lepsza pamięć robocza. d'&gt;2.0 to bardzo dobry wynik.</p>
            <p><strong>Response Bias c ({responseBias.toFixed(2)}):</strong> c&gt;0 = konserwatywny (rzadziej klika), c&lt;0 = liberalny (często klika). Idealne c≈0 oznacza zrównoważoną strategię.</p>
            <p><strong>Accuracy ({Math.round(accuracy)}%):</strong> Ogólna celność odpowiedzi, ale d' lepiej mierzy rzeczywistą zdolność pamięci roboczej.</p>
            <p><strong>Median RT ({medianRT}ms):</strong> Szybkość podejmowania decyzji. Wysoka RT przy niskim d' może sugerować trudności z dostępem do pamięci roboczej.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
