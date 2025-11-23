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
  const { 
    competencyScores, 
    modifierScores, 
    overallScore, 
    validation 
  } = sixSigmaData;

  // 🧪 Diagnostic logging for validation structure
  console.log('🧪 Six Sigma data debug', {
    sessionId: session.id,
    hasValidation: !!validation,
    validationType: typeof validation,
    validationRaw: validation,
    hasIsValid: validation && 'isValid' in validation
  });

  // Create safe validation object with guaranteed structure
  const safeValidation = validation && typeof validation === 'object' && 'isValid' in validation
    ? validation
    : {
        isValid: true,
        warnings: [],
        flags: {
          straightLining: false,
          reverseInconsistency: false,
          speedingDetected: false
        }
      };

  // Find strongest and weakest competencies
  const sortedCompetencies = [...competencyScores].sort((a, b) => b.normalizedScore - a.normalizedScore);
  const strongest = sortedCompetencies[0];
  const weakest = sortedCompetencies[sortedCompetencies.length - 1];

  // Mapy pomocnicze dla nazw i opisów kompetencji / domen
  const competencyMeta: Record<string, { label: string; description: string }> = {
    activation: {
      label: 'Sigma Aktywacja',
      description: 'Jak zarządzasz energią ciała przed i w trakcie startu.'
    },
    control: {
      label: 'Sigma Kontrola',
      description: 'Co dzieje się z Tobą, gdy pojawia się złość, presja lub błąd sędziego.'
    },
    reset: {
      label: 'Sigma Reset',
      description: 'Jak szybko wracasz do gry po błędach i nieudanych akcjach.'
    },
    focus: {
      label: 'Sigma Fokus',
      description: 'Na ile łatwo utrzymujesz uwagę, gdy coś Cię rozprasza.'
    },
    confidence: {
      label: 'Sigma Pewność',
      description: 'Jak postrzegasz swoje umiejętności i szanse w rywalizacji.'
    },
    determination: {
      label: 'Sigma Determinacja',
      description: 'Jak długo potrafisz ciśnąć dalej, gdy robi się trudno.'
    },
    modifier: {
      label: 'Kontekst (Six Sigma Mood)',
      description: 'Sen, stres, zdrowie, atmosfera i inne czynniki tła.'
    }
  };

  const domainLabelsPl: Record<string, string> = {
    thoughts: 'Myśli',
    body: 'Ciało',
    behavior: 'Zachowanie'
  };

  // Generate rule-based interpretation – WIDOK DZIECKO (język psychoedukacyjny)
  const generateAthleteInterpretation = () => {
    const insights: string[] = [];

    // Walidacja – tylko raz, w kafelku interpretacji, prostym językiem
    if (!safeValidation.isValid) {
      insights.push(
        'Wygląda na to, że zaznaczałaś/eś odpowiedzi bardzo podobnie albo trochę na szybko. Przy kolejnym razie spróbuj czytać każde zdanie powoli i zaznaczać to, co naprawdę o Tobie.'
      );
    }

    // Komunikat otwierający – podkreślenie, że to opis tego, jak dziecko WIDZI siebie
    insights.push(
      'Poniżej opisujemy to, jak SAM/A widzisz swoje zachowania i myśli w sporcie. To nie jest ocena na zawsze, tylko zdjęcie z tego jednego momentu.'
    );

    // Percepcja mocniejszego obszaru – bez nazw kompetencji
    if (strongest) {
      insights.push(
        'W kilku pytaniach pokazałaś/eś, że w niektórych sytuacjach na boisku lub macie czujesz się naprawdę pewnie i „u siebie”. To dobry sygnał – masz już zachowania, na których można budować.'
      );
    }

    // Słabszy obszar – język o sytuacjach, nie etykietach
    if (weakest && weakest.normalizedScore < 0.6) {
      insights.push(
        'Są też pytania, w których zaznaczyłaś/eś, że bywa Ci trudniej – na przykład po błędach, przy głośnych trybunach albo gdy boisz się zawieść innych. To normalne, że takie sytuacje są wymagające. Ten raport pomaga je zauważyć, żeby można było nad nimi spokojnie pracować.'
      );
    }

    // Przykłady oparte o treść pytań
    competencyScores.forEach((comp) => {
      if (comp.normalizedScore >= 0.75) {
        if (comp.competency === 'control') {
          insights.push(
            'Z Twoich odpowiedzi wynika, że często potrafisz zachować spokój, nawet gdy sędzia podejmie złą decyzję albo ktoś Cię prowokuje. To znaczy, że umiesz pilnować swoich reakcji, gdy robi się gorąco.'
          );
        }
        if (comp.competency === 'reset') {
          insights.push(
            'Często zaznaczałaś/eś, że po błędzie potrafisz szybko wrócić do walki. To znak, że traktujesz pomyłki bardziej jak informację „co poprawić”, niż dowód, że jesteś słabsza/słabszy.'
          );
        }
        if (comp.competency === 'focus') {
          insights.push(
            'W Twoich odpowiedziach widać, że łatwo skupić Ci się na tym, co ważne – na przykład słyszysz głównie trenera i drużynę, a nie hałas dookoła. To pomaga robić swoje nawet przy trybunach pełnych ludzi.'
          );
        }
      }
    });

    return insights;
  };

  const generateCoachInterpretation = () => {
    const insights: string[] = [];
    
    // Data quality check
    if (safeValidation.flags?.straightLining) {
      insights.push('🚨 UWAGA: Wykryto straight-lining (większość odpowiedzi identyczna). Wyniki mogą być nierzetelne.');
      return insights;
    }

    if (safeValidation.flags?.reverseInconsistency) {
      insights.push('⚠️ Niespójności w pytaniach odwrotnych – możliwe nieuważne odpowiadanie.');
    }

    // Flow/enjoyment check for burnout
    const flowModifier = modifierScores.find((m: any) => m.modifier === 'mod_flow');
    if (flowModifier && flowModifier.normalizedScore <= 0.2 && overallScore < 0.6) {
      insights.push('🚨 ALERT: Niski Flow + niskie samooceny kompetencji sugerują ryzyko wypalenia. Zalecana spokojna rozmowa z zawodnikiem.');
    }

    // Pattern recognition – zabezpieczenie na brak danych
    const activation = competencyScores.find((c: any) => c.competency === 'activation');
    const control = competencyScores.find((c: any) => c.competency === 'control');
    const focus = competencyScores.find((c: any) => c.competency === 'focus');
    const reset = competencyScores.find((c: any) => c.competency === 'reset');
    const confidence = competencyScores.find((c: any) => c.competency === 'confidence');
    const determination = competencyScores.find((c: any) => c.competency === 'determination');

    if (activation && control && activation.normalizedScore > 0.75 && control.normalizedScore < 0.5) {
      insights.push('🔍 Wzorzec: wysoka energia przy niskiej kontroli emocjonalnej. Do dalszej pracy nadają się mikrotechniki uspokajające (oddech, grounding, przerwa na ławce).');
    }

    if (focus && reset && focus.normalizedScore < 0.5 && reset.normalizedScore < 0.5) {
      insights.push('🔍 Wzorzec: trudności z utrzymaniem koncentracji i powrotem po błędach. Sugeruje problemy z zarządzaniem uwagą pod presją meczu.');
    }

    if (confidence && determination && confidence.normalizedScore < 0.5 && determination.normalizedScore < 0.5) {
      insights.push('🔍 Wzorzec: niska samoocena i wytrwałość. Warto szukać mikrosukcesów treningowych i pracy na celu zadaniowym.');
    }

    // Contextual modifiers impact (na podstawie Six Sigma Mood)
    const sleepMod = modifierScores.find((m: any) => m.modifier === 'mod_sleep');
    const stressMod = modifierScores.find((m: any) => m.modifier === 'mod_stress');
    const healthMod = modifierScores.find((m: any) => m.modifier === 'mod_health');
    const socialMod = modifierScores.find((m: any) => m.modifier === 'mod_social');

    if (sleepMod && sleepMod.normalizedScore <= 0.4) {
      insights.push('💤 Niska jakość snu – część zaniżonych samoocen może być efektem zwykłego zmęczenia organizmu.');
    }

    if (stressMod && stressMod.normalizedScore <= 0.4) {
      insights.push('😰 Wysoki stres szkolny/domowy – może obniżać kontrolę emocji i skupienie, niezależnie od realnych zasobów zawodnika.');
    }

    if (healthMod && healthMod.normalizedScore <= 0.4) {
      insights.push('🩹 Ból lub drobne urazy mogą wpływać na sposób, w jaki zawodnik ocenia swoją pewność i gotowość do startu.');
    }

    if (socialMod && socialMod.normalizedScore <= 0.4 && confidence && confidence.normalizedScore < 0.5) {
      insights.push('👥 Niska ocena atmosfery w drużynie + niska pewność siebie – warto przyjrzeć się relacjom w zespole i komunikatom trenera.');
    }

    // Priorytet
    if (weakest && weakest.normalizedScore < 0.6) {
      insights.push(`🎯 Priorytet rozmowy: ${competencyMeta[weakest.competency]?.label || weakest.name}. Najpierw psychoedukacja na przykładach z kwestionariusza, potem dopiero wybór interwencji.`);
    } else {
      insights.push('✅ Samoopis zawodnika jest w większości dodatni. Warto zachować ten profil i obserwować, jak zmienia się wraz z kontekstem (Six Sigma Mood).');
    }

    return insights;
  };

  const athleteInsights = generateAthleteInterpretation();
  const coachInsights = generateCoachInterpretation();

  const handleExportJSON = () => {
    // JSON contains everything: raw responses, aggregated scores, validation
    const exportData = {
      metadata: {
        sessionId: session.id,
        athleteId: athlete.id,
        athleteName: athlete.name,
        date: new Date(session.date).toISOString(),
        exportedAt: new Date().toISOString()
      },
      rawResponses: sixSigmaData.responses || [],
      aggregates: {
        competencyScores: sixSigmaData.competencyScores,
        modifierScores: sixSigmaData.modifierScores,
        overallScore: sixSigmaData.overallScore,
        validation: sixSigmaData.validation
      },
      interpretation: {
        athleteInsights,
        coachInsights
      }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `six-sigma-${session.id}-${new Date().toISOString().split('T')[0]}.json`;
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
          {/* Kafelek interpretacji (zawiera też info o jakości odpowiedzi) */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle>Co mówią Twoje odpowiedzi?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {athleteInsights.map((insight, idx) => (
                <p key={idx} className="text-sm leading-relaxed">
                  {insight}
                </p>
              ))}
            </CardContent>
          </Card>

          {/* Podsumowanie liczbowe – bez słowa "kompetencje" */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Ogólny obraz</p>
                <p className="text-3xl font-bold">{Math.round(overallScore * 100)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Tak widzisz swoje umiejętności w tym momencie</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <p className="text-sm text-green-700 mb-1">Najłatwiejsze dla Ciebie</p>
                <p className="text-xl font-bold text-green-900">{competencyMeta[strongest.competency]?.label || strongest.name}</p>
                <p className="text-xs text-green-700 mt-1">{Math.round(strongest.normalizedScore * 100)}%</p>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <p className="text-sm text-amber-700 mb-1">Najbardziej wymagające sytuacje</p>
                <p className="text-xl font-bold text-amber-900">{competencyMeta[weakest.competency]?.label || weakest.name}</p>
                <p className="text-xs text-amber-700 mt-1">{Math.round(weakest.normalizedScore * 100)}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Spektrum umiejętności – uporządkowane po wyniku */}
          <Card>
            <CardHeader>
              <CardTitle>Jak widzisz swoje umiejętności</CardTitle>
              <p className="text-sm text-muted-foreground">
                Każdy pasek to inny kawałek gry mentalnej – od rzeczy, które przychodzą Ci łatwo, po te, które częściej sprawiają trudność.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {sortedCompetencies.map((comp) => {
                const meta = competencyMeta[comp.competency];
                const value = comp.normalizedScore;
                let levelLabel = 'Dość trudno';
                let barClass = '';

                if (value >= 0.7) {
                  levelLabel = 'Zwykle jest Ci tu łatwo';
                  barClass = 'bg-emerald-500';
                } else if (value >= 0.4) {
                  levelLabel = 'Bywa różnie – czasem łatwo, czasem trudno';
                  barClass = 'bg-amber-500';
                } else {
                  levelLabel = 'Często jest tu trudno';
                  barClass = 'bg-red-500';
                }

                return (
                  <div key={comp.competency} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{meta?.label || comp.name}</p>
                        <p className="text-xs text-muted-foreground">{meta?.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{levelLabel}</p>
                        <p className="text-xs text-muted-foreground">{Math.round(comp.normalizedScore * 100)}%</p>
                      </div>
                    </div>
                    <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-3 ${barClass}`}
                        style={{ width: `${comp.normalizedScore * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Kontekst pomiaru – ten sam komponent co wcześniej */}
          <Card>
            <CardHeader>
              <CardTitle>Kontekst pomiaru</CardTitle>
              <p className="text-sm text-muted-foreground">
                To, jak śpisz, jak się czujesz i co dzieje się poza sportem, też ma znaczenie dla odpowiedzi.
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
          <Card className={safeValidation.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
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
              <CardTitle>Informacje o sesji</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Wersja</p>
                  <p className="text-lg font-semibold">{sixSigmaData.version}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Czas wypełniania (6x6)</p>
                  <p className="text-lg font-semibold">
                    {sixSigmaData.completionTimeSeconds
                      ? `${Math.round(sixSigmaData.completionTimeSeconds / 60)} min`
                      : 'brak danych'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Data</p>
                  <p className="text-lg font-semibold">
                    {new Date(sixSigmaData.completionDate).toLocaleDateString('pl-PL')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ogólny obraz</p>
                  <p className="text-lg font-semibold">{Math.round(overallScore * 100)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coach interpretation – nad surowymi danymi */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle>Interpretacja dla trenera</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {coachInsights.map((insight, idx) => (
                <p key={idx} className="text-sm leading-relaxed">
                  {insight}
                </p>
              ))}
            </CardContent>
          </Card>

          {/* Detailed competency breakdown z kolorami poziomu */}
          <Card>
            <CardHeader>
              <CardTitle>Szczegółowe wyniki (według kompetencji)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {competencyScores.map((comp) => {
                const meta = competencyMeta[comp.competency];
                const value = comp.normalizedScore;
                let level = 'Słaby';
                let badgeClass = 'bg-red-100 text-red-800 border-red-200';

                if (value >= 0.7) {
                  level = 'Dobry';
                  badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                } else if (value >= 0.4) {
                  level = 'Średni';
                  badgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
                }

                return (
                  <div key={comp.competency} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{meta?.label || comp.name}</p>
                        <p className="text-xs text-muted-foreground">{meta?.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs border ${badgeClass}`}>
                            {level}
                          </span>
                          <p className="text-2xl font-bold">{Math.round(comp.normalizedScore * 100)}%</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Surowy: {comp.rawScore}/{comp.maxScore}
                        </p>
                      </div>
                    </div>
                    <Progress value={comp.normalizedScore * 100} className="h-3" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Modifiers with context (z Mood) */}
          <Card>
            <CardHeader>
              <CardTitle>Modyfikatory kontekstowe (Six Sigma Mood)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Sen, stres, zdrowie, atmosfera i inne czynniki, które zmieniają odczyt samooceny zawodnika.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modifierScores.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Brak danych z Six Sigma Mood dla tej sesji.
                  </p>
                )}
                {modifierScores.map((mod) => (
                  <div key={mod.modifier} className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{mod.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {mod.impact === 'positive' && '✅ Pozytywny kontekst'}
                        {mod.impact === 'neutral' && '➖ Neutralny kontekst'}
                        {mod.impact === 'negative' && '⚠️ Utrudniający kontekst'}
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

          {/* Surowe dane – pogrupowane wg kompetencji z oznaczeniem +/- */}
          <Card>
            <CardHeader>
              <CardTitle>Surowe dane odpowiedzi</CardTitle>
              <p className="text-sm text-muted-foreground">
                Pytanie po pytaniu, z podziałem na kompetencje i domeny.
              </p>
            </CardHeader>
            <CardContent>
              {sixSigmaData.responses && sixSigmaData.responses.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(
                    sixSigmaData.responses.reduce((acc: any, r: any) => {
                      const key = r.competency || 'modifier';
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(r);
                      return acc;
                    }, {})
                  ).map(([compKey, responses]: [string, any[]]) => {
                    const meta = competencyMeta[compKey] || competencyMeta.modifier;
                    return (
                      <div key={compKey} className="space-y-2">
                        <p className="text-sm font-semibold">{meta.label}</p>
                        <div className="space-y-2">
                          {responses.map((response, idx) => {
                            const sign = response.type === 'reverse' ? '-' : '+';
                            const domainLabel = domainLabelsPl[response.domain as string] || response.domain;
                            return (
                              <div key={idx} className="border-l-4 border-primary/20 pl-4 py-2">
                                <div className="flex justify-between items-start mb-1">
                                  <p className="text-sm font-medium">
                                    Q{idx + 1}: {response.questionText}
                                  </p>
                                  <Badge variant="outline" className="ml-2">
                                    {response.value}/5 ({sign})
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                  <span>Obszar: {meta.label}</span>
                                  {domainLabel && <span>Domena: {domainLabel}</span>}
                                  {response.type === 'reverse' && (
                                    <span className="text-amber-600">Pytanie odwrócone (–)</span>
                                  )}
                                  {response.isKeyIndicator && (
                                    <span className="text-primary font-semibold">Wskaźnik kluczowy</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Brak szczegółowych danych odpowiedzi dla tej sesji.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eksport danych</CardTitle>
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
                
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  onClick={() => {
                    // CSV export for questionnaire responses (łącznie z Mood)
                    if (sixSigmaData.responses && sixSigmaData.responses.length > 0) {
                      const headers = [
                        'questionId',
                        'questionText',
                        'competency',
                        'domain',
                        'type',
                        'value',
                        'isKeyIndicator'
                      ];
                      const csvContent = [
                        headers.join(','),
                        ...sixSigmaData.responses.map((r: any) =>
                          [
                            r.questionId,
                            `"${(r.questionText || '').replace(/"/g, '""')}"`,
                            r.competency,
                            r.domain,
                            r.type || (r.isReverse ? 'reverse' : 'direct'),
                            r.value,
                            r.isKeyIndicator ? 'yes' : 'no'
                          ].join(',')
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
                  }}
                >
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
                  <li><strong>CSV:</strong> Tabela wszystkich odpowiedzi z wartościami i metadanymi pytań (w tym Six Sigma Mood)</li>
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
