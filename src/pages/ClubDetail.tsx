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
import { Settings, Plus, ArrowLeft, Search, Trophy, TrendingUp, TrendingDown, Calendar as CalendarIcon, Target, ClipboardList, Dumbbell, CheckCircle2, Clock, BookOpen, Archive, X } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import DisciplineSelector from "@/components/DisciplineSelector";
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

import ScanGame from "@/components/games/ScanGame";
import FocusGame from "@/components/games/FocusGame";
import ControlGame from "@/components/games/ControlGame";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { allSprints, exerciseLibrary, getExerciseById, sigmaGoDemoTraining, type Meeting, type Sprint } from "@/data/libraryData";
import { useClubs } from "@/hooks/useClubs";
import { useAthletes } from "@/hooks/useAthletes";
import { useToast } from "@/hooks/use-toast";

const ClubDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "zawodnicy";
  
  // Supabase hooks
  const { clubs, loading: clubsLoading, addClub, updateClub } = useClubs();
  const { athletes: allAthletes, loading: athletesLoading, addAthlete, archiveAthletes, restoreAthletes, refetch: refetchAthletes } = useAthletes();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedM1, setSelectedM1] = useState("m1-oct");
  const [selectedM2, setSelectedM2] = useState("m2-nov");
  const [isAddAthleteDialogOpen, setIsAddAthleteDialogOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  
  const [newAthlete, setNewAthlete] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    phone: "",
    club: "",
    coach: "",
    discipline: "",
    birthDate: undefined as Date | undefined,
    notes: "",
    parentFirstName: "",
    parentLastName: "",
    parentPhone: "",
    parentEmail: "",
  });
  
  // Nowe stany dla Sigma Teams
  const [selectedMeetingForOutline, setSelectedMeetingForOutline] = useState<{
    sprint: Sprint;
    meeting: Meeting;
  } | null>(null);
  
  const [selectedExerciseInOutline, setSelectedExerciseInOutline] = useState<string | null>(null);
  const [selectedGameInOutline, setSelectedGameInOutline] = useState<string | null>(null);
  const [sigmaTeamsTab, setSigmaTeamsTab] = useState("sigma-go");
  const [isPlayingGame, setIsPlayingGame] = useState(false);

  // Pobierz dane klubu z Supabase
  const club = clubs.find((c) => c.id === id) || {
    id: id || "",
    name: "Nieznany klub",
    city: "",
    members_count: 0,
  };
  
  // Refresh athletes when dialog opens
  useEffect(() => {
    if (isAddAthleteDialogOpen) {
      setNewAthlete({
        firstName: "",
        lastName: "",
        gender: "",
        email: "",
        phone: "",
        club: club.name, // Pre-fill with current club
        coach: "",
        discipline: "",
        birthDate: undefined,
        notes: "",
        parentFirstName: "",
        parentLastName: "",
        parentPhone: "",
        parentEmail: "",
      });
    }
  }, [isAddAthleteDialogOpen, club.name]);

  // Filtruj zawodników przypisanych do tego klubu z Supabase
  const athletes = allAthletes
    .filter((athlete) => athlete.club_id === id)
    .map((athlete) => ({
      id: athlete.id,
      name: `${athlete.last_name} ${athlete.first_name}`,
      birthDate: athlete.birth_year ? `${athlete.birth_year}-01-01` : "N/A",
      lastSession: "Brak danych",
      archived: athlete.archived || false,
      archivedAt: athlete.archived_at || null,
    }));
  
  // Funkcja do dodawania zawodnika
  const handleAddAthlete = async () => {
    const birthYear = newAthlete.birthDate ? newAthlete.birthDate.getFullYear() : new Date().getFullYear();
    
    const athleteData = {
      first_name: newAthlete.firstName,
      last_name: newAthlete.lastName,
      gender: newAthlete.gender,
      club_id: id!, // current club ID
      coach: newAthlete.coach,
      discipline: newAthlete.discipline,
      birth_year: birthYear,
      birth_date: newAthlete.birthDate?.toISOString().split('T')[0],
      email: newAthlete.email,
      phone: newAthlete.phone,
      notes: newAthlete.notes,
      parent_first_name: newAthlete.parentFirstName,
      parent_last_name: newAthlete.parentLastName,
      parent_phone: newAthlete.parentPhone,
      parent_email: newAthlete.parentEmail,
    };
    
    const { error } = await addAthlete(athleteData);
    
    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać zawodnika",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sukces",
        description: "Zawodnik został dodany",
      });
      setIsAddAthleteDialogOpen(false);
      await refetchAthletes();
    }
  };
  
  const isFormValid = newAthlete.firstName.trim() !== "" && 
                      newAthlete.lastName.trim() !== "" && 
                      newAthlete.club !== "";

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

  const filteredAthletes = athletes.filter(athlete => {
    // Filter by archive status
    if (!showArchived && athlete.archived) return false;
    if (showArchived && !athlete.archived) return false;
    
    return athlete.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleSelectAll = () => {
    if (selectedAthletes.length === filteredAthletes.length) {
      setSelectedAthletes([]);
    } else {
      setSelectedAthletes(filteredAthletes.map(a => a.id.toString()));
    }
  };

  const toggleSelectAthlete = (id: string) => {
    setSelectedAthletes(prev => 
      prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
    );
  };

  const handleArchiveSelected = async () => {
    const { error } = await archiveAthletes(selectedAthletes);
    
    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zarchiwizować zawodników",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sukces",
        description: "Zawodnicy zostali zarchiwizowani",
      });
      await refetchAthletes();
      setSelectedAthletes([]);
      setIsSelectionMode(false);
    }
  };

  const handleRestoreSelected = async () => {
    const { error } = await restoreAthletes(selectedAthletes);
    
    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się przywrócić zawodników",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sukces",
        description: "Zawodnicy zostali przywróceni",
      });
      await refetchAthletes();
      setSelectedAthletes([]);
      setIsSelectionMode(false);
    }
  };

  const cancelSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedAthletes([]);
  };


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
      <Tabs value={tab} onValueChange={(value) => setSearchParams({ tab: value })} className="w-full" id="club-tabs">
        <TabsList>
          <TabsTrigger value="zawodnicy">Lista zawodników</TabsTrigger>
          <TabsTrigger value="sigma-teams">Sigma Teams</TabsTrigger>
          <TabsTrigger value="raporty">Raporty</TabsTrigger>
          <TabsTrigger value="informacje">Informacje o klubie</TabsTrigger>
        </TabsList>

        {/* ZAKŁADKA 1: Lista zawodników (Centrum dowodzenia) */}
        <TabsContent value="zawodnicy">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Zawodnicy klubu {club.name}</CardTitle>
                <Dialog open={isAddAthleteDialogOpen} onOpenChange={setIsAddAthleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                      <Plus className="h-4 w-4" />
                      Dodaj zawodnika
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Stwórz nowy profil zawodnika</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="firstName" className="text-slate-900 font-semibold">
                            Imię <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="firstName"
                            value={newAthlete.firstName}
                            onChange={(e) => setNewAthlete({ ...newAthlete, firstName: e.target.value })}
                            placeholder="Jan"
                            className="mt-2"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="lastName" className="text-slate-900 font-semibold">
                            Nazwisko <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="lastName"
                            value={newAthlete.lastName}
                            onChange={(e) => setNewAthlete({ ...newAthlete, lastName: e.target.value })}
                            placeholder="Kowalski"
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="email" className="text-slate-900 font-semibold">E-mail</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newAthlete.email}
                            onChange={(e) => setNewAthlete({ ...newAthlete, email: e.target.value })}
                            placeholder="jan.kowalski@example.com"
                            className="mt-2"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="phone" className="text-slate-900 font-semibold">Numer telefonu</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={newAthlete.phone}
                            onChange={(e) => setNewAthlete({ ...newAthlete, phone: e.target.value })}
                            placeholder="+48 123 456 789"
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="club" className="text-slate-900 font-semibold">
                            Klub <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="club"
                            value={newAthlete.club}
                            onChange={(e) => setNewAthlete({ ...newAthlete, club: e.target.value, coach: "" })}
                            placeholder="Wpisz nazwę klubu"
                            className="mt-2"
                            list="clubs-list-dialog"
                          />
                          <datalist id="clubs-list-dialog">
                            {clubs.map((c) => (
                              <option key={c.id} value={c.name} />
                            ))}
                          </datalist>
                        </div>
                        
                        <div>
                          <Label htmlFor="coach" className="text-slate-900 font-semibold">
                            Trener
                          </Label>
                          <Select
                            value={newAthlete.coach}
                            onValueChange={(value) => setNewAthlete({ ...newAthlete, coach: value })}
                            disabled={!newAthlete.club}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder={newAthlete.club ? "Wybierz trenera" : "Najpierw wybierz klub"} />
                            </SelectTrigger>
                            <SelectContent>
                              {(() => {
                                if (!newAthlete.club) return null;
                                const selectedClub = clubs.find((c) => c.name === newAthlete.club);
                                if (selectedClub && selectedClub.coaches) {
                                  return (selectedClub.coaches as any[]).map((coach: any, index: number) => (
                                    <SelectItem key={index} value={coach.name}>
                                      {coach.name}
                                    </SelectItem>
                                  ));
                                }
                                return null;
                              })()}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <DisciplineSelector
                            value={newAthlete.discipline}
                            onChange={(value) => setNewAthlete({ ...newAthlete, discipline: value })}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="gender" className="text-slate-900 font-semibold">
                            Płeć
                          </Label>
                          <Select
                            value={newAthlete.gender}
                            onValueChange={(value) => setNewAthlete({ ...newAthlete, gender: value })}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Wybierz płeć" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Mężczyzna</SelectItem>
                              <SelectItem value="female">Kobieta</SelectItem>
                              <SelectItem value="other">Inna</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-slate-900 font-semibold">Data urodzenia</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal mt-2 bg-white",
                                !newAthlete.birthDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newAthlete.birthDate ? (
                                format(newAthlete.birthDate, "dd MMM yyyy", { locale: pl })
                              ) : (
                                <span>Wybierz datę</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={newAthlete.birthDate}
                              onSelect={(date) => setNewAthlete({ ...newAthlete, birthDate: date })}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1950-01-01")
                              }
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <Label htmlFor="notes" className="text-slate-900 font-semibold">Historia i notatki</Label>
                        <Textarea
                          id="notes"
                          value={newAthlete.notes}
                          onChange={(e) => setNewAthlete({ ...newAthlete, notes: e.target.value })}
                          placeholder="Dodaj informacje o zawodniku, jego historię sportową, cele treningowe..."
                          className="mt-2 min-h-[100px]"
                          rows={4}
                        />
                      </div>

                      <div className="border-t border-slate-200 pt-4 space-y-4">
                        <h3 className="text-slate-900 font-semibold">Dane kontaktowe rodzica/opiekuna (opcjonalne)</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="parentFirstName" className="text-slate-900 font-semibold">
                              Imię rodzica
                            </Label>
                            <Input
                              id="parentFirstName"
                              value={newAthlete.parentFirstName}
                              onChange={(e) => setNewAthlete({ ...newAthlete, parentFirstName: e.target.value })}
                              placeholder="Jan"
                              className="mt-2"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="parentLastName" className="text-slate-900 font-semibold">
                              Nazwisko rodzica
                            </Label>
                            <Input
                              id="parentLastName"
                              value={newAthlete.parentLastName}
                              onChange={(e) => setNewAthlete({ ...newAthlete, parentLastName: e.target.value })}
                              placeholder="Kowalski"
                              className="mt-2"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="parentPhone" className="text-slate-900 font-semibold">
                              Telefon rodzica
                            </Label>
                            <Input
                              id="parentPhone"
                              type="tel"
                              value={newAthlete.parentPhone}
                              onChange={(e) => setNewAthlete({ ...newAthlete, parentPhone: e.target.value })}
                              placeholder="+48 123 456 789"
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <Label htmlFor="parentEmail" className="text-slate-900 font-semibold">
                              Email rodzica
                            </Label>
                            <Input
                              id="parentEmail"
                              type="email"
                              value={newAthlete.parentEmail}
                              onChange={(e) => setNewAthlete({ ...newAthlete, parentEmail: e.target.value })}
                              placeholder="rodzic@example.com"
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4 border-t border-slate-200">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsAddAthleteDialogOpen(false)}
                          className="flex-1"
                        >
                          Anuluj
                        </Button>
                        <Button 
                          onClick={handleAddAthlete} 
                          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                          disabled={!isFormValid}
                        >
                          Zapisz zawodnika
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {/* Wyszukiwarka */}
              <div className="flex gap-4 items-center mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Wyszukaj zawodnika..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button 
                  variant={showArchived ? "default" : "outline"}
                  onClick={() => {
                    setShowArchived(!showArchived);
                    setIsSelectionMode(false);
                    setSelectedAthletes([]);
                  }}
                  className="gap-2"
                >
                  <Archive className="h-4 w-4" />
                  {showArchived ? "Aktywni" : "Archiwum"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {isSelectionMode && (
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedAthletes.length === filteredAthletes.length && filteredAthletes.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                    )}
                    <TableHead className="font-semibold">Nazwisko i imię</TableHead>
                    <TableHead className="font-semibold">Data ur.</TableHead>
                    <TableHead className="font-semibold">Data ost. pomiaru</TableHead>
                    <TableHead className="text-right font-semibold">
                      <div className="flex items-center justify-end gap-2">
                        {!isSelectionMode ? (
                          <>
                            <span>Akcje</span>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setIsSelectionMode(true)}
                              title="Tryb selekcji"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            {selectedAthletes.length > 0 && (
                              !showArchived ? (
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={handleArchiveSelected}
                                  className="gap-2"
                                >
                                  <Archive className="h-4 w-4" />
                                  Archiwizuj ({selectedAthletes.length})
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={handleRestoreSelected}
                                  className="gap-2"
                                >
                                  <Archive className="h-4 w-4" />
                                  Przywróć ({selectedAthletes.length})
                                </Button>
                              )
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={cancelSelectionMode}
                              title="Anuluj tryb selekcji"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAthletes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isSelectionMode ? 5 : 4} className="text-center py-8 text-muted-foreground">
                        {showArchived ? "Brak zarchiwizowanych zawodników." : "Brak zawodników w tym klubie."}
                        {!showArchived && (
                          <Button 
                            variant="link" 
                            className="text-primary ml-2"
                            onClick={() => navigate('/zawodnicy')}
                          >
                            Dodaj pierwszego zawodnika
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAthletes.map((athlete) => (
                      <TableRow 
                        key={athlete.id}
                        className={isSelectionMode ? "cursor-pointer" : "cursor-pointer hover:bg-muted/50"}
                        onClick={(e) => {
                          // In selection mode, toggle checkbox
                          if (isSelectionMode) {
                            toggleSelectAthlete(athlete.id.toString());
                            return;
                          }
                          
                          // Don't navigate if clicking on checkbox or action button
                          if ((e.target as HTMLElement).closest('input[type="checkbox"]') || 
                              (e.target as HTMLElement).closest('button')) {
                            return;
                          }
                          navigate(`/zawodnicy/${athlete.id}`);
                        }}
                      >
                        {isSelectionMode && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedAthletes.includes(athlete.id.toString())}
                              onCheckedChange={() => toggleSelectAthlete(athlete.id.toString())}
                            />
                          </TableCell>
                        )}
                        <TableCell className="font-medium">{athlete.name}</TableCell>
                        <TableCell className="text-muted-foreground">{athlete.birthDate}</TableCell>
                        <TableCell className="text-muted-foreground">{athlete.lastSession}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            size="sm"
                            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => navigate(`/zawodnicy/${athlete.id}?tab=dodaj-pomiar`)}
                          >
                            <Plus className="h-3 w-3" />
                            Pomiar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
                    <div>
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
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
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
                          <CardTitle className="text-lg">Wskazówki dla trenera</CardTitle>
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
                          <CardTitle className="text-lg">Metryki do śledzenia</CardTitle>
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
            {/* Placeholder dla raportów */}
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Raporty klubowe będą dostępne po przeprowadzeniu pomiarów zawodników
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ZAKŁADKA 4: Informacje o klubie */}
        <TabsContent value="informacje" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Podstawowe informacje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Nazwa klubu</span>
                  <span className="font-semibold text-lg">{club.name}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Miasto</span>
                  <span className="font-semibold">{club.city}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Dyscypliny</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {club.disciplines && club.disciplines.length > 0 ? (
                      club.disciplines.map((discipline: string, index: number) => (
                        <Badge key={index} variant="secondary">{discipline}</Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">Nie podano</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dane kontaktowe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Osoba kontaktowa</span>
                  <span className="font-semibold">{"Nie podano"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Email</span>
                  <span className="font-semibold">{"Nie podano"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Telefon</span>
                  <span className="font-semibold">{"Nie podano"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trenerzy</CardTitle>
            </CardHeader>
            <CardContent>
              {club.coaches && club.coaches.length > 0 ? (
                <div className="space-y-3">
                  {club.coaches.map((coach: any, index: number) => (
                    <div key={index} className="p-4 bg-muted/30 rounded-lg">
                      <div className="space-y-1">
                        <p className="font-semibold">{coach.name}</p>
                        <p className="text-sm text-muted-foreground">{coach.email}</p>
                        <p className="text-sm text-muted-foreground">{coach.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Brak przypisanych trenerów</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zakupione programy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">Brak zakupionych programów</p>
              </div>
            </CardContent>
          </Card>

        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClubDetail;
