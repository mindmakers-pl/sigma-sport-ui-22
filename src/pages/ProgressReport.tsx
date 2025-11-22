import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const ProgressReport = () => {
  const { athleteId, gameType } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedIds = searchParams.get('ids')?.split(',') || [];
  const [trainings, setTrainings] = useState<any[]>([]);
  const [gameName, setGameName] = useState('');

  useEffect(() => {
    const allTrainings = JSON.parse(localStorage.getItem('athlete_trainings') || '[]');
    let filtered = allTrainings
      .filter((t: any) => t.athlete_id === athleteId && t.game_type === gameType);
    
    // If specific IDs are selected, filter to only those
    if (selectedIds.length > 0) {
      filtered = filtered.filter((t: any) => selectedIds.includes(t.id));
    }
    
    // Sort by date
    filtered.sort((a: any, b: any) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
    
    setTrainings(filtered);
    
    if (filtered.length > 0) {
      setGameName(filtered[0].game_name);
    }
  }, [athleteId, gameType, selectedIds]);

  if (trainings.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót
        </Button>
        <div className="mt-8 text-center text-muted-foreground">
          Brak danych do wygenerowania raportu postępów
        </div>
      </div>
    );
  }

  // Prepare trend data based on game type
  let trendData: any[] = [];
  let metrics: any = {};

  if (gameType === 'focus') {
    trendData = trainings.map((t, index) => {
      const coachReport = t.results.coachReport || {};
      return {
        session: `T${index + 1}`,
        date: new Date(t.completedAt).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }),
        medianRT: Math.round(coachReport.overall?.medianRT || 0),
        easyRT: Math.round(coachReport.coachMetrics?.congruent?.medianRT || 0),
        hardRT: Math.round(coachReport.coachMetrics?.incongruent?.medianRT || 0),
        accuracy: Math.round((coachReport.overall?.accuracy || 0) * 100),
        concentrationCost: Math.round(t.results.concentrationCost || 0),
        iqr: Math.round(coachReport.overall?.iqr || 0)
      };
    });

    metrics = {
      medianRT: { label: 'Mediana czasu reakcji', unit: 'ms', description: 'Średni czas reakcji - niższe wartości oznaczają szybsze przetwarzanie informacji' },
      easyRT: { label: 'Łatwe próby (bez konfliktu)', unit: 'ms', description: 'Czas reakcji na próby łatwe - gdy kolor pasował do słowa' },
      hardRT: { label: 'Trudne próby (z konfliktem)', unit: 'ms', description: 'Czas reakcji na próby trudne - gdy kolor i słowo się różniły' },
      accuracy: { label: 'Trafność', unit: '%', description: 'Procent poprawnych odpowiedzi - wyższe wartości oznaczają lepszą precyzję' },
      concentrationCost: { label: 'Koszt koncentracji', unit: 'ms', description: 'Różnica między próbami trudnymi a łatwymi - niższe wartości oznaczają lepszą odporność na dystrakcję' },
      iqr: { label: 'Zmienność (IQR)', unit: 'ms', description: 'Stabilność czasów reakcji - niższe wartości oznaczają bardziej spójne wyniki' }
    };
  }

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => navigate(`/zawodnicy/${athleteId}?tab=treningi`)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Powrót
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Raport postępów - {gameName}</h1>
        <p className="text-muted-foreground">Analiza trendów z {trainings.length} treningów</p>
      </div>

      <Tabs defaultValue="dla-zawodnika" className="w-full">
        <div className="mb-4">
          <TabsList>
            <TabsTrigger value="dla-zawodnika">Dla zawodnika</TabsTrigger>
            <TabsTrigger value="dla-trenera">Dla trenera</TabsTrigger>
            <TabsTrigger value="eksport">Eksportuj wyniki</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dla-zawodnika" className="space-y-6">
          <div className="flex justify-end gap-2 mb-4">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Pobierz PDF
            </Button>
            <Button variant="outline" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
              Wyślij PDF
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Twój postęp w {gameName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="font-semibold mb-4">Czas reakcji - łatwe vs trudne</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Porównanie szybkości reakcji na próby łatwe (bez konfliktu) i trudne (z konfliktem)
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${Math.round(value)} ms`} />
                    <Legend />
                    <Line type="monotone" dataKey="easyRT" stroke="hsl(var(--chart-2))" strokeWidth={2} name={metrics.easyRT.label} />
                    <Line type="monotone" dataKey="hardRT" stroke="hsl(var(--chart-3))" strokeWidth={2} name={metrics.hardRT.label} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Trafność</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {metrics.accuracy.description}
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${Math.round(value)}%`} />
                    <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--chart-2))" strokeWidth={2} name={metrics.accuracy.label} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Odporność na dystrakcję</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {metrics.concentrationCost.description}
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${Math.round(value)} ms`} />
                    <Line type="monotone" dataKey="concentrationCost" stroke="hsl(var(--chart-3))" strokeWidth={2} name={metrics.concentrationCost.label} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dla-trenera" className="space-y-6">
          <div className="flex justify-end gap-2 mb-4">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Pobierz PDF
            </Button>
            <Button variant="outline" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
              Wyślij PDF
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Analiza trendów - widok trenera</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="font-semibold mb-4">Wszystkie metryki na jednym wykresie</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value: number, name: string) => {
                      if (name.includes('%')) return `${Math.round(value)}%`;
                      return `${Math.round(value)} ms`;
                    }} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="easyRT" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Łatwe RT (ms)" />
                    <Line yAxisId="left" type="monotone" dataKey="hardRT" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Trudne RT (ms)" />
                    <Line yAxisId="left" type="monotone" dataKey="concentrationCost" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Koszt koncentracji (ms)" />
                    <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2} name="Trafność (%)" />
                    <Line yAxisId="left" type="monotone" dataKey="iqr" stroke="hsl(var(--chart-5))" strokeWidth={2} name="IQR (ms)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Podsumowanie statystyczne</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Pierwszy trening</p>
                    <p className="text-lg font-bold">{trendData[0]?.medianRT} ms</p>
                    <p className="text-xs text-muted-foreground mt-1">{trendData[0]?.date}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Ostatni trening</p>
                    <p className="text-lg font-bold">{trendData[trendData.length - 1]?.medianRT} ms</p>
                    <p className="text-xs text-muted-foreground mt-1">{trendData[trendData.length - 1]?.date}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Zmiana</p>
                    <p className="text-lg font-bold text-green-700">
                      {((trendData[trendData.length - 1]?.medianRT - trendData[0]?.medianRT) / trendData[0]?.medianRT * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Liczba treningów</p>
                    <p className="text-lg font-bold text-blue-700">{trainings.length}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Szczegóły wszystkich treningów</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Trening</th>
                        <th className="text-left p-2">Data</th>
                        <th className="text-right p-2">Mediana RT</th>
                        <th className="text-right p-2">Trafność</th>
                        <th className="text-right p-2">Koszt koncentracji</th>
                        <th className="text-right p-2">IQR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trendData.map((row, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-2">{row.session}</td>
                          <td className="p-2">{row.date}</td>
                          <td className="text-right p-2">{row.medianRT} ms</td>
                          <td className="text-right p-2">{row.accuracy}%</td>
                          <td className="text-right p-2">{row.concentrationCost} ms</td>
                          <td className="text-right p-2">{row.iqr} ms</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eksport" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eksportuj wyniki postępów</CardTitle>
              <p className="text-sm text-muted-foreground">
                Pobierz szczegółowe dane z wszystkich wybranych treningów w różnych formatach
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2"
                  onClick={() => {
                    const dataStr = JSON.stringify(trainings, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `postepy-${gameType}-${new Date().toISOString()}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="h-6 w-6" />
                  <span>Pobierz JSON</span>
                  <span className="text-xs text-muted-foreground">Pełne dane wszystkich treningów</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2"
                  onClick={() => {
                    const headers = ['Data', 'Mediana RT (ms)', 'Łatwe RT (ms)', 'Trudne RT (ms)', 'Trafność (%)', 'Koszt koncentracji (ms)', 'IQR (ms)'];
                    const csvContent = [
                      headers.join(','),
                      ...trendData.map((row: any) => 
                        [row.date, row.medianRT || row.easyRT, row.easyRT, row.hardRT, row.accuracy, row.concentrationCost, row.iqr].join(',')
                      )
                    ].join('\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `postepy-${gameType}-${new Date().toISOString()}.csv`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="h-6 w-6" />
                  <span>Pobierz CSV</span>
                  <span className="text-xs text-muted-foreground">Dane trendów (Excel)</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2" 
                  disabled
                >
                  <Download className="h-6 w-6" />
                  <span>Pobierz PDF</span>
                  <span className="text-xs text-muted-foreground">Kompletny raport</span>
                </Button>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">
                  Informacje o danych:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li><strong>JSON:</strong> Zawiera wszystkie surowe dane z {trainings.length} wybranych treningów</li>
                  <li><strong>CSV:</strong> Tabela z metrykami trendów dla każdego treningu</li>
                  <li><strong>PDF (wkrótce):</strong> Kompletny raport z wykresami i szczegółową analizą postępów</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressReport;
