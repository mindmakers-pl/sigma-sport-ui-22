import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

interface TrainingsTableProps {
  athleteId: string | undefined;
}

const TrainingsTable = ({ athleteId }: TrainingsTableProps) => {
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState<any[]>([]);
  const [filteredTrainings, setFilteredTrainings] = useState<any[]>([]);
  const [gameFilter, setGameFilter] = useState('wszystkie');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
        metric1: { label: 'Mediana RT', value: `${Math.round(coachReport.overall?.medianRT || 0)} ms`, key: 'medianRT' },
        metric2: { label: 'Trafność', value: `${Math.round((coachReport.overall?.accuracy || 0) * 100)}%`, key: 'accuracy' },
        metric3: { label: 'Koszt koncentracji', value: `+${Math.round(results.concentrationCost || 0)} ms`, key: 'cost' }
      };
    }
    return {
      metric1: { label: 'Wynik', value: '-', key: 'score' },
      metric2: { label: 'Celność', value: '-', key: 'accuracy' },
      metric3: { label: 'Czas', value: '-', key: 'time' }
    };
  };

  const getGameBadgeColor = (gameType: string) => {
    switch(gameType) {
      case 'focus': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'scan': return 'bg-green-100 text-green-800 border-green-300';
      case 'control': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const uniqueGameTypes = [...new Set(trainings.map(t => t.game_type))];
  const showProgressReport = gameFilter !== 'wszystkie' && selectedIds.length >= 2;

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTrainings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTrainings.map(t => t.id));
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
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
          {gameFilter !== 'wszystkie' && filteredTrainings.length > 0 && (
            <Button variant="outline" size="sm" onClick={toggleSelectAll}>
              {selectedIds.length === filteredTrainings.length ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
            </Button>
          )}
        </div>
        {showProgressReport && (
          <Button onClick={() => navigate(`/zawodnicy/${athleteId}/postepy/${gameFilter}?ids=${selectedIds.join(',')}`)}>
            Raport postępów ({selectedIds.length})
          </Button>
        )}
      </div>

      {filteredTrainings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Brak treningów do wyświetlenia
        </div>
      ) : (
        <>
          {/* Desktop and Tablet view with table - only when filter is selected */}
          {gameFilter !== 'wszystkie' ? (
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Gra</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>{filteredTrainings[0] && getGameMetrics(filteredTrainings[0]).metric1.label}</TableHead>
                    <TableHead>{filteredTrainings[0] && getGameMetrics(filteredTrainings[0]).metric2.label}</TableHead>
                    <TableHead>{filteredTrainings[0] && getGameMetrics(filteredTrainings[0]).metric3.label}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrainings.map((training) => {
                    const metrics = getGameMetrics(training);
                    const isSelected = selectedIds.includes(training.id);
                    return (
                      <TableRow 
                        key={training.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('[data-checkbox]')) {
                            return;
                          }
                          navigate(`/zawodnicy/${athleteId}/trening/${training.id}`);
                        }}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()} data-checkbox>
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={() => toggleSelection(training.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge className={getGameBadgeColor(training.game_type)}>
                            {training.game_name}
                          </Badge>
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
                          <span className="font-semibold">{metrics.metric1.value}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">{metrics.metric2.value}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">{metrics.metric3.value}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : null}

          {/* Card layout for mobile when filter is selected OR for all views when "wszystkie" */}
          <div className={gameFilter !== 'wszystkie' ? 'sm:hidden space-y-3' : 'space-y-3'}>
            {filteredTrainings.map((training) => {
              const metrics = getGameMetrics(training);
              const isSelected = selectedIds.includes(training.id);
              return (
                <Card 
                  key={training.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/zawodnicy/${athleteId}/trening/${training.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {gameFilter !== 'wszystkie' && (
                          <div onClick={(e) => e.stopPropagation()} data-checkbox>
                            <Checkbox 
                              checked={isSelected}
                              onCheckedChange={() => toggleSelection(training.id)}
                            />
                          </div>
                        )}
                        <Badge className={getGameBadgeColor(training.game_type)}>
                          {training.game_name}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(training.completedAt).toLocaleDateString('pl-PL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">{metrics.metric1.label}</p>
                        <p className="font-semibold">{metrics.metric1.value}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">{metrics.metric2.label}</p>
                        <p className="font-semibold">{metrics.metric2.value}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">{metrics.metric3.label}</p>
                        <p className="font-semibold">{metrics.metric3.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default TrainingsTable;
