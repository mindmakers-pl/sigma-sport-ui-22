import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function TrainingDetail() {
  const { athleteId, trainingId } = useParams();
  const navigate = useNavigate();
  const [training, setTraining] = useState<any>(null);

  useEffect(() => {
    const trainings = JSON.parse(localStorage.getItem('athlete_trainings') || '[]');
    const found = trainings.find((t: any) => t.id === trainingId);
    setTraining(found);
  }, [trainingId]);

  if (!training) {
    return (
      <div className="p-8">
        <p>Ładowanie...</p>
      </div>
    );
  }

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(training, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `training-${training.id}-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (training.results.trials) {
      const trials = training.results.trials;
      const headers = ['trialId', 'type', 'stimulusWord', 'stimulusColor', 'userAction', 'isCorrect', 'reactionTime', 'timestamp'];
      const csvContent = [
        headers.join(','),
        ...trials.map((t: any) => headers.map(h => t[h]).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `training-${training.id}-trials.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const results = training.results;
  const coachReport = results.coachReport || {};
  
  // Extract metrics
  const overallMedianRT = Math.round(coachReport.overall?.medianRT || 0);
  const overallAccuracy = Math.round((coachReport.overall?.accuracy || 0) * 100);
  const overallCorrectCount = coachReport.overall?.correctCount || 0;
  const overallTotalTrials = coachReport.overall?.totalTrials || 0;

  const congruentMedianRT = Math.round(coachReport.congruent?.medianRT || 0);
  const incongruentMedianRT = Math.round(coachReport.incongruent?.medianRT || 0);
  const concentrationCost = incongruentMedianRT - congruentMedianRT;

  // Prepare chart data for difficulty comparison
  const difficultyChartData = [
    {
      name: "ŁATWE\n(Bez konfliktu)",
      medianRT: congruentMedianRT,
      label: "Congruent"
    },
    {
      name: "TRUDNE\n(Z konfliktem)",
      medianRT: incongruentMedianRT,
      label: "Incongruent"
    }
  ];

  // Trial chart data
  const rawTrials = results.trials || [];
  const trialChartData = rawTrials.map((trial: any, index: number) => ({
    trial: index + 1,
    rt: trial.reactionTime,
    isError: !trial.isCorrect
  }));

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate(`/zawodnicy/${athleteId}?tab=raporty`)} className="cursor-pointer">
              Profil zawodnika
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate(`/zawodnicy/${athleteId}?tab=raporty`)} className="cursor-pointer">
              Raporty treningowe
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Raport {training.game_name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Raport {training.game_name}
        </h2>
        <p className="text-slate-600">
          {new Date(training.completedAt).toLocaleDateString('pl-PL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
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

        {/* Player View - Simple metrics */}
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
              <h3 className="font-bold text-lg text-slate-900 mb-3">Sigma Score: Focus</h3>
              <p className="text-slate-700 leading-relaxed mb-2">
                W wyzwaniu Sigma Focus, dowiadujesz się, jak dobra jest Twoja <strong>koncentracja</strong> i umiejętność <strong>ignorowania rozpraszaczy</strong>. W sporcie ta zdolność przekłada się na precyzję w kluczowych momentach – możesz skupić się na tym, co ważne, nawet gdy dookoła dzieje się wiele rzeczy (kibice, przeciwnicy, zmęczenie).
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
                  {overallMedianRT}
                </span>
                <span className="text-2xl text-slate-600">ms</span>
                <div className="ml-auto">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {overallAccuracy}% poprawnych
                    <span className="ml-2 text-slate-500">
                      ({overallCorrectCount}/{overallTotalTrials})
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
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      interval={0}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Czas reakcji (ms)', 
                        angle: -90, 
                        position: 'insideLeft' 
                      }} 
                    />
                    <Tooltip />
                    <Bar 
                      dataKey="medianRT" 
                      fill="hsl(var(--primary))" 
                      label={{ 
                        position: 'top',
                        fill: 'hsl(var(--primary))',
                        fontWeight: 'bold',
                        formatter: (value: number) => `${value} ms`
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-sm font-semibold text-amber-900">Różnica:</span>
                    <span className="text-3xl font-bold text-amber-700">
                      +{concentrationCost}
                    </span>
                    <span className="text-lg text-amber-600">ms</span>
                  </div>
                  <p className="text-sm text-amber-800">
                    💡 Im mniejsza różnica, tym lepiej radzisz sobie z rozpraszaczami!
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
              {trialChartData && trialChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trialChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="trial" 
                      label={{ 
                        value: 'Numer próby', 
                        position: 'insideBottom', 
                        offset: -5 
                      }} 
                    />
                    <YAxis 
                      label={{ 
                        value: 'Czas reakcji (ms)', 
                        angle: -90, 
                        position: 'insideLeft' 
                      }} 
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => {
                        if (name === 'rt') return [`${value} ms`, 'Czas reakcji'];
                        return [value, name];
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rt" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        if (!cx || !cy) return null;
                        if (payload.isError) {
                          return <circle cx={cx} cy={cy} r={5} fill="red" stroke="darkred" strokeWidth={2} />;
                        }
                        return <circle cx={cx} cy={cy} r={2} fill="hsl(var(--primary))" />;
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500">Brak danych do wyświetlenia krzywej.</p>
              )}
              <p className="text-sm text-slate-600 mt-4">
                📊 <strong>Co to znaczy?</strong> Jeśli linia jest w miarę płaska, Twoja koncentracja była stabilna. 
                Duże skoki mogą oznaczać moment zmęczenia lub trudności z utrzymaniem uwagi.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coach View - Advanced metrics with charts */}
        <TabsContent value="coach" className="space-y-6">
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
                    {overallMedianRT} <span className="text-lg font-normal">ms</span>
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Celność</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {overallAccuracy}%
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Poprawne odpowiedzi</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {overallCorrectCount}/{overallTotalTrials}
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
                    <BarChart data={[
                      { name: 'Łatwe\n(Bez konfliktu)', value: congruentMedianRT, fill: 'hsl(142, 71%, 45%)' },
                      { name: 'Trudne\n(Z konfliktem)', value: incongruentMedianRT, fill: 'hsl(0, 84%, 60%)' }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value: number) => [`${value} ms`, 'Czas reakcji']} />
                      <Bar dataKey="value" label={{ position: 'top', formatter: (value: number) => `${value} ms` }}>
                        {[0, 1].map((entry, index) => (
                          <Bar key={`cell-${index}`} dataKey="value" fill={index === 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Error Rate Comparison */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-4">Procent błędów</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { name: 'Łatwe', value: Math.round((coachReport.congruent?.errorRate || 0) * 100), fill: 'hsl(142, 71%, 45%)' },
                      { name: 'Trudne', value: Math.round((coachReport.incongruent?.errorRate || 0) * 100), fill: 'hsl(0, 84%, 60%)' }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Błędy']} />
                      <Bar dataKey="value" label={{ position: 'top', formatter: (value: number) => `${value.toFixed(1)}%` }}>
                        {[0, 1].map((entry, index) => (
                          <Bar key={`cell-${index}`} dataKey="value" fill={index === 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* IES Comparison */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-4">IES (niższy = lepszy)</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { name: 'Łatwe', value: Math.round(coachReport.congruent?.ies || 0), fill: 'hsl(142, 71%, 45%)' },
                      { name: 'Trudne', value: Math.round(coachReport.incongruent?.ies || 0), fill: 'hsl(0, 84%, 60%)' }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis label={{ value: 'IES', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value: number) => [value, 'IES']} />
                      <Bar dataKey="value" label={{ position: 'top' }}>
                        {[0, 1].map((entry, index) => (
                          <Bar key={`cell-${index}`} dataKey="value" fill={index === 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Variability (IQR) Comparison */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-4">Zmienność (IQR)</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { name: 'Łatwe', value: Math.round(coachReport.congruent?.iqr || 0), fill: 'hsl(142, 71%, 45%)' },
                      { name: 'Trudne', value: Math.round(coachReport.incongruent?.iqr || 0), fill: 'hsl(0, 84%, 60%)' }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value: number) => [`${value} ms`, 'IQR']} />
                      <Bar dataKey="value" label={{ position: 'top', formatter: (value: number) => `${value} ms` }}>
                        {[0, 1].map((entry, index) => (
                          <Bar key={`cell-${index}`} dataKey="value" fill={index === 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'} />
                        ))}
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
                    <div className="flex justify-between"><span>Mediana RT:</span><strong>{congruentMedianRT} ms</strong></div>
                    <div className="flex justify-between"><span>Błędy:</span><strong>{((coachReport.congruent?.errorRate || 0) * 100).toFixed(1)}%</strong></div>
                    <div className="flex justify-between"><span>IES:</span><strong>{Math.round(coachReport.congruent?.ies || 0)}</strong></div>
                    <div className="flex justify-between"><span>IQR:</span><strong>{Math.round(coachReport.congruent?.iqr || 0)} ms</strong></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">Próby Trudne (z konfliktem)</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between"><span>Mediana RT:</span><strong>{incongruentMedianRT} ms</strong></div>
                    <div className="flex justify-between"><span>Błędy:</span><strong>{((coachReport.incongruent?.errorRate || 0) * 100).toFixed(1)}%</strong></div>
                    <div className="flex justify-between"><span>IES:</span><strong>{Math.round(coachReport.incongruent?.ies || 0)}</strong></div>
                    <div className="flex justify-between"><span>IQR:</span><strong>{Math.round(coachReport.incongruent?.iqr || 0)} ms</strong></div>
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
                    +{concentrationCost} <span className="text-xl">ms</span>
                  </p>
                  <p className="text-sm text-amber-700 mt-3">
                    Czas dodatkowy potrzebny na przetworzenie konfliktu
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                  <p className="text-sm text-purple-700 mb-2 font-semibold">Różnica IES</p>
                  <p className="text-4xl font-bold text-purple-800">
                    +{Math.round((coachReport.incongruent?.ies || 0) - (coachReport.congruent?.ies || 0))}
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
          {(results.rMSSD || results.HR) && (
            <Card>
              <CardHeader>
                <CardTitle>Pomiar HRV (Zmienność Rytmu Serca)</CardTitle>
                <p className="text-sm text-slate-600">
                  Monitorowanie odpowiedzi autonomicznego układu nerwowego podczas testu
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 mb-4">
                  {results.HR && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Średnie HR (Heart Rate)</p>
                      <p className="text-3xl font-bold text-red-700">
                        {results.HR} <span className="text-lg font-normal">bpm</span>
                      </p>
                      <p className="text-xs text-slate-600 mt-2">Średnia częstość akcji serca</p>
                    </div>
                  )}
                  {results.rMSSD && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">rMSSD</p>
                      <p className="text-3xl font-bold text-blue-700">
                        {results.rMSSD} <span className="text-lg font-normal">ms</span>
                      </p>
                      <p className="text-xs text-slate-600 mt-2">Root Mean Square of Successive Differences</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Export View */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eksport Danych</CardTitle>
              <p className="text-sm text-slate-600">
                Pobierz szczegółowe dane z treningu w różnych formatach
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
                  <span className="text-xs text-slate-500">Pełne dane treningu</span>
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
                  <li><strong>JSON:</strong> Zawiera wszystkie surowe dane, szczegółowe metryki i metadane treningu</li>
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
