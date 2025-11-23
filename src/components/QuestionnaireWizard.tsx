import { useState } from "react";
import QuestionnaireSelector from "@/components/QuestionnaireSelector";
import QuestionnaireRunner from "@/components/QuestionnaireRunner";

interface QuestionnaireWizardProps {
  onComplete: (results: any) => void;
  onCancel: () => void;
}

const QuestionnaireWizard = ({ onComplete, onCancel }: QuestionnaireWizardProps) => {
  const [selectedQuestionnaires, setSelectedQuestionnaires] = useState<string[] | null>(null);

  if (!selectedQuestionnaires) {
    return (
      <QuestionnaireSelector
        onComplete={(ids) => setSelectedQuestionnaires(ids)}
        onCancel={onCancel}
      />
    );
  }

  return (
    <QuestionnaireRunner
      questionnaireIds={selectedQuestionnaires}
      onComplete={(data) => onComplete(data)}
      onCancel={onCancel}
    />
  );
};

export default QuestionnaireWizard;
