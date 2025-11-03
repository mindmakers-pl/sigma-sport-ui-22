import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface HRVTrainingFormProps {
  onComplete: (taskName: string, result: any) => void;
}

const HRVTrainingForm = ({ onComplete }: HRVTrainingFormProps) => {
  const [hrvStart, setHrvStart] = useState("");
  const [hrvEnd, setHrvEnd] = useState("");
  const [duration, setDuration] = useState("");
  const [technique, setTechnique] = useState("");
  const [comment, setComment] = useState("");

  const handleSave = () => {
    if (hrvStart.trim() && hrvEnd.trim() && duration.trim()) {
      const result = {
        hrvStart,
        hrvEnd,
        duration,
        technique,
        comment
      };
      console.log('Zapisuję dane HRV Training:', result);
      onComplete('hrv_training', result);
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

            <div className="space-y-2">
              <Label htmlFor="technique" className="text-slate-200">
                Zastosowana Technika
              </Label>
              <Select value={technique} onValueChange={setTechnique}>
                <SelectTrigger id="technique" className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Wybierz technikę" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="oddech-rezonansowy" className="text-white">Oddech Rezonansowy</SelectItem>
                  <SelectItem value="oddech-pudełkowy" className="text-white">Oddech Pudełkowy</SelectItem>
                  <SelectItem value="oddech-4-7-8" className="text-white">Oddech 4-7-8</SelectItem>
                  <SelectItem value="skanowanie-ciała" className="text-white">Skanowanie Ciała / Uważność</SelectItem>
                  <SelectItem value="kotwica" className="text-white">Kotwica</SelectItem>
                  <SelectItem value="wizualizacja" className="text-white">Wizualizacja</SelectItem>
                  <SelectItem value="inna" className="text-white">Inna</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment" className="text-slate-200">
                Komentarz (Opcjonalne)
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="np. zawodnik zgłaszał trudności..."
                className="bg-slate-700 border-slate-600 text-white min-h-[80px]"
              />
            </div>
          </div>

          <Button 
            onClick={handleSave}
            disabled={!isFormValid}
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

export default HRVTrainingForm;
