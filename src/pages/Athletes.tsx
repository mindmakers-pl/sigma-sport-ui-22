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
import { useState } from "react";
import { Plus, Search, FileText } from "lucide-react";
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
    club: "",
    discipline: "",
    birthYear: "",
  });

  const athletes = [
    { id: 1, name: "Kowalski Jan", club: "KS Górnik", discipline: "Piłka nożna", birthYear: 2005, sessions: 12 },
    { id: 2, name: "Nowak Anna", club: "MKS Cracovia", discipline: "Koszykówka", birthYear: 2004, sessions: 8 },
    { id: 3, name: "Wiśniewski Piotr", club: "KS Górnik", discipline: "Piłka nożna", birthYear: 2006, sessions: 15 },
    { id: 4, name: "Kowalczyk Maria", club: "Wisła Kraków", discipline: "Siatkówka", birthYear: 2005, sessions: 10 },
    { id: 5, name: "Zieliński Tomasz", club: "Legia Warszawa", discipline: "Piłka nożna", birthYear: 2003, sessions: 20 },
  ];

  const clubs = ["KS Górnik", "MKS Cracovia", "Wisła Kraków", "Legia Warszawa"];
  const disciplines = ["Piłka nożna", "Koszykówka", "Siatkówka"];

  const filteredAthletes = athletes.filter(athlete => {
    const matchesSearch = athlete.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClub = filterClub === "all" || athlete.club === filterClub;
    const matchesDiscipline = filterDiscipline === "all" || athlete.discipline === filterDiscipline;
    return matchesSearch && matchesClub && matchesDiscipline;
  });

  const hasActiveFilters = filterClub !== "all" || filterDiscipline !== "all";

  const handleAddAthlete = () => {
    console.log("Dodawanie zawodnika:", newAthlete);
    setIsAddDialogOpen(false);
    setNewAthlete({
      firstName: "",
      lastName: "",
      club: "",
      discipline: "",
      birthYear: "",
    });
  };

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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Dodaj nowego zawodnika</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="firstName">Imię</Label>
                <Input
                  id="firstName"
                  value={newAthlete.firstName}
                  onChange={(e) => setNewAthlete({ ...newAthlete, firstName: e.target.value })}
                  placeholder="Jan"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nazwisko</Label>
                <Input
                  id="lastName"
                  value={newAthlete.lastName}
                  onChange={(e) => setNewAthlete({ ...newAthlete, lastName: e.target.value })}
                  placeholder="Kowalski"
                />
              </div>
              <div>
                <Label htmlFor="club">Klub</Label>
                <Select value={newAthlete.club} onValueChange={(value) => setNewAthlete({ ...newAthlete, club: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz klub" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.map(club => (
                      <SelectItem key={club} value={club}>{club}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discipline">Dyscyplina</Label>
                <Select value={newAthlete.discipline} onValueChange={(value) => setNewAthlete({ ...newAthlete, discipline: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz dyscyplinę" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplines.map(disc => (
                      <SelectItem key={disc} value={disc}>{disc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="birthYear">Rok urodzenia</Label>
                <Input
                  id="birthYear"
                  type="number"
                  value={newAthlete.birthYear}
                  onChange={(e) => setNewAthlete({ ...newAthlete, birthYear: e.target.value })}
                  placeholder="2005"
                />
              </div>
              <Button onClick={handleAddAthlete} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Dodaj zawodnika
              </Button>
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
