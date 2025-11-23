import { useState } from "react";
import QuestionnaireSelector from "@/components/QuestionnaireSelector";
import QuestionnaireRunner from "@/components/QuestionnaireRunner";
import ScanGame from "@/pages/ScanGame";
import FocusGame from "@/pages/FocusGame";
import MemoGame from "@/pages/MemoGame";
import SigmaFeedbackForm from "@/components/forms/SigmaFeedbackForm";
import HRVBaselineForm from "@/components/forms/HRVBaselineForm";
import { useToast } from "@/hooks/use-toast";
import { useSessions } from "@/hooks/useSessions";
import { useSessionTasks } from "@/hooks/useSessionTasks";

interface SessionWizardNewProps {
  athleteId: string;
  sessionId?: string; // Optional - for editing existing session
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

const SessionWizardNew = ({ athleteId, sessionId, onClose, onSaveSession }: SessionWizardNewProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('questionnaire-select');
  const [sessionResults, setSessionResults] = useState<Record<string, any>>({});
  const [selectedQuestionnaires, setSelectedQuestionnaires] = useState<string[]>([]);
  const { toast } = useToast();
  const { addSession, updateSession } = useSessions(athleteId);
  const { addTask } = useSessionTasks(sessionId);

  const handleStepComplete = async (stepName: string, data: any) => {
    const updatedResults = {
      ...sessionResults,
      [stepName]: data
    };
    setSessionResults(updatedResults);
    
    // Auto-save to Supabase
    if (sessionId) {
      // Update existing session
      const { error } = await updateSession(sessionId, { 
        results: updatedResults 
      });
      
      if (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się zapisać wyniku",
          variant: "destructive",
        });
        return;
      }
      
      // Also save as session task
      await addTask({
        session_id: sessionId,
        task_type: stepName,
        task_data: data
      });
    } else {
      // Create new session
      const { data: newSession, error } = await addSession({
        athlete_id: athleteId,
        date: new Date().toISOString(),
        results: updatedResults,
        in_progress: true
      });
      
      if (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się utworzyć sesji",
          variant: "destructive",
        });
        return;
      }
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

  const handleQuestionnairesComplete = async (data: any) => {
    const updatedResults = {
      ...sessionResults,
      questionnaires: data
    };
    setSessionResults(updatedResults);
    
    // Auto-save to Supabase
    if (sessionId) {
      const { error } = await updateSession(sessionId, { 
        results: updatedResults 
      });
      
      if (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się zapisać kwestionariusza",
          variant: "destructive",
        });
        return;
      }
    } else {
      const { error } = await addSession({
        athlete_id: athleteId,
        date: new Date().toISOString(),
        results: updatedResults,
        in_progress: true
      });
      
      if (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się utworzyć sesji",
          variant: "destructive",
        });
        return;
      }
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
