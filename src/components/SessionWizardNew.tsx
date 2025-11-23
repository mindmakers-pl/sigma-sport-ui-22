import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import QuestionnaireSelector from "@/components/QuestionnaireSelector";
import QuestionnaireRunner from "@/components/QuestionnaireRunner";
import ScanGame from "@/pages/ScanGame";
import FocusGame from "@/pages/FocusGame";
import MemoGame from "@/pages/MemoGame";
import SigmaFeedbackForm from "@/components/forms/SigmaFeedbackForm";
import HRVBaselineForm from "@/components/forms/HRVBaselineForm";
import { useToast } from "@/hooks/use-toast";

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
  | 'focus'
  | 'memo'
  | 'feedback'
  | 'hrv_baseline';

const SessionWizardNew = ({ athleteId, onClose, onSaveSession }: SessionWizardNewProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('questionnaire-select');
  const [sessionResults, setSessionResults] = useState<Record<string, any>>({});
  const [selectedQuestionnaires, setSelectedQuestionnaires] = useState<string[]>([]);
  const { toast } = useToast();

  const handleStepComplete = (stepName: string, data: any) => {
    const updatedResults = {
      ...sessionResults,
      [stepName]: data
    };
    setSessionResults(updatedResults);
    
    // Auto-save to localStorage
    const existingSessions = JSON.parse(localStorage.getItem('athlete_sessions') || '[]');
    const sessionIndex = existingSessions.findIndex((s: any) => s.athleteId === athleteId && s.inProgress);
    
    if (sessionIndex >= 0) {
      existingSessions[sessionIndex].results = updatedResults;
      localStorage.setItem('athlete_sessions', JSON.stringify(existingSessions));
    }

    toast({
      title: "Zapisano",
      description: "Wynik został zapisany do sesji.",
    });

    // Return to challenge selection
    setCurrentStep('challenge-select');
  };

  const handleReturnToCockpit = () => {
    onClose();
  };

  const handleQuestionnaireSelection = (questionnaireIds: string[]) => {
    setSelectedQuestionnaires(questionnaireIds);
    if (questionnaireIds.length > 0) {
      setCurrentStep('questionnaires');
    } else {
      setCurrentStep('challenge-select');
    }
  };

  const handleQuestionnairesComplete = (data: any) => {
    const updatedResults = {
      ...sessionResults,
      questionnaires: data
    };
    setSessionResults(updatedResults);
    
    toast({
      title: "Kwestionariusz ukończony",
      description: "Dane zostały zapisane.",
    });
    
    setCurrentStep('challenge-select');
  };

  const handleFinalSave = () => {
    onSaveSession(sessionResults);
    
    toast({
      title: "Sesja zakończona",
      description: "Wszystkie dane zostały zapisane.",
    });
    
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
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <Card className="max-w-4xl w-full bg-slate-900 border-slate-800">
              <CardContent className="pt-6 space-y-6">
                <h2 className="text-xl font-semibold text-white">Wybierz Wyzwanie</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentStep('scan')}
                    className="h-20 text-base"
                  >
                    Sigma Scan
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentStep('focus')}
                    className="h-20 text-base"
                  >
                    Sigma Focus
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentStep('memo')}
                    className="h-20 text-base"
                  >
                    Sigma Memo
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentStep('feedback')}
                    className="h-20 text-base"
                  >
                    Sigma Feedback
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentStep('hrv_baseline')}
                    className="h-20 text-base"
                  >
                    HRV Baseline
                  </Button>
                </div>
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="ghost" 
                    onClick={handleReturnToCockpit}
                  >
                    Powrót do Kokpitu
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
            onGoToCockpit={handleReturnToCockpit}
          />
        );

      case 'focus':
        return (
          <FocusGame 
            onComplete={(data) => handleStepComplete('focus', data)}
            onGoToCockpit={handleReturnToCockpit}
          />
        );

      case 'memo':
        return (
          <MemoGame 
            mode="measurement"
            onComplete={(data) => handleStepComplete('memo', data)}
          />
        );

      case 'feedback':
        return (
          <SigmaFeedbackForm 
            onComplete={(data) => handleStepComplete('feedback', data)}
            onGoToCockpit={handleReturnToCockpit}
          />
        );

      case 'hrv_baseline':
        return (
          <HRVBaselineForm 
            onComplete={(data) => handleStepComplete('hrv_baseline', data)}
            onGoToCockpit={handleReturnToCockpit}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full min-h-screen">
      {renderCurrentStep()}
    </div>
  );
};

export default SessionWizardNew;
