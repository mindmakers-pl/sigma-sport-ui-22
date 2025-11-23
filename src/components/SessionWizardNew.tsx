import { useState } from "react";
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

    // Return to cockpit after each task
    onClose();
  };

  const handleQuestionnaireSelection = (questionnaireIds: string[]) => {
    setSelectedQuestionnaires(questionnaireIds);
    if (questionnaireIds.length > 0) {
      setCurrentStep('questionnaires');
    } else {
      onClose();
    }
  };

  const handleQuestionnairesComplete = (data: any) => {
    const updatedResults = {
      ...sessionResults,
      questionnaires: data
    };
    setSessionResults(updatedResults);
    
    // Auto-save
    const existingSessions = JSON.parse(localStorage.getItem('athlete_sessions') || '[]');
    const sessionIndex = existingSessions.findIndex((s: any) => s.athleteId === athleteId && s.inProgress);
    
    if (sessionIndex >= 0) {
      existingSessions[sessionIndex].results = updatedResults;
      localStorage.setItem('athlete_sessions', JSON.stringify(existingSessions));
    }

    toast({
      title: "Kwestionariusz ukończony",
      description: "Dane zostały zapisane.",
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
            onCancel={onClose}
          />
        );

      case 'scan':
        return (
          <ScanGame 
            mode="measurement"
            onComplete={(data) => handleStepComplete('scan', data)}
            onGoToCockpit={onClose}
          />
        );

      case 'focus':
        return (
          <FocusGame 
            mode="measurement"
            onComplete={(data) => handleStepComplete('focus', data)}
            onGoToCockpit={onClose}
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
