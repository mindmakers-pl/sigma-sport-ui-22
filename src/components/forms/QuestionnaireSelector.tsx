import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, FileCheck, ArrowRight } from "lucide-react";
import { allSixSigmaQuestionnaires } from "@/data/sixSigmaQuestionnaires";

interface QuestionnaireSelectorProps {
  onStart: (selectedIds: string[]) => void;
  onBack?: () => void;
}

const QuestionnaireSelector = ({ onStart, onBack }: QuestionnaireSelectorProps) => {
  const [selected, setSelected] = useState<string[]>(['six_sigma_mood']); // Mood always selected by default

  const toggleSelection = (id: string) => {
    if (id === 'six_sigma_mood') return; // Mood is mandatory
    
    setSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(qId => qId !== id);
      } else {
        // Only allow one main questionnaire (Full or Lite)
        const withoutMain = prev.filter(qId => 
          !qId.startsWith('six_sigma_full') && !qId.startsWith('six_sigma_lite')
        );
        return [...withoutMain, id];
      }
    });
  };

  const handleStart = () => {
    if (selected.length > 1) { // Must have Mood + at least one main questionnaire
      onStart(selected);
    }
  };

  const hasMainQuestionnaire = selected.some(id => 
    id === 'six_sigma_full' || id === 'six_sigma_lite'
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">Wybierz kwestionariusze</CardTitle>
          <CardDescription>
            Zaznacz które kwestionariusze zawodnik ma wypełnić
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allSixSigmaQuestionnaires.map(q => {
            const isSelected = selected.includes(q.id);
            const isMood = q.id === 'six_sigma_mood';
            const isFull = q.id === 'six_sigma_full';
            const isLite = q.id === 'six_sigma_lite';

            return (
              <Card 
                key={q.id}
                className={`cursor-pointer transition-all ${
                  isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                } ${isMood ? 'opacity-100' : ''}`}
                onClick={() => !isMood && toggleSelection(q.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Checkbox 
                      checked={isSelected}
                      disabled={isMood}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold flex items-center gap-2">
                            {q.name}
                            {isMood && <Badge variant="secondary">Obowiązkowy</Badge>}
                            {isFull && <Badge>Baseline/Final</Badge>}
                            {isLite && <Badge variant="outline">Cotygodniowy</Badge>}
                          </h3>
                          <p className="text-sm text-muted-foreground">{q.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileCheck className="h-4 w-4" />
                          <span>{q.questions.length} pytań</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{q.duration}</span>
                        </div>
                      </div>

                      {isFull && (
                        <p className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                          💡 Użyj podczas pierwszego pomiaru (baseline) i pomiaru końcowego (ewaluacja po sezonie)
                        </p>
                      )}
                      {isLite && (
                        <p className="text-xs text-muted-foreground bg-green-50 dark:bg-green-950 p-3 rounded-md">
                          💡 Użyj po każdym Sprincie (co miesiąc) do szybkiego monitoringu
                        </p>
                      )}
                      {isMood && (
                        <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950 p-3 rounded-md">
                          💡 Kontekst i stan zawodnika - zawsze wypełniany w każdym pomiarze
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex gap-3 justify-between pt-4">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                Wróć
              </Button>
            )}
            <Button 
              onClick={handleStart}
              disabled={!hasMainQuestionnaire}
              className="ml-auto gap-2"
            >
              Rozpocznij
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionnaireSelector;
