import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HRVInputFieldsProps {
  rmssd: string;
  hr: string;
  onRmssdChange: (value: string) => void;
  onHrChange: (value: string) => void;
  className?: string;
}

export const HRVInputFields = ({
  rmssd,
  hr,
  onRmssdChange,
  onHrChange,
  className = ""
}: HRVInputFieldsProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="font-semibold text-white">Dane HRV (opcjonalne)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rmssd" className="text-slate-300">rMSSD (ms)</Label>
          <Input
            id="rmssd"
            type="number"
            placeholder="np. 45"
            value={rmssd}
            onChange={(e) => onRmssdChange(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
        <div>
          <Label htmlFor="hr" className="text-slate-300">Średnie HR (bpm)</Label>
          <Input
            id="hr"
            type="number"
            placeholder="np. 72"
            value={hr}
            onChange={(e) => onHrChange(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </div>
    </div>
  );
};
