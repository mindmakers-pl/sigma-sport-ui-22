import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Building2, BookOpen, UserPlus, Shield, Database, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState<any[]>([]);
  const [allAthletes, setAllAthletes] = useState<any[]>([]);
  const [allClubs, setAllClubs] = useState<any[]>([]);
  const [isAddTrainerOpen, setIsAddTrainerOpen] = useState(false);
  const [newTrainer, setNewTrainer] = useState({ email: "", name: "", phone: "" });

  useEffect(() => {
    // Ustaw rolę na admina gdy wchodzimy do panelu
    localStorage.setItem("userRole", "admin");
    window.dispatchEvent(new Event('storage'));
    
    // Załaduj trenerów
    const storedTrainers = localStorage.getItem('trainers');
    if (storedTrainers) {
      setTrainers(JSON.parse(storedTrainers));
    } else {
      // Inicjalizuj z kontem iwan.nylypiuk@mindmakers.pl
      const initialTrainers = [{
        id: "trainer-1",
        email: "iwan.nylypiuk@mindmakers.pl",
        name: "Iwan Nylypiuk",
        phone: "",
        role: "trainer",
        createdAt: new Date().toISOString()
      }];
      localStorage.setItem('trainers', JSON.stringify(initialTrainers));
      setTrainers(initialTrainers);
    }

    // Załaduj wszystkich zawodników ze wszystkich kont trenerów
    const athletes = localStorage.getItem('athletes');
    if (athletes) {
      setAllAthletes(JSON.parse(athletes));
    }

    // Załaduj wszystkie kluby
    const clubs = localStorage.getItem('clubs');
    if (clubs) {
      setAllClubs(JSON.parse(clubs));
    }
  }, []);

  const handleAddTrainer = () => {
    if (!newTrainer.email || !newTrainer.name) {
      toast.error("Wypełnij wymagane pola");
      return;
    }

    // Sprawdź czy trener już istnieje
    if (trainers.some(t => t.email === newTrainer.email)) {
      toast.error("Trener o tym adresie email już istnieje");
      return;
    }

    const trainer = {
      id: `trainer-${Date.now()}`,
      ...newTrainer,
      role: "trainer",
      createdAt: new Date().toISOString()
    };

    const updatedTrainers = [...trainers, trainer];
    setTrainers(updatedTrainers);
    localStorage.setItem('trainers', JSON.stringify(updatedTrainers));
    
    toast.success("Trener został dodany");
    setIsAddTrainerOpen(false);
    setNewTrainer({ email: "", name: "", phone: "" });
  };

  const stats = [
    {
      title: "Trenerzy",
      value: trainers.length.toString(),
      icon: UserPlus,
      color: "text-primary",
      onClick: () => {}
    },
    {
      title: "Wszyscy zawodnicy",
      value: allAthletes.length.toString(),
      icon: Users,
      color: "text-emerald-600",
      onClick: () => navigate('/zawodnicy')
    },
    {
      title: "Wszystkie kluby",
      value: allClubs.length.toString(),
      icon: Building2,
      color: "text-accent",
      onClick: () => navigate('/kluby')
    },
    {
      title: "Ćwiczenia w bibliotece",
      value: "0",
      icon: BookOpen,
      color: "text-violet-600",
      onClick: () => navigate('/biblioteka')
    },
  ];

  return (
    <div>
      <BackButton />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Panel Administratora</h1>
          <p className="text-muted-foreground">Zarządzaj użytkownikami, danymi i ustawieniami systemu</p>
        </div>
        <Dialog open={isAddTrainerOpen} onOpenChange={setIsAddTrainerOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Dodaj trenera
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj nowego trenera</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="trainer-name">Imię i nazwisko *</Label>
                <Input
                  id="trainer-name"
                  value={newTrainer.name}
                  onChange={(e) => setNewTrainer({ ...newTrainer, name: e.target.value })}
                  placeholder="np. Jan Kowalski"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainer-email">Email *</Label>
                <Input
                  id="trainer-email"
                  type="email"
                  value={newTrainer.email}
                  onChange={(e) => setNewTrainer({ ...newTrainer, email: e.target.value })}
                  placeholder="np. jan.kowalski@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainer-phone">Telefon</Label>
                <Input
                  id="trainer-phone"
                  value={newTrainer.phone}
                  onChange={(e) => setNewTrainer({ ...newTrainer, phone: e.target.value })}
                  placeholder="np. +48 123 456 789"
                />
              </div>
              <Button onClick={handleAddTrainer} className="w-full">
                Dodaj trenera
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statystyki */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, i) => (
          <Card key={i} className="cursor-pointer hover:shadow-lg transition-all" onClick={stat.onClick}>
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
        {/* Lista trenerów */}
        <Card>
          <CardHeader>
            <CardTitle>Trenerzy w systemie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trainers.length > 0 ? (
                trainers.map((trainer) => (
                  <div key={trainer.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{trainer.name}</p>
                      <p className="text-sm text-muted-foreground">{trainer.email}</p>
                    </div>
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Brak trenerów</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Funkcje administracyjne */}
        <Card>
          <CardHeader>
            <CardTitle>Funkcje administracyjne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/zawodnicy')}>
                <Users className="mr-2 h-4 w-4" />
                Zarządzaj zawodnikami
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/kluby')}>
                <Building2 className="mr-2 h-4 w-4" />
                Zarządzaj klubami
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/biblioteka')}>
                <BookOpen className="mr-2 h-4 w-4" />
                Biblioteka ćwiczeń
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Database className="mr-2 h-4 w-4" />
                Eksport danych
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/ustawienia')}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Ustawienia systemu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
