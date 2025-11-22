import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function SessionDetail() {
  const { athleteId, sessionId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taskView = searchParams.get("task") || "overview";
  
  const [session, setSession] = useState<any>(null);
  const [athlete, setAthlete] = useState<any>(null);

  useEffect(() => {
    // Load session data
    const sessions = JSON.parse(localStorage.getItem('athlete_sessions') || '[]');
    const foundSession = sessions.find((s: any) => s.id === sessionId);
    setSession(foundSession);

    // Load athlete data
    const athletes = JSON.parse(localStorage.getItem('athletes') || '[]');
    const foundAthlete = athletes.find((a: any) => a.id === parseInt(athleteId || "0"));
    setAthlete(foundAthlete);
  }, [athleteId, sessionId]);

  if (!session || !athlete) {
    return (
      <div className="p-8">
        <p>Ładowanie...</p>
      </div>
    );
  }

  const completedTasks = Object.entries(session.taskStatus)
    .filter(([_, status]) => status === 'completed')
    .map(([task]) => task);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(session, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `session-${session.id}-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    // Basic CSV export for focus game trials
    if (session.results.focus?.coachReport?.rawTrials) {
      const trials = session.results.focus.coachReport.rawTrials;
      const headers = ['trialId', 'type', 'stimulusWord', 'stimulusColor', 'userAction', 'isCorrect', 'reactionTime', 'timestamp'];
      const csvContent = [
        headers.join(','),
        ...trials.map((t: any) => headers.map(h => t[h]).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `session-${session.id}-focus-trials.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Overview screen
  if (taskView === "overview") {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate(`/zawodnicy/${athleteId}?tab=raporty`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót do historii
        </Button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Szczegóły sesji pomiarowej
          </h2>
          <p className="text-slate-600">
            {athlete.name} • {new Date(session.date).toLocaleDateString('pl-PL', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <Badge variant="outline" className="mt-2">
            {session.conditions}
          </Badge>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Podsumowanie Sesji</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">Status</p>
                <p className="text-lg font-semibold">
                  {session.inProgress ? "W trakcie" : "Zakończona"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Ukończone testy</p>
                <p className="text-lg font-semibold">
                  {completedTasks.length}/7
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Warunki</p>
                <p className="text-lg font-semibold capitalize">
                  {session.conditions}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Data</p>
                <p className="text-lg font-semibold">
                  {new Date(session.date).toLocaleDateString('pl-PL')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wykonane Testy</CardTitle>
            <p className="text-sm text-slate-600">Kliknij test, aby zobaczyć szczegółowy raport</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedTasks.map((task) => {
                const taskNames: Record<string, string> = {
                  kwestionariusz: "Kwestionariusz",
                  hrv_baseline: "HRV Baseline",
                  scan: "Sigma Scan",
                  control: "Sigma Control",
                  focus: "Sigma Focus",
                  sigma_move: "Sigma Move",
                  hrv_training: "HRV Training"
                };

                const taskIcons: Record<string, string> = {
                  focus: "🎯",
                  scan: "👁️",
                  control: "🎮",
                  kwestionariusz: "📋",
                  hrv_baseline: "❤️",
                  sigma_move: "🏃",
                  hrv_training: "🧘"
                };

                return (
                  <Card
                    key={task}
                    className="border-slate-200 hover:border-primary/50 transition-colors cursor-pointer bg-slate-50 hover:bg-slate-100"
                    onClick={() => navigate(`/zawodnicy/${athleteId}/sesja/${sessionId}?task=${task}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{taskIcons[task]}</div>
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {taskNames[task]}
                          </h3>
                          <p className="text-sm text-slate-600">
                            Kliknij, aby zobaczyć szczegóły
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sigma Focus detailed view
  if (taskView === "focus" && session.results.focus) {
    const focusData = session.results.focus;
    const coachReport = focusData.coachReport;

    if (!coachReport) {
      return (
        <div className="p-8">
          <p>Brak danych coach report dla tego testu.</p>
        </div>
      );
    }

    // Prepare chart data for difficulty comparison
    const difficultyChartData = [
      {
        name: "ŁATWE\n(Bez konfliktu)",
        medianRT: coachReport.coachMetrics.congruent.medianRT,
        label: "Congruent"
      },
      {
        name: "TRUDNE\n(Z konfliktem)",
        medianRT: coachReport.coachMetrics.incongruent.medianRT,
        label: "Incongruent"
      }
    ];

    // Prepare trial-by-trial chart data (showing errors)
    const trialChartData = coachReport.rawTrials?.slice(0, 80).map((trial: any, idx: number) => ({
      trial: idx + 1,
      rt: trial.reactionTime,
      isError: !trial.isCorrect
    })) || [];

    return (
      <div className="p-8 max-w-6xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate(`/zawodnicy/${athleteId}/sesja/${sessionId}?task=overview`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót do podsumowania
        </Button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Raport Sigma Focus (Stroop Test)
          </h2>
          <p className="text-slate-600">
            {athlete.name} • {new Date(session.date).toLocaleDateString('pl-PL')}
          </p>
        </div>

        <Tabs defaultValue="player" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="player">Dla Zawodnika</TabsTrigger>
            <TabsTrigger value="coach">Dla Trenera</TabsTrigger>
            <TabsTrigger value="export">Eksport Danych</TabsTrigger>
          </TabsList>

          {/* Player View - Simple metrics */}
          <TabsContent value="player" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Twój czas reakcji (mediana)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-5xl font-bold text-primary">
                    {coachReport.playerMetrics.medianRT}
                  </span>
                  <span className="text-2xl text-slate-600">ms</span>
                  <div className="ml-auto">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {coachReport.playerMetrics.accuracy}% trafień
                      <span className="ml-2 text-slate-500">
                        ({focusData.correctCount}/{focusData.totalTrials})
                      </span>
                    </Badge>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-4">
                    Porównanie trudności
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={difficultyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        interval={0}
                      />
                      <YAxis 
                        label={{ value: 'Czas reakcji (ms)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip />
                      <Bar dataKey="medianRT" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Różnica (Koszt Koncentracji)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg">
                  <div className="flex items-baseline gap-4 mb-3">
                    <span className="text-4xl font-bold text-amber-700">
                      +{coachReport.coachMetrics.interferenceCost.rawMs}
                    </span>
                    <span className="text-xl text-amber-600">ms</span>
                  </div>
                  <p className="text-sm text-amber-800">
                    Im mniejsza różnica, tym lepiej ignorujesz zakłócacze
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Krzywa Koncentracji</CardTitle>
                <p className="text-sm text-slate-600">
                  Czerwone punkty pokazują błędy
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trialChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="trial" 
                      label={{ value: 'Numer próby', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Czas reakcji (ms)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="rt" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        if (payload.isError) {
                          return (
                            <circle 
                              cx={cx} 
                              cy={cy} 
                              r={5} 
                              fill="red" 
                              stroke="darkred" 
                              strokeWidth={2}
                            />
                          );
                        }
                        return null;
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {(focusData.rMSSD || focusData.HR) && (
              <Card>
                <CardHeader>
                  <CardTitle>Powiązany Pomiar HRV</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {focusData.rMSSD && (
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-600 mb-1">Średnie rMSSD</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {focusData.rMSSD} <span className="text-base font-normal">ms</span>
                        </p>
                      </div>
                    )}
                    {focusData.HR && (
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-600 mb-1">Średnie HR</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {focusData.HR} <span className="text-base font-normal">bpm</span>
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Coach View - Advanced metrics */}
          <TabsContent value="coach" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informacje o Sesji</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Wszystkie próby</p>
                    <p className="text-2xl font-bold">{coachReport.sessionInfo.totalTrials}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Prawidłowe próby</p>
                    <p className="text-2xl font-bold text-green-700">{coachReport.sessionInfo.validTrials}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Odrzucone</p>
                    <p className="text-2xl font-bold text-red-700">{coachReport.sessionInfo.filteredOut}</p>
                    <p className="text-xs text-red-600 mt-1">&lt;150ms lub &gt;1500ms</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Najdłuższa seria</p>
                    <p className="text-2xl font-bold text-blue-700">{coachReport.playerMetrics.bestStreak}</p>
                    <p className="text-xs text-blue-600 mt-1">bez błędów</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Congruent Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">Próby Zgodne (Congruent)</CardTitle>
                  <p className="text-sm text-slate-600">Łatwe - bez konfliktu</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">Mediana RT</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {coachReport.coachMetrics.congruent.medianRT} <span className="text-lg font-normal">ms</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Procent błędów</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {(coachReport.coachMetrics.congruent.errorRate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">IES (Inverse Efficiency Score)</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {coachReport.coachMetrics.congruent.ies}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Niższy = lepszy</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">IQR (Zmienność)</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {coachReport.coachMetrics.variability.congruentIQR} <span className="text-lg font-normal">ms</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Próby analizowane</p>
                    <p className="text-xl font-bold text-slate-900">
                      {coachReport.coachMetrics.congruent.validTrials}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Incongruent Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-700">Próby Niezgodne (Incongruent)</CardTitle>
                  <p className="text-sm text-slate-600">Trudne - z konfliktem</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">Mediana RT</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {coachReport.coachMetrics.incongruent.medianRT} <span className="text-lg font-normal">ms</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Procent błędów</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {(coachReport.coachMetrics.incongruent.errorRate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">IES (Inverse Efficiency Score)</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {coachReport.coachMetrics.incongruent.ies}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Niższy = lepszy</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">IQR (Zmienność)</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {coachReport.coachMetrics.variability.incongruentIQR} <span className="text-lg font-normal">ms</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Próby analizowane</p>
                    <p className="text-xl font-bold text-slate-900">
                      {coachReport.coachMetrics.incongruent.validTrials}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Koszt Interferencji</CardTitle>
                <p className="text-sm text-slate-600">
                  Różnice między próbami niezgodnymi a zgodnymi
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg">
                    <p className="text-sm text-amber-700 mb-2 font-semibold">Różnica Median RT</p>
                    <p className="text-4xl font-bold text-amber-800">
                      +{coachReport.coachMetrics.interferenceCost.rawMs} <span className="text-xl">ms</span>
                    </p>
                    <p className="text-sm text-amber-700 mt-3">
                      Czas dodatkowy potrzebny na przetworzenie konfliktu
                    </p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                    <p className="text-sm text-purple-700 mb-2 font-semibold">Różnica IES</p>
                    <p className="text-4xl font-bold text-purple-800">
                      +{coachReport.coachMetrics.interferenceCost.iesDiff}
                    </p>
                    <p className="text-sm text-purple-700 mt-3">
                      Koszt efektywności uwzględniający błędy
                    </p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Interpretacja:</strong> Im mniejsze wartości, tym lepsza zdolność ignorowania zakłócaczy i utrzymania koncentracji pod presją.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export View */}
          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Eksport Danych</CardTitle>
                <p className="text-sm text-slate-600">
                  Pobierz szczegółowe dane z sesji w różnych formatach
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col gap-2"
                    onClick={handleExportJSON}
                  >
                    <Download className="h-6 w-6" />
                    <span>Pobierz JSON</span>
                    <span className="text-xs text-slate-500">Pełne dane sesji</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col gap-2"
                    onClick={handleExportCSV}
                  >
                    <Download className="h-6 w-6" />
                    <span>Pobierz CSV</span>
                    <span className="text-xs text-slate-500">Dane prób (Excel)</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col gap-2"
                    disabled
                  >
                    <Download className="h-6 w-6" />
                    <span>Pobierz PDF</span>
                    <span className="text-xs text-slate-500">Wkrótce</span>
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">
                    Informacje o danych:
                  </h4>
                  <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                    <li><strong>JSON:</strong> Zawiera wszystkie surowe dane, coach metrics, i metadane sesji</li>
                    <li><strong>CSV:</strong> Tabela wszystkich prób z czasami reakcji i poprawnością</li>
                    <li><strong>PDF (wkrótce):</strong> Obrandowany raport z wykresami i analizą</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Fallback for other tasks
  return (
    <div className="p-8">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => navigate(`/zawodnicy/${athleteId}/sesja/${sessionId}?task=overview`)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Powrót do podsumowania
      </Button>
      <p>Szczegółowy widok dla tego testu nie jest jeszcze dostępny.</p>
    </div>
  );
}
