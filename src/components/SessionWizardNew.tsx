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
  | 'challenge-select'
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
    console.log('Zapisano dane dla kroku:', stepName, data);

    // After completing a challenge, show completion screen
    setCurrentStep('complete');
  };

  const handleReturnToChallengeSelect = () => {
    // Return to challenge selection
    setCurrentStep('challenge-select');
  };

  const handleQuestionnaireSelection = (questionnaireIds: string[]) => {
    setSelectedQuestionnaires(questionnaireIds);
    if (questionnaireIds.length > 0) {
      setCurrentStep('questionnaires');
    } else {
      // Skip questionnaires, go directly to challenges
      setCurrentStep('challenge-select');
    }
  };

  const handleQuestionnairesComplete = (data: any) => {
    const updatedResults = {
      ...sessionResults,
      questionnaires: data
    };
    setSessionResults(updatedResults);
    console.log('Zapisano dane kwestionariuszy:', data);
    
    // After questionnaires, go to challenge selection
    setCurrentStep('challenge-select');
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
            onComplete={handleQuestionnairesComplete}
            onCancel={() => setCurrentStep('questionnaire-select')}
          />
        );

      case 'challenge-select':
        return (
          <div className="min-h-screen bg-background p-6">
            <Card className="max-w-4xl mx-auto">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6">Wybierz Wyzwanie</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentStep('scan')}
                    className="h-24"
                  >
                    Sigma Scan
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentStep('control')}
                    className="h-24"
                  >
                    Sigma Control
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentStep('focus')}
                    className="h-24"
                  >
                    Sigma Focus
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentStep('move')}
                    className="h-24"
                  >
                    Sigma Move
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentStep('hrv_baseline')}
                    className="h-24"
                  >
                    HRV Baseline
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentStep('hrv_training')}
                    className="h-24"
                  >
                    HRV Training
                  </Button>
                </div>
                <div className="mt-6 flex justify-between">
                  <Button variant="ghost" onClick={onClose}>
                    Anuluj
                  </Button>
                  <Button onClick={handleFinalSave}>
                    Zakończ Sesję
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'scan':
        return (
          <ScanGame 
            onComplete={(data) => handleStepComplete('scan', data)}
            onGoToCockpit={handleReturnToChallengeSelect}
          />
        );

      case 'control':
        return (
          <ControlGame 
            onComplete={(data) => handleStepComplete('control', data)}
            onGoToCockpit={handleReturnToChallengeSelect}
          />
        );

      case 'focus':
        return (
          <FocusGame 
            onComplete={(data) => handleStepComplete('focus', data)}
            onGoToCockpit={handleReturnToChallengeSelect}
          />
        );

      case 'move':
        return (
          <SigmaMoveForm 
            challengeType="time"
            onComplete={(data) => handleStepComplete('move', data)}
            onGoToCockpit={handleReturnToChallengeSelect}
          />
        );

      case 'hrv_training':
        return (
          <HRVTrainingForm 
            onComplete={(data) => handleStepComplete('hrv_training', data)}
            onGoToCockpit={handleReturnToChallengeSelect}
          />
        );

      case 'hrv_baseline':
        return (
          <HRVBaselineForm 
            onComplete={(data) => handleStepComplete('hrv_baseline', data)}
            onGoToCockpit={handleReturnToChallengeSelect}
          />
        );

      case 'complete':
        return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6 space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">
                    Zapisane!
                  </h2>
                  <p className="text-muted-foreground text-lg mb-6">
                    Twoje wyniki zostały zapisane.
                  </p>
                  <div className="text-sm text-muted-foreground mb-8">
                    <p>Możesz kontynuować sesję i wybrać kolejne wyzwanie.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={handleFinalSave}
                    className="flex-1"
                  >
                    Zakończ Sesję
                  </Button>
                  <Button 
                    onClick={handleReturnToChallengeSelect}
                    className="flex-1"
                  >
                    Wybierz Kolejne Wyzwanie
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full min-h-screen bg-background">
      {renderCurrentStep()}
    </div>
  );
};

export default SessionWizardNew;
