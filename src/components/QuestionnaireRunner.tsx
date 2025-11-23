import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { allSixSigmaQuestionnaires, type SixSigmaQuestionnaire, type SixSigmaQuestion } from "@/data/sixSigmaQuestionnaires";

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

  const getCurrentQuestionnaire = (): SixSigmaQuestionnaire | null => {
    const currentId = questionnaireIds[currentQuestionnaireIndex];
    if (currentId === 'six_sigma_full') return allSixSigmaQuestionnaires.full;
    if (currentId === 'six_sigma_lite') return allSixSigmaQuestionnaires.lite;
    if (currentId === 'six_sigma_mood') return allSixSigmaQuestionnaires.mood;
    return null;
  };

  const questionnaire = getCurrentQuestionnaire();

  if (!questionnaire) {
    return null;
  }

  // Flatten all questions from competencies and modifiers
  const allQuestions: (SixSigmaQuestion & { competency?: string })[] = [
    ...questionnaire.competencies.flatMap(comp => 
      comp.questions.map(q => ({ ...q, competency: comp.id }))
    ),
    ...(questionnaire.modifiers?.map(mod => ({
      id: mod.id,
      text: mod.question,
      type: 'direct' as const,
      domain: 'body' as const,
      competency: 'modifier'
    })) || [])
  ];

  const randomizedQuestions = useMemo(() => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled;
  }, [currentQuestionnaireIndex]);

  const currentQuestion = randomizedQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / randomizedQuestions.length) * 100;

  const handleAnswer = (value: number) => {
    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: value
    };
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < randomizedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      if (currentQuestionnaireIndex < questionnaireIds.length - 1) {
        setCurrentQuestionnaireIndex(currentQuestionnaireIndex + 1);
        setCurrentQuestionIndex(0);
        setShowIntro(true);
      } else {
        setShowCompletion(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinish = () => {
    const enrichedResponses = Object.entries(answers).map(([questionId, value]) => {
      const question = allQuestions.find(q => q.id === questionId);
      return {
        questionId,
        questionText: question?.text || '',
        competency: question?.competency || '',
        domain: question?.domain || '',
        value,
        isReverse: question?.type === 'reverse',
        isKeyIndicator: question?.isKeyIndicator || false,
        timestamp: new Date().toISOString()
      };
    });

    const results = {
      questionnaireIds,
      responses: enrichedResponses,
      completedAt: new Date().toISOString()
    };

    onComplete(results);
  };

  if (showCompletion) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-900 border-slate-800">
          <CardContent className="pt-6 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Kwestionariusz ukończony!
              </h2>
              <p className="text-slate-400">
                Twoje odpowiedzi zostały zapisane.
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                size="lg"
              >
                Powrót do Kokpitu
              </Button>
              <Button 
                onClick={handleFinish}
                className="flex-1"
                size="lg"
              >
                Dalej
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-slate-900 border-slate-800">
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">{questionnaire.name}</h2>
              <p className="text-slate-400 text-base leading-relaxed">
                {questionnaire.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>{randomizedQuestions.length} pytań</span>
                <span>•</span>
                <span>{questionnaire.estimatedTime}</span>
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg">
              <p className="text-slate-300 text-sm leading-relaxed">
                {questionnaire.usage}
              </p>
            </div>

            <Button 
              onClick={() => setShowIntro(false)} 
              className="w-full"
              size="lg"
            >
              GO!
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót
        </Button>
      </div>
      
      <Card className="w-full max-w-2xl bg-slate-900 border-slate-800">
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="text-slate-400 hover:text-white disabled:text-slate-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cofnij
            </Button>
            <span className="text-sm text-slate-400">
              {currentQuestionIndex + 1} / {randomizedQuestions.length}
            </span>
          </div>

          <Progress value={progress} className="h-2" />

          <div className="py-8">
            <h3 className="text-xl font-semibold mb-2 text-white">{questionnaire.name}</h3>
            <p className="text-lg leading-relaxed text-slate-300">{currentQuestion.text}</p>
          </div>

          <div className="space-y-4">
            <div className="text-center text-sm text-slate-400 mb-3">
              <p className="mb-1">Jak bardzo to zdanie pasuje do Ciebie?</p>
              <div className="flex justify-between px-2 text-xs">
                <span>Zupełnie nie</span>
                <span>Trochę</span>
                <span>Tak!</span>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleAnswer(value)}
                  className={`
                    h-16 rounded-lg border-2 transition-all
                    hover:scale-105 active:scale-95 flex items-center justify-center
                    ${answers[currentQuestion.id] === value
                      ? 'border-primary bg-primary text-white'
                      : 'border-slate-700 hover:border-primary/50 bg-slate-800'
                    }
                  `}
                  style={{
                    backgroundColor: answers[currentQuestion.id] === value
                      ? undefined
                      : `hsl(var(--primary) / ${0.1 + (value - 1) * 0.175})`
                  }}
                >
                  <span className="text-lg font-semibold text-white">{value}</span>
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
