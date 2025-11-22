import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import SixSigmaReport from "@/components/reports/SixSigmaReport";

export default function SessionDetail() {
  const { athleteId, sessionId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taskView = searchParams.get("task") || "overview";
  
  const [session, setSession] = useState<any>(null);
  const [athlete, setAthlete] = useState<any>(null);

  useEffect(() => {
    const sessions = JSON.parse(localStorage.getItem('athlete_sessions') || '[]');
    const foundSession = sessions.find((s: any) => s.id === sessionId);
    setSession(foundSession);

    const athletes = JSON.parse(localStorage.getItem('athletes') || '[]');
    const foundAthlete = athletes.find((a: any) => a.id === parseInt(athleteId || "0"));
    setAthlete(foundAthlete);
  }, [athleteId, sessionId]);

  if (!session || !athlete) {
    return <div className="p-8"><p>Ładowanie...</p></div>;
  }

  const completedTasks = Object.entries(session.taskStatus)
    .filter(([_, status]) => status === 'completed')
    .map(([task]) => task);

  // Questionnaire Detail View
  if (taskView === "questionnaire" && session.results.questionnaire) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(`/zawodnicy/${athleteId}/sesja/${sessionId}?task=overview`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót do podsumowania
        </Button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Raport Six Sigma</h2>
          <p className="text-muted-foreground">
            {athlete.name} • {new Date(session.date).toLocaleDateString('pl-PL')}
          </p>
        </div>

        <Tabs defaultValue="athlete">
          <TabsList>
            <TabsTrigger value="athlete">Dla zawodnika</TabsTrigger>
            <TabsTrigger value="coach">Dla trenera</TabsTrigger>
          </TabsList>

          <TabsContent value="athlete" className="space-y-6">
            <SixSigmaReport results={session.results.questionnaire.results} viewMode="athlete" />
          </TabsContent>

          <TabsContent value="coach" className="space-y-6">
            <SixSigmaReport results={session.results.questionnaire.results} viewMode="coach" />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Focus Detail View
  if (taskView === "focus" && session.results.focus) {
    const focusData = session.results.focus;
    
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(`/zawodnicy/${athleteId}/sesja/${sessionId}?task=overview`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót do podsumowania
        </Button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Szczegóły Focus</h2>
          <p className="text-muted-foreground">
            {athlete.name} • {new Date(session.date).toLocaleDateString('pl-PL')}
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Wynik Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{focusData.score}</div>
              <p className="text-muted-foreground">Średni czas reakcji: {focusData.avgReactionTime}ms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wykres czasów reakcji</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={focusData.trials}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="trial" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="reactionTime" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Overview
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Button variant="ghost" className="mb-4" onClick={() => navigate(`/zawodnicy/${athleteId}`)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Powrót do profilu zawodnika
      </Button>

      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Sesja Pomiarowa</h2>
        <p className="text-muted-foreground">
          {athlete.name} • {new Date(session.date).toLocaleDateString('pl-PL')}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ukończone zadania</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {completedTasks.map(task => <Badge key={task} variant="outline" className="p-3 text-center">
                {task === 'kwestionariusz' ? 'Six Sigma' : task}
              </Badge>)}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {session.results.focus && <Card>
            <CardHeader>
              <CardTitle>Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Test reakcji i koncentracji
              </p>
              <p className="text-2xl font-bold mb-4">
                {session.results.focus.score}
              </p>
            </CardContent>
            <Button variant="outline" onClick={() => navigate(`/zawodnicy/${athleteId}/sesja/${sessionId}?task=focus`)}>
              Szczegóły
            </Button>
          </Card>}

        {session.results.questionnaire && <Card>
            <CardHeader>
              <CardTitle>Six Sigma - Kwestionariusz</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Profil kompetencji psychologicznych
              </p>
              <p className="text-2xl font-bold mb-4">
                {session.results.questionnaire.results?.overallScore || 'N/A'} / 100
              </p>
            </CardContent>
            <Button variant="outline" onClick={() => navigate(`/zawodnicy/${athleteId}/sesja/${sessionId}?task=questionnaire`)}>
              Szczegóły
            </Button>
          </Card>}

        {session.results.scan && <Card>
            <CardHeader>
              <CardTitle>Scan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Skanowanie pola widzenia
              </p>
              <p className="text-2xl font-bold mb-4">
                {session.results.scan.score}
              </p>
            </CardContent>
            <Button variant="outline" onClick={() => navigate(`/zawodnicy/${athleteId}/sesja/${sessionId}?task=scan`)}>
              Szczegóły
            </Button>
          </Card>}

        {session.results.control && <Card>
            <CardHeader>
              <CardTitle>Control</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Kontrola emocjonalna
              </p>
              <p className="text-2xl font-bold mb-4">
                {session.results.control.score}
              </p>
            </CardContent>
            <Button variant="outline" onClick={() => navigate(`/zawodnicy/${athleteId}/sesja/${sessionId}?task=control`)}>
              Szczegóły
            </Button>
          </Card>}
      </div>

      <div className="mt-6">
        <Button variant="outline" className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Eksportuj raport (PDF)
        </Button>
      </div>
    </div>
  );
}
