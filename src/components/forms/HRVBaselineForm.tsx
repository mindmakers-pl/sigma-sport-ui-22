import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface HRVBaselineFormProps {
  onComplete: (taskName: string, result: any) => void;
}

const HRVBaselineForm = ({ onComplete }: HRVBaselineFormProps) => {
  const [hrvValue, setHrvValue] = useState("");

  const handleSave = () => {
    if (hrvValue.trim()) {
      console.log('Zapisuję dane HRV Baseline:', { hrvValue });
      onComplete('hrv_baseline', { hrv: hrvValue });
    }
  };

  return (
    <div className="flex items-center justify-center h-full p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardContent className="pt-6 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">HRV Baseline</h2>
            <p className="text-slate-300 text-sm">Wprowadź wartość pomiaru HRV spoczynkowego</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hrv-baseline" className="text-slate-200">
              Wynik HRV (ms)
            </Label>
            <Input
              id="hrv-baseline"
              type="number"
              value={hrvValue}
              onChange={(e) => setHrvValue(e.target.value)}
              placeholder="np. 65"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <Button 
            onClick={handleSave}
            disabled={!hrvValue.trim()}
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

export default HRVBaselineForm;
