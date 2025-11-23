import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useTrainings } from "@/hooks/useTrainings";
import FocusGameReport from "@/components/reports/FocusGameReport";
import ScanGameReport from "@/components/reports/ScanGameReport";
import MemoGameReport from "@/components/reports/MemoGameReport";
import ControlGameReport from "@/components/reports/ControlGameReport";
import TrackerGameReport from "@/components/reports/TrackerGameReport";

export default function TrainingDetail() {
  const { athleteId, trainingId } = useParams();
  const navigate = useNavigate();
  
  // Fetch trainings from Supabase
  const { trainings, loading } = useTrainings(athleteId);
  const training = trainings.find(t => t.id === trainingId);

  if (loading) {
    return (
      <div className="p-8">
        <p>Ładowanie...</p>
      </div>
    );
  }

  if (!training) {
    return (
      <div className="p-8">
        <p>Nie znaleziono treningu</p>
      </div>
    );
  }

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(training, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `training-${training.id}-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (training.results.focus_trials) {
      const trials = training.results.focus_trials;
      const headers = ['trialId', 'type', 'stimulusWord', 'stimulusColor', 'userAction', 'isCorrect', 'reactionTime', 'timestamp'];
      const csvContent = [
        headers.join(','),
        ...trials.map((t: any) => headers.map(h => t[h] || '').join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `training-${training.id}-trials.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const results = training.results;
  
  // Render game-specific report based on task_type
  const renderGameReport = () => {
    const taskType = training.task_type;
    
    if (taskType === 'focus') {
      return <FocusGameReport results={results} variant="athlete" />;
    }
    if (taskType === 'scan') {
      return <ScanGameReport results={results} variant="athlete" />;
    }
    if (taskType === 'memo') {
      return <MemoGameReport results={results} variant="athlete" />;
    }
    if (taskType === 'control') {
      return <ControlGameReport results={results} variant="athlete" />;
    }
    if (taskType === 'tracker') {
      return <TrackerGameReport results={results} variant="athlete" />;
    }
    
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-slate-600">Raport dla gry "{taskType}" nie jest jeszcze dostępny.</p>
        </CardContent>
      </Card>
    );
  };
  
  const renderCoachReport = () => {
    const taskType = training.task_type;
    
    if (taskType === 'focus') {
      return <FocusGameReport results={results} variant="coach" />;
    }
    if (taskType === 'scan') {
      return <ScanGameReport results={results} variant="coach" />;
    }
    if (taskType === 'memo') {
      return <MemoGameReport results={results} variant="coach" />;
    }
    if (taskType === 'control') {
      return <ControlGameReport results={results} variant="coach" />;
    }
    if (taskType === 'tracker') {
      return <TrackerGameReport results={results} variant="coach" />;
    }
    
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-slate-600">Raport trenera dla gry "{taskType}" nie jest jeszcze dostępny.</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate(`/zawodnicy/${athleteId}?tab=raporty&subtab=treningi`)} className="cursor-pointer">
              Profil zawodnika
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate(`/zawodnicy/${athleteId}?tab=raporty&subtab=treningi`)} className="cursor-pointer">
              Raporty treningowe
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Raport szczegółowy</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Raport treningowy - {training.task_type}
        </h2>
        <p className="text-slate-600">
          {new Date(training.date).toLocaleDateString('pl-PL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      <Tabs defaultValue="player" className="w-full">
        <div className="mb-6">
          <TabsList>
            <TabsTrigger value="player">Dla Zawodnika</TabsTrigger>
            <TabsTrigger value="coach">Dla Trenera</TabsTrigger>
            <TabsTrigger value="export">Eksport Danych</TabsTrigger>
          </TabsList>
        </div>

        {/* Player View - Simple metrics */}
        <TabsContent value="player" className="space-y-6">
          {/* Download and Send buttons - only in player view */}
          <div className="flex justify-end gap-2 mb-4">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Pobierz
            </Button>
            <Button variant="outline" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
              Wyślij
            </Button>
          </div>
          
          {renderGameReport()}
        </TabsContent>

        {/* Coach View - Advanced metrics with charts */}
        <TabsContent value="coach" className="space-y-6">
          {renderCoachReport()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
