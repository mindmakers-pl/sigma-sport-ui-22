import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { QuestionnaireDefinition, Question } from "@/data/sixSigmaQuestionnaires";
import { QuestionnaireResponse } from "@/utils/sixSigmaScoring";

interface SixSigmaQuestionnaireProps {
  questionnaire: QuestionnaireDefinition;
  onComplete: (responses: QuestionnaireResponse[]) => void;
  onBack?: () => void;
}

const SixSigmaQuestionnaire = ({ questionnaire, onComplete, onBack }: SixSigmaQuestionnaireProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});

  const currentQuestion = questionnaire.questions[currentIndex];
  const progress = ((currentIndex + 1) / questionnaire.questions.length) * 100;
  const isLastQuestion = currentIndex === questionnaire.questions.length - 1;
  const hasAnswer = responses[currentQuestion.id] !== undefined;

  const handleAnswer = (value: number) => {
    setResponses(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Prepare responses for scoring
      const formattedResponses: QuestionnaireResponse[] = questionnaire.questions.map(q => ({
        questionId: q.id,
        value: responses[q.id],
        competence: q.competence,
        reversed: q.reversed,
        keyIndicator: q.keyIndicator
      }));
      onComplete(formattedResponses);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const scaleValues = questionnaire.scaleType === 5 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardContent className="pt-8 pb-6 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              <Badge className="text-xs">{questionnaire.name}</Badge>
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {questionnaire.questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <div className="py-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-block px-3 py-1 bg-primary/10 rounded-full mb-4">
                <span className="text-sm font-medium text-primary">{currentQuestion.competence}</span>
              </div>
              <h2 className="text-2xl font-bold leading-relaxed px-4">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Likert Scale - Large Tiles */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch mt-8">
              {scaleValues.map((value) => {
                const isSelected = responses[currentQuestion.id] === value;
                return (
                  <button
                    key={value}
                    onClick={() => handleAnswer(value)}
                    className={`
                      flex-1 min-h-[80px] sm:min-h-[120px] rounded-xl border-2 transition-all duration-200
                      flex flex-col items-center justify-center gap-2 p-4
                      ${isSelected 
                        ? 'border-primary bg-primary text-primary-foreground shadow-lg scale-105' 
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                      }
                    `}
                  >
                    <span className="text-3xl sm:text-4xl font-bold">{value}</span>
                    {value === scaleValues[0] && (
                      <span className="text-xs text-center">{questionnaire.scaleLabels.min}</span>
                    )}
                    {value === scaleValues[scaleValues.length - 1] && (
                      <span className="text-xs text-center">{questionnaire.scaleLabels.max}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Scale Labels (Mobile) */}
            <div className="flex justify-between text-xs text-muted-foreground px-2 sm:hidden">
              <span>{questionnaire.scaleLabels.min}</span>
              <span>{questionnaire.scaleLabels.max}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {currentIndex === 0 ? 'Wróć' : 'Poprzednie'}
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!hasAnswer}
              className="gap-2"
            >
              {isLastQuestion ? 'Zakończ' : 'Następne'}
              {!isLastQuestion && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SixSigmaQuestionnaire;
