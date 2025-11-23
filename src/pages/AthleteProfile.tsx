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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import TrainingsTable from "@/components/TrainingsTable";
import SessionWizardNew from "@/components/SessionWizardNew";

const AthleteProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "informacje";
  const activeSubTab = searchParams.get("subtab") || "historia";
  
  const [sessionA, setSessionA] = useState("baseline-m1");
  const [sessionB, setSessionB] = useState("ewaluacja-m7");
  
  const [currentView, setCurrentView] = useState('kokpit');
  const [measurementConditions, setMeasurementConditions] = useState('gabinet');
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
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [reportTab, setReportTab] = useState(activeSubTab);
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

  const [newNote, setNewNote] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [editedNoteText, setEditedNoteText] = useState('');
  
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    club: '',
    coach: '',
    discipline: '',
    email: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    birthDate: undefined as Date | undefined,
  });

  // Pobierz listę trenerów z klubu zawodnika
  const getClubCoaches = () => {
    const storedClubs = localStorage.getItem('clubs');
    if (storedClubs) {
      const clubs = JSON.parse(storedClubs);
      const club = clubs.find((c: any) => c.name === athlete.club);
      return club?.coaches || [];
    }
    return [];
  };

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
          coach: athlete.coach,
          discipline: athlete.discipline,
          email: athlete.email,
          phone: athlete.phone,
          birthYear: athlete.birthYear,
          birthDate: athlete.birthDate,
          notes: athlete.notes,
          notesHistory: athlete.notesHistory || [],
          parentName: athlete.parentName || '',
          parentPhone: athlete.parentPhone || '',
          parentEmail: athlete.parentEmail || '',
          createdAt: athlete.createdAt,
        };
      }
    }
    
    // Fallback do mock data
    const athleteData: Record<string, any> = {
      "1": { name: "Kowalski Jan", club: "KS Górnik", coach: "", discipline: "Piłka nożna", birthYear: 2005, email: "jan.kowalski@example.com", phone: "+48 123 456 789", notes: "", notesHistory: [] },
      "2": { name: "Nowak Anna", club: "MKS Cracovia", discipline: "Koszykówka", birthYear: 2004, birthDate: "2004-07-20", email: "anna.nowak@example.com", phone: "+48 234 567 890", notes: "", parentName: "", parentPhone: "", parentEmail: "", createdAt: "2024-01-16" },
      "3": { name: "Wiśniewski Piotr", club: "KS Górnik", discipline: "Piłka nożna", birthYear: 2006, birthDate: "2006-11-10", email: "piotr.wisniewski@example.com", phone: "+48 345 678 901", notes: "", parentName: "", parentPhone: "", parentEmail: "", createdAt: "2024-01-17" },
      "4": { name: "Kowalczyk Maria", club: "Wisła Kraków", discipline: "Siatkówka", birthYear: 2005, birthDate: "2005-05-05", email: "maria.kowalczyk@example.com", phone: "+48 456 789 012", notes: "", parentName: "", parentPhone: "", parentEmail: "", createdAt: "2024-01-18" },
      "5": { name: "Zieliński Tomasz", club: "Legia Warszawa", discipline: "Piłka nożna", birthYear: 2003, birthDate: "2003-09-22", email: "tomasz.zielinski@example.com", phone: "+48 567 890 123", notes: "", parentName: "", parentPhone: "", parentEmail: "", createdAt: "2024-01-19" },
    };
    return athleteData[id || "1"] || { name: "Nieznany zawodnik", club: "Brak danych", discipline: "", email: "", phone: "", birthYear: 0, birthDate: "", notes: "", parentName: "", parentPhone: "", parentEmail: "", createdAt: "" };
  };

  const athlete = getAthleteData();

  // Sync reportTab with URL subtab parameter
  useEffect(() => {
    setReportTab(activeSubTab);
  }, [activeSubTab]);

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
    
    // Check if this is a training session
    const currentTrainingStr = localStorage.getItem('current_training');
    if (currentTrainingStr && currentView.startsWith('playing_')) {
      // This is a training session - save separately
      const currentTraining = JSON.parse(currentTrainingStr);
      const trainingRecord = {
        ...currentTraining,
        results: data,
        completedAt: new Date().toISOString()
      };
      
      // Save to trainings list
      const existingTrainings = JSON.parse(localStorage.getItem('athlete_trainings') || '[]');
      existingTrainings.push(trainingRecord);
      localStorage.setItem('athlete_trainings', JSON.stringify(existingTrainings));
      localStorage.removeItem('current_training');
      
      console.log('Trening zapisany:', trainingRecord);
      setCurrentView('kokpit');
      return;
    }
    
    // Otherwise, it's a measurement session
    const updatedStatus = { ...taskStatus, [taskName]: 'completed' };
    const updatedResults = { ...sessionResults, [taskName]: data };
    
    setTaskStatus(updatedStatus);
    setSessionResults(updatedResults);
    console.log(`Wynik z ${taskName}:`, data);
    
    // Auto-save to localStorage after each task
    const sessionId = currentSessionId || `session_${Date.now()}`;
    if (!currentSessionId) {
      setCurrentSessionId(sessionId);
    }
    
    const sessionData = {
      id: sessionId,
      athlete_id: id,
      athlete_name: athlete?.name || 'Unknown',
      date: new Date().toISOString(),
      conditions: measurementConditions,
      results: updatedResults,
      taskStatus: updatedStatus,
      inProgress: true // Sesja w trakcie
    };

    // Save or update session
    const existingSessions = JSON.parse(localStorage.getItem('athlete_sessions') || '[]');
    const sessionIndex = existingSessions.findIndex((s: any) => s.id === sessionId);
    
    if (sessionIndex !== -1) {
      existingSessions[sessionIndex] = sessionData;
    } else {
      existingSessions.push(sessionData);
    }
    
    localStorage.setItem('athlete_sessions', JSON.stringify(existingSessions));
    setSavedSessions(existingSessions.filter((s: any) => s.athlete_id === id));
    
    setCurrentView('kokpit');
  };

  const handleSaveSessionFromWizard = (wizardResults: any) => {
    console.log('🎯 Otrzymano dane z wizard:', wizardResults);
    
    // Transform questionnaires data to Six Sigma format
    let sixSigmaResults: any = null;
    
    if (wizardResults.questionnaires?.questionnaires) {
      const scoredQuestionnaires = wizardResults.questionnaires.questionnaires;
      console.log('📊 Scored questionnaires:', scoredQuestionnaires);
      
      // Find Six Sigma full (6x6) questionnaire
      const sixSigmaFull = scoredQuestionnaires.find((q: any) => 
        q.questionnaireId === 'six_sigma_full'
      );
      
      if (sixSigmaFull) {
        console.log('✅ Znaleziono Six Sigma Full:', {
          completionTime: sixSigmaFull.completionTimeSeconds,
          responsesCount: sixSigmaFull.responses?.length,
          validation: sixSigmaFull.validation
        });
        
        // Extract completion time from scored questionnaire
        const completionTime = sixSigmaFull.completionTimeSeconds || 0;
        
        // Transform scored questionnaire to session format
        sixSigmaResults = {
          version: "6x6+6",
          questionnaireName: sixSigmaFull.questionnaireName,
          completionDate: sixSigmaFull.completedAt,
          completionTimeSeconds: completionTime,
          competencyScores: sixSigmaFull.competencyScores.map((comp: any) => ({
            competency: comp.competencyId,
            name: comp.competencyName,
            rawScore: comp.rawScore,
            maxScore: comp.maxPossibleScore,
            normalizedScore: comp.normalizedScore / 100, // Convert from 0-100 to 0-1
            interpretation: getScoreInterpretation(comp.normalizedScore)
          })),
          modifierScores: sixSigmaFull.modifierScores.map((mod: any) => ({
            modifier: mod.modifierId,
            name: mod.modifierName,
            rawScore: mod.rawValue,
            maxScore: 5,
            normalizedScore: mod.normalizedScore / 100, // Convert from 0-100 to 0-1
            impact: getModifierImpact(mod.normalizedScore)
          })),
          overallScore: sixSigmaFull.overallScore ? sixSigmaFull.overallScore / 100 : 0,
          validation: sixSigmaFull.validation,
          responses: sixSigmaFull.responses || [] // Include raw responses with metadata
        };
        
        console.log('✅ Transformed Six Sigma results:', {
          responsesCount: sixSigmaResults.responses.length,
          completionTime: sixSigmaResults.completionTimeSeconds,
          overallScore: sixSigmaResults.overallScore
        });
      } else {
        console.warn('⚠️ Six Sigma Full nie znaleziony w questionnaires:', scoredQuestionnaires.map((q: any) => q.questionnaireId));
      }
    } else {
      console.warn('⚠️ Brak danych kwestionariuszy w wizardResults');
    }
    
    // Create or update session
    const sessionId = currentSessionId || `session_${Date.now()}`;
    const sessionData = {
      id: sessionId,
      athlete_id: id,
      athlete_name: athlete?.name || 'Unknown',
      date: new Date().toISOString(),
      conditions: measurementConditions,
      results: {
        ...sessionResults,
        ...wizardResults,
        ...(sixSigmaResults && { six_sigma: sixSigmaResults })
      },
      taskStatus: {
        ...taskStatus,
        ...(sixSigmaResults && { six_sigma: 'completed' })
      },
      inProgress: false
    };
    
    console.log('💾 Zapisuję sesję do localStorage:', {
      sessionId,
      hasSixSigma: !!sixSigmaResults,
      responsesCount: sixSigmaResults?.responses?.length || 0
    });
    
    const existingSessions = JSON.parse(localStorage.getItem('athlete_sessions') || '[]');
    const sessionIndex = existingSessions.findIndex((s: any) => s.id === sessionId);
    
    if (sessionIndex !== -1) {
      existingSessions[sessionIndex] = sessionData;
    } else {
      existingSessions.push(sessionData);
    }
    
    localStorage.setItem('athlete_sessions', JSON.stringify(existingSessions));
    setSavedSessions(existingSessions.filter((s: any) => s.athlete_id === id));
    
    console.log('✅ Sesja zapisana pomyślnie');
    
    // Navigate to reports
    setSearchParams({ tab: 'raporty' });
    
    // Reset wizard state
    setCurrentSessionId(null);
    setSessionResults({});
  };
  
  // Helper functions for interpretation
  const getScoreInterpretation = (normalizedScore: number): string => {
    if (normalizedScore >= 80) return 'Wysoki';
    if (normalizedScore >= 60) return 'Dobry';
    if (normalizedScore >= 40) return 'Średni';
    if (normalizedScore >= 20) return 'Niski';
    return 'Bardzo niski';
  };
  
  const getModifierImpact = (normalizedScore: number): 'positive' | 'neutral' | 'negative' => {
    if (normalizedScore >= 60) return 'positive';
    if (normalizedScore >= 40) return 'neutral';
    return 'negative';
  };

  const handleSaveSession = () => {
    if (!currentSessionId) return;
    
    // Finalize session (remove "inProgress" flag)
    const existingSessions = JSON.parse(localStorage.getItem('athlete_sessions') || '[]');
    const sessionIndex = existingSessions.findIndex((s: any) => s.id === currentSessionId);
    
    if (sessionIndex !== -1) {
      existingSessions[sessionIndex].inProgress = false;
      localStorage.setItem('athlete_sessions', JSON.stringify(existingSessions));
      setSavedSessions(existingSessions.filter((s: any) => s.athlete_id === id));
    }

    // Navigate to reports
    setSearchParams({ tab: 'raporty' });
    
    // Reset session
    setCurrentSessionId(null);
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

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const storedAthletes = localStorage.getItem('athletes');
    if (storedAthletes) {
      const athletes = JSON.parse(storedAthletes);
      const athleteIndex = athletes.findIndex((a: any) => a.id === parseInt(id || "1"));
      
      if (athleteIndex !== -1) {
        const currentDate = new Date().toLocaleString('pl-PL', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        const noteEntry = {
          date: currentDate,
          text: newNote.trim()
        };
        
        if (!athletes[athleteIndex].notesHistory) {
          athletes[athleteIndex].notesHistory = [];
        }
        
        athletes[athleteIndex].notesHistory.push(noteEntry);
        localStorage.setItem('athletes', JSON.stringify(athletes));
        
        setNewNote('');
        window.location.reload();
      }
    }
  };

  const handleEditProfile = () => {
    setEditedProfile({
      name: athlete.name,
      club: athlete.club,
      coach: athlete.coach,
      discipline: athlete.discipline,
      email: athlete.email || '',
      phone: athlete.phone || '',
      parentName: athlete.parentName || '',
      parentPhone: athlete.parentPhone || '',
      parentEmail: athlete.parentEmail || '',
      birthDate: athlete.birthDate ? new Date(athlete.birthDate) : undefined,
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    const storedAthletes = localStorage.getItem('athletes');
    if (storedAthletes) {
      const athletes = JSON.parse(storedAthletes);
      const athleteIndex = athletes.findIndex((a: any) => a.id === parseInt(id || "1"));
      
      if (athleteIndex !== -1) {
        athletes[athleteIndex] = {
          ...athletes[athleteIndex],
          name: editedProfile.name,
          club: editedProfile.club,
          coach: editedProfile.coach,
          discipline: editedProfile.discipline,
          email: editedProfile.email,
          phone: editedProfile.phone,
          parentName: editedProfile.parentName,
          parentPhone: editedProfile.parentPhone,
          parentEmail: editedProfile.parentEmail,
          birthDate: editedProfile.birthDate?.toISOString(),
          birthYear: editedProfile.birthDate?.getFullYear() || athletes[athleteIndex].birthYear,
        };
        localStorage.setItem('athletes', JSON.stringify(athletes));
        setIsEditingProfile(false);
        window.location.reload();
      }
    }
  };

  const handleEditNote = (index: number, text: string) => {
    setEditingNoteIndex(index);
    setEditedNoteText(text);
  };

  const handleSaveEditedNote = () => {
    if (editingNoteIndex === null || !editedNoteText.trim()) return;
    
    const storedAthletes = localStorage.getItem('athletes');
    if (storedAthletes) {
      const athletes = JSON.parse(storedAthletes);
      const athleteIndex = athletes.findIndex((a: any) => a.id === parseInt(id || "1"));
      
      if (athleteIndex !== -1 && athletes[athleteIndex].notesHistory) {
        athletes[athleteIndex].notesHistory[editingNoteIndex].text = editedNoteText.trim();
        localStorage.setItem('athletes', JSON.stringify(athletes));
        setEditingNoteIndex(null);
        setEditedNoteText('');
        window.location.reload();
      }
    }
  };

  const handleDeleteNote = (index: number) => {
    const storedAthletes = localStorage.getItem('athletes');
    if (storedAthletes) {
      const athletes = JSON.parse(storedAthletes);
      const athleteIndex = athletes.findIndex((a: any) => a.id === parseInt(id || "1"));
      
      if (athleteIndex !== -1 && athletes[athleteIndex].notesHistory) {
        athletes[athleteIndex].notesHistory.splice(index, 1);
        localStorage.setItem('athletes', JSON.stringify(athletes));
        window.location.reload();
      }
    }
  };

  const calculateAge = (birthDate: string | undefined) => {
    if (!birthDate) return 'Nie podano';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} lat`;
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
        <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-white border border-slate-200">
              <TabsTrigger value="informacje">Informacje o zawodniku</TabsTrigger>
              <TabsTrigger value="trening">Trening</TabsTrigger>
              <TabsTrigger value="dodaj-pomiar">Dodaj pomiar</TabsTrigger>
              <TabsTrigger value="raporty">Raporty</TabsTrigger>
            </TabsList>
          {activeTab === "informacje" && (
            <Button variant="outline" onClick={handleEditProfile}>
              Edytuj profil
            </Button>
          )}
        </div>

        <TabsContent value="informacje" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-slate-900">Podstawowe informacje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-slate-600 block mb-1">Data utworzenia</span>
                    <span className="font-semibold text-slate-900">
                      {athlete.createdAt ? new Date(athlete.createdAt).toLocaleDateString('pl-PL') : 'Nie podano'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-600 block mb-1">Imię i nazwisko</span>
                    <span className="font-semibold text-slate-900">{athlete.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-600 block mb-1">Wiek</span>
                    <span className="font-semibold text-slate-900">{calculateAge(athlete.birthDate)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-600 block mb-1">Klub</span>
                    <span className="font-semibold text-slate-900">{athlete.club}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-600 block mb-1">Dyscyplina</span>
                    <span className="font-semibold text-slate-900">{athlete.discipline || "Nie podano"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-600 block mb-1">Trenerzy</span>
                    <span className="font-semibold text-slate-900">{athlete.coach || "Nie przypisano"}</span>
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
                  <div>
                    <span className="text-xs text-slate-600 block mb-1">Imię i nazwisko rodzica</span>
                    <span className="font-semibold text-slate-900">{athlete.parentName || "Nie podano"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-600 block mb-1">Telefon rodzica</span>
                    <span className="font-semibold text-slate-900">{athlete.parentPhone || "Nie podano"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-600 block mb-1">Email rodzica</span>
                    <span className="font-semibold text-slate-900">{athlete.parentEmail || "Nie podano"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-600 block mb-1">Telefon zawodnika</span>
                    <span className="font-semibold text-slate-900">{athlete.phone || "Nie podano"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-600 block mb-1">Email zawodnika</span>
                    <span className="font-semibold text-slate-900">{athlete.email || "Nie podano"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-slate-900">Pomiary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-slate-600 block mb-1">Liczba pomiarów</span>
                    <span className="font-semibold text-slate-900">{savedSessions.length}</span>
                  </div>
                  {savedSessions.length > 0 && (
                    <div>
                      <span className="text-xs text-slate-600 block mb-1">Data ostatniego pomiaru</span>
                      <span className="font-semibold text-slate-900">
                        {new Date(savedSessions[savedSessions.length - 1].date).toLocaleDateString('pl-PL')}
                      </span>
                    </div>
                  )}
                  <Button 
                    className="w-full mt-4"
                    onClick={() => setSearchParams({ tab: 'dodaj-pomiar' })}
                  >
                    Dodaj nowy pomiar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-slate-900">Historia i notatki</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsEditingNotes(!isEditingNotes)}
                >
                  {isEditingNotes ? 'Zakończ edycję' : 'Edytuj'}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-md p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                    {athlete.notesHistory && athlete.notesHistory.length > 0 ? (
                      <div className="space-y-3">
                        {athlete.notesHistory.map((note: any, index: number) => (
                          <div key={index} className="border-b border-border/50 pb-3 last:border-0">
                            <p className="text-xs text-muted-foreground font-semibold mb-1">
                              {note.date}
                            </p>
                            {editingNoteIndex === index ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editedNoteText}
                                  onChange={(e) => setEditedNoteText(e.target.value)}
                                  className="min-h-[80px]"
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={handleSaveEditedNote}>
                                    Zapisz
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => {
                                    setEditingNoteIndex(null);
                                    setEditedNoteText('');
                                  }}>
                                    Anuluj
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm text-foreground whitespace-pre-wrap">
                                  {note.text}
                                </p>
                                {isEditingNotes && (
                                  <div className="flex gap-2 mt-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleEditNote(index, note.text)}
                                    >
                                      Edytuj
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => handleDeleteNote(index)}
                                    >
                                      Usuń
                                    </Button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">Brak notatek</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-note" className="text-slate-900">Dodaj nową notatkę</Label>
                    <Textarea
                      id="new-note"
                      placeholder="Wpisz notatkę..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button 
                      onClick={handleAddNote}
                      className="w-full"
                      disabled={!newNote.trim()}
                    >
                      Dodaj notatkę
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dodaj-pomiar" className="mt-6">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Kokpit pomiarowy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-slate-900 font-semibold mb-3 block">Warunki pomiaru</Label>
                <RadioGroup value={measurementConditions} onValueChange={setMeasurementConditions}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gabinet" id="gabinet" />
                    <Label htmlFor="gabinet" className="text-slate-700 font-normal cursor-pointer">Gabinet (w ciszy)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="trening" id="trening" />
                    <Label htmlFor="trening" className="text-slate-700 font-normal cursor-pointer">Trening (z dystraktorami)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Kwestionariusz */}
                <Card className={`cursor-pointer transition-all ${taskStatus.kwestionariusz === 'completed' ? 'bg-green-50 border-green-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">Kwestionariusz</h3>
                      {taskStatus.kwestionariusz === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </div>
                    <p className="text-sm text-slate-600 mb-4">Ocena psychometryczna</p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => setCurrentView('wizard')}
                    >
                      Rozpocznij sesję
                    </Button>
                  </CardContent>
                </Card>

                {/* HRV Baseline */}
                <Card className={`cursor-pointer transition-all ${taskStatus.hrv_baseline === 'completed' ? 'bg-green-50 border-green-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">HRV Baseline</h3>
                      {taskStatus.hrv_baseline === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </div>
                    <p className="text-sm text-slate-600 mb-4">Zmienność rytmu serca - stan bazowy</p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => setCurrentView('measuring_baseline')}
                    >
                      {taskStatus.hrv_baseline === 'completed' ? 'Powtórz' : 'Rozpocznij'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Scan */}
                <Card className={`cursor-pointer transition-all ${taskStatus.scan === 'completed' ? 'bg-green-50 border-green-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">Sigma Scan</h3>
                      {taskStatus.scan === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </div>
                    <p className="text-sm text-slate-600 mb-4">Test skanowania wzrokowego</p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => setCurrentView('playing_scan')}
                    >
                      {taskStatus.scan === 'completed' ? 'Powtórz' : 'Rozpocznij'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Control */}
                <Card className={`cursor-pointer transition-all ${taskStatus.control === 'completed' ? 'bg-green-50 border-green-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">Sigma Control</h3>
                      {taskStatus.control === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </div>
                    <p className="text-sm text-slate-600 mb-4">Test kontroli impulsów</p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => setCurrentView('playing_control')}
                    >
                      {taskStatus.control === 'completed' ? 'Powtórz' : 'Rozpocznij'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Focus */}
                <Card className={`cursor-pointer transition-all ${taskStatus.focus === 'completed' ? 'bg-green-50 border-green-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">Sigma Focus</h3>
                      {taskStatus.focus === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </div>
                    <p className="text-sm text-slate-600 mb-4">Test koncentracji</p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => setCurrentView('playing_focus')}
                    >
                      {taskStatus.focus === 'completed' ? 'Powtórz' : 'Rozpocznij'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Sigma Move */}
                <Card className={`cursor-pointer transition-all ${taskStatus.sigma_move === 'completed' ? 'bg-green-50 border-green-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">Sigma Move</h3>
                      {taskStatus.sigma_move === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </div>
                    <p className="text-sm text-slate-600 mb-4">Test mobilności i koordynacji</p>
                    <div className="space-y-2">
                      <Select value={selectedChallengeType} onValueChange={setSelectedChallengeType}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Wybierz test" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plank">Plank</SelectItem>
                          <SelectItem value="squat">Squat</SelectItem>
                          <SelectItem value="lunge">Lunge</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => setCurrentView('measuring_move')}
                        disabled={!selectedChallengeType}
                      >
                        {taskStatus.sigma_move === 'completed' ? 'Powtórz' : 'Rozpocznij'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* HRV Training */}
                <Card className={`cursor-pointer transition-all ${taskStatus.hrv_training === 'completed' ? 'bg-green-50 border-green-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">HRV Training</h3>
                      {taskStatus.hrv_training === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </div>
                    <p className="text-sm text-slate-600 mb-4">HRV pod obciążeniem</p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => setCurrentView('measuring_training')}
                    >
                      {taskStatus.hrv_training === 'completed' ? 'Powtórz' : 'Rozpocznij'}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <Button 
                  size="lg"
                  onClick={handleSaveSession}
                  disabled={Object.values(taskStatus).every(status => status === 'pending')}
                >
                  Zakończ i Zapisz Sesję
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trening" className="mt-6">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Trening</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Graj w wybrane wyzwania w trybie treningowym</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Scan */}
                <Card className="bg-slate-50 hover:bg-slate-100 border-slate-200 cursor-pointer transition-all">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Sigma Scan</h3>
                    <p className="text-sm text-slate-600 mb-4">Test skanowania wzrokowego</p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => setCurrentView('playing_scan')}
                    >
                      Zagraj
                    </Button>
                  </CardContent>
                </Card>

                {/* Control */}
                <Card className="bg-slate-50 hover:bg-slate-100 border-slate-200 cursor-pointer transition-all">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Sigma Control</h3>
                    <p className="text-sm text-slate-600 mb-4">Test kontroli impulsów</p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => setCurrentView('playing_control')}
                    >
                      Zagraj
                    </Button>
                  </CardContent>
                </Card>

                {/* Focus */}
                <Card className="bg-slate-50 hover:bg-slate-100 border-slate-200 cursor-pointer transition-all">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Sigma Focus</h3>
                    <p className="text-sm text-slate-600 mb-4">Trening uwagi selektywnej</p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        const training = {
                          id: `training_focus_${Date.now()}`,
                          athlete_id: id,
                          athlete_name: athlete.name,
                          game_type: 'focus',
                          game_name: 'Sigma Focus',
                          date: new Date().toISOString(),
                          results: {}
                        };
                        localStorage.setItem('current_training', JSON.stringify(training));
                        setCurrentView('playing_focus');
                      }}
                    >
                      Zagraj
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raporty" className="mt-6">
          <Tabs value={reportTab} onValueChange={(value) => {
            setReportTab(value);
            setSearchParams({ tab: 'raporty', subtab: value });
          }}>
            <TabsList className="mb-6">
              <TabsTrigger value="historia">Historia sesji</TabsTrigger>
              <TabsTrigger value="sigma-score">Sigma Score</TabsTrigger>
              <TabsTrigger value="treningi">Raporty treningowe</TabsTrigger>
            </TabsList>

            {/* Historia sesji */}
            <TabsContent value="historia" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Historia pomiarów</CardTitle>
                    <Select value={conditionsFilter} onValueChange={setConditionsFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtruj warunki" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50">
                        <SelectItem value="wszystkie">Wszystkie warunki</SelectItem>
                        <SelectItem value="gabinet">Gabinet (w ciszy)</SelectItem>
                        <SelectItem value="trening">Trening (z dystraktorami)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {savedSessions.length > 0 ? savedSessions.map((session) => (
                      <Card key={session.id} className="border-slate-200 hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/zawodnicy/${id}/sesja/${session.id}?task=overview`)}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {new Date(session.date).toLocaleDateString('pl-PL', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                              <Badge variant="outline" className="mt-1">
                                {session.conditions}
                              </Badge>
                            </div>
                            <Badge variant="secondary">
                              {Object.values(session.taskStatus).filter(s => s === 'completed').length}/{Object.keys(session.taskStatus).length} testów
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {session.results.six_sigma && (
                              <div>
                                <span className="text-xs text-slate-600 block mb-1">Six Sigma</span>
                                <span className="font-semibold text-lg">{Math.round(session.results.six_sigma.overallScore * 100)}%</span>
                              </div>
                            )}
                            {session.results.hrv_baseline && (
                              <div>
                                <span className="text-xs text-slate-600 block mb-1">HRV Baseline</span>
                                <span className="font-semibold text-lg">{session.results.hrv_baseline.hrv}</span>
                              </div>
                            )}
                            {session.results.scan && (
                              <div>
                                <span className="text-xs text-slate-600 block mb-1">Sigma Scan</span>
                                <span className="font-semibold text-lg">{session.results.scan.avgReactionTime}ms</span>
                              </div>
                            )}
                            {session.results.control && (
                              <div>
                                <span className="text-xs text-slate-600 block mb-1">Sigma Control</span>
                                <span className="font-semibold text-lg">{session.results.control.errors}</span>
                              </div>
                            )}
                            {session.results.focus && (
                              <div>
                                <span className="text-xs text-slate-600 block mb-1">Sigma Focus</span>
                                <span className="font-semibold text-lg">{Math.round(session.results.focus.accuracy)}%</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )) : [
                      {
                        id: "mock-1",
                        date: "2024-03-15",
                        conditions: "trening",
                        hrv: 68,
                        scan: 8.2,
                        control: 5,
                        focus: 72,
                        completed: 7
                      },
                      {
                        id: 2,
                        date: "2024-03-08",
                        conditions: "baseline",
                        hrv: 65,
                        scan: 8.5,
                        control: 6,
                        focus: 68,
                        completed: 7
                      },
                      {
                        id: 3,
                        date: "2024-03-01",
                        conditions: "trening",
                        hrv: 62,
                        scan: 9.1,
                        control: 7,
                        focus: 65,
                        completed: 6
                      },
                      {
                        id: 4,
                        date: "2024-02-23",
                        conditions: "mecz",
                        hrv: 60,
                        scan: 9.8,
                        control: 8,
                        focus: 62,
                        completed: 7
                      }
                    ].filter(session => 
                      conditionsFilter === 'wszystkie' || session.conditions === conditionsFilter
                    ).map((session) => (
                      <Card key={session.id} className="border-slate-200 hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/zawodnicy/${id}/sesja/${session.id}?task=overview`)}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {new Date(session.date).toLocaleDateString('pl-PL', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                              <Badge variant="outline" className="mt-1">
                                {session.conditions}
                              </Badge>
                            </div>
                            <Badge variant="secondary">
                              {session.completed}/7 testów
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <span className="text-xs text-slate-600 block mb-1">HRV Baseline</span>
                              <span className="font-semibold text-lg">{session.hrv}</span>
                            </div>
                            <div>
                              <span className="text-xs text-slate-600 block mb-1">Sigma Scan</span>
                              <span className="font-semibold text-lg">{session.scan}s</span>
                            </div>
                            <div>
                              <span className="text-xs text-slate-600 block mb-1">Sigma Control</span>
                              <span className="font-semibold text-lg">{session.control}</span>
                            </div>
                            <div>
                              <span className="text-xs text-slate-600 block mb-1">Sigma Focus</span>
                              <span className="font-semibold text-lg">{session.focus}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sigma Score */}
            <TabsContent value="sigma-score" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Porównanie pierwszego i ostatniego pomiaru</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-4">Pierwszy pomiar (23.02.2024)</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between p-3 bg-slate-50 rounded">
                          <span>HRV Baseline</span>
                          <span className="font-semibold">60</span>
                        </div>
                        <div className="flex justify-between p-3 bg-slate-50 rounded">
                          <span>Sigma Scan</span>
                          <span className="font-semibold">9.8s</span>
                        </div>
                        <div className="flex justify-between p-3 bg-slate-50 rounded">
                          <span>Sigma Control</span>
                          <span className="font-semibold">8</span>
                        </div>
                        <div className="flex justify-between p-3 bg-slate-50 rounded">
                          <span>Sigma Focus</span>
                          <span className="font-semibold">62%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-4">Ostatni pomiar (15.03.2024)</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between p-3 bg-green-50 rounded">
                          <span>HRV Baseline</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">68</span>
                            <span className="text-xs text-green-600">+13%</span>
                          </div>
                        </div>
                        <div className="flex justify-between p-3 bg-green-50 rounded">
                          <span>Sigma Scan</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">8.2s</span>
                            <span className="text-xs text-green-600">-16%</span>
                          </div>
                        </div>
                        <div className="flex justify-between p-3 bg-green-50 rounded">
                          <span>Sigma Control</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">5</span>
                            <span className="text-xs text-green-600">-37.5%</span>
                          </div>
                        </div>
                        <div className="flex justify-between p-3 bg-green-50 rounded">
                          <span>Sigma Focus</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">72%</span>
                            <span className="text-xs text-green-600">+16%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profil psychofizyczny</CardTitle>
                  <p className="text-sm text-muted-foreground">Porównanie aktualnych wyników</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={[
                      { category: 'HRV', value: 85, fullMark: 100 },
                      { category: 'Reakcja', value: 82, fullMark: 100 },
                      { category: 'Kontrola', value: 75, fullMark: 100 },
                      { category: 'Koncentracja', value: 78, fullMark: 100 },
                      { category: 'Mobilność', value: 70, fullMark: 100 }
                    ]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar name="Aktualne wyniki" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Mocne strony:</strong> HRV i czas reakcji - utrzymuj obecny poziom treningów.<br/>
                      <strong>Do rozwoju:</strong> Mobilność - rozważ zwiększenie treningów ruchowych.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Progres HRV Baseline</CardTitle>
                  <p className="text-sm text-muted-foreground">Wyższe wartości = lepsza regeneracja</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { date: '23.02', value: 60 },
                      { date: '01.03', value: 62 },
                      { date: '08.03', value: 65 },
                      { date: '15.03', value: 68 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Trend wzrostowy (+13%)</strong> - Świetna regeneracja! Zawodniczka systematycznie poprawia parametry HRV.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Progres Sigma Scan</CardTitle>
                  <p className="text-sm text-muted-foreground">Niższe wartości = szybsza reakcja</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { date: '23.02', value: 9.8 },
                      { date: '01.03', value: 9.1 },
                      { date: '08.03', value: 8.5 },
                      { date: '15.03', value: 8.2 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Postęp -16%</strong> - Znacząca poprawa czasu reakcji wizualnej!
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Progres Sigma Control</CardTitle>
                  <p className="text-sm text-muted-foreground">Niższe wartości = lepsza kontrola</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { date: '23.02', value: 8 },
                      { date: '01.03', value: 7 },
                      { date: '08.03', value: 6 },
                      { date: '15.03', value: 5 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Poprawa -37.5%</strong> - Wyraźny postęp w kontroli emocji i koncentracji!
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Progres Sigma Focus</CardTitle>
                  <p className="text-sm text-muted-foreground">Wyższe wartości = lepsza koncentracja</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { date: '23.02', value: 62 },
                      { date: '01.03', value: 65 },
                      { date: '08.03', value: 68 },
                      { date: '15.03', value: 72 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Wzrost +16%</strong> - Znacząca poprawa zdolności koncentracji!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Treningi */}
            <TabsContent value="treningi" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historia treningów</CardTitle>
                </CardHeader>
                <CardContent>
                  <TrainingsTable athleteId={id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Dialog edycji profilu */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Edytuj profil zawodnika</h2>
              <p className="text-slate-600 mt-1">Zaktualizuj dane osobowe i kontaktowe</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Imię i nazwisko</Label>
                <Input
                  id="name"
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">Data urodzenia</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={editedProfile.birthDate ? editedProfile.birthDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, birthDate: e.target.value ? new Date(e.target.value) : undefined })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="club">Klub</Label>
                <Input
                  id="club"
                  value={editedProfile.club}
                  onChange={(e) => setEditedProfile({ ...editedProfile, club: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discipline">Dyscyplina</Label>
                <Input
                  id="discipline"
                  value={editedProfile.discipline}
                  onChange={(e) => setEditedProfile({ ...editedProfile, discipline: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coach">Trener</Label>
                <Select
                  value={editedProfile.coach}
                  onValueChange={(value) => setEditedProfile({ ...editedProfile, coach: value })}
                >
                  <SelectTrigger id="coach">
                    <SelectValue placeholder={getClubCoaches().length > 0 ? "Wybierz trenera" : "Brak trenerów w klubie"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {getClubCoaches().map((coach: any, index: number) => (
                      <SelectItem key={index} value={coach.name}>
                        {coach.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getClubCoaches().length === 0 && (
                  <p className="text-xs text-muted-foreground">Dodaj trenerów w ustawieniach klubu</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email zawodnika</Label>
                <Input
                  id="email"
                  type="email"
                  value={editedProfile.email}
                  onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon zawodnika</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={editedProfile.phone}
                  onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentName">Imię i nazwisko rodzica</Label>
                <Input
                  id="parentName"
                  value={editedProfile.parentName}
                  onChange={(e) => setEditedProfile({ ...editedProfile, parentName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentEmail">Email rodzica</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={editedProfile.parentEmail}
                  onChange={(e) => setEditedProfile({ ...editedProfile, parentEmail: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentPhone">Telefon rodzica</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  value={editedProfile.parentPhone}
                  onChange={(e) => setEditedProfile({ ...editedProfile, parentPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                Anuluj
              </Button>
              <Button onClick={handleSaveProfile}>
                Zapisz zmiany
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pełnoekranowy Dialog dla gier */}
      <Dialog open={currentView !== 'kokpit'} onOpenChange={(open) => {
        if (!open) setCurrentView('kokpit');
      }}>
        <DialogContent className="w-screen h-screen max-w-none p-0 border-0 bg-slate-900" aria-describedby="session-wizard-description">
          <div className="sr-only">
            <h2 id="session-wizard-title">Kreator sesji pomiarowej</h2>
            <p id="session-wizard-description">Wypełnij kwestionariusze i wykonaj testy kognitywne</p>
          </div>
          
          {currentView === 'wizard' && (
            <SessionWizardNew
              athleteId={id || ''}
              onClose={() => setCurrentView('kokpit')}
              onSaveSession={handleSaveSessionFromWizard}
            />
          )}

          {/* Przycisk Powrót - zawsze widoczny ale nie podczas wizarda */}
          {currentView !== 'wizard' && (
            <Button 
              variant="ghost" 
              className="absolute top-4 left-4 z-50 text-white hover:bg-slate-800"
              onClick={() => setCurrentView('kokpit')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Powrót
            </Button>
          )}

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
