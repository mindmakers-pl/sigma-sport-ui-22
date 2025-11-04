import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Plus, Lightbulb, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const ClubDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

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

  const athletes = [
    { id: 1, name: "Kowalski Jan", lastSession: "2024-01-15" },
    { id: 3, name: "Wiśniewski Piotr", lastSession: "2024-01-14" },
    { id: 6, name: "Lewandowski Adam", lastSession: "2024-01-13" },
  ];

  // Średnie dane kognitywne dla klubu
  const cognitiveData = [
    { subject: 'Wyzwanie Sigma Scan', value: 78 },
    { subject: 'Wyzwanie Sigma Control', value: 65 },
    { subject: 'Wyzwanie Sigma Focus', value: 72 },
  ];

  // Średnie dane HRV dla klubu
  const hrvData = [
    { name: 'Baseline', value: 65 },
    { name: 'Scan', value: 58 },
    { name: 'Control', value: 52 },
    { name: 'Focus', value: 55 },
    { name: 'Move', value: 60 },
  ];

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
      <Tabs defaultValue="kokpit" className="w-full">
        <TabsList>
          <TabsTrigger value="kokpit">Kokpit klubu</TabsTrigger>
          <TabsTrigger value="zawodnicy">Lista zawodników ({club.membersCount})</TabsTrigger>
        </TabsList>

        {/* Zakładka: Kokpit Klubu */}
        <TabsContent value="kokpit" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Kafelek 1: Średni Profil Kognitywny */}
            <Card>
              <CardHeader>
                <CardTitle>Średni profil kognitywny (klub)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={cognitiveData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <Radar name="Wynik" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Agregowane wyniki wszystkich zawodników z klubu
                </p>
              </CardContent>
            </Card>

            {/* Kafelek 2: Reaktywność Fizjologiczna */}
            <Card>
              <CardHeader>
                <CardTitle>Reaktywność fizjologiczna (średnia klubu)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hrvData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="hsl(var(--accent))" name="HRV (ms)" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Średnia zmienność rytmu serca (HRV) w różnych fazach pomiaru
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Kafelek 3: Poziom Wytrenowania */}
          <Card>
            <CardHeader>
              <CardTitle>Poziom wytrenowania (biofeedback)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">Średnia poprawa HRV w sesji treningowej</p>
                  <p className="text-3xl font-bold text-primary">+18 ms</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">Najczęściej używana technika</p>
                  <p className="text-xl font-semibold">Oddech rezonansowy</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Dane pokazują mierzalne efekty fizjologiczne treningu mentalnego
              </p>
            </CardContent>
          </Card>

          {/* Kafelek 4: Spostrzeżenia dla Trenera - FAZA 2 AI */}
          <Card className="border-2 border-accent/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-accent" />
                </div>
                <CardTitle>Spostrzeżenia dla trenera</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground italic">
                Zawodnicy w Twoim klubie wykazują ponadprzeciętną szybkość (wyzwanie Sigma Scan), ale ich wyniki w wyzwaniu Sigma Focus są o 15% niższe od średniej. Sugerujemy skupienie się na treningu kontroli poznawczej.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                * Funkcja AI będzie dostępna w przyszłości
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Zakładka: Lista Zawodników */}
        <TabsContent value="zawodnicy">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Zawodnicy klubu {club.name}</CardTitle>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Dodaj zawodnika
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Nazwisko i imię</TableHead>
                    <TableHead className="font-semibold">Data ostatniej sesji</TableHead>
                    <TableHead className="text-right font-semibold">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {athletes.map((athlete) => (
                    <TableRow key={athlete.id}>
                      <TableCell className="font-medium">{athlete.name}</TableCell>
                      <TableCell className="text-muted-foreground">{athlete.lastSession}</TableCell>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClubDetail;
