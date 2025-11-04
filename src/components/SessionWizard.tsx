import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Kwestionariusz from "@/components/forms/Kwestionariusz";
import ScanGame from "@/pages/ScanGame";
import ControlGame from "@/pages/ControlGame";
import FocusGame from "@/pages/FocusGame";
import SigmaMoveForm from "@/components/forms/SigmaMoveForm";
import HRVTrainingForm from "@/components/forms/HRVTrainingForm";
import HRVBaselineForm from "@/components/forms/HRVBaselineForm";

interface SessionWizardProps {
  athleteId: string;
  onClose: () => void;
  onSaveSession: (results: any) => void;
}

const wizardSteps = ['questionnaire', 'scan', 'control', 'focus', 'move', 'training', 'baseline'];

const SessionWizard = ({ athleteId, onClose, onSaveSession }: SessionWizardProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState<Record<string, any>>({});

  const handleStepComplete = (stepName: string, data: any) => {
    // Krok 1: Zapisz dane z ukończonego kroku
    setSessionResults(prev => ({
      ...prev,
      [stepName]: data
    }));

    // Krok 2: Przejdź do następnego kroku
    setCurrentStepIndex(prevIndex => prevIndex + 1);
  };

  const handleGoToCockpit = () => {
    setCurrentStepIndex(-1);
    onClose();
  };

  const handleFinalSave = () => {
    console.log('Zapisuję całą sesję:', sessionResults);
    onSaveSession(sessionResults);
    onClose();
  };

  const renderCurrentStep = () => {
    switch (currentStepIndex) {
      case 0:
        return (
          <Kwestionariusz 
            onComplete={(data) => handleStepComplete('questionnaire', data)}
            onGoToCockpit={handleGoToCockpit}
          />
        );
      
      case 1:
        return (
          <ScanGame 
            onComplete={(data) => handleStepComplete('scan', data)}
            onGoToCockpit={handleGoToCockpit}
          />
        );
      
      case 2:
        return (
          <ControlGame 
            onComplete={(data) => handleStepComplete('control', data)}
            onGoToCockpit={handleGoToCockpit}
          />
        );
      
      case 3:
        return (
          <FocusGame 
            onComplete={(data) => handleStepComplete('focus', data)}
            onGoToCockpit={handleGoToCockpit}
          />
        );
      
      case 4:
        return (
          <SigmaMoveForm 
            challengeType="time"
            onComplete={(data) => handleStepComplete('move', data)}
            onGoToCockpit={handleGoToCockpit}
          />
        );
      
      case 5:
        return (
          <HRVTrainingForm 
            onComplete={(data) => handleStepComplete('training', data)}
            onGoToCockpit={handleGoToCockpit}
          />
        );
      
      case 6:
        return (
          <HRVBaselineForm 
            onComplete={(data) => handleStepComplete('baseline', data)}
            onGoToCockpit={handleGoToCockpit}
          />
        );
      
      case 7:
        return (
          <div className="flex items-center justify-center h-full p-4">
            <Card className="w-full max-w-md bg-slate-800 border-slate-700">
              <CardContent className="pt-6 space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    🎉 Sesja Zakończona!
                  </h2>
                  <p className="text-slate-300 text-lg mb-6">
                    Wszystkie zadania zostały ukończone pomyślnie.
                  </p>
                  <div className="text-sm text-slate-400 mb-8">
                    <p>Ukończone kroki: {Object.keys(sessionResults).length}</p>
                  </div>
                </div>

                <Button 
                  onClick={handleFinalSave}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  Zakończ i Zapisz
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full">
      {renderCurrentStep()}
    </div>
  );
};

export default SessionWizard;
