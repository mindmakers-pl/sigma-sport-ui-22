import { useMemo, useState } from "react";
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
  const [questionnaireStartTime, setQuestionnaireStartTime] = useState<number | null>(null);

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

  const randomizedQuestions = useMemo(() => {
    return [...allQuestions].sort(() => Math.random() - 0.5);
  }, [questionnaire.id]);

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
      // Questionnaire completed - score it with enriched metadata
      const completionTimeSeconds = questionnaireStartTime 
        ? Math.round((Date.now() - questionnaireStartTime) / 1000)
        : undefined;
      
      console.log(`Kwestionariusz wypełniony w ${completionTimeSeconds}s`);
      
      const responses: QuestionnaireResponse[] = Object.entries(newAnswers).map(([questionId, value]) => {
        // Find the original question to get metadata
        const question = allQuestions.find(q => q.id === questionId);
        
        // Find which competency this question belongs to
        let competencyId = '';
        questionnaire.competencies.forEach(comp => {
          if (comp.questions.find(q => q.id === questionId)) {
            competencyId = comp.id;
          }
        });
        
        // Check if it's a modifier question
        const isModifier = questionnaire.modifiers?.find(m => m.id === questionId);
        
        return {
          questionId,
          value,
          questionText: question?.text || isModifier?.question || '',
          competency: competencyId || (isModifier ? 'modifier' : ''),
          domain: question?.domain,
          type: question?.type,
          isKeyIndicator: question?.isKeyIndicator,
          weight: question?.weight
        };
      });

      const scored = scoreQuestionnaire(questionnaire, responses, completionTimeSeconds);
      const newCompleted = [...completedQuestionnaires, scored];
      setCompletedQuestionnaires(newCompleted);
      
      console.log('Scored questionnaire with responses:', scored);

      // Check if more questionnaires to go
      if (currentQuestionnaireIndex < questionnaireIds.length - 1) {
        // Move to next questionnaire
        setCurrentQuestionnaireIndex(prev => prev + 1);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setShowIntro(true);
        setQuestionnaireStartTime(null); // Reset timer for next questionnaire
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900 border-slate-800">
          <CardContent className="pt-6 space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4 text-white">Świetna robota!</h2>
              <p className="text-slate-400 text-lg mb-6">
                Wszystkie kwestionariusze zostały wypełnione.
              </p>
            </div>

            <div className="pt-2 pb-2 border-t border-slate-800">
              <p className="text-green-400 text-sm text-center">✓ Zapisane</p>
            </div>

            <Button onClick={handleFinish} className="w-full" size="lg">
              Wybierz Wyzwanie
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showIntro) {
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

        <Card className="w-full max-w-md bg-slate-900 border-slate-800">
          <CardContent className="pt-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-white">{questionnaire.name}</h2>
              <p className="text-slate-400 whitespace-pre-line leading-relaxed">
                {questionnaire.description}
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{randomizedQuestions.length}</span> pytań
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{questionnaire.estimatedTime}</span>
              </div>
            </div>

            <Button onClick={() => {
              setShowIntro(false);
              setQuestionnaireStartTime(Date.now());
            }} className="w-full" size="lg">
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
