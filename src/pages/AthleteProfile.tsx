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
import MemoGame from "./MemoGame";
import SigmaFeedbackForm from "@/components/forms/SigmaFeedbackForm";
import Kwestionariusz from "@/components/forms/Kwestionariusz";
import HRVBaselineForm from "@/components/forms/HRVBaselineForm";
import SigmaMoveForm from "@/components/forms/SigmaMoveForm";
import HRVTrainingForm from "@/components/forms/HRVTrainingForm";
import TrainingsTable from "@/components/TrainingsTable";
import MeasurementSessionWizard from "@/components/MeasurementSessionWizard";
import { useAthletes } from "@/hooks/useAthletes";
import { useSessions } from "@/hooks/useSessions";
import { useTrainings } from "@/hooks/useTrainings";
import { useClubs } from "@/hooks/useClubs";
import { useToast } from "@/hooks/use-toast";

const AthleteProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Supabase hooks
  const { athletes: allAthletes, updateAthlete, refetch: refetchAthletes } = useAthletes();
  const { sessions, addSession, updateSession, refetch: refetchSessions } = useSessions(id);
  const { trainings, addTraining, refetch: refetchTrainings } = useTrainings(id);
  const { clubs } = useClubs();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "informacje";
  const activeSubTab = searchParams.get("subtab") || "sigma-score";
  
  const [sessionA, setSessionA] = useState("baseline-m1");
  const [sessionB, setSessionB] = useState("ewaluacja-m7");
  
  const [currentView, setCurrentView] = useState('kokpit');
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [measurementConditions, setMeasurementConditions] = useState('gabinet');
  const [selectedChallengeType, setSelectedChallengeType] = useState('');
  
  const [taskStatus, setTaskStatus] = useState({
    six_sigma: 'pending',
    hrv_baseline: 'pending',
    scan: 'pending',
    focus: 'pending',
    memo: 'pending',
    feedback: 'pending'
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

  // Pobierz dane zawodnika z Supabase
  const athleteData = allAthletes.find((a) => a.id === id);
  const athlete = athleteData ? {
    name: `${athleteData.last_name} ${athleteData.first_name}`,
    club: clubs.find(c => c.id === athleteData.club_id)?.name || '',
    clubId: athleteData.club_id,
    coach: athleteData.coach || '',
    discipline: athleteData.discipline || '',
    email: athleteData.email || '',
    phone: athleteData.phone || '',
    birthYear: athleteData.birth_year,
    birthDate: athleteData.birth_date,
    notes: athleteData.notes || '',
    notesHistory: (athleteData.notes_history as any[]) || [],
    parentName: `${athleteData.parent_first_name || ''} ${athleteData.parent_last_name || ''}`.trim(),
    parentPhone: athleteData.parent_phone || '',
    parentEmail: athleteData.parent_email || '',
    createdAt: athleteData.created_at,
  } : {
    name: "Nieznany zawodnik",
    club: "",
    clubId: null,
    coach: "",
    discipline: "",
    email: "",
    phone: "",
    birthYear: 0,
    birthDate: "",
    notes: "",
    notesHistory: [],
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    createdAt: "",
  };

  // Pobierz listę trenerów z klubu zawodnika
  const clubData = clubs.find((c) => c.id === athlete.clubId);
  const getClubCoaches = () => {
    return (clubData?.coaches as any[]) || [];
  };

  // Sync reportTab with URL subtab parameter
  useEffect(() => {
    setReportTab(activeSubTab);
  }, [activeSubTab]);

  // Load sessions from Supabase
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      const athleteSessions = sessions
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setSavedSessions(athleteSessions);
      
      console.log(`📊 Loaded ${athleteSessions.length} sessions for athlete ${id}`);
    }
  }, [sessions, id]);

  const handleMeasurementTaskComplete = async (taskName: string, data: any) => {
    console.log(`✅ Measurement task "${taskName}" completed:`, data);
    
    // Transform kwestionariusz data to six_sigma format if needed
    let transformedResults = { ...sessionResults };
    
    if (taskName === 'kwestionariusz' && data.responses) {
      // Transform questionnaire responses to six_sigma format
      const responses = data.responses;
      
      // Calculate competency scores (6 competencies)
      const competencies = ['scan', 'focus', 'control', 'track', 'back', 'memo'];
      const competencyScores = competencies.map(comp => {
        const compResponses = responses.filter((r: any) => r.competency === comp);
        const rawScore = compResponses.reduce((sum: number, r: any) => sum + r.value, 0);
        const maxScore = compResponses.length * 5; // Each question max is 5
        return {
          competency: comp,
          rawScore,
          maxScore,
          normalizedScore: maxScore > 0 ? rawScore / maxScore : 0
        };
      });
      
      // Calculate overall score
      const totalRaw = competencyScores.reduce((sum, c) => sum + c.rawScore, 0);
      const totalMax = competencyScores.reduce((sum, c) => sum + c.maxScore, 0);
      const overallScore = totalMax > 0 ? totalRaw / totalMax : 0;
      
      // Save as six_sigma (not kwestionariusz)
      transformedResults.six_sigma = {
        overallScore,
        competencyScores,
        responses,
        completedAt: data.completedAt,
        modifierScores: data.modifierScores || [],
        validation: data.validation || {
          isValid: true,
          warnings: [],
          flags: {
            straightLining: false,
            reverseInconsistency: false,
            speedingDetected: false
          }
        }
      };
    } else if (taskName === 'focus' && data.focus_accuracy_pct !== undefined) {
      // Transform focus data to include both formats
      transformedResults.focus = {
        ...data,
        accuracy: data.focus_accuracy_pct, // Add shorthand for display
        totalTrials: data.focus_total_trials,
        correctCount: data.focus_correct_count,
        coachReport: data.focus_coach_report
      };
    } else {
      transformedResults[taskName] = data;
    }
    
    // Update task status (use six_sigma for display)
    const statusKey = taskName === 'kwestionariusz' ? 'six_sigma' : taskName;
    const updatedStatus = { ...taskStatus, [statusKey]: 'completed' };
    
    setTaskStatus(updatedStatus);
    setSessionResults(transformedResults);
    
    // Auto-save to Supabase after each task
    if (currentSessionId) {
      const { error } = await updateSession(currentSessionId, {
        results: transformedResults,
        conditions: measurementConditions,
      });
      
      if (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się zapisać wyniku",
          variant: "destructive",
        });
      } else {
        await refetchSessions();
      }
    } else {
      const { data: newSession, error } = await addSession({
        athlete_id: id!,
        date: new Date().toISOString(),
        results: transformedResults,
        conditions: measurementConditions,
        in_progress: true,
      });
      
      if (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się utworzyć sesji",
          variant: "destructive",
        });
      } else if (newSession) {
        setCurrentSessionId(newSession.id);
        await refetchSessions();
      }
    }
    
    console.log(`📊 Task status updated:`, updatedStatus);
    
    // Return to cockpit
    setActiveTask(null);
    setCurrentView('kokpit');
  };

  const handleTrainingTaskComplete = async (data: any) => {
    const taskName = currentView
      .replace('showing_', '')
      .replace('playing_', '')
      .replace('measuring_', '');
    
    // Check if this is a training session
    const currentTrainingStr = localStorage.getItem('current_training');
    if (currentTrainingStr && currentView.startsWith('playing_')) {
      // This is a training session - save to Supabase
      const currentTraining = JSON.parse(currentTrainingStr);
      
      const { error } = await addTraining({
        athlete_id: id!,
        task_type: taskName,
        date: new Date().toISOString(),
        results: {
          ...currentTraining,
          results: data,
          completedAt: new Date().toISOString()
        }
      });
      
      if (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się zapisać treningu",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sukces",
          description: "Trening został zapisany",
        });
        await refetchTrainings();
      }
      
      localStorage.removeItem('current_training');
      console.log('Trening zapisany do Supabase');
      setCurrentView('kokpit');
      return;
    }
  };

  const handleSaveSessionFromWizard = async (wizardResults: any) => {
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
      // Find Six Sigma Mood (context modifiers)
      const sixSigmaMood = scoredQuestionnaires.find((q: any) => 
        q.questionnaireId === 'six_sigma_mood'
      );
      
      if (sixSigmaFull) {
        console.log('✅ Znaleziono Six Sigma Full:', {
          completionTime: sixSigmaFull.completionTimeSeconds,
          responsesCount: sixSigmaFull.responses?.length,
          validation: sixSigmaFull.validation
        });
        
        // Extract completion time from scored questionnaire (tylko część 6x6)
        const completionTime = sixSigmaFull.completionTimeSeconds || 0;
        
        // Base competency scores z pełnej baterii
        const mappedCompetencies = sixSigmaFull.competencyScores.map((comp: any) => ({
          competency: comp.competencyId,
          name: comp.competencyName,
          rawScore: comp.rawScore,
          maxScore: comp.maxPossibleScore,
          normalizedScore: comp.normalizedScore / 100, // 0-100 -> 0-1
          interpretation: getScoreInterpretation(comp.normalizedScore)
        }));

        // Modifiers mogą pochodzić z Mood (preferowane) albo z tej samej baterii, jeśli kiedyś dodamy
        const moodModifiers = sixSigmaMood?.modifierScores || [];
        const baseModifiers = sixSigmaFull.modifierScores || [];
        const allModifiers = [...baseModifiers, ...moodModifiers];

        const mappedModifiers = allModifiers.map((mod: any) => ({
          modifier: mod.modifierId,
          name: mod.modifierName,
          rawScore: mod.rawValue,
          maxScore: 5,
          normalizedScore: mod.normalizedScore / 100,
          impact: getModifierImpact(mod.normalizedScore)
        }));
        
        // Połącz surowe odpowiedzi z pełnej baterii i Mood (żeby eksport miał komplet kontekstu)
        const fullResponses = sixSigmaFull.responses || [];
        const moodResponses = sixSigmaMood?.responses || [];
        const allResponses = [...fullResponses, ...moodResponses];
        
        // Transform scored questionnaire to session format
        sixSigmaResults = {
          version: '6x6+6',
          questionnaireName: sixSigmaFull.questionnaireName,
          completionDate: sixSigmaFull.completedAt,
          completionTimeSeconds: completionTime,
          responses: allResponses,
          competencyScores: mappedCompetencies,
          modifierScores: mappedModifiers,
          validation: sixSigmaFull.validation || {
            isValid: true,
            warnings: [],
            flags: {
              straightLining: false,
              reverseInconsistency: false,
              speedingDetected: false
            }
          }
        };
      }
    }
    
    // Combine wizard results with sixSigmaResults
    const resultsToSave = {
      ...wizardResults,
      six_sigma: sixSigmaResults
    };
    
    // Determine which tasks were completed
    const updatedTaskStatus = {
      six_sigma: sixSigmaResults ? 'completed' : 'pending',
      hrv_baseline: wizardResults.hrv_baseline ? 'completed' : 'pending',
      scan: wizardResults.scan ? 'completed' : 'pending',
      focus: wizardResults.focus ? 'completed' : 'pending',
      memo: wizardResults.memo ? 'completed' : 'pending',
      feedback: wizardResults.feedback ? 'completed' : 'pending'
    };
    
    const sessionId = currentSessionId || `session_${Date.now()}`;
    
    // Save to Supabase
    if (currentSessionId) {
      const { error } = await updateSession(currentSessionId, {
        results: resultsToSave as any,
        in_progress: true
      });
      
      if (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się zapisać sesji",
          variant: "destructive",
        });
        return;
      }
    } else {
      const { data: newSession, error } = await addSession({
        athlete_id: id!,
        date: new Date().toISOString(),
        results: resultsToSave as any,
        conditions: measurementConditions,
        in_progress: true
      });
      
      if (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się utworzyć sesji",
          variant: "destructive",
        });
        return;
      }
      
      if (newSession) {
        setCurrentSessionId(newSession.id);
      }
    }
    
    await refetchSessions();
    
    // Update local state
    setTaskStatus(updatedTaskStatus);
    setSessionResults(resultsToSave);
    
    console.log('✅ Sesja zapisana pomyślnie, powrót do kokpitu');
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

  const handleSaveSession = async () => {
    if (!currentSessionId) return;
    
    // Finalize session (remove "inProgress" flag)
    const { error } = await updateSession(currentSessionId, {
      in_progress: false,
      completed_at: new Date().toISOString()
    });
    
    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zakończyć sesji",
        variant: "destructive",
      });
      return;
    }
    
    await refetchSessions();

    // Navigate to reports
    setSearchParams({ tab: 'raporty' });
    
    // Reset session
    setCurrentSessionId(null);
    setSessionResults({});
    setTaskStatus({
      six_sigma: 'pending',
      hrv_baseline: 'pending',
      scan: 'pending',
      focus: 'pending',
      memo: 'pending',
      feedback: 'pending'
    });
    setSelectedChallengeType('');
    
    toast({
      title: "Sukces",
      description: "Sesja pomiarowa została zakończona",
    });
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !athleteData) return;
    
    const currentDate = new Date().toISOString();
    const noteEntry = {
      date: currentDate,
      text: newNote.trim(),
      timestamp: currentDate
    };
    
    const updatedNotesHistory = [...athlete.notesHistory, noteEntry];
    
    const { error } = await updateAthlete(athleteData.id, {
      notes_history: updatedNotesHistory as any
    });
    
    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać notatki",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sukces",
        description: "Notatka została dodana",
      });
      setNewNote('');
      await refetchAthletes();
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

  const handleSaveProfile = async () => {
    if (!athleteData) return;
    
    const [firstName, ...lastNameParts] = editedProfile.name.split(' ').reverse();
    const lastName = lastNameParts.reverse().join(' ');
    
    const updates = {
      first_name: firstName,
      last_name: lastName,
      coach: editedProfile.coach,
      discipline: editedProfile.discipline,
      email: editedProfile.email,
      phone: editedProfile.phone,
      parent_first_name: editedProfile.parentName.split(' ')[0] || '',
      parent_last_name: editedProfile.parentName.split(' ').slice(1).join(' ') || '',
      parent_phone: editedProfile.parentPhone,
      parent_email: editedProfile.parentEmail,
      birth_date: editedProfile.birthDate?.toISOString().split('T')[0],
      birth_year: editedProfile.birthDate?.getFullYear(),
    };
    
    const { error } = await updateAthlete(athleteData.id, updates);
    
    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać profilu",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sukces",
        description: "Profil został zaktualizowany",
      });
      setIsEditingProfile(false);
      await refetchAthletes();
    }
  };

  const handleEditNote = (index: number, text: string) => {
    setEditingNoteIndex(index);
    setEditedNoteText(text);
  };

  const handleSaveEditedNote = async () => {
    if (editingNoteIndex === null || !editedNoteText.trim() || !athleteData) return;
    
    const updatedNotesHistory = [...athlete.notesHistory];
    updatedNotesHistory[editingNoteIndex] = {
      ...updatedNotesHistory[editingNoteIndex],
      text: editedNoteText.trim()
    };
    
    const { error } = await updateAthlete(athleteData.id, {
      notes_history: updatedNotesHistory as any
    });
    
    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać notatki",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sukces",
        description: "Notatka została zaktualizowana",
      });
      setEditingNoteIndex(null);
      setEditedNoteText('');
      await refetchAthletes();
    }
  };

  const handleDeleteNote = async (index: number) => {
    if (!athleteData) return;
    
    const updatedNotesHistory = athlete.notesHistory.filter((_, i) => i !== index);
    
    const { error } = await updateAthlete(athleteData.id, {
      notes_history: updatedNotesHistory as any
    });
    
    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć notatki",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sukces",
        description: "Notatka została usunięta",
      });
      await refetchAthletes();
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
                {/* Six Sigma Questionnaire */}
                <Card className={`cursor-pointer transition-all ${taskStatus.six_sigma === 'completed' ? 'bg-green-50 border-green-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">Six Sigma</h3>
                      {taskStatus.six_sigma === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </div>
                    <p className="text-sm text-slate-600 mb-4">Ocena psychometryczna</p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => setActiveTask('kwestionariusz')}
                    >
                      {taskStatus.six_sigma === 'completed' ? 'Powtórz' : 'Rozpocznij'}
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
                      onClick={() => setActiveTask('hrv_baseline')}
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
                      onClick={() => setActiveTask('scan')}
                    >
                      {taskStatus.scan === 'completed' ? 'Powtórz' : 'Rozpocznij'}
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
                      onClick={() => setActiveTask('focus')}
                    >
                      {taskStatus.focus === 'completed' ? 'Powtórz' : 'Rozpocznij'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Memo */}
                <Card className={`cursor-pointer transition-all ${taskStatus.memo === 'completed' ? 'bg-green-50 border-green-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">Sigma Memo</h3>
                      {taskStatus.memo === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </div>
                    <p className="text-sm text-slate-600 mb-4">Test pamięci roboczej 2-Back</p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => setActiveTask('memo')}
                    >
                      {taskStatus.memo === 'completed' ? 'Powtórz' : 'Rozpocznij'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Feedback */}
                <Card className={`cursor-pointer transition-all ${taskStatus.feedback === 'completed' ? 'bg-green-50 border-green-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">Sigma Feedback</h3>
                      {taskStatus.feedback === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    </div>
                    <p className="text-sm text-slate-600 mb-4">Twoja refleksja po dzisiejszych wyzwaniach</p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => setActiveTask('feedback')}
                    >
                      {taskStatus.feedback === 'completed' ? 'Edytuj' : 'Wypełnij'}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <Button 
                  size="lg"
                  onClick={handleSaveSession}
                >
                  Zakończ i Zapisz Sesję
                </Button>
              </div>

              {/* Debug Panel - tylko w dev */}
              {import.meta.env.DEV && (
                <div className="mt-6 p-4 bg-slate-100 border-2 border-slate-300 rounded-lg">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">🔧 Debug Panel (dev only)</h3>
                  
                  <div className="space-y-3 text-xs font-mono">
                    <div>
                      <div className="font-semibold text-slate-700 mb-1">Current Session ID:</div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        {currentSessionId || 'null'}
                      </div>
                    </div>

                    <div>
                      <div className="font-semibold text-slate-700 mb-1">Task Status:</div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(taskStatus, null, 2)}</pre>
                      </div>
                    </div>

                    <div>
                      <div className="font-semibold text-slate-700 mb-1">Session Results:</div>
                      <div className="bg-white p-2 rounded border border-slate-200 max-h-48 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(sessionResults, null, 2)}</pre>
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-semibold text-slate-700 mb-1">Saved Sessions in Supabase:</div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        {savedSessions.length} sessions for athlete {id}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                      onClick={() => {
                        const training = {
                          id: `training_scan_${Date.now()}`,
                          athlete_id: id,
                          athlete_name: athlete.name,
                          game_type: 'scan',
                          game_name: 'Sigma Scan',
                          date: new Date().toISOString(),
                          results: {}
                        };
                        localStorage.setItem('current_training', JSON.stringify(training));
                        setCurrentView('playing_scan');
                      }}
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

                {/* Memo */}
                <Card className="bg-slate-50 hover:bg-slate-100 border-slate-200 cursor-pointer transition-all">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Sigma Memo</h3>
                    <p className="text-sm text-slate-600 mb-4">Trening pamięci roboczej 2-Back</p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        const training = {
                          id: `training_memo_${Date.now()}`,
                          athlete_id: id,
                          athlete_name: athlete.name,
                          game_type: 'memo',
                          game_name: 'Sigma Memo',
                          date: new Date().toISOString(),
                          results: {}
                        };
                        localStorage.setItem('current_training', JSON.stringify(training));
                        setCurrentView('playing_memo');
                      }}
                    >
                      Zagraj
                    </Button>
                  </CardContent>
                </Card>

                {/* Sigma Move */}
                <Card className="bg-slate-50 hover:bg-slate-100 border-slate-200 cursor-pointer transition-all">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Sigma Move</h3>
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
                        onClick={() => setCurrentView('training_move')}
                      >
                        Zagraj
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* HRV Training */}
                <Card className="bg-slate-50 hover:bg-slate-100 border-slate-200 cursor-pointer transition-all">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">HRV Training</h3>
                    <p className="text-sm text-slate-600 mb-4">HRV pod obciążeniem</p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => setCurrentView('training_hrv')}
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
              <TabsTrigger value="sigma-score">Sigma Score</TabsTrigger>
              <TabsTrigger value="historia">Historia sesji</TabsTrigger>
              <TabsTrigger value="treningi">Raporty treningowe</TabsTrigger>
            </TabsList>

            {/* Historia sesji */}
            <TabsContent value="historia" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Historia pomiarów</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          await refetchSessions();
                          toast({
                            title: "Odświeżono",
                            description: `Znaleziono ${sessions.length} sesji`,
                          });
                        }}
                      >
                        🔄 Odśwież historię
                      </Button>
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
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {savedSessions.length > 0 ? (
                      savedSessions
                        .filter(session => 
                          conditionsFilter === 'wszystkie' || session.conditions === conditionsFilter
                        )
                        .map((session) => (
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
                                  <div className="flex gap-2 mt-1">
                                    <Badge variant="outline">
                                      {session.conditions}
                                    </Badge>
                                    {session.in_progress && (
                                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                        ⏳ W trakcie
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Badge variant="secondary">
                                  {session.results ? Object.keys(session.results).length : 0} testów
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {session.results?.six_sigma && (
                                  <div>
                                    <span className="text-xs text-slate-600 block mb-1">Six Sigma</span>
                                    <span className="font-semibold text-lg">{Math.round((session.results.six_sigma.overallScore || 0) * 100)}%</span>
                                  </div>
                                )}
                                {session.results?.hrv_baseline && (
                                  <div>
                                    <span className="text-xs text-slate-600 block mb-1">HRV Baseline</span>
                                    <span className="font-semibold text-lg">{session.results.hrv_baseline.rMSSD || session.results.hrv_baseline.hrv || 'N/A'}</span>
                                  </div>
                                )}
                                {session.results?.scan && (
                                  <div>
                                    <span className="text-xs text-slate-600 block mb-1">Sigma Scan</span>
                                    <span className="font-semibold text-lg">{session.results.scan.scan_max_number_reached ?? session.results.scan.maxNumber ?? 'N/A'}</span>
                                  </div>
                                )}
                                {session.results?.focus && (
                                  <div>
                                    <span className="text-xs text-slate-600 block mb-1">Sigma Focus</span>
                                    <span className="font-semibold text-lg">{Math.round(session.results.focus.accuracy || session.results.focus.focus_accuracy_pct || 0)}%</span>
                                  </div>
                                )}
                                {session.results?.memo && (
                                  <div>
                                    <span className="text-xs text-slate-600 block mb-1">Sigma Memo</span>
                                    <span className="font-semibold text-lg">{Math.round(session.results.memo.accuracy || session.results.memo.memo_accuracy_pct || 0)}%</span>
                                  </div>
                                )}
                                {session.results?.feedback && (
                                  <div>
                                    <span className="text-xs text-slate-600 block mb-1">Feedback</span>
                                    <span className="font-semibold text-lg">✓</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                    ) : (
                      <Card className="border-slate-200">
                        <CardContent className="p-8 text-center">
                          <p className="text-slate-500 mb-4">Brak sesji pomiarowych</p>
                          <Button 
                            onClick={() => {
                              setCurrentView('kokpit');
                              setSearchParams({ tab: 'dodaj-pomiar' });
                            }}
                            className="gap-2"
                          >
                            Dodaj pierwszy pomiar
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sigma Score - Latest Session Report */}
            <TabsContent value="sigma-score" className="space-y-6">
              {(() => {
                // Get latest session from Supabase
                const latestSession = savedSessions[0];

                if (!latestSession) {
                  return (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-slate-600 mb-4">Brak sesji pomiarowych</p>
                        <Button onClick={() => {
                          setSearchParams({ tab: 'dodaj-pomiar' });
                        }}>
                          Dodaj pierwszy pomiar
                        </Button>
                      </CardContent>
                    </Card>
                  );
                }

                const interpretation = latestSession.results?.sigma_score_interpretation;

                return (
                  <>
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Sigma Score Intelligence</CardTitle>
                            <p className="text-sm text-slate-600 mt-1">
                              Raport AI z ostatniej sesji pomiarowej •{' '}
                              {new Date(latestSession.date).toLocaleDateString('pl-PL', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/zawodnicy/${id}/sesja/${latestSession.id}?task=sigma_score`)}
                          >
                            Szczegóły sesji
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {!interpretation ? (
                          <div className="text-center py-12">
                            <p className="text-slate-600 mb-6">
                              Interpretacja AI nie została jeszcze wygenerowana dla tej sesji
                            </p>
                            <Button
                              onClick={() => navigate(`/zawodnicy/${id}/sesja/${latestSession.id}?task=sigma_score`)}
                            >
                              Wygeneruj Sigma Score
                            </Button>
                          </div>
                        ) : (
                          <Tabs defaultValue="zawodnik" className="w-full">
                            <TabsList className="mb-6">
                              <TabsTrigger value="zawodnik">Dla Zawodnika</TabsTrigger>
                              <TabsTrigger value="trener">Dla Trenera</TabsTrigger>
                            </TabsList>

                            <TabsContent value="zawodnik" className="space-y-6">
                              {/* Overall Assessment */}
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-lg">
                                <h3 className="font-bold text-lg text-slate-900 mb-3">Ogólna ocena</h3>
                                <p className="text-slate-700 leading-relaxed">
                                  {interpretation.overall_assessment}
                                </p>
                              </div>

                              {/* Key Observations */}
                              {interpretation.key_observations?.length > 0 && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Kluczowe obserwacje</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    {interpretation.key_observations.map((obs: any, idx: number) => (
                                      <div key={idx} className="border-l-4 border-primary pl-4">
                                        <h4 className="font-semibold text-slate-900 mb-1">{obs.competency}</h4>
                                        <p className="text-sm text-slate-700 mb-2">{obs.finding}</p>
                                        <p className="text-xs text-slate-600 italic">
                                          Dowód: {obs.evidence}
                                        </p>
                                      </div>
                                    ))}
                                  </CardContent>
                                </Card>
                              )}

                              {/* Recommendations */}
                              {interpretation.recommendations?.length > 0 && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Rekomendacje treningowe</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    {interpretation.recommendations.map((rec: any, idx: number) => (
                                      <div key={idx} className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                        <h4 className="font-semibold text-green-900 mb-2">{rec.competency}</h4>
                                        <p className="text-sm text-green-800 mb-2">{rec.action}</p>
                                        <p className="text-xs text-green-700">Dlaczego: {rec.why}</p>
                                      </div>
                                    ))}
                                  </CardContent>
                                </Card>
                              )}
                            </TabsContent>

                            <TabsContent value="trener" className="space-y-6">
                              {/* Overall Assessment */}
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-lg">
                                <h3 className="font-bold text-lg text-slate-900 mb-3">Ogólna ocena</h3>
                                <p className="text-slate-700 leading-relaxed">
                                  {interpretation.overall_assessment}
                                </p>
                              </div>

                              {/* Key Observations */}
                              {interpretation.key_observations?.length > 0 && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Kluczowe obserwacje</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    {interpretation.key_observations.map((obs: any, idx: number) => (
                                      <div key={idx} className="border-l-4 border-primary pl-4">
                                        <h4 className="font-semibold text-slate-900 mb-1">{obs.competency}</h4>
                                        <p className="text-sm text-slate-700 mb-2">{obs.finding}</p>
                                        <p className="text-xs text-slate-600 italic mb-2">
                                          Dowód: {obs.evidence}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                          <strong>Interpretacja:</strong> {obs.interpretation}
                                        </p>
                                      </div>
                                    ))}
                                  </CardContent>
                                </Card>
                              )}

                              {/* Recommendations */}
                              {interpretation.recommendations?.length > 0 && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Rekomendacje treningowe</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    {interpretation.recommendations.map((rec: any, idx: number) => (
                                      <div key={idx} className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                        <h4 className="font-semibold text-green-900 mb-2">{rec.competency}</h4>
                                        <p className="text-sm text-green-800 mb-2">{rec.action}</p>
                                        <p className="text-xs text-green-700">Dlaczego: {rec.why}</p>
                                      </div>
                                    ))}
                                  </CardContent>
                                </Card>
                              )}

                              {/* Contextual Factors */}
                              {interpretation.contextual_factors?.length > 0 && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Czynniki kontekstowe</CardTitle>
                                    <p className="text-sm text-slate-600">
                                      Modyfikatory środowiskowe i stanowe
                                    </p>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    {interpretation.contextual_factors.map((factor: any, idx: number) => (
                                      <div key={idx} className="bg-amber-50 border border-amber-200 p-3 rounded">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Badge variant="outline">{factor.modifier}</Badge>
                                          <span className="text-sm text-slate-700">{factor.impact}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 ml-2">{factor.recommendation}</p>
                                      </div>
                                    ))}
                                  </CardContent>
                                </Card>
                              )}

                              {/* Attention Areas */}
                              {interpretation.attention_areas?.length > 0 && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Obszary wymagające uwagi trenera</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <ul className="space-y-2">
                                      {interpretation.attention_areas.map((area: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2">
                                          <span className="text-red-500 mt-1">⚠️</span>
                                          <span className="text-sm text-slate-700">{area}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Convergence Analysis */}
                              {interpretation.convergence_analysis && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Analiza zbieżności</CardTitle>
                                    <p className="text-sm text-slate-600">
                                      Porównanie samooceny vs. wyników poznawczych
                                    </p>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                      <div className="flex items-center gap-3 mb-3">
                                        <Badge 
                                          variant={
                                            interpretation.convergence_analysis.alignment_score === 'high' 
                                              ? 'default' 
                                              : interpretation.convergence_analysis.alignment_score === 'medium'
                                              ? 'secondary'
                                              : 'destructive'
                                          }
                                        >
                                          {interpretation.convergence_analysis.alignment_score === 'high' 
                                            ? 'Wysoka zbieżność' 
                                            : interpretation.convergence_analysis.alignment_score === 'medium'
                                            ? 'Średnia zbieżność'
                                            : 'Niska zbieżność'}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-slate-700">
                                        {interpretation.convergence_analysis.notes}
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </TabsContent>
                          </Tabs>
                        )}
                      </CardContent>
                    </Card>
                  </>
                );
              })()}
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

      {/* Measurement Task Dialog */}
      <Dialog open={activeTask !== null} onOpenChange={(open) => {
        if (!open) setActiveTask(null);
      }}>
        <DialogContent className="w-screen h-screen max-w-none p-0 border-0 bg-slate-900" aria-describedby="measurement-task-description">
          <div className="sr-only">
            <h2 id="measurement-task-title">Pomiar</h2>
            <p id="measurement-task-description">Wykonaj wybrany test</p>
          </div>
          
          {activeTask && (
            <MeasurementSessionWizard
              taskType={activeTask as any}
              onComplete={handleMeasurementTaskComplete}
              onCancel={() => setActiveTask(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Training Games Dialog */}
      <Dialog open={currentView !== 'kokpit' && !activeTask} onOpenChange={(open) => {
        if (!open) setCurrentView('kokpit');
      }}>
        <DialogContent className="w-screen h-screen max-w-none p-0 border-0 bg-slate-900" aria-describedby="training-game-description">
          <div className="sr-only">
            <h2 id="training-game-title">Trening</h2>
            <p id="training-game-description">Graj w trybie treningowym</p>
          </div>

          {/* Przycisk Powrót dla treningów */}
          {currentView.startsWith('playing_') && (
            <Button 
              variant="ghost" 
              className="absolute top-4 left-4 z-50 text-white hover:bg-slate-800"
              onClick={() => setCurrentView('kokpit')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Powrót
            </Button>
          )}

          {currentView === 'playing_scan' && (
            <ScanGame onComplete={handleTrainingTaskComplete} />
          )}

          {currentView === 'playing_control' && (
            <ControlGame onComplete={handleTrainingTaskComplete} />
          )}

          {currentView === 'playing_focus' && (
            <FocusGame onComplete={handleTrainingTaskComplete} />
          )}

          {currentView === 'playing_memo' && (
            <MemoGame onComplete={handleTrainingTaskComplete} />
          )}

          {currentView === 'training_move' && (
            <SigmaMoveForm 
              challengeType={selectedChallengeType} 
              onComplete={handleTrainingTaskComplete} 
            />
          )}

          {currentView === 'training_hrv' && (
            <HRVTrainingForm onComplete={handleTrainingTaskComplete} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AthleteProfile;
