import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TrainingsTableProps {
  athleteId: string | undefined;
}

const TrainingsTable = ({ athleteId }: TrainingsTableProps) => {
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState<any[]>([]);
  const [filteredTrainings, setFilteredTrainings] = useState<any[]>([]);
  const [gameFilter, setGameFilter] = useState('wszystkie');

  useEffect(() => {
    const allTrainings = JSON.parse(localStorage.getItem('athlete_trainings') || '[]');
    const athleteTrainings = allTrainings
      .filter((t: any) => t.athlete_id === athleteId)
      .sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    setTrainings(athleteTrainings);
    setFilteredTrainings(athleteTrainings);
  }, [athleteId]);

  useEffect(() => {
    if (gameFilter === 'wszystkie') {
      setFilteredTrainings(trainings);
    } else {
      setFilteredTrainings(trainings.filter(t => t.game_type === gameFilter));
    }
  }, [gameFilter, trainings]);

  const getGameMetrics = (training: any) => {
    const results = training.results;
    if (training.game_type === 'focus') {
      const coachReport = results.coachReport || {};
      return {
        metric1: { label: 'Mediana RT', value: `${Math.round(coachReport.overall?.medianRT || 0)} ms` },
        metric2: { label: 'Trafność', value: `${Math.round((coachReport.overall?.accuracy || 0) * 100)}%` },
        metric3: { label: 'Koszt koncentracji', value: `+${Math.round(results.concentrationCost || 0)} ms` }
      };
    }
    return {
      metric1: { label: 'Wynik', value: '-' },
      metric2: { label: 'Celność', value: '-' },
      metric3: { label: 'Czas', value: '-' }
    };
  };

  const uniqueGameTypes = [...new Set(trainings.map(t => t.game_type))];
  const showProgressReport = gameFilter !== 'wszystkie' && filteredTrainings.length > 1;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Select value={gameFilter} onValueChange={setGameFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtruj gry" />
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            <SelectItem value="wszystkie">Wszystkie gry</SelectItem>
            {uniqueGameTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type === 'focus' ? 'Sigma Focus' : 
                 type === 'scan' ? 'Sigma Scan' :
                 type === 'control' ? 'Sigma Control' : type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showProgressReport && (
          <Button onClick={() => navigate(`/zawodnicy/${athleteId}/postepy/${gameFilter}`)}>
            Raport postępów
          </Button>
        )}
      </div>

      {filteredTrainings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Brak treningów do wyświetlenia
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gra</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Wskaźnik 1</TableHead>
              <TableHead>Wskaźnik 2</TableHead>
              <TableHead>Wskaźnik 3</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrainings.map((training) => {
              const metrics = getGameMetrics(training);
              return (
                <TableRow 
                  key={training.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/zawodnicy/${athleteId}/trening/${training.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{training.game_name}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(training.completedAt).toLocaleDateString('pl-PL', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="text-muted-foreground">{metrics.metric1.label}: </span>
                      <span className="font-semibold">{metrics.metric1.value}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="text-muted-foreground">{metrics.metric2.label}: </span>
                      <span className="font-semibold">{metrics.metric2.value}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="text-muted-foreground">{metrics.metric3.label}: </span>
                      <span className="font-semibold">{metrics.metric3.value}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Zobacz</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default TrainingsTable;
