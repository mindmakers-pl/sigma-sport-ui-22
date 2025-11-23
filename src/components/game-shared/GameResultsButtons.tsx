import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface GameResultsButtonsProps {
  isLibrary: boolean;
  isMeasurement: boolean;
  isTraining: boolean;
  onLibraryComplete: () => void;
  onMeasurementComplete: () => void;
  onTrainingEnd: () => void;
  onTrainingSave: () => void;
  isSaving?: boolean;
}

export const GameResultsButtons = ({
  isLibrary,
  isMeasurement,
  isTraining,
  onLibraryComplete,
  onMeasurementComplete,
  onTrainingEnd,
  onTrainingSave,
  isSaving = false
}: GameResultsButtonsProps) => {
  if (isLibrary) {
    return (
      <Button 
        size="lg"
        className="w-full"
        onClick={onLibraryComplete}
      >
        Zakończ
      </Button>
    );
  }

  if (isMeasurement) {
    return (
      <>
        <div className="pt-2 pb-2 border-t border-slate-700">
          <p className="text-green-400 text-sm">✓ Zapisaliśmy Twój wynik</p>
        </div>
        <Button 
          size="lg" 
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={onMeasurementComplete}
          disabled={isSaving}
        >
          Następne Wyzwanie
        </Button>
      </>
    );
  }

  if (isTraining) {
    return (
      <div className="flex gap-3">
        <Button 
          size="lg"
          variant="outline"
          className="flex-1"
          onClick={onTrainingEnd}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zakończ
        </Button>
        <Button 
          size="lg" 
          className="flex-1 bg-green-600 hover:bg-green-700"
          onClick={onTrainingSave}
          disabled={isSaving}
        >
          Zapisz trening
        </Button>
      </div>
    );
  }

  return null;
};
