import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

interface SigmaFeedbackFormProps {
  onComplete: (data: any) => void;
  onGoToCockpit: () => void;
}

const SigmaFeedbackForm = ({ onComplete, onGoToCockpit }: SigmaFeedbackFormProps) => {
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");

  const handleSave = () => {
    const feedbackData = {
      question1: "Mój dzisiejszy wynik w wyzwaniach zależał głównie od...",
      answer1: answer1,
      question2: "Gdybym mógł powtórzyć dzisiejszy test, to co zrobił(a)bym inaczej?",
      answer2: answer2,
      completedAt: new Date().toISOString()
    };

    onComplete(feedbackData);
  };

  const isValid = answer1.trim().length > 0 && answer2.trim().length > 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <Button
        variant="ghost"
        onClick={onGoToCockpit}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Powrót
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Sigma Feedback</h2>
            <p className="text-muted-foreground">
              Podziel się swoimi przemyśleniami po dzisiejszych wyzwaniach
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="answer1" className="text-base font-semibold mb-3 block">
                Dokończ zdanie: Mój dzisiejszy wynik w wyzwaniach zależał głównie od...
              </Label>
              <Textarea
                id="answer1"
                value={answer1}
                onChange={(e) => setAnswer1(e.target.value)}
                placeholder="Np. mojego skupienia, zmęczenia po treningu, dobrego snu..."
                className="min-h-[120px]"
                rows={5}
              />
            </div>

            <div>
              <Label htmlFor="answer2" className="text-base font-semibold mb-3 block">
                Gdybym mógł(a) powtórzyć dzisiejszy test, to co zrobił(a)bym inaczej?
              </Label>
              <Textarea
                id="answer2"
                value={answer2}
                onChange={(e) => setAnswer2(e.target.value)}
                placeholder="Np. skupiłbym się bardziej na instrukcjach, odpoczął przed testem..."
                className="min-h-[120px]"
                rows={5}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onGoToCockpit}>
              Anuluj
            </Button>
            <Button onClick={handleSave} disabled={!isValid}>
              Zapisz odpowiedzi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SigmaFeedbackForm;
