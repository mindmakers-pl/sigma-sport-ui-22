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
import { Settings, Plus, ArrowLeft, Search, Trophy, TrendingUp, TrendingDown, Calendar as CalendarIcon, Target, ClipboardList, Dumbbell, CheckCircle2, Clock } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import SessionWizard from "@/components/SessionWizard";
import ScanGame from "@/pages/ScanGame";
import FocusGame from "@/pages/FocusGame";
import ControlGame from "@/pages/ControlGame";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { allSprints, exerciseLibrary, getExerciseById, sigmaGoDemoTraining, type Meeting, type Sprint } from "@/data/libraryData";

const ClubDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeWizardAthleteId, setActiveWizardAthleteId] = useState<string | null>(null);
  const [selectedM1, setSelectedM1] = useState("m1-oct");
  const [selectedM2, setSelectedM2] = useState("m2-nov");
  
  // Nowe stany dla Sigma Teams
  const [selectedMeetingForOutline, setSelectedMeetingForOutline] = useState<{
    sprint: Sprint;
    meeting: Meeting;
  } | null>(null);
  
  const [selectedExerciseInOutline, setSelectedExerciseInOutline] = useState<string | null>(null);
  const [selectedGameInOutline, setSelectedGameInOutline] = useState<string | null>(null);
  const [sigmaTeamsTab, setSigmaTeamsTab] = useState("sigma-go");
  const [isPlayingGame, setIsPlayingGame] = useState(false);

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

  // Funkcja pomocnicza do określenia status badge
  const getStatusBadge = (sprint: Sprint) => {
    if (sprint.status === 'completed') {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Ukończono ({sprint.completedMeetings} / {sprint.totalMeetings} spotkań)
        </Badge>
      );
    }
    if (sprint.status === 'in-progress') {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          W toku ({sprint.completedMeetings} / {sprint.totalMeetings} spotkań)
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        Zaplanowano ({sprint.completedMeetings} / {sprint.totalMeetings} spotkań)
      </Badge>
    );
  };

  // Określ defaultValue - sprint który jest 'in-progress'
  const defaultOpenSprint = allSprints.find(s => s.status === 'in-progress')?.id || allSprints[0].id;

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
      <Tabs defaultValue="zawodnicy" className="w-full" id="club-tabs">
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

        {/* ZAKŁADKA 2: Sigma Teams - Programy */}
        <TabsContent value="sigma-teams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Programy Sigma Teams</CardTitle>
              <p className="text-sm text-muted-foreground">
                Wybierz produkt realizowany przez klub
              </p>
            </CardHeader>
            <CardContent>
              <Tabs value={sigmaTeamsTab} onValueChange={setSigmaTeamsTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="sigma-go">Sigma Go!</TabsTrigger>
                  <TabsTrigger value="sigma-sprint">Sigma Sprint</TabsTrigger>
                  <TabsTrigger value="sigma-pro">Sigma Pro</TabsTrigger>
                </TabsList>

                {/* Sigma Go! - Trening demonstracyjny */}
                <TabsContent value="sigma-go" className="mt-6">
                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        {sigmaGoDemoTraining.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {sigmaGoDemoTraining.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full mb-6"
                        onClick={() => setSelectedMeetingForOutline({ 
                          sprint: { id: 'sigma-go', title: sigmaGoDemoTraining.title } as Sprint, 
                          meeting: { 
                            id: sigmaGoDemoTraining.id, 
                            title: sigmaGoDemoTraining.title,
                            date: null,
                            completed: false,
                            isMeasurement: false,
                            outline: sigmaGoDemoTraining.outline 
                          } as Meeting 
                        })}
                      >
                        Zobacz Konspekt Treningu
                      </Button>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold">Przegląd scenariusza:</p>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Czas trwania: {sigmaGoDemoTraining.duration}</li>
                          <li>• Cel: {sigmaGoDemoTraining.outline.goal}</li>
                          <li>• Ilość kroków: {sigmaGoDemoTraining.outline.steps.length}</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Sigma Sprint - Accordion ze sprintami */}
                <TabsContent value="sigma-sprint" className="mt-6">
                  <Accordion 
                    type="single" 
                    collapsible 
                    defaultValue={defaultOpenSprint}
                    className="w-full"
                  >
                    {allSprints.map((sprint) => (
                      <AccordionItem key={sprint.id} value={sprint.id}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="text-left">
                              <h3 className="font-semibold text-base">{sprint.title}</h3>
                            </div>
                            <div>{getStatusBadge(sprint)}</div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid gap-3 pt-4">
                            {sprint.meetings.map((meeting) => (
                              <Card key={meeting.id} className="bg-muted/30">
                                <CardContent className="p-3">
                                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-center">
                                    {/* Tytuł i badge */}
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold text-sm">
                                        {meeting.title.replace('Spotkanie', 'Trening')}
                                      </h4>
                                      {meeting.isMeasurement && (
                                        <Badge variant="secondary" className="text-xs">Pomiar</Badge>
                                      )}
                                    </div>
                                    
                                    {/* DatePicker - kompaktowy */}
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className={cn(
                                            "justify-start text-left font-normal h-8 px-3",
                                            !meeting.date && "text-muted-foreground"
                                          )}
                                        >
                                          <CalendarIcon className="mr-2 h-3 w-3" />
                                          {meeting.date 
                                            ? format(meeting.date, "dd/MM/yy", { locale: pl }) 
                                            : "Data"}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={meeting.date || undefined}
                                          onSelect={(date) => console.log("Selected date:", date)}
                                          initialFocus
                                          captionLayout="dropdown-buttons"
                                          fromYear={2024}
                                          toYear={2025}
                                          className="pointer-events-auto"
                                        />
                                      </PopoverContent>
                                    </Popover>

                                    {/* Checkbox - kompaktowy */}
                                    <div className="flex items-center space-x-2">
                                      <Checkbox 
                                        id={`completed-${meeting.id}`}
                                        checked={meeting.completed}
                                        onCheckedChange={(checked) => console.log("Completed:", checked)}
                                      />
                                      <label
                                        htmlFor={`completed-${meeting.id}`}
                                        className="text-xs font-medium cursor-pointer whitespace-nowrap"
                                      >
                                        Zrealizowano
                                      </label>
                                    </div>

                                    {/* Przycisk Zobacz Konspekt */}
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="h-8"
                                      onClick={() => setSelectedMeetingForOutline({ sprint, meeting })}
                                    >
                                      Konspekt
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>

                {/* Sigma Pro - Placeholder */}
                <TabsContent value="sigma-pro" className="mt-6">
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Sigma Pro</h3>
                      <p className="text-sm text-muted-foreground">
                        Program dla zaawansowanych zespołów. Wkrótce dostępny.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Dialog - Kreator Konspektu */}
          <Dialog 
            open={selectedMeetingForOutline !== null} 
            onOpenChange={(open) => !open && setSelectedMeetingForOutline(null)}
          >
            <DialogContent className="max-w-7xl h-[90vh] bg-white p-0">
              <DialogHeader className="px-8 py-6 border-b">
                <DialogTitle className="text-2xl">
                  {selectedMeetingForOutline?.meeting.title}
                </DialogTitle>
              </DialogHeader>
              
              {selectedMeetingForOutline && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-8 py-6 overflow-y-auto">
                  {/* KOLUMNA PRAWA (Główna) - Konspekt - 70% */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* Pomiar Button (tylko dla spotkań pomiarowych) */}
                    {selectedMeetingForOutline.meeting.isMeasurement && (
                      <Card className="border-primary/50 bg-primary/5">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold mb-1">Spotkanie pomiarowe</h4>
                              <p className="text-sm text-muted-foreground">
                                Przejdź do listy zawodników aby rozpocząć pomiary
                              </p>
                            </div>
                            <Button 
                              className="gap-2"
                              onClick={() => {
                                setSelectedMeetingForOutline(null);
                                // Przełącz na zakładkę zawodników
                                const tabTrigger = document.querySelector('[data-state][value="zawodnicy"]') as HTMLButtonElement;
                                if (tabTrigger) {
                                  tabTrigger.click();
                                }
                              }}
                            >
                              <Plus className="h-4 w-4" />
                              + Rozpocznij pomiary
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Cel Treningu */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Cel Treningu
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed">
                          {selectedMeetingForOutline.meeting.outline.goal}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Wskazówki prowadzenia treningu - bezpośrednio pod celem */}
                    {selectedMeetingForOutline.meeting.outline.trainingGuidance && (
                      <Card className="border-violet-200 bg-violet-50/50">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Wskazówki prowadzenia treningu
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="prose prose-sm max-w-none space-y-3">
                            {selectedMeetingForOutline.meeting.outline.trainingGuidance.split('\n\n').map((paragraph, idx) => {
                              const lines = paragraph.split('\n');
                              return (
                                <div key={idx}>
                                  {lines.map((line, lineIdx) => {
                                    const trimmed = line.trim();
                                    
                                    // Nagłówki
                                    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                                      return (
                                        <h4 key={lineIdx} className="font-bold text-base mt-4 mb-2 first:mt-0">
                                          {trimmed.replace(/\*\*/g, '')}
                                        </h4>
                                      );
                                    }
                                    
                                    // Punktory
                                    if (trimmed.startsWith('•')) {
                                      return (
                                        <div key={lineIdx} className="flex gap-2 mb-2">
                                          <span className="text-violet-600 font-bold">•</span>
                                          <p className="flex-1 text-sm leading-relaxed">
                                            {trimmed.substring(1).trim()}
                                          </p>
                                        </div>
                                      );
                                    }
                                    
                                    // Zwykły tekst
                                    if (trimmed) {
                                      return (
                                        <p key={lineIdx} className="text-sm leading-relaxed mb-2">
                                          {trimmed}
                                        </p>
                                      );
                                    }
                                    
                                    return null;
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Konspekt (Krok po Kroku) */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <ClipboardList className="h-5 w-5" />
                          Konspekt (Krok po Kroku)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-4">
                          {selectedMeetingForOutline.meeting.outline.steps.map((step, idx) => {
                            // Funkcja do renderowania tekstu z buttonami do ćwiczeń i gier
                            const renderStepWithButtons = (text: string) => {
                              const parts = text.split(/(@[\w-]+)/g);
                              return parts.map((part, i) => {
                                if (part.startsWith('@')) {
                                  const exerciseId = part.substring(1);
                                  const exercise = getExerciseById(exerciseId);
                                  if (exercise) {
                                    return (
                                      <Button
                                        key={i}
                                        variant="outline"
                                        size="sm"
                                        className="mx-1 h-7 px-2 text-xs shadow-sm hover:shadow-md transition-shadow"
                                        onClick={() => {
                                          if (exercise.category === 'game') {
                                            setSelectedGameInOutline(exerciseId);
                                          } else {
                                            setSelectedExerciseInOutline(exerciseId);
                                          }
                                        }}
                                      >
                                        {exercise.title}
                                      </Button>
                                    );
                                  }
                                }
                                return <span key={i}>{part}</span>;
                              });
                            };

                            return (
                              <li 
                                key={idx} 
                                className="text-sm leading-relaxed pl-4 border-l-2 border-primary/30 py-2"
                              >
                                {renderStepWithButtons(step)}
                              </li>
                            );
                          })}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* KOLUMNA LEWA (Sub-Menu) - Powiązane Ćwiczenia - 30% */}
                  <div className="lg:col-span-4">
                    <Card className="sticky top-0">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Dumbbell className="h-5 w-5" />
                          Powiązane Ćwiczenia
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">Z Biblioteki</p>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[400px]">
                          <div className="space-y-3">
                            {selectedMeetingForOutline.meeting.outline.relatedExercises.map((exerciseId) => {
                              const exercise = getExerciseById(exerciseId);
                              if (!exercise) return null;
                              
                              return (
                                <Card 
                                  key={exercise.id} 
                                  className="bg-muted/50 cursor-pointer hover:bg-muted/80 transition-colors"
                                  onClick={() => {
                                    if (exercise.category === 'game') {
                                      setSelectedGameInOutline(exerciseId);
                                    } else {
                                      setSelectedExerciseInOutline(exerciseId);
                                    }
                                  }}
                                >
                                  <CardContent className="p-3 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <h5 className="font-semibold text-sm">{exercise.title}</h5>
                                      <Badge variant="outline" className="shrink-0 text-xs">
                                        {exercise.duration}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      {exercise.description}
                                    </p>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Dialog - Widok ćwiczenia z pełnymi instrukcjami - identyczny jak w Bibliotece */}
          <Dialog 
            open={selectedExerciseInOutline !== null} 
            onOpenChange={(open) => !open && setSelectedExerciseInOutline(null)}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {selectedExerciseInOutline && (() => {
                const exercise = getExerciseById(selectedExerciseInOutline);
                if (!exercise) return null;
                return (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold mb-2">{exercise.title}</h2>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="outline" className="gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {exercise.duration}
                          </Badge>
                          <Badge variant="secondary" className="capitalize">
                            {exercise.category === 'breathing' && 'Oddech'}
                            {exercise.category === 'focus' && 'Uwaga'}
                            {exercise.category === 'control' && 'Kontrola'}
                            {exercise.category === 'visualization' && 'Wizualizacja'}
                            {exercise.category === 'game' && 'Wyzwanie'}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedExerciseInOutline(null)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Powrót
                      </Button>
                    </div>

                    <Separator />

                    {exercise.objective && (
                      <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            Cel ćwiczenia
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="leading-relaxed">{exercise.objective}</p>
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Opis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="leading-relaxed text-muted-foreground">{exercise.description}</p>
                      </CardContent>
                    </Card>

                    {exercise.equipment && exercise.equipment.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Potrzebny sprzęt</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {exercise.equipment.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {exercise.steps && exercise.steps.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Instrukcja krok po kroku</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            {exercise.steps.map((step, idx) => (
                              <div key={idx} className="relative pl-8 pb-6 last:pb-0">
                                <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                                  {idx + 1}
                                </div>
                                {idx < exercise.steps!.length - 1 && (
                                  <div className="absolute left-3 top-7 h-full w-0.5 bg-border" />
                                )}
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-base">{step.title}</h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed">{step.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {exercise.coachingTips && exercise.coachingTips.length > 0 && (
                      <Card className="border-blue-200 bg-blue-50/50">
                        <CardHeader>
                          <CardTitle className="text-lg">💡 Wskazówki dla trenera</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {exercise.coachingTips.map((tip, idx) => (
                              <li key={idx} className="flex gap-3 text-sm">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                                <span className="text-foreground/90 leading-relaxed">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {exercise.adaptations && (exercise.adaptations.easier || exercise.adaptations.harder) && (
                      <div className="grid gap-4 md:grid-cols-2">
                        {exercise.adaptations.easier && (
                          <Card className="border-green-200 bg-green-50/50">
                            <CardHeader>
                              <CardTitle className="text-base flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-600" />
                                Wersja łatwiejsza
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-foreground/80 leading-relaxed">{exercise.adaptations.easier}</p>
                            </CardContent>
                          </Card>
                        )}
                        {exercise.adaptations.harder && (
                          <Card className="border-orange-200 bg-orange-50/50">
                            <CardHeader>
                              <CardTitle className="text-base flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-orange-600" />
                                Wersja trudniejsza
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-foreground/80 leading-relaxed">{exercise.adaptations.harder}</p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}

                    {exercise.metrics && exercise.metrics.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">📊 Metryki do śledzenia</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {exercise.metrics.map((metric, idx) => (
                              <Badge key={idx} variant="outline" className="text-sm py-1.5 px-3">
                                {metric}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              })()}
            </DialogContent>
          </Dialog>

          {/* Renderowanie gry pełnoekranowo */}
          {isPlayingGame && selectedGameInOutline && (() => {
            const gameId = selectedGameInOutline;
            
            return (
              <div className="fixed inset-0 z-50 bg-slate-900">
                {gameId === 'game-scan' && (
                  <ScanGame 
                    onComplete={(data) => {
                      console.log('Scan game completed:', data);
                      setIsPlayingGame(false);
                      setSelectedGameInOutline(null);
                    }}
                    onGoToCockpit={() => {
                      setIsPlayingGame(false);
                      setSelectedGameInOutline(null);
                    }}
                  />
                )}
                {gameId === 'game-focus' && (
                  <FocusGame 
                    onComplete={(data) => {
                      console.log('Focus game completed:', data);
                      setIsPlayingGame(false);
                      setSelectedGameInOutline(null);
                    }}
                    onGoToCockpit={() => {
                      setIsPlayingGame(false);
                      setSelectedGameInOutline(null);
                    }}
                  />
                )}
                {gameId === 'game-control' && (
                  <ControlGame 
                    onComplete={(data) => {
                      console.log('Control game completed:', data);
                      setIsPlayingGame(false);
                      setSelectedGameInOutline(null);
                    }}
                    onGoToCockpit={() => {
                      setIsPlayingGame(false);
                      setSelectedGameInOutline(null);
                    }}
                  />
                )}
              </div>
            );
          })()}

          {/* Dialog - Widok instrukcji gry */}
          <Dialog 
            open={selectedGameInOutline !== null && !isPlayingGame} 
            onOpenChange={(open) => !open && setSelectedGameInOutline(null)}
          >
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
              {selectedGameInOutline && !isPlayingGame && (() => {
                const game = getExerciseById(selectedGameInOutline);
                if (!game) return null;
                
                return (
                  <>
                    <DialogHeader>
                      <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl">{game.title}</DialogTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedGameInOutline(null)}
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Powrót do konspektu
                        </Button>
                      </div>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      {/* Podstawowe info */}
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{game.duration}</Badge>
                        <Badge variant="secondary">Wyzwanie Sigma</Badge>
                      </div>

                      {/* Cel */}
                      {game.objective && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Cel wyzwania</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm leading-relaxed">{game.objective}</p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Opis */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Opis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-relaxed">{game.description}</p>
                        </CardContent>
                      </Card>

                      {/* Instrukcje */}
                      {game.steps && game.steps.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Instrukcje</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {game.steps.map((step, idx) => (
                                <div key={idx} className="border-l-2 border-primary/30 pl-4 py-2">
                                  <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed">{step.content}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Przycisk uruchomienia */}
                      <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-6 text-center space-y-4">
                          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <Trophy className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold mb-2">Uruchom wyzwanie</h3>
                            <p className="text-sm text-muted-foreground">
                              Kliknij przycisk poniżej aby rozpocząć tryb treningowy
                            </p>
                          </div>
                          <Button 
                            size="lg" 
                            className="w-full gap-2"
                            onClick={() => setIsPlayingGame(true)}
                          >
                            <Trophy className="h-5 w-5" />
                            Rozpocznij Wyzwanie
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                );
              })()}
            </DialogContent>
          </Dialog>
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
