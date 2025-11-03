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
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
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

  // Mock data - w przyszłości z API/bazy danych
  const athleteData: Record<string, { name: string; club: string }> = {
    "1": { name: "Jan Kowalski", club: "KS Górnik" },
    "2": { name: "Anna Nowak", club: "MKS Cracovia" },
    "3": { name: "Piotr Wiśniewski", club: "KS Górnik" },
    "4": { name: "Maria Kowalczyk", club: "Wisła Kraków" },
    "5": { name: "Tomasz Zieliński", club: "Legia Warszawa" },
  };

  const athlete = athleteData[id || "1"] || { name: "Nieznany zawodnik", club: "Brak danych" };

  // Load sessions on mount
  useEffect(() => {
    if (id) {
      const athleteName = athleteData[id]?.name || 'Unknown';
      const sessions = loadMockSessionsToStorage(id, athleteName);
      const allSessions = JSON.parse(localStorage.getItem('athlete_sessions') || '[]');
      setSavedSessions(allSessions.filter((s: any) => s.athlete_id === id));
    }
  }, [id]);

  const handleTaskComplete = (taskName: string, result: any) => {
    setTaskStatus(prev => ({ ...prev, [taskName]: 'completed' }));
    setSessionResults(prev => ({ ...prev, [taskName]: result }));
    console.log(`Wynik z ${taskName}:`, result);
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
                    <RadioGroupItem value="gabinet" id="gabinet" />
                    <Label htmlFor="gabinet" className="cursor-pointer text-slate-700">
                      Gabinet (Cisza)
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
          {!selectedSessionId ? (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Historia Pomiarów: {athlete.name}</h2>
              
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
                            Sesja {new Date(session.date).toLocaleDateString('pl-PL')}
                          </h3>
                          <p className="text-slate-600">
                            Warunki: {session.conditions === 'gabinet' ? 'Gabinet (Cisza)' : 'Trening (Hałas)'}
                          </p>
                          <p className="text-slate-500 text-sm mt-1">
                            {new Date(session.date).toLocaleTimeString('pl-PL')}
                          </p>
                        </div>
                        <Button 
                          onClick={() => setSelectedSessionId(session.id)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Zobacz Raport
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
                <ArrowLeft className="mr-2 h-4 w-4" />
                Powrót do Listy Sesji
              </Button>
              
              {(() => {
                const session = savedSessions.find(s => s.id === selectedSessionId);
                if (!session) return null;
                
                return (
                  <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                      <h2 className="text-2xl font-bold text-slate-900">
                        Raport Sesji: {new Date(session.date).toLocaleDateString('pl-PL')}
                      </h2>
                      <p className="text-slate-600 mt-2">
                        Data: {new Date(session.date).toLocaleString('pl-PL')} | 
                        Warunki: {session.conditions === 'gabinet' ? 'Gabinet (Cisza)' : 'Trening (Hałas)'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Row 1: Profil Kognitywny (2/3) + Samoocena (1/3) */}
                      <Card className="bg-white border-slate-200 lg:col-span-2">
                        <CardHeader>
                          <CardTitle className="text-slate-900">Profil Kognitywny</CardTitle>
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
                            <p className="font-semibold mb-2 text-slate-900">Surowe Dane:</p>
                            {session.results.scan && (
                              <p><span className="text-slate-600">Scan:</span> {session.results.scan.avgReactionTime}ms, {session.results.scan.accuracy}% celności</p>
                            )}
                            {session.results.control && (
                              <p><span className="text-slate-600">Control:</span> {session.results.control.omissionErrors || 0} przeoczenia, {session.results.control.commissionErrors || 0} impulsywności</p>
                            )}
                            {session.results.focus && (
                              <p><span className="text-slate-600">Focus:</span> {session.results.focus.interferenceEffect}ms Efekt Interferencji</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white border-slate-200">
                        <CardHeader>
                          <CardTitle className="text-slate-900">Profil Psychometryczny</CardTitle>
                          <p className="text-xs text-slate-500">Samoocena</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {session.results.kwestionariusz ? (
                            <>
                              <div>
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-slate-600 font-medium">Pewność Siebie</span>
                                  <span className="text-slate-900 font-bold text-lg">{session.results.kwestionariusz.confidence}/10</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3">
                                  <div className="bg-blue-500 h-3 rounded-full transition-all" style={{width: `${(session.results.kwestionariusz.confidence / 10) * 100}%`}}></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-slate-600 font-medium">Kontrola Emocji</span>
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
                          <CardTitle className="text-slate-900">Reaktywność Fizjologiczna (HRV)</CardTitle>
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
                          <CardTitle className="text-slate-900">Efekt Treningu Regulacji</CardTitle>
                          <p className="text-xs text-slate-500">Trening Biofeedback</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {session.results.hrv_training ? (
                            <>
                              <div className="space-y-1">
                                <p className="text-xs text-slate-500">Technika</p>
                                <p className="text-slate-900 font-semibold">{session.results.hrv_training.technique}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-slate-500">Czas Trwania</p>
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
                          <p className="text-xs text-slate-500">Wydajność Motoryczna</p>
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
