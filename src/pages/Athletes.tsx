import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Plus, Search, FileText, Settings, Archive, X } from "lucide-react";
import DisciplineSelector from "@/components/DisciplineSelector";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Athletes = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClub, setFilterClub] = useState("all");
  const [filterDiscipline, setFilterDiscipline] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showArchived, setShowArchived] = useState(false);
  const itemsPerPage = 10;
  
  const [newAthlete, setNewAthlete] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    club: "",
    coach: "",
    discipline: "",
    birthDate: undefined as Date | undefined,
    notes: "",
  });

  const [athletes, setAthletes] = useState(() => {
    const stored = localStorage.getItem('athletes');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  });

  const [clubs, setClubs] = useState(() => {
    const storedClubs = localStorage.getItem('clubs');
    if (storedClubs) {
      const clubsData = JSON.parse(storedClubs);
      return clubsData.map((club: any) => club.name);
    }
    return ["KS Górnik", "MKS Cracovia", "Wisła Kraków", "Legia Warszawa"];
  });
  
  // Pobierz unikalne dyscypliny z zawodników w localStorage
  const getDisciplines = () => {
    const storedAthletes = localStorage.getItem('athletes');
    if (storedAthletes) {
      const athletesData = JSON.parse(storedAthletes);
      const uniqueDisciplines = Array.from(new Set(
        athletesData
          .map((athlete: any) => athlete.discipline)
          .filter((discipline: string) => discipline && discipline.trim() !== "")
      ));
      return uniqueDisciplines as string[];
    }
    return ["Piłka nożna", "Koszykówka", "Siatkówka"];
  };

  const [disciplines, setDisciplines] = useState<string[]>(getDisciplines());

  // Pobierz trenerów z wybranego klubu
  const getCoachesForClub = () => {
    if (!newAthlete.club) return [];
    
    const storedClubs = localStorage.getItem('clubs');
    if (storedClubs) {
      const clubsData = JSON.parse(storedClubs);
      const selectedClub = clubsData.find((club: any) => club.name === newAthlete.club);
      if (selectedClub && selectedClub.coaches) {
        return selectedClub.coaches;
      }
    }
    return [];
  };

  // Synchronizuj listę klubów i dyscyplin z localStorage
  useEffect(() => {
    const storedClubs = localStorage.getItem('clubs');
    if (storedClubs) {
      const clubsData = JSON.parse(storedClubs);
      setClubs(clubsData.map((club: any) => club.name));
    }
    
    // Aktualizuj dyscypliny przy zmianie athletes
    setDisciplines(getDisciplines());
  }, [athletes]);

  const filteredAthletes = athletes.filter(athlete => {
    // Filtruj według statusu archiwizacji
    if (!showArchived && athlete.archived) return false;
    if (showArchived && !athlete.archived) return false;
    
    const matchesSearch = athlete.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClub = filterClub === "all" || athlete.club === filterClub;
    const matchesDiscipline = filterDiscipline === "all" || athlete.discipline === filterDiscipline;
    return matchesSearch && matchesClub && matchesDiscipline;
  });

  // Paginacja
  const totalPages = Math.ceil(filteredAthletes.length / itemsPerPage);
  const paginatedAthletes = filteredAthletes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset strony przy zmianie filtrów
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterClub, filterDiscipline, showArchived]);

  const toggleSelectAll = () => {
    if (selectedAthletes.length === paginatedAthletes.length) {
      setSelectedAthletes([]);
    } else {
      setSelectedAthletes(paginatedAthletes.map(a => a.id));
    }
  };

  const toggleSelectAthlete = (id: string) => {
    setSelectedAthletes(prev => 
      prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
    );
  };

  const handleArchiveSelected = () => {
    const updatedAthletes = athletes.map(athlete => 
      selectedAthletes.includes(athlete.id) 
        ? { ...athlete, archived: true, archivedAt: new Date().toISOString() }
        : athlete
    );
    localStorage.setItem('athletes', JSON.stringify(updatedAthletes));
    setAthletes(updatedAthletes);
    setSelectedAthletes([]);
    setIsSelectionMode(false);
  };

  const handleRestoreSelected = () => {
    const updatedAthletes = athletes.map(athlete => 
      selectedAthletes.includes(athlete.id) 
        ? { ...athlete, archived: false, archivedAt: null }
        : athlete
    );
    localStorage.setItem('athletes', JSON.stringify(updatedAthletes));
    setAthletes(updatedAthletes);
    setSelectedAthletes([]);
    setIsSelectionMode(false);
  };

  const cancelSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedAthletes([]);
  };

  const hasActiveFilters = filterClub !== "all" || filterDiscipline !== "all";

  const handleAddAthlete = () => {
    const newId = athletes.length > 0 ? Math.max(...athletes.map(a => a.id)) + 1 : 1;
    const fullName = `${newAthlete.lastName} ${newAthlete.firstName}`;
    const birthYear = newAthlete.birthDate ? newAthlete.birthDate.getFullYear() : new Date().getFullYear();
    
    const athleteToAdd = {
      id: newId,
      name: fullName,
      club: newAthlete.club,
      coach: newAthlete.coach,
      discipline: newAthlete.discipline,
      birthYear: birthYear,
      sessions: 0,
      email: newAthlete.email,
      phone: newAthlete.phone,
      notes: newAthlete.notes,
    };
    
    const updatedAthletes = [...athletes, athleteToAdd];
    setAthletes(updatedAthletes);
    
    // Zapisz do localStorage
    localStorage.setItem('athletes', JSON.stringify(updatedAthletes));
    
    // Dodaj klub do listy jeśli nie istnieje
    if (newAthlete.club && !clubs.includes(newAthlete.club)) {
      const updatedClubs = [...clubs, newAthlete.club];
      setClubs(updatedClubs);
      
      // Zaktualizuj też clubs w localStorage jeśli istnieje struktura klubów
      const storedClubs = localStorage.getItem('clubs');
      if (storedClubs) {
        const clubsData = JSON.parse(storedClubs);
        const clubExists = clubsData.some((c: any) => c.name === newAthlete.club);
        if (!clubExists) {
          const newClubData = {
            id: Math.max(...clubsData.map((c: any) => c.id), 0) + 1,
            name: newAthlete.club,
            city: "",
            disciplines: newAthlete.discipline ? [newAthlete.discipline] : [],
            members: 1
          };
          localStorage.setItem('clubs', JSON.stringify([...clubsData, newClubData]));
        }
      }
    }
    
    setIsAddDialogOpen(false);
    setNewAthlete({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      club: "",
      coach: "",
      discipline: "",
      birthDate: undefined,
      notes: "",
    });
  };

  const isFormValid = newAthlete.firstName.trim() !== "" && 
                      newAthlete.lastName.trim() !== "" && 
                      newAthlete.club !== "";

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Zawodnicy</h1>
          <p className="text-muted-foreground">Zarządzaj swoimi zawodnikami</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                      onChange={(e) => {
                        setNewAthlete({ ...newAthlete, club: e.target.value, coach: "" });
                      }}
                      placeholder="Wpisz nazwę klubu"
                      className="mt-2"
                      list="clubs-list"
                    />
                    <datalist id="clubs-list">
                      {clubs.map(club => (
                        <option key={club} value={club} />
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
                        {getCoachesForClub().map((coach: any, index: number) => (
                          <SelectItem key={index} value={coach.name}>
                            {coach.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <DisciplineSelector
                    value={newAthlete.discipline}
                    onChange={(value) => setNewAthlete({ ...newAthlete, discipline: value })}
                  />
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

                <div className="flex gap-4 pt-4 border-t border-slate-200">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
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

      {/* Filtrowanie/Wyszukiwanie */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Filtruj zawodników</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Wyszukaj</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Imię, nazwisko..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="clubFilter">Klub</Label>
              <Select value={filterClub} onValueChange={setFilterClub}>
                <SelectTrigger id="clubFilter">
                  <SelectValue placeholder="Wszystkie kluby" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie kluby</SelectItem>
                  {clubs.map(club => (
                    <SelectItem key={club} value={club}>{club}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="disciplineFilter">Dyscyplina</Label>
              <Select value={filterDiscipline} onValueChange={setFilterDiscipline}>
                <SelectTrigger id="disciplineFilter">
                  <SelectValue placeholder="Wszystkie dyscypliny" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie dyscypliny</SelectItem>
                  {disciplines.map(disc => (
                    <SelectItem key={disc} value={disc}>{disc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {hasActiveFilters && (
                <p className="text-sm text-muted-foreground">
                  Znaleziono {filteredAthletes.length} zawodników
                </p>
              )}
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="h-4 w-4" />
                Wygeneruj raport
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela Zawodników */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              {isSelectionMode && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedAthletes.length === paginatedAthletes.length && paginatedAthletes.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead className="font-semibold">Nazwisko i imię</TableHead>
              <TableHead className="font-semibold">Klub</TableHead>
              <TableHead className="font-semibold">Dyscyplina</TableHead>
              <TableHead className="font-semibold">Rok ur.</TableHead>
              <TableHead className="text-right font-semibold">
                <div className="flex items-center justify-end gap-2">
                  {!isSelectionMode ? (
                    <>
                      Akcje
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
            {paginatedAthletes.map((athlete) => (
              <TableRow 
                key={athlete.id}
                className={isSelectionMode ? "cursor-pointer" : "cursor-pointer hover:bg-muted/50"}
                onClick={(e) => {
                  // In selection mode, toggle checkbox
                  if (isSelectionMode) {
                    toggleSelectAthlete(athlete.id);
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
                      checked={selectedAthletes.includes(athlete.id)}
                      onCheckedChange={() => toggleSelectAthlete(athlete.id)}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">{athlete.name}</TableCell>
                <TableCell className="text-muted-foreground">{athlete.club}</TableCell>
                <TableCell className="text-muted-foreground">{athlete.discipline}</TableCell>
                <TableCell className="text-muted-foreground">{athlete.birthYear}</TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => navigate(`/zawodnicy/${athlete.id}?addMeasurement=true`)}
                  >
                    Dodaj pomiar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Paginacja i przycisk archiwum */}
      <div className="flex items-center justify-between mt-4">
        <Button 
          variant={showArchived ? "default" : "outline"} 
          size="sm" 
          className="gap-2"
          onClick={() => setShowArchived(!showArchived)}
        >
          <Archive className="h-4 w-4" />
          {showArchived ? "Pokaż aktywnych" : "Pokaż archiwum"}
        </Button>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Strona {currentPage} z {totalPages} ({filteredAthletes.length} zawodników)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Poprzednia
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Następna
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Athletes;
