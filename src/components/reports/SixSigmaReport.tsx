import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { SixSigmaResults } from "@/utils/sixSigmaScoring";

interface SixSigmaReportProps {
  results: SixSigmaResults;
  viewMode?: 'athlete' | 'coach';
}

const SixSigmaReport = ({ results, viewMode = 'athlete' }: SixSigmaReportProps) => {
  const { hexagon, competenceScores, moodModifiers, overallScore, warnings, straightLiningDetected } = results;

  // Prepare data for hexagon (radar chart)
  const radarData = hexagon.map(h => ({
    competence: h.competence,
    score: h.score
  }));

  // Prepare data for bar chart
  const barData = competenceScores.map(cs => ({
    name: cs.competence,
    wynik: cs.normalizedScore
  }));

  const getScoreInterpretation = (score: number) => {
    if (score >= 80) return { label: 'Bardzo wysoki', color: 'text-green-600', icon: TrendingUp };
    if (score >= 60) return { label: 'Wysoki', color: 'text-green-500', icon: TrendingUp };
    if (score >= 40) return { label: 'Średni', color: 'text-yellow-600', icon: Minus };
    if (score >= 20) return { label: 'Niski', color: 'text-orange-600', icon: TrendingDown };
    return { label: 'Bardzo niski', color: 'text-red-600', icon: TrendingDown };
  };

  const overallInterpretation = getScoreInterpretation(overallScore);
  const OverallIcon = overallInterpretation.icon;

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Ogólny Wynik
            <OverallIcon className={`h-5 w-5 ${overallInterpretation.color}`} />
          </CardTitle>
          <CardDescription>
            Średnia z wszystkich 6 kompetencji
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{overallScore}</span>
            <span className="text-2xl text-muted-foreground">/ 100</span>
            <Badge className="ml-4">{overallInterpretation.label}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Hexagon Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Profil Kompetencji (Heksagon)</CardTitle>
          <CardDescription>
            Twój profil psychologiczny w 6 wymiarach
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="competence" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar 
                name="Wynik" 
                dataKey="score" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))" 
                fillOpacity={0.6} 
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Competence Scores Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Szczegółowe Wyniki Kompetencji</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="wynik" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Competence Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Interpretacja Wyników</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {competenceScores.map(cs => {
            const interp = getScoreInterpretation(cs.normalizedScore);
            const Icon = interp.icon;
            return (
              <div key={cs.competence} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-semibold">{cs.competence}</h3>
                  <p className="text-sm text-muted-foreground">{getCompetenceDescription(cs.competence)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">{cs.normalizedScore}</span>
                  <Badge variant="outline" className={interp.color}>
                    <Icon className="h-3 w-3 mr-1" />
                    {interp.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Mood Modifiers (Coach View) */}
      {viewMode === 'coach' && moodModifiers && (
        <Card>
          <CardHeader>
            <CardTitle>Kontekst i Stan Zawodnika</CardTitle>
            <CardDescription>
              Modyfikatory wpływające na wyniki (Six Sigma Mood)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <MoodItem label="Sen" value={moodModifiers.sen} />
              <MoodItem label="Stres pozasportowy" value={moodModifiers.stres} />
              <MoodItem label="Zdrowie" value={moodModifiers.zdrowie} />
              <MoodItem label="Atmosfera w drużynie" value={moodModifiers.atmosfera} />
              <MoodItem label="Dieta/Paliwo" value={moodModifiers.dieta} />
              <MoodItem label="Satysfakcja ze sportu" value={moodModifiers.flow} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const MoodItem = ({ label, value }: { label: string; value: number }) => {
  const getColor = (v: number) => {
    if (v >= 4) return 'text-green-600';
    if (v >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-3 border rounded-lg space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${getColor(value)}`}>{value} / 5</p>
    </div>
  );
};

function getCompetenceDescription(competence: string): string {
  const descriptions: Record<string, string> = {
    'Aktywacja': 'Regulacja energii i gotowości do wysiłku',
    'Kontrola': 'Stabilność emocjonalna i reakcje na stresory',
    'Reset': 'Powrót do równowagi po błędach',
    'Fokus': 'Utrzymanie uwagi i odporność na dystraktory',
    'Pewność': 'Poczucie sprawstwa i wiara w umiejętności',
    'Determinacja': 'Wytrwałość i konsekwencja w działaniu'
  };
  return descriptions[competence] || '';
}

export default SixSigmaReport;
