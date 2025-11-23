import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Building, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import DisciplineSelectorMultiple from "@/components/DisciplineSelectorMultiple";
import BackButton from "@/components/BackButton";
import { useClubs } from "@/hooks/useClubs";
import { useAthletes } from "@/hooks/useAthletes";
import { toast } from "sonner";

const Clubs = () => {
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newClub, setNewClub] = useState({
    name: "",
    city: "",
    disciplines: [] as string[],
  });
  
  const { clubs, loading: clubsLoading, addClub } = useClubs();
  const { athletes } = useAthletes();

  const getClubMemberCount = (clubId: string) => {
    return athletes.filter(athlete => athlete.club_id === clubId).length;
  };

  const handleAddClub = async () => {
    if (!newClub.name || !newClub.city) {
      toast.error("Wypełnij wszystkie wymagane pola");
      return;
    }
    
    const { error } = await addClub({
      name: newClub.name,
      city: newClub.city,
      disciplines: newClub.disciplines,
      coaches: [],
      members_count: 0
    });

    if (error) {
      toast.error("Błąd podczas dodawania klubu");
      return;
    }

    toast.success("Klub został dodany");
    setIsAddDialogOpen(false);
    setNewClub({ name: "", city: "", disciplines: [] });
  };

  if (clubsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <BackButton />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Kluby</h1>
          <p className="text-muted-foreground">Zarządzaj klubami sportowymi</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Dodaj klub
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Dodaj nowy klub</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="clubName">Nazwa klubu</Label>
                <Input
                  id="clubName"
                  value={newClub.name}
                  onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                  placeholder="KS Górnik"
                />
              </div>
              <div>
                <Label htmlFor="city">Miasto</Label>
                <Input
                  id="city"
                  value={newClub.city}
                  onChange={(e) => setNewClub({ ...newClub, city: e.target.value })}
                  placeholder="Zabrze"
                />
              </div>
              <DisciplineSelectorMultiple
                value={newClub.disciplines}
                onChange={(disciplines) => setNewClub({ ...newClub, disciplines })}
              />
              <Button onClick={handleAddClub} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Dodaj klub
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {clubs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Brak klubów</h3>
            <p className="text-muted-foreground">Dodaj pierwszy klub, aby rozpocząć</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <Card key={club.id} className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{club.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-muted-foreground">
                    Miasto: <span className="font-medium text-foreground">{club.city || 'N/A'}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Zawodnicy: <span className="font-medium text-foreground">{getClubMemberCount(club.id)}</span>
                  </p>
                  {club.disciplines && club.disciplines.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {club.disciplines.map(disc => (
                        <Badge key={disc} variant="outline" className="text-xs">
                          {disc}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/kluby/${club.id}`)}
                >
                  Zobacz szczegóły
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Clubs;
