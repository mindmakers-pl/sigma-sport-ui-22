import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, CheckCircle2, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
export default function SessionDetail() {
  const {
    athleteId,
    sessionId
  } = useParams();
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
    return <div className="p-8">
        <p>Ładowanie...</p>
      </div>;
  }
  const completedTasks = Object.entries(session.taskStatus).filter(([_, status]) => status === 'completed').map(([task]) => task);
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(session, null, 2);
    const dataBlob = new Blob([dataStr], {
      type: 'application/json'
    });
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
      const csvContent = [headers.join(','), ...trials.map((t: any) => headers.map(h => t[h]).join(','))].join('\n');
      const blob = new Blob([csvContent], {
        type: 'text/csv'
      });
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
    // Define all possible tests
    const allTests = [
      { id: 'six_sigma', name: 'Six Sigma', resultKey: 'six_sigma', navPath: `/zawodnicy/${athleteId}/sesja/${sessionId}/six-sigma` },
      { id: 'hrv_baseline', name: 'HRV Baseline', resultKey: 'hrv_baseline', navPath: `/zawodnicy/${athleteId}/sesja/${sessionId}?task=hrv_baseline` },
      { id: 'scan', name: 'Sigma Scan', resultKey: 'scan', navPath: `/zawodnicy/${athleteId}/sesja/${sessionId}?task=scan` },
      { id: 'focus', name: 'Sigma Focus', resultKey: 'focus', navPath: `/zawodnicy/${athleteId}/sesja/${sessionId}?task=focus` },
      { id: 'memo', name: 'Sigma Memo', resultKey: 'memo', navPath: `/zawodnicy/${athleteId}/sesja/${sessionId}?task=memo` }
    ];

    return <div className="p-8 max-w-6xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(`/zawodnicy/${athleteId}?tab=raporty`)}>
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
        </div>

        <Card>
          <CardContent className="pt-6">
            {/* Metadata badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="outline" className="text-sm">
                {session.conditions}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {completedTasks.length}/5 testów
              </Badge>
              <Badge variant="outline" className="text-sm">
                {new Date(session.date).toLocaleDateString('pl-PL')}
              </Badge>
            </div>

            {/* Test tiles grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allTests.map(test => {
                const isCompleted = session.results[test.resultKey];
                return (
                  <Card 
                    key={test.id}
                    className={`relative border transition-colors ${
                      isCompleted 
                        ? 'border-green-200 bg-green-50/30 hover:bg-green-50/50 cursor-pointer' 
                        : 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                    }`}
                    onClick={() => isCompleted && navigate(test.navPath)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className={`font-semibold ${isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>
                          {test.name}
                        </h3>
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>;
  }

  // Sigma Focus detailed view
  if (taskView === "focus" && session.results.focus) {
    const focusData = session.results.focus;
    const coachReport = focusData.coachReport;
    if (!coachReport) {
      return <div className="p-8">
          <p>Brak danych coach report dla tego testu.</p>
        </div>;
    }

    // Prepare chart data for difficulty comparison
    const difficultyChartData = [{
      name: "ŁATWE\n(Bez konfliktu)",
      medianRT: coachReport.coachMetrics.congruent.medianRT,
      label: "Congruent"
    }, {
      name: "TRUDNE\n(Z konfliktem)",
      medianRT: coachReport.coachMetrics.incongruent.medianRT,
      label: "Incongruent"
    }];

    // Prepare trial-by-trial chart data (showing errors)
    const rawTrials = coachReport.rawTrials || focusData.trials || [];
    console.log('Debug rawTrials:', rawTrials.length, coachReport.rawTrials?.length, focusData.trials?.length);
    const trialChartData = rawTrials.length > 0 ? rawTrials.slice(0, 80).map((trial: any, idx: number) => ({
      trial: trial.trialId || idx + 1,
      rt: trial.reactionTime,
      isError: !trial.isCorrect
    })) : [];
    console.log('Trial chart data:', trialChartData.length, 'trials');
    return <div className="p-8 max-w-6xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(`/zawodnicy/${athleteId}/sesja/${sessionId}?task=overview`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót do podsumowania
        </Button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Raport Sigma Focus
          </h2>
          <p className="text-slate-600">
            {athlete.name} • {new Date(session.date).toLocaleDateString('pl-PL')}
          </p>
        </div>

        <Tabs defaultValue="player" className="w-full">
          <div className="mb-6">
            <TabsList>
              <TabsTrigger value="player">Dla Zawodnika</TabsTrigger>
              <TabsTrigger value="coach">Dla Trenera</TabsTrigger>
              <TabsTrigger value="export">Eksport Danych</TabsTrigger>
            </TabsList>
          </div>

        <TabsContent value="player" className="space-y-6">
          {/* Download and Send buttons - only in player view */}
          <div className="flex justify-end gap-2 mb-4">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Pobierz
            </Button>
            <Button variant="outline" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
              Wyślij
            </Button>
          </div>
          
          {/* Intro explanation */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg text-slate-900 mb-3">Sigma Score: Focus   </h3>
                <p className="text-slate-700 leading-relaxed mb-2">
                  ​W wyzwaniu Sigma Focus, dowiadujesz się, jak dobra jest Twoja koncentracja i umiejętność ignorowania rozpraszaczy. W sporcie ta zdolność przekłada się na precyzję w kluczowych momentach – możesz skupić się na tym, co ważne, nawet gdy dookoła dzieje się wiele rzeczy (kibice, przeciwnicy, zmęczenie).              <strong>koncentracja</strong> ​ <strong>ignorowania rozpraszaczy</strong>​
                </p>
                <p className="text-sm text-slate-600">
                  Poniżej znajdziesz swoje wyniki: jak szybko reagujesz i jak radzisz sobie w trudniejszych sytuacjach.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Twój typowy czas reakcji</CardTitle>
                <p className="text-sm text-slate-600">To czas, w jakim zazwyczaj odpowiadałeś/aś</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-5xl font-bold text-primary">
                    {coachReport.playerMetrics.medianRT}
                  </span>
                  <span className="text-2xl text-slate-600">ms</span>
                  <div className="ml-auto">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {coachReport.playerMetrics.accuracy}% poprawnych
                      <span className="ml-2 text-slate-500">
                        ({focusData.correctCount}/{focusData.totalTrials})
                      </span>
                    </Badge>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">
                    Porównanie: łatwe vs trudne próby
                  </h4>
                  <p className="text-sm text-slate-600 mb-4">
                    <strong>Łatwe</strong> = gdy kolor pasował do słowa. <strong>Trudne</strong> = gdy kolor i słowo się różniły.
                  </p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={difficultyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{
                      fontSize: 12
                    }} interval={0} />
                      <YAxis label={{
                      value: 'Czas reakcji (ms)',
                      angle: -90,
                      position: 'insideLeft'
                    }} />
                      <Tooltip />
                      <Bar dataKey="medianRT" fill="hsl(var(--primary))" label={{
                      position: 'top',
                      fill: 'hsl(var(--primary))',
                      fontWeight: 'bold',
                      formatter: (value: number) => `${value} ms`
                    }} />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-sm font-semibold text-amber-900">Różnica:</span>
                      <span className="text-3xl font-bold text-amber-700">
                        +{coachReport.coachMetrics.interferenceCost.rawMs}
                      </span>
                      <span className="text-lg text-amber-600">ms</span>
                    </div>
                    <p className="text-sm text-amber-800">
                      Im mniejsza różnica, tym lepiej radzisz sobie z rozpraszaczami!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Twoja stabilność w czasie</CardTitle>
                <p className="text-sm text-slate-600">
                  Jak zmieniała się Twoja szybkość przez cały test? Czerwone punkty to błędy.
                </p>
              </CardHeader>
              <CardContent>
                {trialChartData && trialChartData.length > 0 ? <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={trialChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="trial" label={{
                    value: 'Numer próby',
                    position: 'insideBottom',
                    offset: -5
                  }} />
                      <YAxis label={{
                    value: 'Czas reakcji (ms)',
                    angle: -90,
                    position: 'insideLeft'
                  }} />
                      <Tooltip formatter={(value: any, name: string) => {
                    if (name === 'rt') return [`${value} ms`, 'Czas reakcji'];
                    return [value, name];
                  }} />
                      <Line type="monotone" dataKey="rt" stroke="hsl(var(--primary))" strokeWidth={2} dot={(props: any) => {
                    const {
                      cx,
                      cy,
                      payload
                    } = props;
                    if (!cx || !cy) return null;
                    if (payload.isError) {
                      return <circle cx={cx} cy={cy} r={5} fill="red" stroke="darkred" strokeWidth={2} />;
                    }
                    return <circle cx={cx} cy={cy} r={2} fill="hsl(var(--primary))" />;
                  }} />
                    </LineChart>
                  </ResponsiveContainer> : <p className="text-slate-500">Brak danych do wyświetlenia krzywej.</p>}
                <p className="text-sm text-slate-600 mt-4">
                  <strong>Co to znaczy?</strong> Jeśli linia jest w miarę płaska, Twoja koncentracja była stabilna. 
                  Duże skoki mogą oznaczać moment zmęczenia lub trudności z utrzymaniem uwagi.
                </p>
              </CardContent>
            </Card>

          </TabsContent>

          {/* Coach View - Advanced metrics with charts */}
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

            {/* Overall Performance Metrics with Visualizations */}
            <Card>
              <CardHeader>
                <CardTitle>Ogólne Wyniki</CardTitle>
                <p className="text-sm text-slate-600">Wszystkie próby razem</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Mediana czasu reakcji</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {coachReport.playerMetrics.medianRT} <span className="text-lg font-normal">ms</span>
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Celność</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {coachReport.playerMetrics.accuracy}%
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Poprawne odpowiedzi</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {focusData.correctCount}/{focusData.totalTrials}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparative Charts */}
            <Card>
              <CardHeader>
                <CardTitle>Analiza Porównawcza: Łatwe vs Trudne</CardTitle>
                <p className="text-sm text-slate-600">Próby bez konfliktu vs z konfliktem</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* RT Comparison */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-4">Mediana czasu reakcji</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={[{
                      name: 'Łatwe\n(Bez konfliktu)',
                      value: coachReport.coachMetrics.congruent.medianRT,
                      fill: 'hsl(142, 71%, 45%)'
                    }, {
                      name: 'Trudne\n(Z konfliktem)',
                      value: coachReport.coachMetrics.incongruent.medianRT,
                      fill: 'hsl(0, 84%, 60%)'
                    }]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{
                        fontSize: 12
                      }} />
                        <YAxis label={{
                        value: 'ms',
                        angle: -90,
                        position: 'insideLeft'
                      }} />
                        <Tooltip formatter={(value: number) => [`${value} ms`, 'Czas reakcji']} />
                        <Bar dataKey="value" label={{
                        position: 'top',
                        formatter: (value: number) => `${value} ms`
                      }}>
                          {[0, 1].map((entry, index) => <Bar key={`cell-${index}`} dataKey="value" fill={index === 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Error Rate Comparison */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-4">Procent błędów</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={[{
                      name: 'Łatwe',
                      value: coachReport.coachMetrics.congruent.errorRate * 100,
                      fill: 'hsl(142, 71%, 45%)'
                    }, {
                      name: 'Trudne',
                      value: coachReport.coachMetrics.incongruent.errorRate * 100,
                      fill: 'hsl(0, 84%, 60%)'
                    }]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{
                        fontSize: 12
                      }} />
                        <YAxis label={{
                        value: '%',
                        angle: -90,
                        position: 'insideLeft'
                      }} />
                        <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Błędy']} />
                        <Bar dataKey="value" label={{
                        position: 'top',
                        formatter: (value: number) => `${value.toFixed(1)}%`
                      }}>
                          {[0, 1].map((entry, index) => <Bar key={`cell-${index}`} dataKey="value" fill={index === 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* IES Comparison */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-4">IES (niższy = lepszy)</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={[{
                      name: 'Łatwe',
                      value: coachReport.coachMetrics.congruent.ies,
                      fill: 'hsl(142, 71%, 45%)'
                    }, {
                      name: 'Trudne',
                      value: coachReport.coachMetrics.incongruent.ies,
                      fill: 'hsl(0, 84%, 60%)'
                    }]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{
                        fontSize: 12
                      }} />
                        <YAxis label={{
                        value: 'IES',
                        angle: -90,
                        position: 'insideLeft'
                      }} />
                        <Tooltip formatter={(value: number) => [value, 'IES']} />
                        <Bar dataKey="value" label={{
                        position: 'top'
                      }}>
                          {[0, 1].map((entry, index) => <Bar key={`cell-${index}`} dataKey="value" fill={index === 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Variability (IQR) Comparison */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-4">Zmienność (IQR)</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={[{
                      name: 'Łatwe',
                      value: coachReport.coachMetrics.variability.congruentIQR,
                      fill: 'hsl(142, 71%, 45%)'
                    }, {
                      name: 'Trudne',
                      value: coachReport.coachMetrics.variability.incongruentIQR,
                      fill: 'hsl(0, 84%, 60%)'
                    }]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{
                        fontSize: 12
                      }} />
                        <YAxis label={{
                        value: 'ms',
                        angle: -90,
                        position: 'insideLeft'
                      }} />
                        <Tooltip formatter={(value: number) => [`${value} ms`, 'IQR']} />
                        <Bar dataKey="value" label={{
                        position: 'top',
                        formatter: (value: number) => `${value} ms`
                      }}>
                          {[0, 1].map((entry, index) => <Bar key={`cell-${index}`} dataKey="value" fill={index === 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Detailed metrics table */}
                <div className="grid md:grid-cols-2 gap-4 mt-6 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Próby Łatwe (bez konfliktu)</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between"><span>Próby analizowane:</span><strong>{coachReport.coachMetrics.congruent.validTrials}</strong></div>
                      <div className="flex justify-between"><span>Mediana RT:</span><strong>{coachReport.coachMetrics.congruent.medianRT} ms</strong></div>
                      <div className="flex justify-between"><span>Błędy:</span><strong>{(coachReport.coachMetrics.congruent.errorRate * 100).toFixed(1)}%</strong></div>
                      <div className="flex justify-between"><span>IES:</span><strong>{coachReport.coachMetrics.congruent.ies}</strong></div>
                      <div className="flex justify-between"><span>IQR:</span><strong>{coachReport.coachMetrics.variability.congruentIQR} ms</strong></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">Próby Trudne (z konfliktem)</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between"><span>Próby analizowane:</span><strong>{coachReport.coachMetrics.incongruent.validTrials}</strong></div>
                      <div className="flex justify-between"><span>Mediana RT:</span><strong>{coachReport.coachMetrics.incongruent.medianRT} ms</strong></div>
                      <div className="flex justify-between"><span>Błędy:</span><strong>{(coachReport.coachMetrics.incongruent.errorRate * 100).toFixed(1)}%</strong></div>
                      <div className="flex justify-between"><span>IES:</span><strong>{coachReport.coachMetrics.incongruent.ies}</strong></div>
                      <div className="flex justify-between"><span>IQR:</span><strong>{coachReport.coachMetrics.variability.incongruentIQR} ms</strong></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Koszt Interferencji</CardTitle>
                <p className="text-sm text-slate-600">
                  Różnice między próbami trudnymi a łatwymi
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

            {/* HRV Metrics */}
            {(focusData.rMSSD || focusData.HR) && <Card>
                <CardHeader>
                  <CardTitle>Pomiar HRV (Zmienność Rytmu Serca)</CardTitle>
                  <p className="text-sm text-slate-600">
                    Monitorowanie odpowiedzi autonomicznego układu nerwowego podczas testu
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6 mb-4">
                    {focusData.HR && <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <p className="text-sm text-slate-600 mb-1">Średnie HR (Heart Rate)</p>
                        <p className="text-3xl font-bold text-red-700">
                          {focusData.HR} <span className="text-lg font-normal">bpm</span>
                        </p>
                        <p className="text-xs text-slate-600 mt-2">Średnia częstość akcji serca</p>
                      </div>}
                    {focusData.rMSSD && <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <p className="text-sm text-slate-600 mb-1">rMSSD</p>
                        <p className="text-3xl font-bold text-blue-700">
                          {focusData.rMSSD} <span className="text-lg font-normal">ms</span>
                        </p>
                        <p className="text-xs text-slate-600 mt-2">Root Mean Square of Successive Differences</p>
                      </div>}
                  </div>
                  
                </CardContent>
              </Card>}
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
                  <Button variant="outline" className="h-24 flex-col gap-2" onClick={handleExportJSON}>
                    <Download className="h-6 w-6" />
                    <span>Pobierz JSON</span>
                    <span className="text-xs text-slate-500">Pełne dane sesji</span>
                  </Button>
                  
                  <Button variant="outline" className="h-24 flex-col gap-2" onClick={handleExportCSV}>
                    <Download className="h-6 w-6" />
                    <span>Pobierz CSV</span>
                    <span className="text-xs text-slate-500">Dane prób (Excel)</span>
                  </Button>
                  
                  <Button variant="outline" className="h-24 flex-col gap-2" disabled>
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
                    <li><strong>JSON:</strong> Zawiera wszystkie surowe dane, szczegółowe metryki i metadane sesji</li>
                    <li><strong>CSV:</strong> Tabela wszystkich prób z czasami reakcji i poprawnością</li>
                    <li><strong>PDF (wkrótce):</strong> Obrandowany raport z wykresami i analizą</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>;
  }

  // Sigma Scan detailed view
  if (taskView === "scan" && session.results.scan) {
    const scanData = session.results.scan;
    
    return <div className="p-8 max-w-6xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(`/zawodnicy/${athleteId}/sesja/${sessionId}?task=overview`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót do podsumowania
        </Button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Raport Sigma Scan
          </h2>
          <p className="text-slate-600">
            {athlete.name} • {new Date(session.date).toLocaleDateString('pl-PL')}
          </p>
        </div>

        <Tabs defaultValue="player" className="w-full">
          <div className="mb-6">
            <TabsList>
              <TabsTrigger value="player">Dla Zawodnika</TabsTrigger>
              <TabsTrigger value="coach">Dla Trenera</TabsTrigger>
              <TabsTrigger value="export">Eksport Danych</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="player" className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg text-slate-900 mb-3">Sigma Score: Koncentracja</h3>
                <p className="text-slate-700 leading-relaxed mb-2">
                  Test skanowania wzrokowego sprawdza, jak szybko i precyzyjnie potrafisz znaleźć i przetworzyć informacje w chaotycznym środowisku. W sporcie ta umiejętność przekłada się na szybkie lokalizowanie wolnych kolegów, wykrywanie luk w obronie i orientację w przestrzeni.
                </p>
                <p className="text-sm text-slate-600">
                  Poniżej znajdziesz swoje wyniki: jak daleko udało Ci się dojść i jak radzisz sobie z utrzymaniem uwagi.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Twój wynik</CardTitle>
                <p className="text-sm text-slate-600">Najdłuższa poprawna sekwencja liczb</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-5xl font-bold text-primary">
                    {scanData.scan_max_number_reached}
                  </span>
                  <span className="text-2xl text-slate-600">/ 63</span>
                  <div className="ml-auto">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {scanData.scan_correct_clicks} poprawnych kliknięć
                    </Badge>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">
                    Szczegóły wykonania
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-white p-4 rounded border">
                      <p className="text-sm text-slate-600 mb-1">Błędne kliknięcia</p>
                      <p className="text-2xl font-bold text-slate-900">{scanData.scan_error_clicks}</p>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <p className="text-sm text-slate-600 mb-1">Czas trwania</p>
                      <p className="text-2xl font-bold text-slate-900">{scanData.scan_duration_s}s</p>
                    </div>
                  </div>
                  
                  {scanData.scan_skipped_numbers && scanData.scan_skipped_numbers.length > 0 && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-amber-900 mb-2">Pominięte liczby:</p>
                      <p className="text-amber-800">{scanData.scan_skipped_numbers.join(', ')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coach" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Szczegóły Wykonania</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Maksymalna liczba</p>
                    <p className="text-2xl font-bold">{scanData.scan_max_number_reached}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Poprawne kliknięcia</p>
                    <p className="text-2xl font-bold text-green-700">{scanData.scan_correct_clicks}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Błędne kliknięcia</p>
                    <p className="text-2xl font-bold text-red-700">{scanData.scan_error_clicks}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Czas trwania</p>
                    <p className="text-2xl font-bold text-blue-700">{scanData.scan_duration_s}s</p>
                  </div>
                </div>

                {scanData.scan_skipped_numbers && scanData.scan_skipped_numbers.length > 0 && (
                  <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-amber-900 mb-2">Pominięte liczby w sekwencji:</h4>
                    <p className="text-amber-800">{scanData.scan_skipped_numbers.join(', ')}</p>
                    <p className="text-sm text-amber-700 mt-2">
                      Te liczby zostały pominięte, co przerwało poprawną sekwencję.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {(scanData.scan_rmssd_ms || scanData.scan_avg_hr_bpm) && (
              <Card>
                <CardHeader>
                  <CardTitle>Dane HRV (Polar H10)</CardTitle>
                  <p className="text-sm text-slate-600">Zmienność rytmu serca i tętno podczas testu</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {scanData.scan_rmssd_ms && (
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <p className="text-sm text-slate-600 mb-2">rMSSD</p>
                        <p className="text-4xl font-bold text-blue-700">{scanData.scan_rmssd_ms}</p>
                        <p className="text-sm text-slate-500 mt-1">ms</p>
                        <p className="text-xs text-slate-600 mt-3">
                          Wyższa wartość = lepsza regeneracja układu nerwowego
                        </p>
                      </div>
                    )}
                    {scanData.scan_avg_hr_bpm && (
                      <div className="bg-red-50 p-6 rounded-lg">
                        <p className="text-sm text-slate-600 mb-2">Średnie HR</p>
                        <p className="text-4xl font-bold text-red-700">{scanData.scan_avg_hr_bpm}</p>
                        <p className="text-sm text-slate-500 mt-1">BPM</p>
                        <p className="text-xs text-slate-600 mt-3">
                          Tętno podczas wykonywania zadania
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Eksport Danych</CardTitle>
                <p className="text-sm text-slate-600">Pobierz dane w różnych formatach</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex-col gap-2" onClick={handleExportJSON}>
                    <Download className="h-6 w-6" />
                    <span>Pobierz JSON</span>
                    <span className="text-xs text-slate-500">Pełne dane sesji</span>
                  </Button>
                  
                  <Button variant="outline" className="h-24 flex-col gap-2" onClick={handleExportCSV}>
                    <Download className="h-6 w-6" />
                    <span>Pobierz CSV</span>
                    <span className="text-xs text-slate-500">Dane kliknięć</span>
                  </Button>
                  
                  <Button variant="outline" className="h-24 flex-col gap-2" disabled>
                    <Download className="h-6 w-6" />
                    <span>Pobierz PDF</span>
                    <span className="text-xs text-slate-500">Wkrótce</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>;
  }

  // Sigma Memo detailed view
  if (taskView === "memo" && session.results.memo) {
    const memoData = session.results.memo;
    
    return <div className="p-8 max-w-6xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(`/zawodnicy/${athleteId}/sesja/${sessionId}?task=overview`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót do podsumowania
        </Button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Raport Sigma Memo
          </h2>
          <p className="text-slate-600">
            {athlete.name} • {new Date(session.date).toLocaleDateString('pl-PL')}
          </p>
        </div>

        <Tabs defaultValue="player" className="w-full">
          <div className="mb-6">
            <TabsList>
              <TabsTrigger value="player">Dla Zawodnika</TabsTrigger>
              <TabsTrigger value="coach">Dla Trenera</TabsTrigger>
              <TabsTrigger value="export">Eksport Danych</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="player" className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg text-slate-900 mb-3">Sigma Score: Pamięć Robocza</h3>
                <p className="text-slate-700 leading-relaxed mb-2">
                  Test 2-Back mierzy pamięć roboczą - umiejętność trzymania informacji w głowie i stałego jej aktualizowania. W sporcie to jak "bufor taktyczny" - zapamiętywanie ostatnich akcji, przewidywanie ruchów przeciwnika, realizowanie złożonych schematów gry.
                </p>
                <p className="text-sm text-slate-600">
                  Poniżej znajdziesz swoje wyniki: jak dokładnie rozpoznawałeś powtórzenia i jak szybko reagowałeś.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Twój wynik</CardTitle>
                <p className="text-sm text-slate-600">Ogólna celność i czas reakcji</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-primary/10 p-6 rounded-lg">
                    <p className="text-sm text-slate-600 mb-2">Celność</p>
                    <p className="text-5xl font-bold text-primary">{memoData.memo_accuracy_pct}%</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <p className="text-sm text-slate-600 mb-2">Czas reakcji</p>
                    <p className="text-5xl font-bold text-blue-700">{memoData.memo_median_rt_ms}</p>
                    <p className="text-sm text-slate-500 mt-1">ms</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-4">Szczegóły wykonania</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded border">
                      <p className="text-sm text-slate-600 mb-1">Trafienia</p>
                      <p className="text-2xl font-bold text-green-700">{memoData.memo_hits}</p>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <p className="text-sm text-slate-600 mb-1">Pominięcia</p>
                      <p className="text-2xl font-bold text-amber-700">{memoData.memo_misses}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coach" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Szczegółowe Metryki</CardTitle>
                <p className="text-sm text-slate-600">Analiza signal detection theory</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Trafienia (Hits)</p>
                    <p className="text-2xl font-bold text-green-700">{memoData.memo_hits}</p>
                    <p className="text-xs text-slate-600 mt-1">Poprawne wykrycia</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Pominięcia (Misses)</p>
                    <p className="text-2xl font-bold text-amber-700">{memoData.memo_misses}</p>
                    <p className="text-xs text-slate-600 mt-1">Niewychwycone targety</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Fałszywe alarmy</p>
                    <p className="text-2xl font-bold text-red-700">{memoData.memo_false_alarms}</p>
                    <p className="text-xs text-slate-600 mt-1">Błędne kliknięcia</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Poprawne odrzucenia</p>
                    <p className="text-2xl font-bold text-blue-700">{memoData.memo_correct_rejections}</p>
                    <p className="text-xs text-slate-600 mt-1">Trafne ignorowanie</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <p className="text-sm text-slate-600 mb-2">d-prime (Czułość)</p>
                    <p className="text-4xl font-bold text-purple-700">{memoData.memo_d_prime.toFixed(2)}</p>
                    <p className="text-xs text-slate-600 mt-3">
                      Wskaźnik zdolności rozróżniania sygnału od szumu. Wyższa wartość = lepsza pamięć robocza.
                    </p>
                  </div>
                  <div className="bg-indigo-50 p-6 rounded-lg">
                    <p className="text-sm text-slate-600 mb-2">Response Bias (c)</p>
                    <p className="text-4xl font-bold text-indigo-700">{memoData.memo_response_bias.toFixed(2)}</p>
                    <p className="text-xs text-slate-600 mt-3">
                      Tendencja do odpowiedzi. Wartość ujemna = skłonność do klikania, dodatnia = ostrożność.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analiza prób</CardTitle>
                <p className="text-sm text-slate-600">Szczegółowe dane trial-by-trial</p>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-2">
                    Zarejestrowano {memoData.memo_trials?.length || 0} prób z których:
                  </p>
                  <ul className="text-sm space-y-1 list-disc list-inside text-slate-700">
                    <li>Targety (2-back match): {memoData.memo_trials?.filter((t: any) => t.is_target).length || 0}</li>
                    <li>Lures (1-back match): {memoData.memo_trials?.filter((t: any) => t.is_lure).length || 0}</li>
                    <li>Non-targets: {memoData.memo_trials?.filter((t: any) => !t.is_target && !t.is_lure).length || 0}</li>
                  </ul>
                  <p className="text-xs text-slate-500 mt-3">
                    Lures testują specyficzność pamięci - czy zawodnik rozróżnia 1-back od 2-back.
                  </p>
                </div>
              </CardContent>
            </Card>

            {(memoData.memo_rmssd_ms || memoData.memo_hr_bpm) && (
              <Card>
                <CardHeader>
                  <CardTitle>Dane HRV (Polar H10)</CardTitle>
                  <p className="text-sm text-slate-600">Zmienność rytmu serca i tętno podczas testu</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {memoData.memo_rmssd_ms && (
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <p className="text-sm text-slate-600 mb-2">rMSSD</p>
                        <p className="text-4xl font-bold text-blue-700">{memoData.memo_rmssd_ms}</p>
                        <p className="text-sm text-slate-500 mt-1">ms</p>
                        <p className="text-xs text-slate-600 mt-3">
                          Wyższa wartość = lepsza regeneracja układu nerwowego
                        </p>
                      </div>
                    )}
                    {memoData.memo_hr_bpm && (
                      <div className="bg-red-50 p-6 rounded-lg">
                        <p className="text-sm text-slate-600 mb-2">Średnie HR</p>
                        <p className="text-4xl font-bold text-red-700">{memoData.memo_hr_bpm}</p>
                        <p className="text-sm text-slate-500 mt-1">BPM</p>
                        <p className="text-xs text-slate-600 mt-3">
                          Tętno podczas wykonywania zadania
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Eksport Danych</CardTitle>
                <p className="text-sm text-slate-600">Pobierz dane w różnych formatach</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex-col gap-2" onClick={handleExportJSON}>
                    <Download className="h-6 w-6" />
                    <span>Pobierz JSON</span>
                    <span className="text-xs text-slate-500">Pełne dane sesji</span>
                  </Button>
                  
                  <Button variant="outline" className="h-24 flex-col gap-2" onClick={handleExportCSV}>
                    <Download className="h-6 w-6" />
                    <span>Pobierz CSV</span>
                    <span className="text-xs text-slate-500">Dane prób</span>
                  </Button>
                  
                  <Button variant="outline" className="h-24 flex-col gap-2" disabled>
                    <Download className="h-6 w-6" />
                    <span>Pobierz PDF</span>
                    <span className="text-xs text-slate-500">Wkrótce</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>;
  }

  // Fallback for other tasks
  return <div className="p-8">
      <Button variant="ghost" className="mb-4" onClick={() => navigate(`/zawodnicy/${athleteId}/sesja/${sessionId}?task=overview`)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Powrót do podsumowania
      </Button>
      <p>Szczegółowy widok dla tego testu nie jest jeszcze dostępny.</p>
    </div>;
}