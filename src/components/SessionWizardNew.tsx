import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import QuestionnaireSelector from "@/components/QuestionnaireSelector";
import QuestionnaireRunner from "@/components/QuestionnaireRunner";
import ScanGame from "@/pages/ScanGame";
import ControlGame from "@/pages/ControlGame";
import FocusGame from "@/pages/FocusGame";
import SigmaMoveForm from "@/components/forms/SigmaMoveForm";
import HRVTrainingForm from "@/components/forms/HRVTrainingForm";
import HRVBaselineForm from "@/components/forms/HRVBaselineForm";

interface SessionWizardNewProps {
  athleteId: string;
  onClose: () => void;
  onSaveSession: (results: any) => void;
}

type WizardStep = 
  | 'questionnaire-select'
  | 'questionnaires'
  | 'scan' 
  | 'control' 
  | 'focus' 
  | 'move' 
  | 'hrv_baseline'
  | 'hrv_training'
  | 'complete';

const SessionWizardNew = ({ athleteId, onClose, onSaveSession }: SessionWizardNewProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('questionnaire-select');
  const [sessionResults, setSessionResults] = useState<Record<string, any>>({});
  const [selectedQuestionnaires, setSelectedQuestionnaires] = useState<string[]>([]);

  const handleStepComplete = (stepName: string, data: any) => {
    const updatedResults = {
      ...sessionResults,
      [stepName]: data
    };
    setSessionResults(updatedResults);

    // Move to next step
    if (currentStep === 'questionnaires') setCurrentStep('scan');
    else if (currentStep === 'scan') setCurrentStep('control');
    else if (currentStep === 'control') setCurrentStep('focus');
    else if (currentStep === 'focus') setCurrentStep('move');
    else if (currentStep === 'move') setCurrentStep('hrv_training');
    else if (currentStep === 'hrv_training') setCurrentStep('hrv_baseline');
    else if (currentStep === 'hrv_baseline') setCurrentStep('complete');
  };

  const handleQuestionnaireSelection = (questionnaireIds: string[]) => {
    setSelectedQuestionnaires(questionnaireIds);
    setCurrentStep('questionnaires');
  };

  const handleFinalSave = () => {
    console.log('Zapisuję całą sesję:', sessionResults);
    onSaveSession(sessionResults);
    onClose();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'questionnaire-select':
        return (
          <QuestionnaireSelector
            onComplete={handleQuestionnaireSelection}
            onCancel={onClose}
          />
        );

      case 'questionnaires':
        return (
          <QuestionnaireRunner
            questionnaireIds={selectedQuestionnaires}
            onComplete={(data) => handleStepComplete('questionnaires', data)}
            onCancel={() => setCurrentStep('questionnaire-select')}
          />
        );

      case 'scan':
        return (
          <ScanGame 
            onComplete={(data) => handleStepComplete('scan', data)}
            onGoToCockpit={onClose}
          />
        );

      case 'control':
        return (
          <ControlGame 
            onComplete={(data) => handleStepComplete('control', data)}
            onGoToCockpit={onClose}
          />
        );

      case 'focus':
        return (
          <FocusGame 
            onComplete={(data) => handleStepComplete('focus', data)}
            onGoToCockpit={onClose}
          />
        );

      case 'move':
        return (
          <SigmaMoveForm 
            challengeType="time"
            onComplete={(data) => handleStepComplete('move', data)}
            onGoToCockpit={onClose}
          />
        );

      case 'hrv_training':
        return (
          <HRVTrainingForm 
            onComplete={(data) => handleStepComplete('hrv_training', data)}
            onGoToCockpit={onClose}
          />
        );

      case 'hrv_baseline':
        return (
          <HRVBaselineForm 
            onComplete={(data) => handleStepComplete('hrv_baseline', data)}
            onGoToCockpit={onClose}
          />
        );

      case 'complete':
        return (
          <div className="flex items-center justify-center h-full p-4">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6 space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">
                    Sesja zakończona!
                  </h2>
                  <p className="text-muted-foreground text-lg mb-6">
                    Wszystkie zadania zostały ukończone pomyślnie.
                  </p>
                  <div className="text-sm text-muted-foreground mb-8">
                    <p>Ukończone kroki: {Object.keys(sessionResults).length}</p>
                  </div>
                </div>

                <Button 
                  onClick={handleFinalSave}
                  className="w-full"
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

export default SessionWizardNew;
