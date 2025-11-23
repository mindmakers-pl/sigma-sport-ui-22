import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface SigmaFeedbackFormProps {
  onComplete: (data: any) => void;
  onGoToCockpit: () => void;
}

const SigmaFeedbackForm = ({ onComplete, onGoToCockpit }: SigmaFeedbackFormProps) => {
  const [fatigue, setFatigue] = useState(5);
  const [stress, setStress] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [sleepHours, setSleepHours] = useState(8);
  const [mood, setMood] = useState(5);
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    const feedbackData = {
      feedback_fatigue: fatigue,
      feedback_stress: stress,
      feedback_sleep_quality: sleepQuality,
      feedback_sleep_hours: sleepHours,
      feedback_mood: mood,
      feedback_notes: notes.trim() || undefined,
      feedback_timestamp: new Date().toISOString()
    };

    onComplete(feedbackData);
  };

  const isValid = true; // All numeric fields have defaults

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
      <Card className="max-w-2xl w-full bg-slate-900 border-slate-800">
        <CardContent className="pt-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-white">Sigma Feedback</h2>
            <p className="text-slate-400">
              Oceń swój stan po dzisiejszych wyzwaniach
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-2 block text-white">
                Zmęczenie (1 = świeży/a, 10 = wyczerpany/a)
              </Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[fatigue]}
                  onValueChange={(vals) => setFatigue(vals[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <span className="text-white font-semibold w-8 text-center">{fatigue}</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block text-white">
                Stres (1 = spokojny/a, 10 = bardzo zestresowany/a)
              </Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[stress]}
                  onValueChange={(vals) => setStress(vals[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <span className="text-white font-semibold w-8 text-center">{stress}</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block text-white">
                Jakość snu (1 = bardzo słaba, 10 = doskonała)
              </Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[sleepQuality]}
                  onValueChange={(vals) => setSleepQuality(vals[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <span className="text-white font-semibold w-8 text-center">{sleepQuality}</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block text-white">
                Ilość godzin snu
              </Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[sleepHours]}
                  onValueChange={(vals) => setSleepHours(vals[0])}
                  min={0}
                  max={12}
                  step={0.5}
                  className="flex-1"
                />
                <span className="text-white font-semibold w-8 text-center">{sleepHours}</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block text-white">
                Nastrój (1 = bardzo zły, 10 = doskonały)
              </Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[mood]}
                  onValueChange={(vals) => setMood(vals[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <span className="text-white font-semibold w-8 text-center">{mood}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium mb-2 block text-white">
                Dodatkowe uwagi (opcjonalnie)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Np. ból głowy, problemy z koncentracją..."
                className="min-h-[80px] bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                rows={3}
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
