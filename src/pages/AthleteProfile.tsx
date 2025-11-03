import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import ScanGame from "./ScanGame";
import ControlGame from "./ControlGame";
import FocusGame from "./FocusGame";

const AthleteProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "informacje";
  
  const [sessionA, setSessionA] = useState("baseline-m1");
  const [sessionB, setSessionB] = useState("ewaluacja-m7");
  
  const [currentView, setCurrentView] = useState('kokpit');
  
  const [taskStatus, setTaskStatus] = useState({
    kwestionariusz: 'pending',
    hrv_baseline: 'pending',
    scan: 'pending',
    control: 'pending',
    focus: 'pending',
    hrv_challenge: 'pending',
    hrv_training: 'pending'
  });
  
  const [manualInputMode, setManualInputMode] = useState({
    kwestionariusz: false,
    hrv_baseline: false,
    hrv_challenge: false,
    hrv_training: false
  });
  
  const [inputValues, setInputValues] = useState({
    kwestionariusz: '',
    hrv_baseline: '',
    hrv_challenge: '',
    hrv_training: ''
  });

  const handleTaskComplete = (taskName: string, result: any) => {
    // Krok 1: Zaktualizuj status (żeby 'odhaczyć' kafelek)
    setTaskStatus(prev => ({ ...prev, [taskName]: 'completed' }));

    // Krok 2: Zapisz wynik (na razie do konsoli)
    console.log(`Wynik z ${taskName}:`, result);

    // Krok 3: Wróć do widoku kokpitu
    setCurrentView('kokpit');
  };

  // Mock data - w przyszłości z API/bazy danych
  const athleteData: Record<string, { name: string; club: string }> = {
    "1": { name: "Jan Kowalski", club: "KS Górnik" },
    "2": { name: "Anna Nowak", club: "MKS Cracovia" },
    "3": { name: "Piotr Wiśniewski", club: "KS Górnik" },
    "4": { name: "Maria Kowalczyk", club: "Wisła Kraków" },
    "5": { name: "Tomasz Zieliński", club: "Legia Warszawa" },
  };

  const athlete = athleteData[id || "1"] || { name: "Nieznany zawodnik", club: "Brak danych" };

  // Mock data dla wykresów
  const cognitiveData = [
    { subject: "Scan", A: 85, B: 92 },
    { subject: "Control", A: 78, B: 88 },
    { subject: "Focus", A: 90, B: 95 },
  ];

  const psychometricData = [
    { name: "Pewność Siebie", A: 7.5, B: 8.2 },
    { name: "Kontrola Emocji", A: 6.8, B: 7.9 },
  ];

  const hrvData = [
    { time: 0, A: 65, B: 68 },
    { time: 2, A: 62, B: 66 },
    { time: 4, A: 58, B: 63 },
    { time: 6, A: 52, B: 59 },
    { time: 8, A: 48, B: 56 },
    { time: 10, A: 45, B: 54 },
  ];

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
            <Card className="border-slate-200 bg-white hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Kwestionariusz</h3>
                {taskStatus.kwestionariusz === 'completed' ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Ukończono</span>
                  </div>
                ) : manualInputMode.kwestionariusz ? (
                  <div className="space-y-3">
                    <div className="text-left">
                      <Label htmlFor="kwestionariusz-input" className="text-sm text-slate-700">
                        Wprowadź wynik
                      </Label>
                      <Input
                        id="kwestionariusz-input"
                        type="text"
                        value={inputValues.kwestionariusz}
                        onChange={(e) => setInputValues(prev => ({ ...prev, kwestionariusz: e.target.value }))}
                        className="mt-1"
                        placeholder="Wpisz wynik"
                      />
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setTaskStatus(prev => ({ ...prev, kwestionariusz: 'completed' }));
                        setManualInputMode(prev => ({ ...prev, kwestionariusz: false }));
                      }}
                    >
                      Zapisz
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setCurrentView('showing_questionnaire')}
                  >
                    Rozpocznij
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">HRV Baseline</h3>
                {taskStatus.hrv_baseline === 'completed' ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Ukończono</span>
                  </div>
                ) : manualInputMode.hrv_baseline ? (
                  <div className="space-y-3">
                    <div className="text-left">
                      <Label htmlFor="hrv-baseline-input" className="text-sm text-slate-700">
                        Wprowadź wynik (ms)
                      </Label>
                      <Input
                        id="hrv-baseline-input"
                        type="text"
                        value={inputValues.hrv_baseline}
                        onChange={(e) => setInputValues(prev => ({ ...prev, hrv_baseline: e.target.value }))}
                        className="mt-1"
                        placeholder="Wpisz wynik w ms"
                      />
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setTaskStatus(prev => ({ ...prev, hrv_baseline: 'completed' }));
                        setManualInputMode(prev => ({ ...prev, hrv_baseline: false }));
                      }}
                    >
                      Zapisz
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setManualInputMode(prev => ({ ...prev, hrv_baseline: true }))}
                  >
                    Rozpocznij
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Sigma Scan</h3>
                {taskStatus.scan === 'pending' ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setCurrentView('playing_scan')}
                  >
                    Rozpocznij
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Ukończono</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Sigma Control</h3>
                {taskStatus.control === 'pending' ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setCurrentView('playing_control')}
                  >
                    Rozpocznij
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Ukończono</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Sigma Focus</h3>
                {taskStatus.focus === 'pending' ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setCurrentView('playing_focus')}
                  >
                    Rozpocznij
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Ukończono</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">HRV Challenge</h3>
                {taskStatus.hrv_challenge === 'completed' ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Ukończono</span>
                  </div>
                ) : manualInputMode.hrv_challenge ? (
                  <div className="space-y-3">
                    <div className="text-left">
                      <Label htmlFor="hrv-challenge-input" className="text-sm text-slate-700">
                        Wprowadź wynik (ms)
                      </Label>
                      <Input
                        id="hrv-challenge-input"
                        type="text"
                        value={inputValues.hrv_challenge}
                        onChange={(e) => setInputValues(prev => ({ ...prev, hrv_challenge: e.target.value }))}
                        className="mt-1"
                        placeholder="Wpisz wynik w ms"
                      />
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setTaskStatus(prev => ({ ...prev, hrv_challenge: 'completed' }));
                        setManualInputMode(prev => ({ ...prev, hrv_challenge: false }));
                      }}
                    >
                      Zapisz
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setManualInputMode(prev => ({ ...prev, hrv_challenge: true }))}
                  >
                    Rozpocznij
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">HRV Training</h3>
                {taskStatus.hrv_training === 'completed' ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Ukończono</span>
                  </div>
                ) : manualInputMode.hrv_training ? (
                  <div className="space-y-3">
                    <div className="text-left">
                      <Label htmlFor="hrv-training-input" className="text-sm text-slate-700">
                        Wprowadź wynik (ms)
                      </Label>
                      <Input
                        id="hrv-training-input"
                        type="text"
                        value={inputValues.hrv_training}
                        onChange={(e) => setInputValues(prev => ({ ...prev, hrv_training: e.target.value }))}
                        className="mt-1"
                        placeholder="Wpisz wynik w ms"
                      />
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setTaskStatus(prev => ({ ...prev, hrv_training: 'completed' }));
                        setManualInputMode(prev => ({ ...prev, hrv_training: false }));
                      }}
                    >
                      Zapisz
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setManualInputMode(prev => ({ ...prev, hrv_training: true }))}
                  >
                    Rozpocznij
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button 
              variant="default" 
              size="lg"
              className="px-12"
            >
              Zakończ i Zapisz Sesję
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="raporty" className="mt-6">
          <div className="space-y-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 mb-2 block">Sesja A:</label>
                <Select value={sessionA} onValueChange={setSessionA}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Wybierz sesję A" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="baseline-m1">Baseline M1</SelectItem>
                    <SelectItem value="baseline-m2">Baseline M2</SelectItem>
                    <SelectItem value="mid-m4">Mid-season M4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 mb-2 block">Sesja B:</label>
                <Select value={sessionB} onValueChange={setSessionB}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Wybierz sesję B" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="mid-m4">Mid-season M4</SelectItem>
                    <SelectItem value="ewaluacja-m7">Ewaluacja M7</SelectItem>
                    <SelectItem value="final-m12">Final M12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-slate-900">Profil Kognitywny</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={cognitiveData}>
                      <PolarGrid stroke="#cbd5e1" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b' }} />
                      <Radar name="Sesja A" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                      <Radar name="Sesja B" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-slate-900">Profil Psychometryczny</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={psychometricData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis domain={[0, 10]} tick={{ fill: '#64748b' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #cbd5e1' }}
                        labelStyle={{ color: '#334155' }}
                      />
                      <Legend />
                      <Bar dataKey="A" fill="#3b82f6" name="Sesja A" />
                      <Bar dataKey="B" fill="#10b981" name="Sesja B" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-slate-900">Postęp Motoryczny</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <p className="text-slate-600 text-lg mb-4">Sigma Agility</p>
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-4xl font-bold text-slate-400">12.5s</span>
                      <span className="text-3xl text-slate-400">→</span>
                      <span className="text-4xl font-bold text-green-500">11.9s</span>
                    </div>
                    <p className="text-green-600 font-semibold mt-4 text-xl">-0.6s (-4.8%)</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-slate-900">Profil Fizjologiczny</CardTitle>
                  <p className="text-sm text-slate-600">Reaktywność HRV na Stres</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={hrvData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="time" 
                        label={{ value: 'Czas (min)', position: 'insideBottom', offset: -5, fill: '#64748b' }}
                        tick={{ fill: '#64748b' }}
                      />
                      <YAxis 
                        label={{ value: 'HRV', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                        tick={{ fill: '#64748b' }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #cbd5e1' }}
                        labelStyle={{ color: '#334155' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="A" stroke="#3b82f6" strokeWidth={2} name="Sesja A" />
                      <Line type="monotone" dataKey="B" stroke="#10b981" strokeWidth={2} name="Sesja B" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Pełnoekranowy Dialog dla gier */}
      <Dialog open={currentView !== 'kokpit'} onOpenChange={(open) => {
        if (!open) setCurrentView('kokpit');
      }}>
        <DialogContent className="w-screen h-screen max-w-none p-0 border-0 bg-slate-900">
          {currentView === 'showing_questionnaire' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center py-12 bg-slate-800 p-8 rounded-lg">
                <h2 className="text-2xl font-bold text-white mb-4">Kwestionariusz</h2>
                <p className="text-slate-300 mb-8">Komponent kwestionariusza będzie tutaj...</p>
                <Button onClick={() => handleTaskComplete('kwestionariusz', { score: 85 })}>
                  Zakończ kwestionariusz
                </Button>
              </div>
            </div>
          )}

          {currentView === 'playing_scan' && (
            <ScanGame onComplete={handleTaskComplete} />
          )}

          {currentView === 'playing_control' && (
            <ControlGame onComplete={handleTaskComplete} />
          )}

          {currentView === 'playing_focus' && (
            <FocusGame onComplete={handleTaskComplete} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AthleteProfile;
