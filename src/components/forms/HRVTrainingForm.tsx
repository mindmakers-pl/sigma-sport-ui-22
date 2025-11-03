import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface HRVTrainingFormProps {
  onComplete: (taskName: string, result: any) => void;
}

const HRVTrainingForm = ({ onComplete }: HRVTrainingFormProps) => {
  const [hrvStart, setHrvStart] = useState("");
  const [hrvEnd, setHrvEnd] = useState("");
  const [duration, setDuration] = useState("");

  const handleSave = () => {
    if (hrvStart.trim() && hrvEnd.trim() && duration.trim()) {
      console.log('Zapisuję dane HRV Training:', { hrvStart, hrvEnd, duration });
      onComplete('hrv_training', { hrvStart, hrvEnd, duration });
    }
  };

  const isFormValid = hrvStart.trim() && hrvEnd.trim() && duration.trim();

  return (
    <div className="flex items-center justify-center h-full p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardContent className="pt-6 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">HRV Training</h2>
            <p className="text-slate-300 text-sm">Wprowadź dane z treningu HRV</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hrv-start" className="text-slate-200">
                HRV Start (ms)
              </Label>
              <Input
                id="hrv-start"
                type="number"
                value={hrvStart}
                onChange={(e) => setHrvStart(e.target.value)}
                placeholder="np. 65"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hrv-end" className="text-slate-200">
                HRV Koniec (ms)
              </Label>
              <Input
                id="hrv-end"
                type="number"
                value={hrvEnd}
                onChange={(e) => setHrvEnd(e.target.value)}
                placeholder="np. 72"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-slate-200">
                Czas Trwania (s)
              </Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="np. 120"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <Button 
            onClick={handleSave}
            disabled={!isFormValid}
            className="w-full"
            size="lg"
          >
            Zapisz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HRVTrainingForm;
