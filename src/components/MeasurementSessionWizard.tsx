import { useState } from "react";
import QuestionnaireWizard from "@/components/QuestionnaireWizard";
import ScanGame from "@/pages/ScanGame";
import FocusGame from "@/pages/FocusGame";
import MemoGame from "@/pages/MemoGame";
import SigmaFeedbackForm from "@/components/forms/SigmaFeedbackForm";
import HRVBaselineForm from "@/components/forms/HRVBaselineForm";

interface MeasurementSessionWizardProps {
  taskType: 'kwestionariusz' | 'hrv_baseline' | 'scan' | 'focus' | 'memo' | 'feedback';
  onComplete: (taskName: string, data: any) => void;
  onCancel: () => void;
}

const MeasurementSessionWizard = ({ taskType, onComplete, onCancel }: MeasurementSessionWizardProps) => {
  
  const handleTaskComplete = (data: any) => {
    console.log(`✅ Task ${taskType} completed with data:`, data);
    onComplete(taskType, data);
  };

  switch (taskType) {
    case 'kwestionariusz':
      return (
        <QuestionnaireWizard
          onComplete={handleTaskComplete}
          onCancel={onCancel}
        />
      );
    
    case 'hrv_baseline':
      return (
        <HRVBaselineForm
          onComplete={handleTaskComplete}
          onGoToCockpit={onCancel}
        />
      );
    
    case 'scan':
      return (
        <ScanGame
          mode="measurement"
          onComplete={handleTaskComplete}
          onGoToCockpit={onCancel}
        />
      );
    
    case 'focus':
      return (
        <FocusGame
          mode="measurement"
          onComplete={handleTaskComplete}
          onGoToCockpit={onCancel}
        />
      );
    
    case 'memo':
      return (
        <MemoGame
          mode="measurement"
          onComplete={handleTaskComplete}
        />
      );
    
    case 'feedback':
      return (
        <SigmaFeedbackForm
          onComplete={handleTaskComplete}
          onGoToCockpit={onCancel}
        />
      );
    
    default:
      return null;
  }
};

export default MeasurementSessionWizard;
