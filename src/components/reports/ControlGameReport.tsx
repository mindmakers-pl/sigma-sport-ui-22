import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from "recharts";

interface ControlGameReportProps {
  results: {
    gameData: {
      avgRT: number;
      minRT: number;
      maxRT: number;
      goHits: number;
      goMisses: number;
      noGoErrors: number;
      trialHistory?: any[];
      reactionTimes: number[];
    };
    hrvData?: string;
  };
  variant: 'athlete' | 'coach';
}

export default function ControlGameReport({ results, variant }: ControlGameReportProps) {
  const { avgRT, minRT, maxRT, goHits, goMisses, noGoErrors, reactionTimes } = results.gameData;
  
  // Calculate metrics
  const totalGoTrials = goHits + goMisses;
  const hitRate = totalGoTrials > 0 ? ((goHits / totalGoTrials) * 100).toFixed(1) : '0.0';
  const inhibitionControl = noGoErrors;
  
  // Calculate performance level
  const getPerformanceLevel = () => {
    if (avgRT < 350 && noGoErrors <= 2) return { level: "Ekspert", color: "text-green-400", description: "Błyskawiczne reakcje i świetna kontrola!" };
    if (avgRT < 450 && noGoErrors <= 5) return { level: "Zaawansowany", color: "text-blue-400", description: "Bardzo dobry poziom kontroli!" };
    if (avgRT < 550 && noGoErrors <= 10) return { level: "Średnio-zaawansowany", color: "text-yellow-400", description: "Dobry wynik, ćwicz dalej!" };
    return { level: "Początkujący", color: "text-orange-400", description: "Potrzebujesz więcej treningu" };
  };

  const performance = getPerformanceLevel();

  // Calculate moving average for trend
  const calculateMovingAverage = () => {
    const windowSize = 5;
    const movingAvg: any[] = [];
    for (let i = 0; i < reactionTimes.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = reactionTimes.slice(start, i + 1);
      const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
      movingAvg.push({ trial: i + 1, avgRT: Math.round(avg) });
    }
    return movingAvg;
  };

  if (variant === 'athlete') {
    return (
      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div>
                <p className="text-slate-400 text-sm mb-2">Średni czas reakcji</p>
                <div className="text-6xl font-bold text-primary">
                  {avgRT}<span className="text-3xl">ms</span>
                </div>
              </div>
              
              <div className={`text-xl font-semibold ${performance.color}`}>
                {performance.level}
              </div>
              <p className="text-slate-300">{performance.description}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-400">{goHits}</div>
              <p className="text-slate-400 text-sm mt-1">Trafienia ✓</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-yellow-400">{goMisses}</div>
              <p className="text-slate-400 text-sm mt-1">Pominięcia</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-red-400">{noGoErrors}</div>
              <p className="text-slate-400 text-sm mt-1">Błędy kontroli ✗</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Najszybsza reakcja</span>
                <span className="text-white font-bold">{minRT} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Najwolniejsza reakcja</span>
                <span className="text-white font-bold">{maxRT} ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <h3 className="text-white font-semibold mb-3">💡 Co to znaczy?</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Sigma Control sprawdza Twoją szybkość reakcji i umiejętność hamowania - kiedy klikasz (zielone O) 
              i kiedy powstrzymujesz się od kliknięcia (czerwone X). Błędy kontroli oznaczają, że kliknąłeś, 
              gdy nie powinieneś - to normalne, trening pomoże!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Coach variant
  const rtVariability = reactionTimes.length > 0 
    ? Math.round(Math.sqrt(reactionTimes.reduce((sum, rt) => sum + Math.pow(rt - avgRT, 2), 0) / reactionTimes.length))
    : 0;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-primary">{avgRT}</div>
            <p className="text-slate-400 text-xs mt-2">Mean RT (ms)</p>
            <p className="text-slate-500 text-xs mt-1">SD: {rtVariability}ms</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-green-400">{hitRate}%</div>
            <p className="text-slate-400 text-xs mt-2">Hit Rate</p>
            <p className="text-slate-500 text-xs mt-1">{goHits}/{totalGoTrials} Go trials</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-red-400">{noGoErrors}</div>
            <p className="text-slate-400 text-xs mt-2">Inhibition Errors</p>
            <p className="text-slate-500 text-xs mt-1">NoGo failures</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <h3 className="text-white font-semibold mb-4">RT Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Min RT</p>
              <p className="text-2xl font-bold text-green-400">{minRT} ms</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Mean RT</p>
              <p className="text-2xl font-bold text-blue-400">{avgRT} ms</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Max RT</p>
              <p className="text-2xl font-bold text-orange-400">{maxRT} ms</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-slate-400 text-sm">RT Variability (SD)</p>
            <p className="text-2xl font-bold text-purple-400">{rtVariability} ms</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <h3 className="text-white font-semibold mb-4">Performance Breakdown</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-900/30 border border-green-700 rounded p-3 text-center">
              <p className="text-green-400 font-bold text-2xl">{goHits}</p>
              <p className="text-slate-400 text-xs">Go Hits</p>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-700 rounded p-3 text-center">
              <p className="text-yellow-400 font-bold text-2xl">{goMisses}</p>
              <p className="text-slate-400 text-xs">Go Misses</p>
            </div>
            <div className="bg-red-900/30 border border-red-700 rounded p-3 text-center">
              <p className="text-red-400 font-bold text-2xl">{noGoErrors}</p>
              <p className="text-slate-400 text-xs">NoGo Errors</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <h3 className="text-white font-semibold mb-4">Trend czasów reakcji</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={calculateMovingAverage()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="trial" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} 
                labelStyle={{ color: '#cbd5e1' }} 
              />
              <Line type="monotone" dataKey="avgRT" stroke="#10b981" strokeWidth={2} name="Moving Avg RT (5-trial window)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <h3 className="text-white font-semibold mb-4">Rozkład czasów reakcji</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis type="number" dataKey="trial" name="Trial" stroke="#94a3b8" />
              <YAxis type="number" dataKey="rt" name="RT (ms)" stroke="#94a3b8" />
              <ZAxis range={[50, 200]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} 
                labelStyle={{ color: '#cbd5e1' }} 
              />
              <Scatter 
                name="Reaction Time" 
                data={reactionTimes.map((rt, index) => ({ trial: index + 1, rt }))} 
                fill="#10b981" 
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {results.hrvData && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <h3 className="text-white font-semibold mb-3">Dane fizjologiczne</h3>
            <div>
              <p className="text-slate-400 text-sm">HRV</p>
              <p className="text-2xl font-bold text-blue-400">{results.hrvData}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <h3 className="text-white font-semibold mb-3">📊 Interpretacja dla trenera</h3>
          <div className="space-y-2 text-sm text-slate-300">
            <p><strong>Mean RT ({avgRT}ms):</strong> Średnia szybkość reakcji motorycznej. RT&lt;400ms to bardzo dobry wynik, wskazujący na wysoką sprawność psychomotoryczną.</p>
            <p><strong>RT Variability (SD: {rtVariability}ms):</strong> Zmienność czasów reakcji. Niska SD wskazuje na stabilność uwagi, wysoka SD może sugerować zmienną koncentrację lub zmęczenie.</p>
            <p><strong>Hit Rate ({hitRate}%):</strong> Procent prawidłowo wykonanych reakcji na sygnał Go. Wysoki hit rate = dobra czujność i szybkość reagowania.</p>
            <p><strong>Inhibition Errors ({noGoErrors}):</strong> Liczba błędnych reakcji na sygnał NoGo. Kluczowy wskaźnik kontroli impulsywności - mniej błędów = lepsza kontrola hamowania.</p>
            <p><strong>Zastosowanie:</strong> Go/NoGo mierzy zdolność do szybkiej reakcji (Go) i hamowania niepożądanej reakcji (NoGo). Kluczowe w sportach wymagających szybkiego przełączania się między akcją a powstrzymaniem (np. bramkarz, szermierka, tenis).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
