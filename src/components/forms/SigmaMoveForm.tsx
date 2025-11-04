import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface SigmaMoveFormProps {
  challengeType: string;
  onComplete: (data: any) => void;
  onGoToCockpit?: () => void;
}

const SigmaMoveForm = ({ challengeType, onComplete, onGoToCockpit }: SigmaMoveFormProps) => {
  // Pola dla różnych typów wyzwań
  const [timeResult, setTimeResult] = useState("");
  const [repsResult, setRepsResult] = useState("");
  const [successCount, setSuccessCount] = useState("");
  const [attemptCount, setAttemptCount] = useState("");
  const [avgHrv, setAvgHrv] = useState("");

  const handleSave = () => {
    let resultPayload: any = {
      type: challengeType,
      hrv: avgHrv
    };

    // Dodaj odpowiednie dane w zależności od typu wyzwania
    if (challengeType === 'move_1_czas') {
      resultPayload.result = timeResult;
    } else if (challengeType === 'move_2_powtorzenia') {
      resultPayload.result = repsResult;
    } else if (challengeType === 'move_3_skutecznosc') {
      resultPayload.successCount = successCount;
      resultPayload.attemptCount = attemptCount;
    }

    console.log('Zapisuję dane Sigma Move:', resultPayload);
    onComplete(resultPayload);
  };

  // Walidacja w zależności od typu wyzwania
  const isFormValid = () => {
    if (!avgHrv.trim()) return false;
    
    if (challengeType === 'move_1_czas') {
      return timeResult.trim() !== '';
    } else if (challengeType === 'move_2_powtorzenia') {
      return repsResult.trim() !== '';
    } else if (challengeType === 'move_3_skutecznosc') {
      return successCount.trim() !== '' && attemptCount.trim() !== '';
    }
    return false;
  };

  return (
    <div className="flex items-center justify-center h-full p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardContent className="pt-6 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Sigma Move</h2>
            <p className="text-slate-300 text-sm">Wprowadź wyniki wyzwania motorycznego</p>
          </div>

          <div className="space-y-4">
            {/* Warunkowe renderowanie pól w zależności od typu wyzwania */}
            {challengeType === 'move_1_czas' && (
              <div className="space-y-2">
                <Label htmlFor="time-result" className="text-slate-200">
                  Wynik (s)
                </Label>
                <Input
                  id="time-result"
                  type="number"
                  step="0.1"
                  value={timeResult}
                  onChange={(e) => setTimeResult(e.target.value)}
                  placeholder="np. 12.5"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            )}

            {challengeType === 'move_2_powtorzenia' && (
              <div className="space-y-2">
                <Label htmlFor="reps-result" className="text-slate-200">
                  Liczba Powtórzeń
                </Label>
                <Input
                  id="reps-result"
                  type="number"
                  value={repsResult}
                  onChange={(e) => setRepsResult(e.target.value)}
                  placeholder="np. 25"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            )}

            {challengeType === 'move_3_skutecznosc' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="success-count" className="text-slate-200">
                    Liczba Sukcesów
                  </Label>
                  <Input
                    id="success-count"
                    type="number"
                    value={successCount}
                    onChange={(e) => setSuccessCount(e.target.value)}
                    placeholder="np. 18"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attempt-count" className="text-slate-200">
                    Liczba Prób
                  </Label>
                  <Input
                    id="attempt-count"
                    type="number"
                    value={attemptCount}
                    onChange={(e) => setAttemptCount(e.target.value)}
                    placeholder="np. 20"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            )}

            {/* Pole HRV zawsze widoczne na dole */}
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
            disabled={!isFormValid()}
            className="w-full bg-green-600 hover:bg-green-700"
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
