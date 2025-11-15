import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Coach {
  name: string;
  email: string;
  phone: string;
}

interface Club {
  id: number;
  name: string;
  city: string;
  disciplines: string[];
  contactPerson?: string;
  email?: string;
  phone?: string;
  coaches?: Coach[];
  purchasedPrograms?: {
    sigmaTeamsGo?: boolean;
    sigmaTeamsSprints?: string[];
    sigmaTeamsPro?: boolean;
  };
  notes?: string;
}

const SIGMA_SPRINTS_MODULES = [
  "Moduł 1: Koncentracja",
  "Moduł 2: Kontrola emocji",
  "Moduł 3: Motywacja",
  "Moduł 4: Pewność siebie",
  "Moduł 5: Praca zespołowa",
  "Moduł 6: Zarządzanie stresem"
];

const ClubManagement = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [clubData, setClubData] = useState<Club | null>(null);
  const [coachInput, setCoachInput] = useState({
    name: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    // Pobierz dane klubu z localStorage
    const storedClubs = localStorage.getItem('clubs');
    if (storedClubs) {
      const clubs: Club[] = JSON.parse(storedClubs);
      const club = clubs.find(c => c.id === parseInt(id || '0'));
      if (club) {
        setClubData(club);
      }
    }
  }, [id]);

  const handleSave = () => {
    if (!clubData) return;

    const storedClubs = localStorage.getItem('clubs');
    if (storedClubs) {
      const clubs: Club[] = JSON.parse(storedClubs);
      const updatedClubs = clubs.map(c => c.id === clubData.id ? clubData : c);
      localStorage.setItem('clubs', JSON.stringify(updatedClubs));
      toast.success("Dane klubu zostały zapisane");
    }
  };

  const handleAddCoach = () => {
    if (!clubData || !coachInput.name.trim()) return;
    
    setClubData({
      ...clubData,
      coaches: [...(clubData.coaches || []), coachInput]
    });
    setCoachInput({ name: "", email: "", phone: "" });
  };

  const handleRemoveCoach = (index: number) => {
    if (!clubData) return;
    
    setClubData({
      ...clubData,
      coaches: clubData.coaches?.filter((_, i) => i !== index) || []
    });
  };

  const toggleProgram = (program: 'sigmaTeamsGo' | 'sigmaTeamsPro') => {
    if (!clubData) return;
    
    setClubData({
      ...clubData,
      purchasedPrograms: {
        ...clubData.purchasedPrograms,
        [program]: !clubData.purchasedPrograms?.[program]
      }
    });
  };

  const toggleSprintModule = (module: string) => {
    if (!clubData) return;
    
    const currentModules = clubData.purchasedPrograms?.sigmaTeamsSprints || [];
    const newModules = currentModules.includes(module)
      ? currentModules.filter(m => m !== module)
      : [...currentModules, module];
    
    setClubData({
      ...clubData,
      purchasedPrograms: {
        ...clubData.purchasedPrograms,
        sigmaTeamsSprints: newModules
      }
    });
  };

  if (!clubData) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/kluby/${id}`)} 
          className="mb-6 text-slate-300 hover:text-slate-100 hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót
        </Button>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{clubData.name}</h1>
            <p className="text-slate-400">Zarządzanie klubem</p>
          </div>
          <Button onClick={handleSave} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Save className="h-4 w-4" />
            Zapisz zmiany
          </Button>
        </div>

        <div className="space-y-6">
          {/* Podstawowe informacje */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Podstawowe informacje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-slate-200">Nazwa klubu</Label>
                  <Input
                    id="name"
                    value={clubData.name}
                    onChange={(e) => setClubData({ ...clubData, name: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-slate-100"
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-slate-200">Miasto</Label>
                  <Input
                    id="city"
                    value={clubData.city}
                    onChange={(e) => setClubData({ ...clubData, city: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-slate-100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dane kontaktowe */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Dane kontaktowe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contactPerson" className="text-slate-200">Osoba kontaktowa</Label>
                <Input
                  id="contactPerson"
                  value={clubData.contactPerson || ''}
                  onChange={(e) => setClubData({ ...clubData, contactPerson: e.target.value })}
                  placeholder="Jan Kowalski"
                  className="bg-slate-800 border-slate-600 text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-slate-200">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={clubData.email || ''}
                    onChange={(e) => setClubData({ ...clubData, email: e.target.value })}
                    placeholder="kontakt@klub.pl"
                    className="bg-slate-800 border-slate-600 text-slate-100"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-slate-200">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={clubData.phone || ''}
                    onChange={(e) => setClubData({ ...clubData, phone: e.target.value })}
                    placeholder="+48 123 456 789"
                    className="bg-slate-800 border-slate-600 text-slate-100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trenerzy */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Trenerzy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="coachName" className="text-slate-200">Imię i Nazwisko</Label>
                  <Input
                    id="coachName"
                    value={coachInput.name}
                    onChange={(e) => setCoachInput({ ...coachInput, name: e.target.value })}
                    placeholder="Jan Kowalski"
                    className="bg-slate-800 border-slate-600 text-slate-100 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="coachEmail" className="text-slate-200">Email</Label>
                  <Input
                    id="coachEmail"
                    type="email"
                    value={coachInput.email}
                    onChange={(e) => setCoachInput({ ...coachInput, email: e.target.value })}
                    placeholder="trener@example.com"
                    className="bg-slate-800 border-slate-600 text-slate-100 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="coachPhone" className="text-slate-200">Numer telefonu</Label>
                  <Input
                    id="coachPhone"
                    type="tel"
                    value={coachInput.phone}
                    onChange={(e) => setCoachInput({ ...coachInput, phone: e.target.value })}
                    placeholder="+48 123 456 789"
                    className="bg-slate-800 border-slate-600 text-slate-100 mt-1"
                  />
                </div>
              </div>
              <Button onClick={handleAddCoach} variant="outline" className="w-full bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700">
                Dodaj trenera
              </Button>
              <div className="space-y-2 mt-4">
                {clubData.coaches?.map((coach, index) => (
                  <div key={index} className="p-4 bg-slate-800 rounded-md">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-slate-100 font-semibold">{coach.name}</p>
                        <p className="text-slate-400 text-sm">{coach.email}</p>
                        <p className="text-slate-400 text-sm">{coach.phone}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveCoach(index)}
                        className="text-slate-400 hover:text-slate-100"
                      >
                        Usuń
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Kupione programy */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Kupione programy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sigmaTeamsGo"
                    checked={clubData.purchasedPrograms?.sigmaTeamsGo || false}
                    onCheckedChange={() => toggleProgram('sigmaTeamsGo')}
                    className="border-slate-600"
                  />
                  <label htmlFor="sigmaTeamsGo" className="text-slate-200 font-medium cursor-pointer">
                    Sigma Teams Go!
                  </label>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sigmaTeamsPro"
                      checked={clubData.purchasedPrograms?.sigmaTeamsPro || false}
                      onCheckedChange={() => toggleProgram('sigmaTeamsPro')}
                      className="border-slate-600"
                    />
                    <label htmlFor="sigmaTeamsPro" className="text-slate-200 font-medium cursor-pointer">
                      Sigma Teams Pro
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-slate-200 font-medium">Sigma Teams Sprints - Moduły:</p>
                  <div className="pl-4 space-y-2">
                    {SIGMA_SPRINTS_MODULES.map((module) => (
                      <div key={module} className="flex items-center space-x-2">
                        <Checkbox
                          id={module}
                          checked={clubData.purchasedPrograms?.sigmaTeamsSprints?.includes(module) || false}
                          onCheckedChange={() => toggleSprintModule(module)}
                          className="border-slate-600"
                        />
                        <label htmlFor={module} className="text-slate-300 cursor-pointer text-sm">
                          {module}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notatki */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Notatki</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={clubData.notes || ''}
                onChange={(e) => setClubData({ ...clubData, notes: e.target.value })}
                placeholder="Dodaj notatki dotyczące klubu, umowy, specjalnych ustaleń..."
                className="min-h-[150px] bg-slate-800 border-slate-600 text-slate-100"
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Save className="h-5 w-5" />
            Zapisz wszystkie zmiany
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClubManagement;
