import { Card, CardContent } from "@/components/ui/card";

interface TrackerGameReportProps {
  results: {
    gameData: {
      level: number;
      finalScore: {
        correct: number;
        total: number;
      };
      mistakes: number;
    };
    hrvData?: string;
  };
  variant: 'athlete' | 'coach';
}

export function TrackerGameReport({ results, variant }: TrackerGameReportProps) {
  const { level, finalScore, mistakes } = results.gameData;
  const accuracyPercent = finalScore.total > 0 
    ? ((finalScore.correct / finalScore.total) * 100).toFixed(1) 
    : '0.0';
  
  // Calculate performance level
  const getPerformanceLevel = () => {
    if (level >= 8) return { level: "Ekspert", color: "text-green-400", description: "Fenomenalne śledzenie obiektów!" };
    if (level >= 6) return { level: "Zaawansowany", color: "text-blue-400", description: "Świetna uwaga przestrzenna!" };
    if (level >= 4) return { level: "Średnio-zaawansowany", color: "text-yellow-400", description: "Dobry wynik, ćwicz dalej!" };
    return { level: "Początkujący", color: "text-orange-400", description: "Potrzebujesz więcej treningu" };
  };

  const performance = getPerformanceLevel();

  if (variant === 'athlete') {
    return (
      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div>
                <p className="text-slate-400 text-sm mb-2">Osiągnięty poziom</p>
                <div className="text-6xl font-bold text-primary">
                  {level}
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
              <div className="text-3xl font-bold text-green-400">{finalScore.correct}</div>
              <p className="text-slate-400 text-sm mt-1">Poprawne ✓</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-red-400">{mistakes}</div>
              <p className="text-slate-400 text-sm mt-1">Błędy ✗</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Ostatnia próba</p>
              <div className="text-4xl font-bold text-blue-400">
                {finalScore.correct}/{finalScore.total}
              </div>
              <p className="text-slate-300 text-sm mt-2">
                {accuracyPercent}% celności
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <h3 className="text-white font-semibold mb-3">💡 Co to znaczy?</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Sigma Tracker sprawdza Twoją uwagę przestrzenną - umiejętność śledzenia wielu obiektów jednocześnie. 
              W sporcie pomaga to obserwować przeciwników, kolegów z drużyny i piłkę w tym samym czasie!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Coach variant
  const errorRate = ((mistakes / (mistakes + level)) * 100).toFixed(1);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-primary">{level}</div>
            <p className="text-slate-400 text-xs mt-2">Highest Level Reached</p>
            <p className="text-slate-500 text-xs mt-1">Staircase progression</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-green-400">{accuracyPercent}%</div>
            <p className="text-slate-400 text-xs mt-2">Last Trial Accuracy</p>
            <p className="text-slate-500 text-xs mt-1">{finalScore.correct}/{finalScore.total} correct</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-red-400">{mistakes}</div>
            <p className="text-slate-400 text-xs mt-2">Total Mistakes</p>
            <p className="text-slate-500 text-xs mt-1">{errorRate}% error rate</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <h3 className="text-white font-semibold mb-4">Performance Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Levels completed successfully</span>
              <span className="text-white font-bold">{level}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Failed attempts</span>
              <span className="text-white font-bold">{mistakes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Success rate</span>
              <span className="text-white font-bold">{(100 - parseFloat(errorRate)).toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <h3 className="text-white font-semibold mb-3">Final Trial Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Correct identifications</p>
              <p className="text-2xl font-bold text-green-400">{finalScore.correct}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total targets</p>
              <p className="text-2xl font-bold text-blue-400">{finalScore.total}</p>
            </div>
          </div>
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
            <p><strong>Level ({level}):</strong> Maksymalny poziom złożoności, jaki zawodnik potrafi obsłużyć. Wyższy poziom = lepsza zdolność do śledzenia wielu obiektów (MOT - Multiple Object Tracking).</p>
            <p><strong>Mistakes ({mistakes}):</strong> Liczba błędnych prób. Wysoka liczba błędów może wskazywać na trudności z utrzymaniem uwagi przestrzennej pod presją czasu.</p>
            <p><strong>Accuracy ({accuracyPercent}%):</strong> Celność w ostatniej próbie przed zakończeniem. Niska accuracy przy wysokim poziomie może sugerować, że zawodnik osiągnął swój limit kognitywny.</p>
            <p><strong>Zastosowanie w sporcie:</strong> MOT jest kluczowe w sportach zespołowych (piłka nożna, koszykówka, hokej) - umiejętność równoczesnego monitorowania pozycji wielu graczy i piłki.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
