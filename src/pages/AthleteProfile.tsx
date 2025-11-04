import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CheckCircle2, Lightbulb } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import { Progress } from "@/components/ui/progress";
import ScanGame from "./ScanGame";
import ControlGame from "./ControlGame";
import FocusGame from "./FocusGame";
import Kwestionariusz from "@/components/forms/Kwestionariusz";
import HRVBaselineForm from "@/components/forms/HRVBaselineForm";
import SigmaMoveForm from "@/components/forms/SigmaMoveForm";
import HRVTrainingForm from "@/components/forms/HRVTrainingForm";
import { loadMockSessionsToStorage } from "@/utils/mockSessionData";

const AthleteProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "informacje";
  
  const [sessionA, setSessionA] = useState("baseline-m1");
  const [sessionB, setSessionB] = useState("ewaluacja-m7");
  
  const [currentView, setCurrentView] = useState('kokpit');
  const [measurementConditions, setMeasurementConditions] = useState('trening');
  const [selectedChallengeType, setSelectedChallengeType] = useState('');
  
  const [taskStatus, setTaskStatus] = useState({
    kwestionariusz: 'pending',
    hrv_baseline: 'pending',
    scan: 'pending',
    control: 'pending',
    focus: 'pending',
    sigma_move: 'pending',
    hrv_training: 'pending'
  });

  const [sessionResults, setSessionResults] = useState<Record<string, any>>({});
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [reportTab, setReportTab] = useState('historia');
  const [conditionsFilter, setConditionsFilter] = useState('wszystkie');
  const [benchmarkGroup, setBenchmarkGroup] = useState('wszyscy');
  const [benchmarkDiscipline, setBenchmarkDiscipline] = useState('judo');
  const [benchmarkAge, setBenchmarkAge] = useState('14-16');
  
  const [manualInputMode, setManualInputMode] = useState({
    kwestionariusz: false,
    hrv_baseline: false,
    sigma_move: false,
    hrv_training: false
  });
  
  const [inputValues, setInputValues] = useState({
    kwestionariusz: '',
    hrv_baseline: '',
    sigma_move: '',
    hrv_training: ''
  });

  // Pobierz dane zawodnika z localStorage lub użyj mock data
  const getAthleteData = () => {
    const storedAthletes = localStorage.getItem('athletes');
    if (storedAthletes) {
      const athletes = JSON.parse(storedAthletes);
      const athlete = athletes.find((a: any) => a.id === parseInt(id || "1"));
      if (athlete) {
        return {
          name: athlete.name,
          club: athlete.club,
          discipline: athlete.discipline,
          email: athlete.email,
          phone: athlete.phone,
          birthYear: athlete.birthYear,
          notes: athlete.notes,
        };
      }
    }
    
    // Fallback do mock data
    const athleteData: Record<string, any> = {
      "1": { name: "Kowalski Jan", club: "KS Górnik", discipline: "Piłka nożna", birthYear: 2005, email: "jan.kowalski@example.com", phone: "+48 123 456 789", notes: "" },
      "2": { name: "Nowak Anna", club: "MKS Cracovia", discipline: "Koszykówka", birthYear: 2004, email: "anna.nowak@example.com", phone: "+48 234 567 890", notes: "" },
      "3": { name: "Wiśniewski Piotr", club: "KS Górnik", discipline: "Piłka nożna", birthYear: 2006, email: "piotr.wisniewski@example.com", phone: "+48 345 678 901", notes: "" },
      "4": { name: "Kowalczyk Maria", club: "Wisła Kraków", discipline: "Siatkówka", birthYear: 2005, email: "maria.kowalczyk@example.com", phone: "+48 456 789 012", notes: "" },
      "5": { name: "Zieliński Tomasz", club: "Legia Warszawa", discipline: "Piłka nożna", birthYear: 2003, email: "tomasz.zielinski@example.com", phone: "+48 567 890 123", notes: "" },
    };
    return athleteData[id || "1"] || { name: "Nieznany zawodnik", club: "Brak danych", discipline: "", email: "", phone: "", birthYear: 0, notes: "" };
  };

  const athlete = getAthleteData();

  // Load sessions on mount
  useEffect(() => {
    if (id) {
      const athleteName = athlete.name || 'Unknown';
      const sessions = loadMockSessionsToStorage(id, athleteName);
      const allSessions = JSON.parse(localStorage.getItem('athlete_sessions') || '[]');
      setSavedSessions(allSessions.filter((s: any) => s.athlete_id === id));
    }
  }, [id, athlete.name]);

  const handleTaskComplete = (data: any) => {
    const taskName = currentView.replace('showing_', '').replace('playing_', '').replace('measuring_', '');
    setTaskStatus(prev => ({ ...prev, [taskName]: 'completed' }));
    setSessionResults(prev => ({ ...prev, [taskName]: data }));
    console.log(`Wynik z ${taskName}:`, data);
    setCurrentView('kokpit');
  };

  const handleSaveSession = () => {
    const sessionData = {
      id: `session_${Date.now()}`,
      athlete_id: id,
      athlete_name: athlete?.name || 'Unknown',
      date: new Date().toISOString(),
      conditions: measurementConditions,
      results: sessionResults,
      taskStatus: taskStatus
    };

    // Save to localStorage
    const existingSessions = JSON.parse(localStorage.getItem('athlete_sessions') || '[]');
    const updatedSessions = [...existingSessions, sessionData];
    localStorage.setItem('athlete_sessions', JSON.stringify(updatedSessions));

    // Update local state
    setSavedSessions(updatedSessions.filter((s: any) => s.athlete_id === id));

    // Navigate to reports
    setSearchParams({ tab: 'raporty' });
    
    // Reset session
    setSessionResults({});
    setTaskStatus({
      kwestionariusz: 'pending',
      hrv_baseline: 'pending',
      scan: 'pending',
      control: 'pending',
      focus: 'pending',
      sigma_move: 'pending',
      hrv_training: 'pending',
    });
    setSelectedChallengeType('');
  };

  // Mock data for charts
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

  // Mock data for progress trends
  const scanTrendData = [
    { session: 'S1', value: 520 },
    { session: 'S2', value: 510 },
    { session: 'S3', value: 495 },
    { session: 'S4', value: 480 },
    { session: 'S5', value: 465 },
    { session: 'S6', value: 450 },
  ];

  const controlTrendData = [
    { session: 'S1', value: 12 },
    { session: 'S2', value: 10 },
    { session: 'S3', value: 9 },
    { session: 'S4', value: 7 },
    { session: 'S5', value: 6 },
    { session: 'S6', value: 5 },
  ];

  const focusTrendData = [
    { session: 'S1', value: 85 },
    { session: 'S2', value: 78 },
    { session: 'S3', value: 75 },
    { session: 'S4', value: 70 },
    { session: 'S5', value: 68 },
    { session: 'S6', value: 65 },
  ];

  const hrvBaselineTrendData = [
    { session: 'S1', value: 58 },
    { session: 'S2', value: 60 },
    { session: 'S3', value: 63 },
    { session: 'S4', value: 65 },
    { session: 'S5', value: 68 },
    { session: 'S6', value: 70 },
  ];

  return (
    <div>
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => navigate("/zawodnicy")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Powrót
      </Button>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">{athlete.name}</h2>
        <p className="text-slate-600">{athlete.club}</p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setSearchParams({ tab: value })} className="w-full">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="informacje">Informacje o zawodniku</TabsTrigger>
          <TabsTrigger value="dodaj-pomiar">Dodaj pomiar</TabsTrigger>
          <TabsTrigger value="raporty">Raporty</TabsTrigger>
        </TabsList>

        <TabsContent value="informacje" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-slate-900">Podstawowe informacje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Imię i nazwisko</span>
                    <span className="font-semibold text-slate-900">{athlete.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Klub</span>
                    <span className="font-semibold text-slate-900">{athlete.club}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Dyscyplina</span>
                    <span className="font-semibold text-slate-900">{athlete.discipline || "Nie podano"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Rok urodzenia</span>
                    <span className="font-semibold text-slate-900">{athlete.birthYear || "Nie podano"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-slate-900">Kontakt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Email</span>
                    <span className="font-semibold text-slate-900">{athlete.email || "Nie podano"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Telefon</span>
                    <span className="font-semibold text-slate-900">{athlete.phone || "Nie podano"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white md:col-span-2">
              <CardHeader>
                <CardTitle className="text-slate-900">Historia i notatki</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">{athlete.notes || "Brak notatek"}</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white md:col-span-2">
              <CardHeader>
                <CardTitle className="text-slate-900">Ostatni pomiar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">15 stycznia 2024</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSearchParams({ tab: 'dodaj-pomiar' })}
                >
                  Dodaj nowy pomiar
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dodaj-pomiar" className="mt-6">
          {/* Nagłówek Sesji */}
          <Card className="mb-6 border-slate-200 bg-white">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold text-slate-900">
                  Warunki Pomiaru
                </Label>
                <RadioGroup 
                  value={measurementConditions} 
                  onValueChange={setMeasurementConditions}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pracownia" id="pracownia" />
                    <Label htmlFor="pracownia" className="cursor-pointer text-slate-700">
                      Pracownia (Cisza)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="trening" id="trening" />
                    <Label htmlFor="trening" className="cursor-pointer text-slate-700">
                      Trening (Dystraktory)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-slate-200 bg-white hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Kwestionariusz</h3>
                {taskStatus.kwestionariusz === 'completed' ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Ukończono</span>
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
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setCurrentView('measuring_baseline')}
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
                <h3 className="text-xl font-semibold text-slate-900">Sigma Move</h3>
                {taskStatus.sigma_move === 'completed' ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Ukończono</span>
                  </div>
                ) : (
                  <>
                    <div className="text-left">
                      <Label className="text-sm text-slate-700 mb-2 block">
                        Wybierz typ wyzwania
                      </Label>
                      <Select value={selectedChallengeType} onValueChange={setSelectedChallengeType}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Wybierz typ wyzwania" />
                        </SelectTrigger>
                        <SelectContent className="bg-white z-50">
                          <SelectItem value="move_1_czas">Move 1 (Czas)</SelectItem>
                          <SelectItem value="move_2_powtorzenia">Move 2 (Powtórzenia)</SelectItem>
                          <SelectItem value="move_3_skutecznosc">Move 3 (% Skuteczność)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setCurrentView('measuring_move')}
                      disabled={!selectedChallengeType}
                    >
                      Rozpocznij
                    </Button>
                  </>
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
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setCurrentView('measuring_training')}
                  >
                    Rozpocznij
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button 
              size="lg" 
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-12"
              onClick={handleSaveSession}
            >
              Zakończ i Zapisz Sesję
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="raporty" className="space-y-6">
          <Tabs value={reportTab} onValueChange={setReportTab} className="w-full">
            <TabsList className="bg-white border border-slate-200">
              <TabsTrigger value="historia">Historia pomiarów</TabsTrigger>
              <TabsTrigger value="progres">Raport progresu</TabsTrigger>
              <TabsTrigger value="benchmark">Raport benchmarkowy</TabsTrigger>
            </TabsList>

            {/* Historia pomiarów */}
            <TabsContent value="historia" className="mt-6">
              {!selectedSessionId ? (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Historia pomiarów: {athlete.name}</h2>
                  
                  {savedSessions.length === 0 ? (
                    <Card className="bg-white border-slate-200 p-8 text-center">
                      <p className="text-slate-600">Brak zapisanych sesji. Rozpocznij nowy pomiar w zakładce "Dodaj pomiar".</p>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {savedSessions.map((session) => (
                        <Card key={session.id} className="bg-white border-slate-200 p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-slate-900 mb-2">
                                Sigma Score {new Date(session.date).toLocaleDateString('pl-PL')}
                              </h3>
                              <p className="text-slate-600">
                                Warunki: {session.conditions === 'pracownia' ? 'Pracownia (Cisza)' : 'Trening (Hałas)'}
                              </p>
                              <p className="text-slate-500 text-sm mt-1">
                                {new Date(session.date).toLocaleTimeString('pl-PL')}
                              </p>
                            </div>
                            <Button 
                              onClick={() => setSelectedSessionId(session.id)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              Zobacz raport
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedSessionId(null)}
                    className="mb-6"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Powrót
                  </Button>
                  
                  {(() => {
                    const session = savedSessions.find(s => s.id === selectedSessionId);
                    if (!session) return null;
                    
                    return (
                      <div className="space-y-6">
                        <div className="bg-white border border-slate-200 rounded-lg p-6">
                          <h2 className="text-2xl font-bold text-slate-900">
                            Raport sesji: {new Date(session.date).toLocaleDateString('pl-PL')}
                          </h2>
                          <p className="text-slate-600 mt-2">
                            Data: {new Date(session.date).toLocaleString('pl-PL')} | 
                            Warunki: {session.conditions === 'pracownia' ? 'Pracownia (Cisza)' : 'Trening (Hałas)'}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Row 1: Profil Kognitywny (2/3) + Samoocena (1/3) */}
                          <Card className="bg-white border-slate-200 lg:col-span-2">
                            <CardHeader>
                              <CardTitle className="text-slate-900">Profil kognitywny</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                  <RadarChart data={[
                                    { subject: 'Skanowanie', value: session.results.scan?.avgReactionTime ? Math.max(0, 100 - session.results.scan.avgReactionTime / 10) : 0 },
                                    { subject: 'Kontrola', value: session.results.control?.errors ? Math.max(0, 100 - session.results.control.errors * 5) : 0 },
                                    { subject: 'Focus', value: session.results.focus?.focusScore || 0 },
                                  ]}>
                                    <PolarGrid stroke="#cbd5e1" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b' }} />
                                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b' }} />
                                    <Radar name="Wynik" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                                  </RadarChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="mt-4 space-y-1 text-sm text-slate-700 border-t pt-3">
                                <p className="font-semibold mb-2 text-slate-900">Surowe dane:</p>
                                {session.results.scan && (
                                  <p><span className="text-slate-600">Scan:</span> {session.results.scan.avgReactionTime}ms, {session.results.scan.accuracy}% celności</p>
                                )}
                                {session.results.control && (
                                  <p><span className="text-slate-600">Control:</span> {session.results.control.omissionErrors || 0} przeoczenia, {session.results.control.commissionErrors || 0} impulsywności</p>
                                )}
                                {session.results.focus && (
                                  <p><span className="text-slate-600">Focus:</span> {session.results.focus.interferenceEffect}ms efekt interferencji</p>
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-white border-slate-200">
                            <CardHeader>
                              <CardTitle className="text-slate-900">Profil psychometryczny</CardTitle>
                              <p className="text-xs text-slate-500">Samoocena</p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                              {session.results.kwestionariusz ? (
                                <>
                                  <div>
                                    <div className="flex justify-between text-sm mb-2">
                                      <span className="text-slate-600 font-medium">Pewność siebie</span>
                                      <span className="text-slate-900 font-bold text-lg">{session.results.kwestionariusz.confidence}/10</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-3">
                                      <div className="bg-blue-500 h-3 rounded-full transition-all" style={{width: `${(session.results.kwestionariusz.confidence / 10) * 100}%`}}></div>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between text-sm mb-2">
                                      <span className="text-slate-600 font-medium">Kontrola emocji</span>
                                      <span className="text-slate-900 font-bold text-lg">{session.results.kwestionariusz.emotionalControl}/10</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-3">
                                      <div className="bg-green-500 h-3 rounded-full transition-all" style={{width: `${(session.results.kwestionariusz.emotionalControl / 10) * 100}%`}}></div>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between text-sm mb-2">
                                      <span className="text-slate-600 font-medium">Motywacja</span>
                                      <span className="text-slate-900 font-bold text-lg">{session.results.kwestionariusz.motivation}/10</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-3">
                                      <div className="bg-purple-500 h-3 rounded-full transition-all" style={{width: `${(session.results.kwestionariusz.motivation / 10) * 100}%`}}></div>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <p className="text-slate-500 text-center py-8">Brak danych z kwestionariusza</p>
                              )}
                            </CardContent>
                          </Card>

                          {/* Row 2: HRV (2/3) + Biofeedback (1/3) */}
                          <Card className="bg-white border-slate-200 lg:col-span-2">
                            <CardHeader>
                              <CardTitle className="text-slate-900">Reaktywność fizjologiczna (HRV)</CardTitle>
                              <p className="text-xs text-slate-500">Spadek HRV pod presją zadań</p>
                            </CardHeader>
                            <CardContent>
                              <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={[
                                    { name: 'Baseline', hrv: parseInt(session.results.hrv_baseline?.hrv) || 0 },
                                    { name: 'Scan', hrv: parseInt(session.results.scan?.hrv) || 0 },
                                    { name: 'Control', hrv: parseInt(session.results.control?.hrv) || 0 },
                                    { name: 'Focus', hrv: parseInt(session.results.focus?.hrv) || 0 },
                                    { name: 'Move', hrv: parseInt(session.results.sigma_move?.hrv) || 0 },
                                  ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis 
                                      tick={{ fill: '#64748b' }} 
                                      label={{ value: 'HRV (ms)', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
                                    />
                                    <Tooltip 
                                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                      labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                                      formatter={(value: any) => [`${value} ms`, 'HRV']}
                                    />
                                    <Bar dataKey="hrv" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-white border-slate-200">
                            <CardHeader>
                              <CardTitle className="text-slate-900">Efekt treningu regulacji</CardTitle>
                              <p className="text-xs text-slate-500">Trening biofeedback</p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {session.results.hrv_training ? (
                                <>
                                  <div className="space-y-1">
                                    <p className="text-xs text-slate-500">Technika</p>
                                    <p className="text-slate-900 font-semibold">{session.results.hrv_training.technique}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-slate-500">Czas trwania</p>
                                    <p className="text-slate-900 font-semibold">{session.results.hrv_training.duration}s</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-slate-500">Zmiana HRV</p>
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg font-bold text-slate-700">{session.results.hrv_training.hrvStart}ms</span>
                                      <span className="text-slate-400">→</span>
                                      <span className="text-lg font-bold text-green-600">{session.results.hrv_training.hrvEnd}ms</span>
                                    </div>
                                    <p className="text-sm text-green-600 font-medium">
                                      +{parseInt(session.results.hrv_training.hrvEnd) - parseInt(session.results.hrv_training.hrvStart)}ms
                                    </p>
                                  </div>
                                  {session.results.hrv_training.comment && (
                                    <div className="space-y-1 pt-2 border-t">
                                      <p className="text-xs text-slate-500">Komentarz</p>
                                      <p className="text-sm text-slate-700 italic">{session.results.hrv_training.comment}</p>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <p className="text-slate-500 text-center py-8">Brak danych z treningu HRV</p>
                              )}
                            </CardContent>
                          </Card>

                          {/* Row 3: Sigma Move (1/3 width) */}
                          <Card className="bg-white border-slate-200">
                            <CardHeader>
                              <CardTitle className="text-slate-900">Sigma Move</CardTitle>
                              <p className="text-xs text-slate-500">Wydajność motoryczna</p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {session.results.sigma_move ? (
                                <>
                                  <div className="space-y-1">
                                    <p className="text-xs text-slate-500">Wyzwanie</p>
                                    <p className="text-slate-900 font-semibold">{session.results.sigma_move.type}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-slate-500">Wynik</p>
                                    <p className="text-2xl font-bold text-slate-900">{session.results.sigma_move.result}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-slate-500">Średnie HRV</p>
                                    <p className="text-slate-900 font-semibold">{session.results.sigma_move.hrv}ms</p>
                                  </div>
                                </>
                              ) : (
                                <p className="text-slate-500 text-center py-8">Brak danych z Sigma Move</p>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </TabsContent>

            {/* Raport Progresu */}
            <TabsContent value="progres" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Label className="text-slate-900 font-semibold">Pokaż dane dla warunków:</Label>
                  <Select value={conditionsFilter} onValueChange={setConditionsFilter}>
                    <SelectTrigger className="w-64 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      <SelectItem value="wszystkie">Wszystkie</SelectItem>
                      <SelectItem value="pracownia">Pracownia (Cisza)</SelectItem>
                      <SelectItem value="trening">Trening (Dystraktory)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Trend Kognitywny */}
                  <Card className="bg-white border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-slate-900">Trend kognitywny</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Scan Trend */}
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 mb-3">Trend: Scan (ms)</h4>
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={scanTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="session" tick={{ fill: '#64748b', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[400, 550]} />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                  formatter={(value: any) => [`${value}ms`, 'Czas reakcji']}
                                />
                                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Control Trend */}
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 mb-3">Trend: Control (błędy)</h4>
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={controlTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="session" tick={{ fill: '#64748b', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 15]} />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                  formatter={(value: any) => [`${value}`, 'Błędy']}
                                />
                                <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Focus Trend */}
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 mb-3">Trend: Focus (efekt interferencji ms)</h4>
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={focusTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="session" tick={{ fill: '#64748b', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[60, 90]} />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                  formatter={(value: any) => [`${value}ms`, 'Interferencja']}
                                />
                                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trend Fizjologiczny */}
                  <Card className="bg-white border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-slate-900">Trend fizjologiczny (HRV)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <h4 className="text-sm font-semibold text-slate-900 mb-3">Trend: HRV Baseline (ms)</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={hrvBaselineTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="session" tick={{ fill: '#64748b' }} />
                            <YAxis tick={{ fill: '#64748b' }} domain={[50, 75]} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                              formatter={(value: any) => [`${value}ms`, 'HRV Baseline']}
                            />
                            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Analiza AI */}
                  <Card className="bg-white border-slate-200">
                    <CardHeader className="flex flex-row items-center gap-3">
                      <Lightbulb className="h-6 w-6 text-yellow-500" />
                      <CardTitle className="text-slate-900">Analiza AI (Beta)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 leading-relaxed">
                        Zauważyliśmy silną korelację (r=0.75) między twoją "Pewnością siebie" a "HRV Baseline". 
                        Twój wynik "Focus" wykazuje stały trend progresu (-15%). Spadek efektu interferencji 
                        sugeruje poprawę kontroli uwagi selektywnej. Kontynuuj obecny schemat treningowy, 
                        ze szczególnym uwzględnieniem ćwiczeń oddechowych w warunkach z dystraktorami.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Raport Benchmarkowy */}
            <TabsContent value="benchmark" className="mt-6">
              <div className="space-y-6">
                {/* Filtry */}
                <Card className="bg-white border-slate-200">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label className="text-slate-900 font-semibold mb-2 block">Porównaj z:</Label>
                        <Select value={benchmarkGroup} onValueChange={setBenchmarkGroup}>
                          <SelectTrigger className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            <SelectItem value="wszyscy">Wszyscy zawodnicy</SelectItem>
                            <SelectItem value="klub">Mój klub</SelectItem>
                            <SelectItem value="dyscyplina">Cała dyscyplina</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-slate-900 font-semibold mb-2 block">Dyscyplina:</Label>
                        <Select value={benchmarkDiscipline} onValueChange={setBenchmarkDiscipline}>
                          <SelectTrigger className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            <SelectItem value="judo">Judo</SelectItem>
                            <SelectItem value="pilka_nozna">Piłka nożna</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-slate-900 font-semibold mb-2 block">Wiek:</Label>
                        <Select value={benchmarkAge} onValueChange={setBenchmarkAge}>
                          <SelectTrigger className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            <SelectItem value="wszyscy">Wszyscy</SelectItem>
                            <SelectItem value="14-16">14-16 lat</SelectItem>
                            <SelectItem value="17-19">17-19 lat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600">
                      Porównanie z: {benchmarkDiscipline === 'judo' ? 'Judo' : 'Piłka nożna'}, {benchmarkAge === '14-16' ? '14-16 lat' : benchmarkAge === '17-19' ? '17-19 lat' : 'wszyscy'} (n=45 zawodników)
                    </p>
                  </CardContent>
                </Card>

                {/* Benchmark Kognitywny */}
                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-slate-900">Benchmark kognitywny</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-slate-700">Skanowanie (Scan)</Label>
                        <span className="text-sm font-semibold text-slate-900">78. percentyl</span>
                      </div>
                      <Progress value={78} className="h-3" />
                      <p className="text-xs text-slate-600 mt-1">Lepszy niż 78% grupy</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-slate-700">Kontrola (Control)</Label>
                        <span className="text-sm font-semibold text-slate-900">45. percentyl</span>
                      </div>
                      <Progress value={45} className="h-3" />
                      <p className="text-xs text-slate-600 mt-1">45. percentyl</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-slate-700">Focus</Label>
                        <span className="text-sm font-semibold text-slate-900">85. percentyl</span>
                      </div>
                      <Progress value={85} className="h-3" />
                      <p className="text-xs text-slate-600 mt-1">85. percentyl (Top 15%)</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Benchmark Fizjologiczny */}
                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-slate-900">Benchmark fizjologiczny</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-slate-700">HRV Baseline (Regeneracja)</Label>
                        <span className="text-sm font-semibold text-slate-900">65. percentyl</span>
                      </div>
                      <Progress value={65} className="h-3" />
                      <p className="text-xs text-slate-600 mt-1">65. percentyl</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-slate-700">HRV pod presją (Focus)</Label>
                        <span className="text-sm font-semibold text-slate-900">75. percentyl</span>
                      </div>
                      <Progress value={75} className="h-3" />
                      <p className="text-xs text-slate-600 mt-1">75. percentyl</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Pełnoekranowy Dialog dla gier */}
      <Dialog open={currentView !== 'kokpit'} onOpenChange={(open) => {
        if (!open) setCurrentView('kokpit');
      }}>
        <DialogContent className="w-screen h-screen max-w-none p-0 border-0 bg-slate-900">
          {/* Przycisk Powrót - zawsze widoczny */}
          <Button 
            variant="ghost" 
            className="absolute top-4 left-4 z-50 text-white hover:bg-slate-800"
            onClick={() => setCurrentView('kokpit')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>

          {currentView === 'showing_questionnaire' && (
            <Kwestionariusz onComplete={handleTaskComplete} />
          )}

          {currentView === 'measuring_baseline' && (
            <HRVBaselineForm onComplete={handleTaskComplete} />
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

          {currentView === 'measuring_move' && (
            <SigmaMoveForm 
              challengeType={selectedChallengeType} 
              onComplete={handleTaskComplete} 
            />
          )}

          {currentView === 'measuring_training' && (
            <HRVTrainingForm onComplete={handleTaskComplete} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AthleteProfile;
