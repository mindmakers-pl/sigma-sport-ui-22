import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface SigmaMoveFormProps {
  onComplete: (taskName: string, result: any) => void;
}

const SigmaMoveForm = ({ onComplete }: SigmaMoveFormProps) => {
  const [challengeResult, setChallengeResult] = useState("");
  const [avgHrv, setAvgHrv] = useState("");

  const handleSave = () => {
    if (challengeResult.trim() && avgHrv.trim()) {
      console.log('Zapisuję dane Sigma Move:', { challengeResult, avgHrv });
      onComplete('sigma_move', { challengeResult, avgHrv });
    }
  };

  const isFormValid = challengeResult.trim() && avgHrv.trim();

  return (
    <div className="flex items-center justify-center h-full p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardContent className="pt-6 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Sigma Move</h2>
            <p className="text-slate-300 text-sm">Wprowadź wyniki wyzwania motorycznego</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="challenge-result" className="text-slate-200">
                Wynik wyzwania (s)
              </Label>
              <Input
                id="challenge-result"
                type="number"
                step="0.1"
                value={challengeResult}
                onChange={(e) => setChallengeResult(e.target.value)}
                placeholder="np. 12.5"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avg-hrv" className="text-slate-200">
                Śr. HRV (ms)
              </Label>
              <Input
                id="avg-hrv"
                type="number"
                value={avgHrv}
                onChange={(e) => setAvgHrv(e.target.value)}
                placeholder="np. 58"
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

export default SigmaMoveForm;
