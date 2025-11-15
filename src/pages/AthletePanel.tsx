import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, TrendingUp, Calendar, Award, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const AthletePanel = () => {
  const navigate = useNavigate();
  const [athleteData, setAthleteData] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    // W przyszłości pobierzemy z localStorage dane zalogowanego zawodnika
    // Na razie mockujemy podstawowe dane
    const mockAthlete = {
      id: "athlete-1",
      name: "Jan Kowalski",
      club: "KS Cracovia",
      discipline: "Piłka nożna"
    };
    setAthleteData(mockAthlete);

    // Pobierz sesje zawodnika z localStorage
    const allSessions = localStorage.getItem(`sessions_${mockAthlete.id}`);
    if (allSessions) {
      setSessions(JSON.parse(allSessions));
    }
  }, []);

  const stats = [
    {
      title: "Sesje w tym miesiącu",
      value: sessions.length.toString(),
      icon: Activity,
      color: "text-primary",
    },
    {
      title: "Średni wynik HRV",
      value: "68",
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      title: "Dni treningowe",
      value: "12",
      icon: Calendar,
      color: "text-accent",
    },
    {
      title: "Osiągnięcia",
      value: "5",
      icon: Award,
      color: "text-violet-600",
    },
  ];

  const recentSessions = sessions.slice(0, 5).map((session: any) => ({
    date: new Date(session.date).toLocaleDateString('pl-PL'),
    type: "Sesja treningowa",
    score: session.questionnaire?.overallScore || "N/A"
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Panel Zawodnika</h1>
        <p className="text-muted-foreground">
          {athleteData ? `Witaj ${athleteData.name}! Oto Twoje statystyki i postępy` : "Ładowanie..."}
        </p>
      </div>

      {/* Statystyki */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ostatnie sesje */}
        <Card>
          <CardHeader>
            <CardTitle>Ostatnie Sesje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSessions.length > 0 ? (
                recentSessions.map((session, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{session.type}</p>
                      <p className="text-sm text-muted-foreground">{session.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Wynik: {session.score}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Brak sesji</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Twoje treningi */}
        <Card>
          <CardHeader>
            <CardTitle>Twoje Zadania</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/biblioteka')}>
                <FileText className="mr-2 h-4 w-4" />
                Zobacz plan treningowy
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Harmonogram treningów
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Award className="mr-2 h-4 w-4" />
                Osiągnięcia i cele
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AthletePanel;
