import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Plus, Search, FileText, X } from "lucide-react";
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
  
  const [newAthlete, setNewAthlete] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    club: "",
    discipline: "",
    birthDate: undefined as Date | undefined,
    notes: "",
  });

  const [athletes, setAthletes] = useState(() => {
    const stored = localStorage.getItem('athletes');
    if (stored) {
      return JSON.parse(stored);
    }
    const defaultAthletes = [
      { id: 1, name: "Kowalski Jan", club: "KS Górnik", discipline: "Piłka nożna", birthYear: 2005, sessions: 12, email: "jan.kowalski@example.com", phone: "+48 123 456 789", notes: "" },
      { id: 2, name: "Nowak Anna", club: "MKS Cracovia", discipline: "Koszykówka", birthYear: 2004, sessions: 8, email: "anna.nowak@example.com", phone: "+48 234 567 890", notes: "" },
      { id: 3, name: "Wiśniewski Piotr", club: "KS Górnik", discipline: "Piłka nożna", birthYear: 2006, sessions: 15, email: "piotr.wisniewski@example.com", phone: "+48 345 678 901", notes: "" },
      { id: 4, name: "Kowalczyk Maria", club: "Wisła Kraków", discipline: "Siatkówka", birthYear: 2005, sessions: 10, email: "maria.kowalczyk@example.com", phone: "+48 456 789 012", notes: "" },
      { id: 5, name: "Zieliński Tomasz", club: "Legia Warszawa", discipline: "Piłka nożna", birthYear: 2003, sessions: 20, email: "tomasz.zielinski@example.com", phone: "+48 567 890 123", notes: "" },
    ];
    localStorage.setItem('athletes', JSON.stringify(defaultAthletes));
    return defaultAthletes;
  });

  const [clubs, setClubs] = useState(() => {
    const storedClubs = localStorage.getItem('clubs');
    if (storedClubs) {
      const clubsData = JSON.parse(storedClubs);
      return clubsData.map((club: any) => club.name);
    }
    return ["KS Górnik", "MKS Cracovia", "Wisła Kraków", "Legia Warszawa"];
  });
  
  const disciplines = ["Piłka nożna", "Koszykówka", "Siatkówka"];

  // Synchronizuj listę klubów z localStorage
  useEffect(() => {
    const storedClubs = localStorage.getItem('clubs');
    if (storedClubs) {
      const clubsData = JSON.parse(storedClubs);
      setClubs(clubsData.map((club: any) => club.name));
    }
  }, []);

  const filteredAthletes = athletes.filter(athlete => {
    const matchesSearch = athlete.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClub = filterClub === "all" || athlete.club === filterClub;
    const matchesDiscipline = filterDiscipline === "all" || athlete.discipline === filterDiscipline;
    return matchesSearch && matchesClub && matchesDiscipline;
  });

  const hasActiveFilters = filterClub !== "all" || filterDiscipline !== "all";

  const handleAddAthlete = () => {
    const newId = athletes.length > 0 ? Math.max(...athletes.map(a => a.id)) + 1 : 1;
    const fullName = `${newAthlete.lastName} ${newAthlete.firstName}`;
    const birthYear = newAthlete.birthDate ? newAthlete.birthDate.getFullYear() : new Date().getFullYear();
    
    const athleteToAdd = {
      id: newId,
      name: fullName,
      club: newAthlete.club,
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
          <DialogContent className="w-screen h-screen max-w-none p-0 overflow-y-auto bg-slate-50">
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-slate-900">Stwórz nowy profil zawodnika</DialogTitle>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsAddDialogOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="max-w-3xl mx-auto p-8">
              <div className="bg-white rounded-lg border border-slate-200 p-8 space-y-6">
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
                      onChange={(e) => setNewAthlete({ ...newAthlete, club: e.target.value })}
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
                    <Label htmlFor="discipline" className="text-slate-900 font-semibold">Dyscyplina</Label>
                    <Input
                      id="discipline"
                      value={newAthlete.discipline}
                      onChange={(e) => setNewAthlete({ ...newAthlete, discipline: e.target.value })}
                      placeholder="np. Judo"
                      className="mt-2"
                    />
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
                          format(newAthlete.birthDate, "PPP", { locale: pl })
                        ) : (
                          <span>Wybierz datę</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white" align="start">
                      <Calendar
                        mode="single"
                        selected={newAthlete.birthDate}
                        onSelect={(date) => setNewAthlete({ ...newAthlete, birthDate: date })}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1950-01-01")
                        }
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1950}
                        toYear={new Date().getFullYear()}
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
                    className="flex-1"
                    disabled={!isFormValid}
                  >
                    Zapisz zawodnika
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtrowanie/Wyszukiwanie */}
      <Card className="mb-6">
        <CardHeader>
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
          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Znaleziono {filteredAthletes.length} zawodników
              </p>
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="h-4 w-4" />
                Wygeneruj raport
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela Zawodników */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Nazwisko i imię</TableHead>
              <TableHead className="font-semibold">Klub</TableHead>
              <TableHead className="font-semibold">Dyscyplina</TableHead>
              <TableHead className="font-semibold">Rok ur.</TableHead>
              <TableHead className="font-semibold">Liczba pomiarów</TableHead>
              <TableHead className="text-right font-semibold">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAthletes.map((athlete) => (
              <TableRow key={athlete.id}>
                <TableCell className="font-medium">{athlete.name}</TableCell>
                <TableCell className="text-muted-foreground">{athlete.club}</TableCell>
                <TableCell className="text-muted-foreground">{athlete.discipline}</TableCell>
                <TableCell className="text-muted-foreground">{athlete.birthYear}</TableCell>
                <TableCell className="text-muted-foreground">{athlete.sessions}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/zawodnicy/${athlete.id}`)}
                  >
                    Zobacz profil
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Athletes;
