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
import { Settings, Plus, ArrowLeft, Search, Trophy, TrendingUp, TrendingDown, Calendar as CalendarIcon, Target, ClipboardList, Dumbbell } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [selectedTraining, setSelectedTraining] = useState<number | null>(null);

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

  // Program treningowy - lista spotkań
  const trainingProgram = [
    {
      id: 1,
      title: "Spotkanie 1.1: Wprowadzenie i Pomiar Baseline",
      module: "Moduł 1: Trening Uwagi",
      date: null as Date | undefined,
      completed: false,
      isMeasurement: true,
      goal: "Przeprowadzenie pierwszego pomiaru bazowego zawodników w celu ustalenia poziomu wyjściowego umiejętności kognitywnych i fizjologicznych. Zapoznanie z koncepcją programu Sigma Teams.",
      steps: [
        "1. Wprowadzenie do programu (10 min) - omówienie celów, harmonogramu i zasad",
        "2. Wypełnienie kwestionariusza wstępnego (5 min)",
        "3. Test Sigma Scan - szybkość skanowania wzrokowego (3 min)",
        "4. Test Sigma Control - kontrola inhibicyjna (3 min)",
        "5. Test Sigma Focus - uwaga selektywna (3 min)",
        "6. Test Sigma Tracker - śledzenie wielu obiektów (3 min)",
        "7. Pomiar HRV baseline i focus (10 min)",
        "8. Podsumowanie i omówienie dalszych kroków (5 min)"
      ],
      exercises: []
    },
    {
      id: 2,
      title: "Spotkanie 1.2: Podstawy świadomości oddechowej",
      module: "Moduł 1: Trening Uwagi",
      date: null as Date | undefined,
      completed: false,
      isMeasurement: false,
      goal: "Wprowadzenie do świadomości oddechowej jako fundamentu kontroli uwagi. Nauka techniki oddechu rezonansowego.",
      steps: [
        "1. Rozgrzewka kognitywna - test Scan (5 min)",
        "2. Wprowadzenie teoretyczne - wpływ oddechu na układ nerwowy (10 min)",
        "3. Ćwiczenie: Oddech rezonansowy 5.5/min (15 min)",
        "4. Ćwiczenie: Body Scan z oddechem (10 min)",
        "5. Trening gry Sigma Focus (10 min)",
        "6. Podsumowanie i zadanie domowe (5 min)"
      ],
      exercises: [
        "Ćw. 1: Oddech Rezonansowy - technika 5.5 oddechu na minutę",
        "Ćw. 2: Body Scan - skanowanie ciała z uwagą na oddech",
        "Gra: Sigma Focus - trening uwagi selektywnej"
      ]
    },
    {
      id: 3,
      title: "Spotkanie 1.3: Rozpoznawanie rozproszeń",
      module: "Moduł 1: Trening Uwagi",
      date: null as Date | undefined,
      completed: false,
      isMeasurement: false,
      goal: "Nauka identyfikacji zewnętrznych i wewnętrznych źródeł rozproszenia uwagi. Praktyka powrotu do obecności.",
      steps: [
        "1. Rozgrzewka - test Control (5 min)",
        "2. Analiza sytuacji rozpraszających w sporcie (10 min)",
        "3. Ćwiczenie: Rozpoznawanie myśli automatycznych (10 min)",
        "4. Praktyka: Technika 'Zauważam i wracam' (15 min)",
        "5. Trening gry Sigma Scan (10 min)",
        "6. Refleksja i zadanie domowe (5 min)"
      ],
      exercises: [
        "Ćw. 3: Rozpoznawanie rozproszeń - identyfikacja bodźców",
        "Ćw. 4: Technika 'Zauważam i wracam' - powrót do obecności",
        "Gra: Sigma Scan - trening szybkości percepcji"
      ]
    },
    {
      id: 4,
      title: "Spotkanie 1.4: Trening koncentracji z progresją",
      module: "Moduł 1: Trening Uwagi",
      date: null as Date | undefined,
      completed: false,
      isMeasurement: false,
      goal: "Zastosowanie poznanych technik w praktyce sportowej. Stopniowe zwiększanie trudności i czasu utrzymania koncentracji.",
      steps: [
        "1. Rozgrzewka - test Tracker (5 min)",
        "2. Progresywny trening koncentracji na oddechu (15 min)",
        "3. Ćwiczenie: Koncentracja w ruchu (10 min)",
        "4. Symulacja sytuacji meczowej z rozproszeniami (15 min)",
        "5. Trening wszystkich gier Sigma (10 min)",
        "6. Podsumowanie modułu i przygotowanie do pomiaru (5 min)"
      ],
      exercises: [
        "Ćw. 5: Koncentracja progresywna - od 30s do 5min",
        "Ćw. 6: Koncentracja w ruchu - uwaga podczas aktywności",
        "Wszystkie gry Sigma - sesja treningowa"
      ]
    },
    {
      id: 5,
      title: "Spotkanie 1.5: Pomiar Kontrolny M2",
      module: "Moduł 1: Trening Uwagi",
      date: null as Date | undefined,
      completed: false,
      isMeasurement: true,
      goal: "Pomiar postępu po zakończeniu Modułu 1. Weryfikacja poprawy w zakresie uwagi, koncentracji i parametrów fizjologicznych.",
      steps: [
        "1. Krótkie przypomnienie technik z modułu (5 min)",
        "2. Wypełnienie kwestionariusza kontrolnego (5 min)",
        "3. Test Sigma Scan (3 min)",
        "4. Test Sigma Control (3 min)",
        "5. Test Sigma Focus (3 min)",
        "6. Test Sigma Tracker (3 min)",
        "7. Pomiar HRV baseline i focus (10 min)",
        "8. Analiza wyników i feedback indywidualny (10 min)"
      ],
      exercises: []
    }
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
                            Pomiar
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

        {/* ZAKŁADKA 2: Sigma Teams (Dostarczanie programu) - Master-Detail */}
        <TabsContent value="sigma-teams" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* KOLUMNA LEWA - Master (Lista Treningów) - 40% */}
            <div className="lg:col-span-5">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Program Treningowy</CardTitle>
                  <p className="text-sm text-muted-foreground">Moduł 1: Trening Uwagi</p>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-3">
                      {trainingProgram.map((training) => (
                        <Card 
                          key={training.id}
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            selectedTraining === training.id && "ring-2 ring-primary"
                          )}
                          onClick={() => setSelectedTraining(training.id)}
                        >
                          <CardContent className="p-4 space-y-3">
                            <div>
                              <h4 className="font-semibold text-sm mb-1">{training.title}</h4>
                              <p className="text-xs text-muted-foreground">{training.module}</p>
                            </div>
                            
                            {/* DatePicker */}
                            <div className="space-y-2">
                              <label className="text-xs font-medium">Data odbycia</label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !training.date && "text-muted-foreground"
                                    )}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {training.date ? format(training.date, "PPP") : "Wybierz datę"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={training.date}
                                    onSelect={(date) => {
                                      // W rzeczywistej aplikacji: zaktualizuj stan
                                      console.log("Selected date:", date);
                                    }}
                                    initialFocus
                                    className="pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>

                            {/* Checkbox */}
                            <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                              <Checkbox 
                                id={`completed-${training.id}`}
                                checked={training.completed}
                                onCheckedChange={(checked) => {
                                  // W rzeczywistej aplikacji: zaktualizuj stan
                                  console.log("Completed:", checked);
                                }}
                              />
                              <label
                                htmlFor={`completed-${training.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                Zrealizowano
                              </label>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* KOLUMNA PRAWA - Detail (Konspekt) - 60% */}
            <div className="lg:col-span-7">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Konspekt Spotkania</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTraining === null ? (
                    <div className="flex items-center justify-center h-[600px] text-center">
                      <div className="space-y-2">
                        <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        <p className="text-muted-foreground">
                          Wybierz trening z listy po lewej, aby zobaczyć konspekt
                        </p>
                      </div>
                    </div>
                  ) : (
                    <ScrollArea className="h-[600px] pr-4">
                      {(() => {
                        const training = trainingProgram.find(t => t.id === selectedTraining);
                        if (!training) return null;

                        return (
                          <div className="space-y-6">
                            {/* Tytuł */}
                            <div>
                              <h2 className="text-2xl font-bold mb-2">{training.title}</h2>
                              <Badge variant="outline">{training.module}</Badge>
                            </div>

                            {/* Przycisk pomiaru (tylko dla spotkań pomiarowych) */}
                            {training.isMeasurement && (
                              <Card className="border-primary/50 bg-primary/5">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-semibold mb-1">Spotkanie pomiarowe</h4>
                                      <p className="text-sm text-muted-foreground">
                                        Uruchom tryb pomiaru dla zawodników
                                      </p>
                                    </div>
                                    <Button 
                                      className="gap-2"
                                      onClick={() => setActiveWizardAthleteId("club-measurement")}
                                    >
                                      <Plus className="h-4 w-4" />
                                      Przejdź do Trybu Pomiaru
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Cel Spotkania */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Target className="h-5 w-5" />
                                  Cel Spotkania
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm leading-relaxed">{training.goal}</p>
                              </CardContent>
                            </Card>

                            {/* Konspekt (Krok po Kroku) */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <ClipboardList className="h-5 w-5" />
                                  Konspekt (Krok po Kroku)
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ul className="space-y-2">
                                  {training.steps.map((step, idx) => (
                                    <li key={idx} className="text-sm leading-relaxed pl-4 border-l-2 border-muted py-1">
                                      {step}
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>

                            {/* Powiązane Ćwiczenia */}
                            {training.exercises.length > 0 && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    <Dumbbell className="h-5 w-5" />
                                    Powiązane Ćwiczenia (z Biblioteki)
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ul className="space-y-2">
                                    {training.exercises.map((exercise, idx) => (
                                      <li key={idx} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded">
                                        <Badge variant="outline" className="shrink-0">{idx + 1}</Badge>
                                        <span>{exercise}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        );
                      })()}
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
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
