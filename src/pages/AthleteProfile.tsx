import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const AthleteProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "informacje";

  // Mock data - w przyszłości z API/bazy danych
  const athleteData: Record<string, { name: string; club: string }> = {
    "1": { name: "Jan Kowalski", club: "KS Górnik" },
    "2": { name: "Anna Nowak", club: "MKS Cracovia" },
    "3": { name: "Piotr Wiśniewski", club: "KS Górnik" },
    "4": { name: "Maria Kowalczyk", club: "Wisła Kraków" },
    "5": { name: "Tomasz Zieliński", club: "Legia Warszawa" },
  };

  const athlete = athleteData[id || "1"];

  return (
    <div>
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => navigate("/zawodnicy")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Powrót do listy
      </Button>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">{athlete.name}</h2>
        <p className="text-slate-600">{athlete.club}</p>
      </div>

      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="informacje">Informacje o zawodniku</TabsTrigger>
          <TabsTrigger value="dodaj-pomiar">Dodaj pomiar</TabsTrigger>
          <TabsTrigger value="raporty">Raporty</TabsTrigger>
        </TabsList>

        <TabsContent value="informacje" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-slate-900">Parametry fizyczne</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Wzrost</span>
                    <span className="font-semibold text-slate-900">180 cm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Waga</span>
                    <span className="font-semibold text-slate-900">75 kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">BMI</span>
                    <span className="font-semibold text-slate-900">23.1</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-slate-900">Wydolność</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">VO2 Max</span>
                    <span className="font-semibold text-slate-900">52 ml/kg/min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Spoczynkowe tętno</span>
                    <span className="font-semibold text-slate-900">58 bpm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Maksymalne tętno</span>
                    <span className="font-semibold text-slate-900">192 bpm</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-slate-900">Siła</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Przysiady</span>
                    <span className="font-semibold text-slate-900">120 kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Wyciskanie</span>
                    <span className="font-semibold text-slate-900">85 kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Martwy ciąg</span>
                    <span className="font-semibold text-slate-900">140 kg</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-slate-900">Ostatni pomiar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">15 stycznia 2024</p>
                <Button variant="outline" className="w-full">
                  Dodaj nowy pomiar
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dodaj-pomiar" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-slate-200 bg-white hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6 text-center space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Kwestionariusz</h3>
                <Button variant="outline" className="w-full">
                  Rozpocznij
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6 text-center space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">HRV Baseline</h3>
                <Button variant="outline" className="w-full">
                  Rozpocznij
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="border-slate-200 bg-white hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/scan/${id}`)}
            >
              <CardContent className="pt-6 text-center space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Sigma Scan</h3>
                <Button variant="outline" className="w-full">
                  Rozpocznij
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="border-slate-200 bg-white hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/control/${id}`)}
            >
              <CardContent className="pt-6 text-center space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Sigma Control</h3>
                <Button variant="outline" className="w-full">
                  Rozpocznij
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6 text-center space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Sigma Focus</h3>
                <Button variant="outline" className="w-full">
                  Rozpocznij
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6 text-center space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">HRV Challenge</h3>
                <Button variant="outline" className="w-full">
                  Rozpocznij
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6 text-center space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">HRV Training</h3>
                <Button variant="outline" className="w-full">
                  Rozpocznij
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="raporty" className="mt-6">
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-slate-900">Raporty treningowe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-900">Raport miesięczny - Styczeń 2024</h4>
                    <span className="text-sm text-slate-600">31.01.2024</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Podsumowanie treningów i postępów za miesiąc styczeń
                  </p>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-900">Raport miesięczny - Grudzień 2023</h4>
                    <span className="text-sm text-slate-600">31.12.2023</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Podsumowanie treningów i postępów za miesiąc grudzień
                  </p>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-900">Analiza wyników testów</h4>
                    <span className="text-sm text-slate-600">15.12.2023</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Szczegółowa analiza wyników testów sprawnościowych
                  </p>
                </div>

                <Button variant="outline" className="w-full">
                  Generuj nowy raport
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AthleteProfile;
