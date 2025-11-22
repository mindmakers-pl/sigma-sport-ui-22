import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, RotateCcw } from "lucide-react";
import BackButton from "@/components/BackButton";
import { allSixSigmaQuestionnaires, SixSigmaQuestionnaire } from "@/data/sixSigmaQuestionnaires";

// Helper function to get questionnaire by ID
const getQuestionnaireById = (id: string): SixSigmaQuestionnaire | null => {
  switch (id) {
    case 'six_sigma_full':
      return allSixSigmaQuestionnaires.full;
    case 'six_sigma_lite':
      return allSixSigmaQuestionnaires.lite;
    case 'six_sigma_mood':
      return allSixSigmaQuestionnaires.mood;
    default:
      return null;
  }
};
const QuestionnaireDetail = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [randomizedQuestions, setRandomizedQuestions] = useState<Array<{
    questionId: string;
    question: any;
    competencyName: string;
  }>>([]);
  const questionnaire = getQuestionnaireById(id || '');
  if (!questionnaire) {
    return <div className="min-h-screen bg-background p-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/biblioteka')}
          className="mb-4 gap-2 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Powrót
        </Button>
        <div className="flex items-center justify-center h-[80vh]">
          <Card className="max-w-md border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Kwestionariusz nie znaleziony</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Nie można znaleźć wybranego kwestionariusza.
              </p>
              <Button onClick={() => navigate('/biblioteka')}>
                Powrót do biblioteki
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>;
  }

  // Build flat question list for progress tracking
  const allQuestions: Array<{
    questionId: string;
    question: any;
    competencyName: string;
  }> = [];
  questionnaire.competencies.forEach(comp => {
    comp.questions.forEach(q => {
      allQuestions.push({
        questionId: q.id,
        question: q,
        competencyName: comp.name
      });
    });
  });

  // Add modifiers as questions if present
  if (questionnaire.modifiers) {
    questionnaire.modifiers.forEach(mod => {
      allQuestions.push({
        questionId: mod.id,
        question: {
          text: mod.question,
          type: 'direct'
        },
        competencyName: 'Kontekst'
      });
    });
  }

  // Randomize questions on first render
  if (!isStarted && randomizedQuestions.length === 0) {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    setRandomizedQuestions(shuffled);
  }

  const questionsToUse = isStarted ? randomizedQuestions : allQuestions;
  const totalQuestions = questionsToUse.length;
  const currentQuestionData = questionsToUse[currentQuestionIndex];
  const progress = Object.keys(answers).length / totalQuestions * 100;
  const handleAnswer = (value: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionData.questionId]: value
    }));
    
    // Auto-advance to next question
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setIsCompleted(true);
      }
    }, 300); // Small delay for visual feedback
  };
  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  if (!isStarted) {
    return <div className="min-h-screen bg-background p-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/biblioteka')}
          className="mb-4 gap-2 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Powrót
        </Button>
        <div className="max-w-2xl mx-auto mt-12">
          <Card className="border-border">
            <CardContent className="p-12">
              <CardTitle className="text-4xl text-foreground mb-8 text-center font-bold">
                {questionnaire.name}
              </CardTitle>
              
              <div className="space-y-6 text-lg text-foreground leading-relaxed mb-10">
                {questionnaire.description.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">{totalQuestions}</div>
                  <div className="text-base text-muted-foreground">pytań</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">{questionnaire.estimatedTime}</div>
                  <div className="text-base text-muted-foreground">minut</div>
                </div>
              </div>

              <Button 
                onClick={() => {
                  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
                  setRandomizedQuestions(shuffled);
                  setIsStarted(true);
                }} 
                size="lg" 
                className="w-full text-2xl py-8 font-bold"
              >
                GO!
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>;
  }
  if (isCompleted) {
    return <div className="min-h-screen bg-background p-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/biblioteka')}
          className="mb-4 gap-2 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Powrót
        </Button>
        <div className="max-w-4xl mx-auto mt-8">
          <Card className="border-border">
            <CardHeader className="bg-gradient-to-br from-primary/10 to-background">
              <CardTitle className="text-3xl text-foreground flex items-center gap-3">
                Świetna robota!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <p className="text-muted-foreground text-lg">
                {questionnaire.completionMessage || `Dziękujemy za wypełnienie kwestionariusza ${questionnaire.name}. Twoje odpowiedzi zostały zapisane i pomogą w śledzeniu Twojego rozwoju.`}
              </p>

              <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                <h3 className="font-semibold mb-2 text-foreground">Co dalej?</h3>
                <p className="text-sm text-muted-foreground">
                  Trener otrzyma szczegółowy raport z Twoimi wynikami. Będzie mógł zobaczyć, 
                  w których obszarach jesteś najsilniejszy/a i nad czym warto jeszcze popracować.
                </p>
              </div>

              <div className="bg-muted/30 rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-4 text-foreground">Liczba odpowiedzi: {Object.keys(answers).length} / {totalQuestions}</h3>
                <Progress value={100} className="h-3" />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => {
                setIsStarted(false);
                setCurrentQuestionIndex(0);
                setAnswers({});
                setIsCompleted(false);
                setRandomizedQuestions([]);
              }} className="flex-1">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Wypełnij ponownie
                </Button>
                <Button onClick={() => navigate('/biblioteka')} className="flex-1">
                  Powrót do biblioteki
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>;
  }

  // Render scale option tiles with color coding
  const renderScaleOptions = () => {
    const scaleValues = Array.from({
      length: questionnaire.scale
    }, (_, i) => i + 1);
    
    // Color intensity based on value (1=lightest, 5=strongest) using primary color
    const getColorClasses = (value: number, isSelected: boolean) => {
      if (isSelected) {
        return 'border-primary bg-primary shadow-lg scale-105 text-primary-foreground';
      }
      
      // Progressive primary color intensity: 1 (lightest) to 5 (strongest)
      const intensities = [
        'bg-primary/10 border-primary/20 hover:border-primary/30 hover:bg-primary/15', // 1
        'bg-primary/25 border-primary/35 hover:border-primary/45 hover:bg-primary/30', // 2
        'bg-primary/40 border-primary/50 hover:border-primary/60 hover:bg-primary/45', // 3
        'bg-primary/60 border-primary/70 hover:border-primary/80 hover:bg-primary/65', // 4
        'bg-primary/80 border-primary/90 hover:border-primary hover:bg-primary/85', // 5
      ];
      return intensities[value - 1];
    };
    
    return <div className="space-y-6">
        <div className="text-center text-base text-muted-foreground mb-4">
          <p>1 = Zupełnie nie o mnie | 5 = To o mnie!</p>
        </div>
        
        <div className="grid grid-cols-5 gap-3">
          {scaleValues.map(value => {
          const isSelected = answers[currentQuestionData.questionId] === value;
          return <button key={value} onClick={() => handleAnswer(value)} className={`
                  relative flex flex-col items-center justify-center p-8 rounded-xl border-2 transition-all
                  ${getColorClasses(value, isSelected)}
                `}>
                <span className={`text-4xl font-bold ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {value}
                </span>
              </button>;
        })}
        </div>
        
        <div className="flex justify-between text-base font-medium text-foreground px-2 mt-6">
          <span className="text-left">Zupełnie nie o mnie</span>
          <span className="text-center">Trochę o mnie</span>
          <span className="text-right">O mnie!</span>
        </div>
      </div>;
  };
  return <div className="min-h-screen bg-background p-4 md:p-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/biblioteka')}
        className="mb-4 gap-2 hover:bg-muted"
      >
        <ArrowLeft className="h-4 w-4" />
        Powrót
      </Button>
      <div className="max-w-4xl mx-auto mt-8">
        <Card className="border-border">
          <CardHeader className="bg-gradient-to-br from-primary/5 to-background">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">{currentQuestionIndex + 1}</span>
                </div>
                <div>
                  <CardTitle className="text-lg text-foreground">
                    {questionnaire.name}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    Pytanie {currentQuestionIndex + 1} z {totalQuestions}
                  </span>
                </div>
              </div>
              <span className="text-sm font-semibold text-primary">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>

          <CardContent className="space-y-8 p-6 md:p-8">
            <div className="bg-muted/30 rounded-xl p-6 md:p-8 border border-border">
              <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed text-center">
                {currentQuestionData.question.text}
              </p>
            </div>

            <div className="space-y-6">
              {renderScaleOptions()}
            </div>

            <div className="pt-4">
              <Button 
                variant="outline" 
                onClick={handlePrevious} 
                disabled={currentQuestionIndex === 0} 
                className="w-full" 
                size="lg"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cofnij
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default QuestionnaireDetail;