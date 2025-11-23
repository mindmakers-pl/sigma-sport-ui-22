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
import { Plus, Search, FileText, Settings, Archive, X, Loader2 } from "lucide-react";
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
import BackButton from "@/components/BackButton";
import { useAthletes } from "@/hooks/useAthletes";
import { useClubs } from "@/hooks/useClubs";
import { toast } from "sonner";

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
  
  const { athletes, loading, addAthlete, archiveAthletes, restoreAthletes } = useAthletes();
  const { clubs, loading: clubsLoading } = useClubs();
  
  const [newAthlete, setNewAthlete] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    phone: "",
    clubId: "",
    coach: "",
    discipline: "",
    birthDate: undefined as Date | undefined,
    notes: "",
    parentFirstName: "",
    parentLastName: "",
    parentPhone: "",
    parentEmail: "",
  });

  // Get unique disciplines from all athletes
  const disciplines = Array.from(new Set(
    athletes
      .map(athlete => athlete.discipline)
      .filter(discipline => discipline && discipline.trim() !== "")
  )) as string[];

  // Get coaches for selected club
  const getCoachesForClub = () => {
    if (!newAthlete.clubId) return [];
    const selectedClub = clubs.find(c => c.id === newAthlete.clubId);
    return selectedClub?.coaches || [];
  };

  const filteredAthletes = athletes.filter(athlete => {
    // Filter by archive status
    if (!showArchived && athlete.archived) return false;
    if (showArchived && !athlete.archived) return false;
    
    const fullName = `${athlete.first_name} ${athlete.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesClub = filterClub === "all" || athlete.club_id === filterClub;
    const matchesDiscipline = filterDiscipline === "all" || athlete.discipline === filterDiscipline;
    return matchesSearch && matchesClub && matchesDiscipline;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAthletes.length / itemsPerPage);
  const paginatedAthletes = filteredAthletes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page on filter change
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

  const handleArchiveSelected = async () => {
    const { error } = await archiveAthletes(selectedAthletes);
    if (error) {
      toast.error("Błąd podczas archiwizacji zawodników");
      return;
    }
    toast.success("Zawodnicy zostali zarchiwizowani");
    setSelectedAthletes([]);
    setIsSelectionMode(false);
  };

  const handleRestoreSelected = async () => {
    const { error } = await restoreAthletes(selectedAthletes);
    if (error) {
      toast.error("Błąd podczas przywracania zawodników");
      return;
    }
    toast.success("Zawodnicy zostali przywróceni");
    setSelectedAthletes([]);
    setIsSelectionMode(false);
  };

  const cancelSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedAthletes([]);
  };

  const hasActiveFilters = filterClub !== "all" || filterDiscipline !== "all";

  const handleAddAthlete = async () => {
    if (!newAthlete.firstName.trim() || !newAthlete.lastName.trim()) {
      toast.error("Wypełnij wszystkie wymagane pola (imię i nazwisko)");
      return;
    }

    const athleteData = {
      first_name: newAthlete.firstName,
      last_name: newAthlete.lastName,
      gender: newAthlete.gender || undefined,
      email: newAthlete.email || undefined,
      phone: newAthlete.phone || undefined,
      club_id: newAthlete.clubId || undefined,
      coach: newAthlete.coach || undefined,
      discipline: newAthlete.discipline || undefined,
      birth_date: newAthlete.birthDate?.toISOString(),
      birth_year: newAthlete.birthDate?.getFullYear(),
      notes: newAthlete.notes || undefined,
      parent_first_name: newAthlete.parentFirstName || undefined,
      parent_last_name: newAthlete.parentLastName || undefined,
      parent_phone: newAthlete.parentPhone || undefined,
      parent_email: newAthlete.parentEmail || undefined,
    };
    
    const { error } = await addAthlete(athleteData);
    
    if (error) {
      toast.error("Błąd podczas dodawania zawodnika");
      return;
    }

    toast.success("Zawodnik został dodany");
    setIsAddDialogOpen(false);
    setNewAthlete({
      firstName: "",
      lastName: "",
      gender: "",
      email: "",
      phone: "",
      clubId: "",
      coach: "",
      discipline: "",
      birthDate: undefined,
      notes: "",
      parentFirstName: "",
      parentLastName: "",
      parentPhone: "",
      parentEmail: "",
    });
  };

  const isFormValid = newAthlete.firstName.trim() !== "" && 
                      newAthlete.lastName.trim() !== "";

  if (loading || clubsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <BackButton />
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
                      Klub
                    </Label>
                    <Select
                      value={newAthlete.clubId}
                      onValueChange={(value) => setNewAthlete({ ...newAthlete, clubId: value, coach: "" })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Wybierz klub" />
                      </SelectTrigger>
                      <SelectContent>
                        {clubs.map(club => (
                          <SelectItem key={club.id} value={club.id}>
                            {club.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="coach" className="text-slate-900 font-semibold">
                      Trener
                    </Label>
                    <Select
                      value={newAthlete.coach}
                      onValueChange={(value) => setNewAthlete({ ...newAthlete, coach: value })}
                      disabled={!newAthlete.clubId}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder={newAthlete.clubId ? "Wybierz trenera" : "Najpierw wybierz klub"} />
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

                {/* Parent/Guardian Section */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold text-slate-900">Kontakt do rodzica/opiekuna</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="parentFirstName" className="text-slate-900 font-semibold">Imię rodzica</Label>
                      <Input
                        id="parentFirstName"
                        value={newAthlete.parentFirstName}
                        onChange={(e) => setNewAthlete({ ...newAthlete, parentFirstName: e.target.value })}
                        placeholder="Anna"
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="parentLastName" className="text-slate-900 font-semibold">Nazwisko rodzica</Label>
                      <Input
                        id="parentLastName"
                        value={newAthlete.parentLastName}
                        onChange={(e) => setNewAthlete({ ...newAthlete, parentLastName: e.target.value })}
                        placeholder="Kowalska"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="parentPhone" className="text-slate-900 font-semibold">Telefon rodzica</Label>
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
                      <Label htmlFor="parentEmail" className="text-slate-900 font-semibold">E-mail rodzica</Label>
                      <Input
                        id="parentEmail"
                        type="email"
                        value={newAthlete.parentEmail}
                        onChange={(e) => setNewAthlete({ ...newAthlete, parentEmail: e.target.value })}
                        placeholder="anna.kowalska@example.com"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleAddAthlete} 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!isFormValid}
                >
                  Dodaj zawodnika
                </Button>
              </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Filtruj zawodników</CardTitle>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterClub("all");
                  setFilterDiscipline("all");
                }}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Wyczyść filtry
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj zawodnika..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterClub} onValueChange={setFilterClub}>
              <SelectTrigger>
                <SelectValue placeholder="Wszystkie kluby" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie kluby</SelectItem>
                {clubs.map(club => (
                  <SelectItem key={club.id} value={club.id}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDiscipline} onValueChange={setFilterDiscipline}>
              <SelectTrigger>
                <SelectValue placeholder="Wszystkie dyscypliny" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie dyscypliny</SelectItem>
                {disciplines.map(discipline => (
                  <SelectItem key={discipline} value={discipline}>
                    {discipline}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Selection Mode Controls */}
      {isSelectionMode && (
        <Card className="mb-6 border-primary">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold">
                  Zaznaczono: {selectedAthletes.length} {selectedAthletes.length === 1 ? 'zawodnika' : 'zawodników'}
                </p>
              </div>
              <div className="flex gap-2">
                {showArchived ? (
                  <Button
                    onClick={handleRestoreSelected}
                    disabled={selectedAthletes.length === 0}
                    variant="default"
                  >
                    Przywróć zaznaczonych
                  </Button>
                ) : (
                  <Button
                    onClick={handleArchiveSelected}
                    disabled={selectedAthletes.length === 0}
                    variant="destructive"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archiwizuj zaznaczonych
                  </Button>
                )}
                <Button onClick={cancelSelectionMode} variant="outline">
                  Anuluj
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Athletes Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>
              {showArchived ? "Zarchiwizowani zawodnicy" : "Lista zawodników"}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={showArchived ? "default" : "outline"}
                onClick={() => setShowArchived(!showArchived)}
                className="gap-2"
              >
                <Archive className="h-4 w-4" />
                {showArchived ? "Pokaż aktywnych" : "Pokaż zarchiwizowanych"}
              </Button>
              {!showArchived && (
                <Button
                  variant={isSelectionMode ? "default" : "outline"}
                  onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                    setSelectedAthletes([]);
                  }}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  {isSelectionMode ? "Zakończ zaznaczanie" : "Zaznacz"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAthletes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {showArchived ? "Brak zarchiwizowanych zawodników" : "Brak zawodników spełniających kryteria"}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    {isSelectionMode && (
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedAthletes.length === paginatedAthletes.length}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                    )}
                    <TableHead>Imię i nazwisko</TableHead>
                    <TableHead>Klub</TableHead>
                    <TableHead>Dyscyplina</TableHead>
                    <TableHead>Data urodzenia</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAthletes.map((athlete) => {
                    const club = clubs.find(c => c.id === athlete.club_id);
                    return (
                      <TableRow key={athlete.id}>
                        {isSelectionMode && (
                          <TableCell>
                            <Checkbox
                              checked={selectedAthletes.includes(athlete.id)}
                              onCheckedChange={() => toggleSelectAthlete(athlete.id)}
                            />
                          </TableCell>
                        )}
                        <TableCell className="font-medium">
                          {athlete.first_name} {athlete.last_name}
                        </TableCell>
                        <TableCell>{club?.name || 'N/A'}</TableCell>
                        <TableCell>{athlete.discipline || 'N/A'}</TableCell>
                        <TableCell>
                          {athlete.birth_date ? format(new Date(athlete.birth_date), "dd MMM yyyy", { locale: pl }) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/zawodnicy/${athlete.id}`)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Profil
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => navigate(`/zawodnicy/${athlete.id}?tab=dodaj-pomiar`)}
                            >
                              Pomiar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Strona {currentPage} z {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Poprzednia
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Następna
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Athletes;
