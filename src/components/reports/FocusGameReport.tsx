import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface FocusGameReportProps {
  results: any;
  variant?: 'athlete' | 'coach';
}

export default function FocusGameReport({ results, variant = 'athlete' }: FocusGameReportProps) {
  const coachReport = results.coachReport || results.focus_coach_report || {};
  
  if (!coachReport.overall) {
    return <div className="text-muted-foreground text-sm">Brak danych raportu Focus</div>;
  }

  const overallMedianRT = Math.round(coachReport.overall.medianRT || 0);
  const overallAccuracy = Math.round((coachReport.overall.accuracy || 0) * 100);
  const congruentMedianRT = Math.round(coachReport.coachMetrics?.congruent?.medianRT || 0);
  const incongruentMedianRT = Math.round(coachReport.coachMetrics?.incongruent?.medianRT || 0);
  const concentrationCost = incongruentMedianRT - congruentMedianRT;

  if (variant === 'athlete') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Twój wynik - Focus Game</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="text-3xl font-bold text-primary">{overallMedianRT} ms</div>
              <div className="text-sm text-muted-foreground">Czas reakcji</div>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="text-3xl font-bold text-primary">{overallAccuracy}%</div>
              <div className="text-sm text-muted-foreground">Celność</div>
            </div>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="text-sm text-amber-800 mb-1">Koszt koncentracji</div>
            <div className="text-2xl font-bold text-amber-900">+{concentrationCost} ms</div>
            <div className="text-xs text-amber-700 mt-2">
              Dodatkowy czas na przetworzenie zadań trudnych
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Coach variant - detailed metrics and charts
  return (
    <Card>
      <CardHeader>
        <CardTitle>Focus Game - Raport trenera</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="text-2xl font-bold">{overallMedianRT} ms</div>
            <div className="text-sm text-muted-foreground">Mediana RT</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="text-2xl font-bold">{overallAccuracy}%</div>
            <div className="text-sm text-muted-foreground">Celność</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="text-2xl font-bold">+{concentrationCost} ms</div>
            <div className="text-sm text-muted-foreground">Koszt koncentracji</div>
          </div>
        </div>

        {/* RT Comparison Chart */}
        <div>
          <h4 className="font-semibold mb-4">Porównanie czasów reakcji</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { name: 'Łatwe', value: congruentMedianRT, fill: 'hsl(142, 71%, 45%)' },
              { name: 'Trudne', value: incongruentMedianRT, fill: 'hsl(0, 84%, 60%)' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: number) => [`${value} ms`, 'Czas reakcji']} />
              <Bar dataKey="value" label={{ position: 'top', formatter: (value: number) => `${value} ms` }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed metrics table */}
        <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
          <div>
            <h4 className="font-semibold text-green-700 mb-2">Próby Łatwe</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Mediana RT:</span>
                <strong>{congruentMedianRT} ms</strong>
              </div>
              <div className="flex justify-between">
                <span>Błędy:</span>
                <strong>{((coachReport.coachMetrics?.congruent?.errorRate || 0) * 100).toFixed(1)}%</strong>
              </div>
              <div className="flex justify-between">
                <span>IQR:</span>
                <strong>{Math.round(coachReport.coachMetrics?.congruent?.iqr || 0)} ms</strong>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-red-700 mb-2">Próby Trudne</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Mediana RT:</span>
                <strong>{incongruentMedianRT} ms</strong>
              </div>
              <div className="flex justify-between">
                <span>Błędy:</span>
                <strong>{((coachReport.coachMetrics?.incongruent?.errorRate || 0) * 100).toFixed(1)}%</strong>
              </div>
              <div className="flex justify-between">
                <span>IQR:</span>
                <strong>{Math.round(coachReport.coachMetrics?.incongruent?.iqr || 0)} ms</strong>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
