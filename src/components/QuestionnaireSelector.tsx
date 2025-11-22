import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { allSixSigmaQuestionnaires } from "@/data/sixSigmaQuestionnaires";

interface QuestionnaireSelectorProps {
  onComplete: (selectedQuestionnaires: string[]) => void;
  onCancel: () => void;
}

const QuestionnaireSelector = ({ onComplete, onCancel }: QuestionnaireSelectorProps) => {
  const [selectedQuestionnaires, setSelectedQuestionnaires] = useState<string[]>([]);

  const questionnaires = [
    {
      id: 'six_sigma_full',
      name: allSixSigmaQuestionnaires.full.name,
      description: allSixSigmaQuestionnaires.full.shortName,
      questions: 36,
      time: allSixSigmaQuestionnaires.full.estimatedTime
    },
    {
      id: 'six_sigma_lite',
      name: allSixSigmaQuestionnaires.lite.name,
      description: allSixSigmaQuestionnaires.lite.shortName,
      questions: 12,
      time: allSixSigmaQuestionnaires.lite.estimatedTime
    },
    {
      id: 'six_sigma_mood',
      name: allSixSigmaQuestionnaires.mood.name,
      description: allSixSigmaQuestionnaires.mood.shortName,
      questions: 6,
      time: allSixSigmaQuestionnaires.mood.estimatedTime
    }
  ];

  const handleToggle = (questionnaireId: string) => {
    setSelectedQuestionnaires(prev =>
      prev.includes(questionnaireId)
        ? prev.filter(id => id !== questionnaireId)
        : [...prev, questionnaireId]
    );
  };

  const handleConfirm = () => {
    if (selectedQuestionnaires.length > 0) {
      onComplete(selectedQuestionnaires);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Wybierz kwestionariusze</h2>
            <p className="text-muted-foreground">
              Zaznacz kwestionariusze, które chcesz dołączyć do sesji pomiarowej.
            </p>
          </div>

          <div className="space-y-3">
            {questionnaires.map((q) => (
              <div
                key={q.id}
                className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleToggle(q.id)}
              >
                <Checkbox
                  id={q.id}
                  checked={selectedQuestionnaires.includes(q.id)}
                  onCheckedChange={() => handleToggle(q.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={q.id}
                    className="text-base font-semibold cursor-pointer"
                  >
                    {q.name}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {q.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {q.questions} pytań • {q.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Anuluj
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedQuestionnaires.length === 0}
              className="flex-1"
            >
              Kontynuuj ({selectedQuestionnaires.length})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionnaireSelector;
