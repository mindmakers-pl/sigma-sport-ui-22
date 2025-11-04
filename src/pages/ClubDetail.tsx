import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Plus, ArrowLeft, Search, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import SessionWizard from "@/components/SessionWizard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const ClubDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeWizardAthleteId, setActiveWizardAthleteId] = useState<string | null>(null);
  const [selectedM1, setSelectedM1] = useState("m1-oct");
  const [selectedM2, setSelectedM2] = useState("m2-nov");

  // Pobierz dane klubu z localStorage
  const getClubData = () => {
    const storedClubs = localStorage.getItem('clubs');
    if (storedClubs) {
      const clubs = JSON.parse(storedClubs);
      return clubs.find((c: any) => c.id === parseInt(id || "1")) || {
        id: parseInt(id || "1"),
        name: "KS Górnik",
        city: "Zabrze",
        membersCount: 12,
      };
    }
    return {
      id: parseInt(id || "1"),
      name: "KS Górnik",
      city: "Zabrze",
      membersCount: 12,
    };
  };

  const club = getClubData();

  // Zawodnicy klubu
  const athletes = [
    { id: 1, name: "Kowalski Jan", birthDate: "2005-03-15", lastSession: "2024-01-15" },
    { id: 3, name: "Wiśniewski Piotr", birthDate: "2006-07-22", lastSession: "2024-01-14" },
    { id: 6, name: "Lewandowski Adam", birthDate: "2005-11-08", lastSession: "2024-01-13" },
    { id: 7, name: "Nowak Anna", birthDate: "2004-05-19", lastSession: "2024-01-16" },
  ];

  // Programy przypisane do klubu
  const assignedPrograms = [
    { 
      id: 1, 
      title: "Sprint 2: Kontrola Emocji", 
      type: "sprint",
      completed: 2,
      total: 5,
      status: "in-progress"
    },
    { 
      id: 2, 
      title: "Sprint 1: Koncentracja", 
      type: "sprint",
      completed: 5,
      total: 5,
      status: "completed"
    },
    { 
      id: 3, 
      title: "Sigma Teams Pro", 
      type: "pro",
      completed: 8,
      total: 12,
      status: "in-progress"
    },
  ];

  // Dane radarowe dla porównania M1 i M2
  const cognitiveDataM1 = [
    { subject: 'Sigma Scan', m1: 65, m2: 78 },
    { subject: 'Sigma Control', m1: 58, m2: 65 },
    { subject: 'Sigma Focus', m1: 62, m2: 72 },
  ];

  // Dane HRV dla porównania M1 i M2
  const hrvDataComparison = [
    { name: 'HRV Baseline', m1: 58, m2: 65 },
    { name: 'HRV Focus', m1: 45, m2: 52 },
  ];

  // Liderzy progresu
  const topProgressLeaders = [
    { name: "Kowalski Jan", metric: "Focus HRV", improvement: "+45ms" },
    { name: "Nowak Anna", metric: "Focus HRV", improvement: "+42ms" },
  ];

  const topHRVLeaders = [
    { name: "Nowak Anna", metric: "HRV Baseline", improvement: "+12ms" },
    { name: "Kowalski Jan", metric: "HRV Baseline", improvement: "+10ms" },
  ];

  // Obszary do poprawy
  const needsImprovement = [
    { name: "Lewandowski Adam", metric: "Focus HRV", improvement: "-5ms" },
    { name: "Wiśniewski Piotr", metric: "Focus HRV", improvement: "+2ms" },
  ];

  const filteredAthletes = athletes.filter(athlete =>
    athlete.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveSession = (results: any) => {
    console.log("Sesja zapisana:", results);
    setActiveWizardAthleteId(null);
  };

  if (activeWizardAthleteId) {
    return (
      <SessionWizard
        athleteId={activeWizardAthleteId}
        onClose={() => setActiveWizardAthleteId(null)}
        onSaveSession={handleSaveSession}
      />
    );
  }

  return (
    <div>
      {/* Nagłówek */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/kluby')} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Powrót
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">{club.name}</h1>
            <p className="text-muted-foreground">{club.city}</p>
          </div>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => navigate(`/kluby/${id}/zarzadzaj`)}
          >
            <Settings className="h-4 w-4" />
            Zarządzaj klubem
          </Button>
        </div>
      </div>

      {/* Zakładki */}
      <Tabs defaultValue="zawodnicy" className="w-full">
        <TabsList>
          <TabsTrigger value="zawodnicy">Lista zawodników</TabsTrigger>
          <TabsTrigger value="sigma-teams">Sigma Teams</TabsTrigger>
          <TabsTrigger value="raporty">Raporty</TabsTrigger>
        </TabsList>

        {/* ZAKŁADKA 1: Lista zawodników (Centrum dowodzenia) */}
        <TabsContent value="zawodnicy">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Zawodnicy klubu {club.name}</CardTitle>
                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                  Dodaj zawodnika
                </Button>
              </div>
              
              {/* Wyszukiwarka */}
              <div className="relative mt-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Wyszukaj zawodnika..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Nazwisko i imię</TableHead>
                    <TableHead className="font-semibold">Data ur.</TableHead>
                    <TableHead className="font-semibold">Data ost. pomiaru</TableHead>
                    <TableHead className="text-right font-semibold">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAthletes.map((athlete) => (
                    <TableRow key={athlete.id}>
                      <TableCell className="font-medium">{athlete.name}</TableCell>
                      <TableCell className="text-muted-foreground">{athlete.birthDate}</TableCell>
                      <TableCell className="text-muted-foreground">{athlete.lastSession}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/zawodnicy/${athlete.id}`)}
                          >
                            Zobacz profil
                          </Button>
                          <Button 
                            size="sm"
                            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => setActiveWizardAthleteId(athlete.id.toString())}
                          >
                            <Plus className="h-3 w-3" />
                            Dodaj pomiar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ZAKŁADKA 2: Sigma Teams (Dostarczanie programu) */}
        <TabsContent value="sigma-teams" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Programy treningowe</h2>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Przypisz program
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedPrograms.map((program) => (
              <Card key={program.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-1">{program.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {program.status === "completed" ? "Ukończono" : "W toku"}
                      </p>
                    </div>
                    {program.status === "completed" && (
                      <Badge variant="outline" className="gap-1">
                        <Trophy className="h-3 w-3" />
                        Ukończono
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Postęp</span>
                      <span className="font-medium">{program.completed} / {program.total} spotkań</span>
                    </div>
                    <Progress value={(program.completed / program.total) * 100} />
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled={program.status === "completed"}
                  >
                    {program.status === "completed" ? "Program ukończony" : "Kontynuuj program"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {assignedPrograms.length === 0 && (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <p className="mb-4">Brak przypisanych programów treningowych</p>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Przypisz pierwszy program
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ZAKŁADKA 3: Raporty (Analiza klubu) */}
        <TabsContent value="raporty" className="space-y-6">
          {/* Selektory porównania pomiarów */}
          <Card>
            <CardHeader>
              <CardTitle>Porównaj pomiary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Pomiar bazowy (M1)</Label>
                  <Select value={selectedM1} onValueChange={setSelectedM1}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="m1-oct">Pomiar M1 (Październik 2024)</SelectItem>
                      <SelectItem value="m1-sep">Pomiar M0 (Wrzesień 2024)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Pomiar porównawczy (M2)</Label>
                  <Select value={selectedM2} onValueChange={setSelectedM2}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="m2-nov">Pomiar M2 (Listopad 2024)</SelectItem>
                      <SelectItem value="m2-dec">Pomiar M3 (Grudzień 2024)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Kafelek 1: Progres Kognitywny Klubu */}
            <Card>
              <CardHeader>
                <CardTitle>Progres kognitywny klubu</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={cognitiveDataM1}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <Radar 
                      name="M1 (Październik)" 
                      dataKey="m1" 
                      stroke="hsl(var(--muted-foreground))" 
                      fill="hsl(var(--muted-foreground))" 
                      fillOpacity={0.3}
                      strokeWidth={1}
                    />
                    <Radar 
                      name="M2 (Listopad)" 
                      dataKey="m2" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.6}
                      strokeWidth={2}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Klub poprawił się w "Kontroli" i "Focusie"
                </p>
              </CardContent>
            </Card>

            {/* Kafelek 2: Progres Fizjologiczny Klubu */}
            <Card>
              <CardHeader>
                <CardTitle>Progres fizjologiczny klubu</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hrvDataComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="m1" fill="hsl(var(--muted-foreground))" name="M1 (Październik)" />
                    <Bar dataKey="m2" fill="hsl(var(--primary))" name="M2 (Listopad)" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Klub poprawił regenerację i lepiej radzi sobie ze stresem
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Kafelek 3: Liderzy Progresu */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Liderzy progresu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Największy postęp (Focus HRV)</h3>
                  <div className="space-y-2">
                    {topProgressLeaders.map((leader, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                            {idx + 1}
                          </Badge>
                          <span className="font-medium">{leader.name}</span>
                        </div>
                        <span className="text-green-600 font-semibold">{leader.improvement}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Największy postęp (HRV Baseline)</h3>
                  <div className="space-y-2">
                    {topHRVLeaders.map((leader, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                            {idx + 1}
                          </Badge>
                          <span className="font-medium">{leader.name}</span>
                        </div>
                        <span className="text-green-600 font-semibold">{leader.improvement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kafelek 4: Obszary do Poprawy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-orange-600" />
                Obszary do poprawy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Najmniejszy postęp (Focus HRV)</h3>
                <div className="space-y-2">
                  {needsImprovement.map((athlete, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                          {idx + 1}
                        </Badge>
                        <span className="font-medium">{athlete.name}</span>
                      </div>
                      <span className={athlete.improvement.startsWith("-") ? "text-red-600 font-semibold" : "text-muted-foreground font-semibold"}>
                        {athlete.improvement}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClubDetail;
