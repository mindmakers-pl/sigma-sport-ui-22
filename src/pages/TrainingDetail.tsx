import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const TrainingDetail = () => {
  const { trainingId } = useParams();
  const navigate = useNavigate();
  const [training, setTraining] = useState<any>(null);

  useEffect(() => {
    const trainings = JSON.parse(localStorage.getItem('athlete_trainings') || '[]');
    const found = trainings.find((t: any) => t.id === trainingId);
    setTraining(found);
  }, [trainingId]);

  if (!training) {
    return <div>Ładowanie...</div>;
  }

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

  // Trial chart data
  const rawTrials = results.trials || [];
  const trialChartData = rawTrials.map((trial: any, index: number) => ({
    trial: index + 1,
    rt: trial.reactionTime,
    isError: !trial.isCorrect
  }));

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Powrót
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">{training.game_name}</h1>
        <p className="text-muted-foreground">
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

      <Tabs defaultValue="dla-zawodnika" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="dla-zawodnika">Dla zawodnika</TabsTrigger>
            <TabsTrigger value="dla-trenera">Dla trenera</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Pobierz
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Wyślij
            </Button>
          </div>
        </div>

        <TabsContent value="dla-zawodnika" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Z wyzwania Sigma Focus dowiadujesz się jak reaguje Twój mózg, gdy musi ignorować zakłócenia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-primary/5 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Twój typowy czas reakcji</h3>
                <p className="text-4xl font-bold text-primary">{overallMedianRT} ms</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Trafność: {overallAccuracy}% ({overallCorrectCount}/{overallTotalTrials})
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Porównanie trudności</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { type: 'ŁATWE\n(Bez konfliktu)', value: congruentMedianRT },
                    { type: 'TRUDNE\n(Z konfliktem)', value: incongruentMedianRT }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `${value} ms`} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" label={{ position: 'top', formatter: (value: any) => `${value} ms` }} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Różnica: +{concentrationCost} ms</h4>
                  <p className="text-sm text-blue-800">
                    To pokazuje, jak bardzo Twój czas reakcji się wydłuża, gdy musisz ignorować zakłócenia. Im mniejsza różnica, tym lepiej radzisz sobie z dystrakcją!
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Krzywa koncentracji</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trialChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="trial" label={{ value: 'Numer próby', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Czas reakcji (ms)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value: any) => `${value} ms`} />
                    <Line type="monotone" dataKey="rt" stroke="hsl(var(--primary))" dot={(props: any) => {
                      if (props.payload.isError) {
                        return <circle cx={props.cx} cy={props.cy} r={4} fill="red" />;
                      }
                      return <circle cx={props.cx} cy={props.cy} r={2} fill="hsl(var(--primary))" />;
                    }} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-sm text-muted-foreground mt-2">
                  Czerwone punkty oznaczają błędy. Ten wykres pokazuje, jak Twoja koncentracja zmienia się w trakcie wyzwania.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dla-trenera" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analiza szczegółowa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Wskaźniki ogólne</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Mediana RT</p>
                    <p className="text-2xl font-bold">{overallMedianRT} ms</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Trafność</p>
                    <p className="text-2xl font-bold">{overallAccuracy}%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">IQR</p>
                    <p className="text-2xl font-bold">{Math.round(coachReport.overall?.iqr || 0)} ms</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">IES</p>
                    <p className="text-2xl font-bold">{Math.round(coachReport.overall?.ies || 0)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Porównanie wykresy</h3>
                <div className="grid grid-cols-2 gap-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { type: 'Łatwe', value: congruentMedianRT },
                      { type: 'Trudne', value: incongruentMedianRT }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => `${value} ms`} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { type: 'Łatwe', value: Math.round((coachReport.congruent?.errorRate || 0) * 100) },
                      { type: 'Trudne', value: Math.round((coachReport.incongruent?.errorRate || 0) * 100) }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => `${value}%`} />
                      <Bar dataKey="value" fill="hsl(var(--destructive))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Krzywa trendu</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trialChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="trial" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="rt" stroke="hsl(var(--primary))" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingDetail;
