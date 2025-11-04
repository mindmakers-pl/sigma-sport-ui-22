import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, TrendingUp, Users, Award, Plus, UserPlus, Building2, PlayCircle, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchAthlete, setSearchAthlete] = useState("");
  
  const stats = [
    {
      title: "Aktywni zawodnicy",
      value: "24",
      change: "+12%",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Treningi w tym tygodniu",
      value: "48",
      change: "+8%",
      icon: Activity,
      color: "text-accent",
    },
    {
      title: "Średnia wydajność",
      value: "87%",
      change: "+5%",
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      title: "Osiągnięcia",
      value: "156",
      change: "+23",
      icon: Award,
      color: "text-violet-600",
    },
  ];

  const recentActivity = [
    { text: "Jan Kowalski ukończył sesję pomiarową", time: "2 godziny temu" },
    { text: "Dodano nowego zawodnika: Anna Nowak", time: "3 godziny temu" },
    { text: "Maria Kowalczyk - nowy rekord w wyzwaniu Sigma Focus", time: "5 godzin temu" },
  ];

  const myClubs = [
    { name: "KS Górnik", members: 12, id: 1 },
    { name: "MKS Cracovia", members: 8, id: 2 },
    { name: "Wisła Kraków", members: 15, id: 3 },
  ];

  const athletes = [
    { id: 1, name: "Jan Kowalski" },
    { id: 2, name: "Anna Nowak" },
    { id: 3, name: "Piotr Wiśniewski" },
    { id: 4, name: "Maria Kowalczyk" },
  ];

  const filteredAthletes = athletes.filter(a => 
    a.name.toLowerCase().includes(searchAthlete.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Kokpit</h1>
        <p className="text-muted-foreground">Witaj ponownie! Oto podsumowanie aktywności Twoich zawodników</p>
      </div>

      {/* Karty Szybkich Akcji */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="cursor-pointer hover:shadow-lg transition-all border-2" onClick={() => navigate('/zawodnicy')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Dodaj zawodnika</h3>
                <p className="text-sm text-muted-foreground">Utwórz nowy profil</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all border-2" onClick={() => navigate('/kluby')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Dodaj klub</h3>
                <p className="text-sm text-muted-foreground">Zarejestruj nowy klub</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                <PlayCircle className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Rozpocznij pomiar</h3>
                <p className="text-sm text-muted-foreground">Wybierz zawodnika</p>
              </div>
            </div>
            <div className="relative">
              <Input
                placeholder="Wpisz imię i nazwisko..."
                value={searchAthlete}
                onChange={(e) => setSearchAthlete(e.target.value)}
              />
              {searchAthlete && filteredAthletes.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg">
                  {filteredAthletes.map(athlete => (
                    <div
                      key={athlete.id}
                      className="p-2 hover:bg-muted cursor-pointer"
                      onClick={() => navigate(`/zawodnicy/${athlete.id}?tab=dodaj-pomiar`)}
                    >
                      {athlete.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-emerald-600 mt-1">{stat.change} vs ostatni tydzień</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ostatnia Aktywność */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ostatnia aktywność</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{activity.text}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Moje Kluby */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Moje kluby</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/kluby')}>
              Zobacz wszystkie
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myClubs.map((club) => (
                <div 
                  key={club.id}
                  className="p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => navigate(`/kluby/${club.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{club.name}</p>
                      <p className="text-sm text-muted-foreground">Zawodnicy: {club.members}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spostrzeżenia - FAZA 2 AI */}
      <Card className="mt-6 border-2 border-accent/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-accent" />
            </div>
            <CardTitle>Spostrzeżenia</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground italic">
            Funkcja analizy AI będzie dostępna wkrótce. Tutaj zobaczysz inteligentne sugestie dotyczące treningu Twoich zawodników.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
