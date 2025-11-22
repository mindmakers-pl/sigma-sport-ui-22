import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { 
  allSixSigmaQuestionnaires, 
  SixSigmaQuestionnaire, 
  SixSigmaQuestion 
} from "@/data/sixSigmaQuestionnaires";
import { scoreQuestionnaire, QuestionnaireResponse } from "@/utils/sixSigmaScoring";

interface QuestionnaireRunnerProps {
  questionnaireIds: string[];
  onComplete: (results: any) => void;
  onCancel: () => void;
}

const QuestionnaireRunner = ({ questionnaireIds, onComplete, onCancel }: QuestionnaireRunnerProps) => {
  const [currentQuestionnaireIndex, setCurrentQuestionnaireIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showIntro, setShowIntro] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completedQuestionnaires, setCompletedQuestionnaires] = useState<any[]>([]);

  const getCurrentQuestionnaire = (): SixSigmaQuestionnaire | null => {
    const qId = questionnaireIds[currentQuestionnaireIndex];
    if (qId === 'six_sigma_full') return allSixSigmaQuestionnaires.full;
    if (qId === 'six_sigma_lite') return allSixSigmaQuestionnaires.lite;
    if (qId === 'six_sigma_mood') return allSixSigmaQuestionnaires.mood;
    return null;
  };

  const questionnaire = getCurrentQuestionnaire();
  if (!questionnaire) return null;

  // Flatten all questions (from competencies and modifiers)
  const allQuestions: SixSigmaQuestion[] = [
    ...questionnaire.competencies.flatMap(c => c.questions),
    ...(questionnaire.modifiers?.map(m => ({
      id: m.id,
      text: m.question,
      type: 'direct' as const,
      domain: 'body' as const,
      weight: 1.0
    })) || [])
  ];

  // Randomize questions
  const [randomizedQuestions] = useState(() => {
    return [...allQuestions].sort(() => Math.random() - 0.5);
  });

  const currentQuestion = randomizedQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / randomizedQuestions.length) * 100;

  const handleAnswer = (value: number) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: value
    };
    setAnswers(newAnswers);

    // Auto-advance
    if (currentQuestionIndex < randomizedQuestions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 300);
    } else {
      // Questionnaire completed - score it
      const responses: QuestionnaireResponse[] = Object.entries(newAnswers).map(([questionId, value]) => ({
        questionId,
        value
      }));

      const scored = scoreQuestionnaire(questionnaire, responses);
      const newCompleted = [...completedQuestionnaires, scored];
      setCompletedQuestionnaires(newCompleted);

      // Check if more questionnaires to go
      if (currentQuestionnaireIndex < questionnaireIds.length - 1) {
        // Move to next questionnaire
        setCurrentQuestionnaireIndex(prev => prev + 1);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setShowIntro(true);
      } else {
        // All questionnaires completed
        setShowCompletion(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    onComplete({ questionnaires: completedQuestionnaires });
  };

  if (showCompletion) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Świetna robota!</h2>
              <p className="text-muted-foreground text-lg mb-6">
                Wszystkie kwestionariusze zostały wypełnione. Twoje odpowiedzi zostały zapisane.
              </p>
              <div className="text-sm text-muted-foreground mb-8">
                <p>Ukończone kwestionariusze: {completedQuestionnaires.length}</p>
              </div>
            </div>

            <Button onClick={handleFinish} className="w-full" size="lg">
              Zakończ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">{questionnaire.name}</h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {questionnaire.description}
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{randomizedQuestions.length}</span> pytań
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{questionnaire.estimatedTime}</span>
              </div>
            </div>

            <Button onClick={() => setShowIntro(false)} className="w-full" size="lg">
              GO!
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cofnij
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentQuestionIndex + 1} / {randomizedQuestions.length}
            </span>
          </div>

          <Progress value={progress} className="h-2" />

          <div className="py-8">
            <h3 className="text-xl font-semibold mb-2">{questionnaire.name}</h3>
            <p className="text-lg leading-relaxed">{currentQuestion.text}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-2 px-2">
              <span>Zupełnie nie o mnie</span>
              <span>Trochę o mnie</span>
              <span>O mnie!</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleAnswer(value)}
                  className={`
                    h-16 rounded-lg border-2 transition-all
                    hover:scale-105 active:scale-95
                    ${answers[currentQuestion.id] === value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                  style={{
                    backgroundColor: answers[currentQuestion.id] === value
                      ? undefined
                      : `hsl(var(--primary) / ${0.1 + (value - 1) * 0.175})`
                  }}
                >
                  <span className="text-lg font-semibold">{value}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionnaireRunner;
