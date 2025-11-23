import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScanGameReportProps {
  results: {
    scan_max_number_reached: number;
    scan_duration_s: number;
    scan_correct_clicks: number;
    scan_error_clicks: number;
    scan_skipped_numbers: number[];
    scan_rmssd_ms?: number;
    scan_avg_hr_bpm?: number;
    scan_raw_clicks?: any[];
  };
  variant: 'athlete' | 'coach';
}

export function ScanGameReport({ results, variant }: ScanGameReportProps) {
  const maxNumber = results.scan_max_number_reached;
  const correctClicks = results.scan_correct_clicks;
  const errorClicks = results.scan_error_clicks;
  const skippedNumbers = results.scan_skipped_numbers || [];
  
  // Calculate performance level
  const getPerformanceLevel = () => {
    if (maxNumber >= 50) return { level: "Ekspert", color: "text-green-400", description: "Fenomenalna koncentracja!" };
    if (maxNumber >= 35) return { level: "Zaawansowany", color: "text-blue-400", description: "Świetna praca!" };
    if (maxNumber >= 20) return { level: "Średnio-zaawansowany", color: "text-yellow-400", description: "Dobry wynik, ćwicz dalej!" };
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
                <p className="text-slate-400 text-sm mb-2">Twój najlepszy wynik</p>
                <div className="text-6xl font-bold text-primary">
                  {maxNumber.toString().padStart(2, '0')}
                </div>
                <p className="text-slate-400 text-sm mt-2">z 63 możliwych</p>
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
              <div className="text-3xl font-bold text-green-400">{correctClicks}</div>
              <p className="text-slate-400 text-sm mt-1">Trafienia ✓</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-red-400">{errorClicks}</div>
              <p className="text-slate-400 text-sm mt-1">Pomyłki ✗</p>
            </CardContent>
          </Card>
        </div>

        {skippedNumbers.length > 0 && (
          <Card className="bg-amber-900/20 border-amber-700/50">
            <CardContent className="pt-6">
              <p className="text-amber-400 text-sm mb-3 font-semibold">Pominięte liczby:</p>
              <div className="flex flex-wrap gap-2">
                {skippedNumbers.slice(0, 10).map((num, idx) => (
                  <Badge key={idx} variant="outline" className="bg-amber-900/30 text-amber-300 border-amber-600">
                    {num.toString().padStart(2, '0')}
                  </Badge>
                ))}
                {skippedNumbers.length > 10 && (
                  <Badge variant="outline" className="bg-amber-900/30 text-amber-300 border-amber-600">
                    +{skippedNumbers.length - 10} więcej
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <h3 className="text-white font-semibold mb-3">💡 Co to znaczy?</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Siatka Koncentracji sprawdza, jak długo potrafisz utrzymać skupienie podczas szukania liczb w kolejności. 
              Im wyższa liczba, tym lepsza Twoja koncentracja i umiejętność szybkiego skanowania wzrokiem!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Coach variant
  const accuracyRate = correctClicks > 0 ? (correctClicks / (correctClicks + errorClicks) * 100).toFixed(1) : '0.0';
  const coveragePercent = ((maxNumber + 1) / 64 * 100).toFixed(1);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-primary">{maxNumber}</div>
            <p className="text-slate-400 text-xs mt-2">Max osiągnięta liczba</p>
            <p className="text-slate-500 text-xs mt-1">{coveragePercent}% pokrycia</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-green-400">{accuracyRate}%</div>
            <p className="text-slate-400 text-xs mt-2">Accuracy Rate</p>
            <p className="text-slate-500 text-xs mt-1">{correctClicks}/{correctClicks + errorClicks} clicks</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-yellow-400">{results.scan_duration_s}s</div>
            <p className="text-slate-400 text-xs mt-2">Czas trwania</p>
            <p className="text-slate-500 text-xs mt-1">60s limit</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <h3 className="text-white font-semibold mb-3">Analiza błędów</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Kliknięcia błędne</p>
              <p className="text-2xl font-bold text-red-400">{errorClicks}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Pominięte liczby</p>
              <p className="text-2xl font-bold text-orange-400">{skippedNumbers.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {skippedNumbers.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <h3 className="text-white font-semibold mb-3">Lista pominiętych liczb</h3>
            <div className="flex flex-wrap gap-2">
              {skippedNumbers.map((num, idx) => (
                <Badge key={idx} variant="outline" className="bg-slate-700 text-slate-300 border-slate-600">
                  {num.toString().padStart(2, '0')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {results.scan_rmssd_ms && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <h3 className="text-white font-semibold mb-3">Dane fizjologiczne</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm">rMSSD</p>
                <p className="text-2xl font-bold text-blue-400">{results.scan_rmssd_ms} ms</p>
              </div>
              {results.scan_avg_hr_bpm && (
                <div>
                  <p className="text-slate-400 text-sm">Avg HR</p>
                  <p className="text-2xl font-bold text-pink-400">{results.scan_avg_hr_bpm} bpm</p>
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
            <p><strong>Max number ({maxNumber}):</strong> Miara trwałości koncentracji - im wyższa, tym dłużej zawodnik utrzymuje focus.</p>
            <p><strong>Accuracy Rate ({accuracyRate}%):</strong> Precyzja skanowania - wysoka accuracy wskazuje na kontrolę impulsywności.</p>
            <p><strong>Error clicks ({errorClicks}):</strong> Nieprawidłowe kliknięcia mogą sugerować nadmierną impulsywność lub zmęczenie.</p>
            <p><strong>Skipped numbers ({skippedNumbers.length}):</strong> Przeskoczone liczby wskazują na luki w skanowaniu wzrokowym lub pośpiech.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
