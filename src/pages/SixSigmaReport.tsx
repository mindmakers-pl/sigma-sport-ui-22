import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function SixSigmaReport() {
  const { athleteId, sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [athlete, setAthlete] = useState<any>(null);

  useEffect(() => {
    const sessions = JSON.parse(localStorage.getItem('athlete_sessions') || '[]');
    const foundSession = sessions.find((s: any) => s.id === sessionId);
    setSession(foundSession);

    const athletes = JSON.parse(localStorage.getItem('athletes') || '[]');
    const foundAthlete = athletes.find((a: any) => a.id === parseInt(athleteId || "0"));
    setAthlete(foundAthlete);
  }, [athleteId, sessionId]);

  if (!session || !athlete || !session.results.six_sigma) {
    return (
      <div className="p-8">
        <p>Ładowanie...</p>
      </div>
    );
  }

  const sixSigmaData = session.results.six_sigma;
  const { competencyScores, modifierScores, overallScore, validation } = sixSigmaData;

  // Find strongest and weakest competencies
  const sortedCompetencies = [...competencyScores].sort((a, b) => b.normalizedScore - a.normalizedScore);
  const strongest = sortedCompetencies[0];
  const weakest = sortedCompetencies[sortedCompetencies.length - 1];

  // Generate rule-based interpretation
  const generateAthleteInterpretation = () => {
    const insights: string[] = [];
    
    // Check validation first
    if (!validation.isValid) {
      insights.push("⚠️ Wykryto niespójności w odpowiedziach. Wyniki mogą być mało wiarygodne.");
    }

    // Strength-based feedback - treating self-report as perception
    insights.push(`Dobrze widzieć, że czujesz się mocny/a w obszarze ${strongest.name}! To silna podstawa, na której możesz budować inne kompetencje.`);

    // Weakest area with context - perception-based language
    if (weakest.normalizedScore < 0.6) {
      const sleepModifier = modifierScores.find(m => m.modifier === 'sleep');
      const stressModifier = modifierScores.find(m => m.modifier === 'stress');
      
      let weaknessExplanation = `Zauważamy, że w obszarze ${weakest.name} czujesz, że masz jeszcze przestrzeń do rozwoju.`;
      
      if (sleepModifier && sleepModifier.normalizedScore <= 0.4) {
        weaknessExplanation += " Zwróć uwagę, że niewystarczający sen może wpływać na to, jak oceniasz swoje kompetencje.";
      }
      if (stressModifier && stressModifier.normalizedScore <= 0.4) {
        weaknessExplanation += " Wysoki stres pozasportowy też może wpływać na Twoją percepcję własnych możliwości.";
      }
      
      insights.push(weaknessExplanation);
    }

    // Specific competency advice - perception-based
    competencyScores.forEach(comp => {
      if (comp.normalizedScore >= 0.85) {
        // High scores - positive reinforcement with perception language
        if (comp.competency === 'focus') {
          insights.push("Dobrze widzieć, że czujesz, że łatwo utrzymujesz koncentrację mimo rozpraszaczy - to oznacza, że wypracowałeś/aś silne umiejętności uwagi!");
        }
        if (comp.competency === 'reset') {
          insights.push("Dobrze widzieć, że czujesz, że szybko wracasz do gry po błędach - to oznacza wysoką odporność psychiczną!");
        }
        if (comp.competency === 'control') {
          insights.push("Dobrze widzieć, że czujesz, że złe decyzje sędziego nie wyprowadzają Cię z równowagi - to oznacza dojrzałą kontrolę emocjonalną!");
        }
        if (comp.competency === 'confidence') {
          insights.push("Dobrze widzieć, że wierzysz w swoje umiejętności - to mocny fundament sukcesu sportowego!");
        }
      } else if (comp.normalizedScore < 0.5) {
        // Low scores - actionable suggestions
        if (comp.competency === 'activation') {
          insights.push("💡 Aktywacja: Jeśli czujesz, że brakuje Ci energii przed startem, spróbuj energicznej muzyki lub krótkiej wizualizacji dynamicznej akcji.");
        }
        if (comp.competency === 'control') {
          insights.push("💡 Kontrola: Gdy czujesz presję, spróbuj techniki oddechu 4-7-8 (wdech 4s, zatrzymaj 7s, wydech 8s) - pomoże to uspokoić ciało i umysł.");
        }
        if (comp.competency === 'reset') {
          insights.push("💡 Reset: Po błędzie weź dwa głębokie oddechy i skup wzrok na piłce/punkcie odniesienia - to pomoże Ci szybciej wrócić do gry.");
        }
        if (comp.competency === 'focus') {
          insights.push("💡 Focus: Ćwicz koncentrację poprzez krótkie sesje mindfulness (5 min dziennie) - regularność przynosi efekty!");
        }
      }
    });

    return insights;
  };

  const generateCoachInterpretation = () => {
    const insights: string[] = [];
    
    // Data quality check
    if (validation.isStraightLining) {
      insights.push("🚨 UWAGA: Wykryto straight-lining (wszystkie odpowiedzi identyczne). Wyniki nierzetelne.");
      return insights;
    }

    if (validation.hasReverseInconsistency) {
      insights.push("⚠️ Niespójności w pytaniach odwrotnych - możliwe nieprzemyślane odpowiedzi.");
    }

    // Flow/enjoyment check for burnout
    const flowModifier = modifierScores.find(m => m.modifier === 'flow');
    if (flowModifier && flowModifier.normalizedScore <= 0.2 && overallScore < 0.6) {
      insights.push("🚨 ALERT: Niski Flow + niskie kompetencje sugerują wypalenie. Zalecana rozmowa z zawodnikiem.");
    }

    // Pattern recognition
    const activation = competencyScores.find(c => c.competency === 'activation')!;
    const control = competencyScores.find(c => c.competency === 'control')!;
    const focus = competencyScores.find(c => c.competency === 'focus')!;
    const reset = competencyScores.find(c => c.competency === 'reset')!;
    const confidence = competencyScores.find(c => c.competency === 'confidence')!;
    const determination = competencyScores.find(c => c.competency === 'determination')!;

    // Cross-competency patterns
    if (activation.normalizedScore > 0.75 && control.normalizedScore < 0.5) {
      insights.push("🔍 Wzorzec: Wysoka energia, niska kontrola emocjonalna. Priorytet: techniki uspokajające (oddech, grounding).");
    }

    if (focus.normalizedScore < 0.5 && reset.normalizedScore < 0.5) {
      insights.push("🔍 Wzorzec: Problemy z koncentracją i regeneracją po błędach. Sugeruje trudność z zarządzaniem uwagą pod presją.");
    }

    if (confidence.normalizedScore < 0.5 && determination.normalizedScore < 0.5) {
      insights.push("🔍 Wzorzec: Niska pewność siebie i wytrwałość. Zawodnik potrzebuje wsparcia motywacyjnego i budowania małych sukcesów.");
    }

    // Contextual modifiers impact
    const sleepMod = modifierScores.find(m => m.modifier === 'sleep');
    const stressMod = modifierScores.find(m => m.modifier === 'stress');
    const healthMod = modifierScores.find(m => m.modifier === 'health');
    const socialMod = modifierScores.find(m => m.modifier === 'social');

    if (sleepMod && sleepMod.normalizedScore <= 0.4) {
      insights.push(`💤 Niewystarczająca regeneracja (sen: ${sleepMod.rawScore}/${sleepMod.maxScore}). Niskie wyniki mogą wynikać z fizycznego zmęczenia.`);
    }

    if (stressMod && stressMod.normalizedScore <= 0.4) {
      insights.push(`😰 Wysoki stres pozasportowy (${stressMod.rawScore}/${stressMod.maxScore}) obniża kontrolę emocjonalną i koncentrację.`);
    }

    if (healthMod && healthMod.normalizedScore <= 0.4) {
      insights.push(`🩹 Kontuzja/ból (${healthMod.rawScore}/${healthMod.maxScore}) wpływa na koncentrację i motywację.`);
    }

    if (socialMod && socialMod.normalizedScore <= 0.4 && confidence.normalizedScore < 0.5) {
      insights.push(`👥 Niskie wsparcie społeczne (${socialMod.rawScore}/${socialMod.maxScore}) może osłabiać pewność siebie.`);
    }

    // Priority recommendation
    if (weakest.normalizedScore < 0.6) {
      insights.push(`🎯 PRIORYTET TRENINGOWY: ${weakest.name}. Zaplanuj dedykowane ćwiczenia w tym obszarze.`);
    } else {
      insights.push("✅ Wszystkie kompetencje na dobrym poziomie. Kontynuuj trening dla utrzymania formy.");
    }

    return insights;
  };

  const athleteInsights = generateAthleteInterpretation();
  const coachInsights = generateCoachInterpretation();

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(sixSigmaData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `six-sigma-${session.id}-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate(`/zawodnicy/${athleteId}/sesja/${sessionId}?task=overview`)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Powrót do podsumowania
      </Button>

      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">
          Raport Six Sigma
        </h2>
        <p className="text-muted-foreground">
          {athlete.name} • {new Date(session.date).toLocaleDateString('pl-PL')}
        </p>
        <Badge variant="outline" className="mt-2">
          Psychometria
        </Badge>
      </div>

      <Tabs defaultValue="player" className="w-full">
        <div className="mb-6">
          <TabsList>
            <TabsTrigger value="player">Dla Zawodnika</TabsTrigger>
            <TabsTrigger value="coach">Dla Trenera</TabsTrigger>
            <TabsTrigger value="export">Eksport Danych</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="player" className="space-y-6">
          {/* Validation warnings */}
          {!validation.isValid && (
            <Card className="border-amber-500 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">Uwaga</p>
                    <p className="text-sm text-amber-800">
                      Wykryto niespójności w odpowiedziach. Przy kolejnym wypełnieniu zwróć uwagę na dokładne czytanie pytań.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Athlete interpretation - MOVED TO TOP */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle>Twoje wyniki - co oznaczają dla Ciebie?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {athleteInsights.map((insight, idx) => (
                <p key={idx} className="text-sm leading-relaxed">
                  {insight}
                </p>
              ))}
            </CardContent>
          </Card>

          {/* Quick summary tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Ogólny Wynik</p>
                <p className="text-3xl font-bold">{Math.round(overallScore * 100)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Średnia wszystkich kompetencji</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <p className="text-sm text-green-700 mb-1">Najmocniejszy Obszar</p>
                <p className="text-xl font-bold text-green-900">{strongest.name}</p>
                <p className="text-xs text-green-700 mt-1">{Math.round(strongest.normalizedScore * 100)}%</p>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <p className="text-sm text-amber-700 mb-1">Do Rozwinięcia</p>
                <p className="text-xl font-bold text-amber-900">{weakest.name}</p>
                <p className="text-xs text-amber-700 mt-1">{Math.round(weakest.normalizedScore * 100)}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Competency bars */}
          <Card>
            <CardHeader>
              <CardTitle>Twoje Kompetencje Mentalne</CardTitle>
              <p className="text-sm text-muted-foreground">
                Poziom rozwinięcia sześciu kluczowych kompetencji sportowych
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {competencyScores.map((comp) => (
                <div key={comp.competency} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{comp.name}</p>
                      <p className="text-sm text-muted-foreground">{comp.interpretation}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{Math.round(comp.normalizedScore * 100)}%</p>
                      <p className="text-xs text-muted-foreground">{comp.rawScore}/{comp.maxScore}</p>
                    </div>
                  </div>
                  <Progress value={comp.normalizedScore * 100} className="h-3" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contextual modifiers */}
          <Card>
            <CardHeader>
              <CardTitle>Kontekst Pomiaru</CardTitle>
              <p className="text-sm text-muted-foreground">
                Czynniki, które mogły wpłynąć na Twoje wyniki
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {modifierScores.map((mod) => (
                  <div key={mod.modifier} className="space-y-2">
                    <p className="text-sm font-medium">{mod.name}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold">{mod.rawScore}</p>
                      <p className="text-sm text-muted-foreground">/ {mod.maxScore}</p>
                    </div>
                    <Progress value={mod.normalizedScore * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coach" className="space-y-6">
          {/* Data quality validation */}
          <Card className={validation.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                {validation.isValid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">Jakość Danych</p>
                  {validation.isValid ? (
                    <p className="text-sm text-green-800">Dane wiarygodne, brak wykrytych anomalii.</p>
                  ) : (
                    <div className="text-sm text-red-800 space-y-1">
                      {validation.isStraightLining && <p>• Straight-lining wykryty</p>}
                      {validation.hasReverseInconsistency && <p>• Niespójności w pytaniach odwrotnych</p>}
                      {validation.warnings.map((w, i) => <p key={i}>• {w}</p>)}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session info */}
          <Card>
            <CardHeader>
              <CardTitle>Informacje o Sesji</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Wersja</p>
                  <p className="text-lg font-semibold">{sixSigmaData.version}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Czas wypełniania</p>
                  <p className="text-lg font-semibold">{Math.round(sixSigmaData.completionTimeSeconds / 60)} min</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Data</p>
                  <p className="text-lg font-semibold">
                    {new Date(sixSigmaData.completionDate).toLocaleDateString('pl-PL')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ogólny Wynik</p>
                  <p className="text-lg font-semibold">{Math.round(overallScore * 100)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed competency breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Szczegółowe Wyniki Kompetencji</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {competencyScores.map((comp) => (
                <div key={comp.competency} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{comp.name}</p>
                      <Badge variant="outline">{comp.interpretation}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{Math.round(comp.normalizedScore * 100)}%</p>
                      <p className="text-xs text-muted-foreground">
                        Surowy: {comp.rawScore}/{comp.maxScore}
                      </p>
                    </div>
                  </div>
                  <Progress value={comp.normalizedScore * 100} className="h-3" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Modifiers with context */}
          <Card>
            <CardHeader>
              <CardTitle>Modyfikatory Kontekstowe</CardTitle>
              <p className="text-sm text-muted-foreground">
                Czynniki wpływające na interpretację wyników
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modifierScores.map((mod) => (
                  <div key={mod.modifier} className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{mod.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {mod.impact === 'positive' && '✅ Pozytywny wpływ'}
                        {mod.impact === 'neutral' && '➖ Neutralny'}
                        {mod.impact === 'negative' && '⚠️ Negatywny wpływ'}
                      </p>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className="text-xl font-bold">{mod.rawScore}/{mod.maxScore}</p>
                    </div>
                    <div className="w-32">
                      <Progress value={mod.normalizedScore * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Raw response data for coach/psychologist */}
          <Card>
            <CardHeader>
              <CardTitle>Surowe Dane Odpowiedzi</CardTitle>
              <p className="text-sm text-muted-foreground">
                Szczegółowy przegląd odpowiedzi zawodnika pytanie po pytaniu
              </p>
            </CardHeader>
            <CardContent>
              {sixSigmaData.responses && sixSigmaData.responses.length > 0 ? (
                <div className="space-y-4">
                  {sixSigmaData.responses.map((response: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-primary/20 pl-4 py-2">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-medium text-slate-900">
                          Q{idx + 1}: {response.questionText}
                        </p>
                        <Badge variant="outline" className="ml-2">
                          {response.value}/5
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Kompetencja: {response.competency}</span>
                        <span>Domena: {response.domain}</span>
                        {response.isReverse && <span className="text-amber-600">Pytanie odwrócone</span>}
                        {response.isKeyIndicator && <span className="text-primary font-semibold">Wskaźnik kluczowy</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Brak szczegółowych danych odpowiedzi dla tej sesji.</p>
              )}
            </CardContent>
          </Card>

          {/* Coach interpretation */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle>Interpretacja Dla Trenera</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {coachInsights.map((insight, idx) => (
                <p key={idx} className="text-sm leading-relaxed">
                  {insight}
                </p>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eksport Danych</CardTitle>
              <p className="text-sm text-muted-foreground">
                Pobierz wyniki w różnych formatach
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex-col gap-2" onClick={handleExportJSON}>
                  <Download className="h-6 w-6" />
                  <span>Pobierz JSON</span>
                  <span className="text-xs text-slate-500">Pełne dane</span>
                </Button>
                
                <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => {
                  // CSV export for questionnaire responses
                  if (sixSigmaData.responses && sixSigmaData.responses.length > 0) {
                    const headers = ['questionId', 'questionText', 'competency', 'domain', 'type', 'value', 'isKeyIndicator'];
                    const csvContent = [
                      headers.join(','),
                      ...sixSigmaData.responses.map((r: any) => 
                        [r.questionId, `"${r.questionText}"`, r.competency, r.domain, r.isReverse ? 'reverse' : 'direct', r.value, r.isKeyIndicator ? 'yes' : 'no'].join(',')
                      )
                    ].join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `six-sigma-${session.id}-responses.csv`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }
                }}>
                  <Download className="h-6 w-6" />
                  <span>Pobierz CSV</span>
                  <span className="text-xs text-slate-500">Odpowiedzi (Excel)</span>
                </Button>
                
                <Button variant="outline" className="h-24 flex-col gap-2" disabled>
                  <Download className="h-6 w-6" />
                  <span>Pobierz PDF</span>
                  <span className="text-xs text-slate-500">Wkrótce</span>
                </Button>
              </div>

              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-2">
                  Informacje o danych:
                </h4>
                <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                  <li><strong>JSON:</strong> Zawiera wszystkie surowe dane, wyniki kompetencji i metadane</li>
                  <li><strong>CSV:</strong> Tabela wszystkich odpowiedzi z wartościami i metadanymi pytań</li>
                  <li><strong>PDF (wkrótce):</strong> Obrandowany raport z wykresami i analizą</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
