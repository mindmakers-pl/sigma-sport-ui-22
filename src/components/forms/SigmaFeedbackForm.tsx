import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
    <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
      <Card className="max-w-2xl w-full bg-slate-900 border-slate-800">
        <CardContent className="pt-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-white">Sigma Feedback</h2>
            <p className="text-slate-400">
              Podziel się swoimi przemyśleniami po dzisiejszych wyzwaniach
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="answer1" className="text-sm font-medium mb-2 block text-white">
                Dokończ zdanie: Mój dzisiejszy wynik w wyzwaniach zależał głównie od...
              </Label>
              <Textarea
                id="answer1"
                value={answer1}
                onChange={(e) => setAnswer1(e.target.value)}
                placeholder="Np. mojego skupienia, zmęczenia po treningu, dobrego snu..."
                className="min-h-[100px] bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="answer2" className="text-sm font-medium mb-2 block text-white">
                Gdybym mógł(a) powtórzyć dzisiejszy test, to co zrobił(a)bym inaczej?
              </Label>
              <Textarea
                id="answer2"
                value={answer2}
                onChange={(e) => setAnswer2(e.target.value)}
                placeholder="Np. skupiłbym się bardziej na instrukcjach, odpoczął przed testem..."
                className="min-h-[100px] bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                rows={4}
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={!isValid}
            className="w-full"
            size="lg"
          >
            Zapisz Feedback
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SigmaFeedbackForm;
