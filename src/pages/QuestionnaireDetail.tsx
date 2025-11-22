import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles, HelpCircle } from "lucide-react";
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
  const questionnaire = getQuestionnaireById(id || '');
  if (!questionnaire) {
    return <div className="min-h-screen bg-background p-6">
        <BackButton />
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
  const totalQuestions = allQuestions.length;
  const currentQuestionData = allQuestions[currentQuestionIndex];
  const progress = Object.keys(answers).length / totalQuestions * 100;
  const handleAnswer = (value: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionData.questionId]: value
    }));
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
        <BackButton />
        <div className="max-w-4xl mx-auto mt-8">
          <Card className="border-border overflow-hidden">
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-3xl text-foreground">{questionnaire.name}</CardTitle>
              </div>
              <p className="text-muted-foreground text-lg">{questionnaire.shortName}</p>
            </div>
            
            <CardContent className="space-y-6 p-8">
              <div className="bg-muted/30 rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  O czym jest ten kwestionariusz?
                </h3>
                <p className="text-muted-foreground leading-relaxed">{questionnaire.description}</p>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-3 text-foreground">Jak go używać?</h3>
                <p className="text-muted-foreground mb-4">{questionnaire.usage}</p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Liczba pytań</span>
                    <span className="font-semibold text-foreground text-lg">{totalQuestions}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Szacowany czas</span>
                    <span className="font-semibold text-foreground text-lg">{questionnaire.estimatedTime}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Częstotliwość</span>
                    <span className="font-semibold text-foreground text-lg">{questionnaire.frequency}</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                <h3 className="font-semibold mb-3 text-foreground">Jak odpowiadać?</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>📝 Przeczytaj każde pytanie uważnie.</p>
                  <p>💭 Pomyśl, jak zwykle się czujesz lub zachowujesz – nie jak chciałbyś/chciałabyś.</p>
                  <p>✅ Wybierz odpowiedź od <strong className="text-foreground">{questionnaire.scaleLabels.min}</strong> do <strong className="text-foreground">{questionnaire.scaleLabels.max}</strong>.</p>
                  <p>⏱️ Nie zastanawiaj się zbyt długo – pierwsza myśl jest najlepsza!</p>
                </div>
              </div>

              <Button onClick={() => setIsStarted(true)} size="lg" className="w-full text-lg py-6">
                Zacznij odpowiadać
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>;
  }
  if (isCompleted) {
    return <div className="min-h-screen bg-background p-6">
        <BackButton />
        <div className="max-w-4xl mx-auto mt-8">
          <Card className="border-border">
            <CardHeader className="bg-gradient-to-br from-primary/10 to-background">
              <CardTitle className="text-3xl text-foreground flex items-center gap-3">
                Świetna robota!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <p className="text-muted-foreground text-lg">
                Dziękujemy za wypełnienie kwestionariusza <strong className="text-foreground">{questionnaire.name}</strong>. 
                Twoje odpowiedzi zostały zapisane i pomogą w śledzeniu Twojego rozwoju.
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

  // Render scale option tiles (child-friendly, large clickable areas)
  const renderScaleOptions = () => {
    const scaleValues = Array.from({
      length: questionnaire.scale
    }, (_, i) => i + 1);
    return <div className="grid grid-cols-5 gap-3">
        {scaleValues.map(value => {
        const isSelected = answers[currentQuestionData.questionId] === value;
        const isMin = value === 1;
        const isMax = value === questionnaire.scale;
        return <button key={value} onClick={() => handleAnswer(value)} className={`
                relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all
                ${isSelected ? 'border-primary bg-primary/10 shadow-lg scale-105' : 'border-border bg-background hover:border-primary/50 hover:bg-muted/30'}
              `}>
              <span className={`text-3xl font-bold mb-2 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                {value}
              </span>
              {(isMin || isMax) && <span className="text-xs text-center text-muted-foreground leading-tight">
                  {isMin ? questionnaire.scaleLabels.min : questionnaire.scaleLabels.max}
                </span>}
            </button>;
      })}
      </div>;
  };
  return <div className="min-h-screen bg-background p-4 md:p-6">
      <BackButton />
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
                    {currentQuestionData.competencyName}
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

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Wybierz odpowiedź, która najlepiej do Ciebie pasuje:
                </p>
              </div>
              
              {renderScaleOptions()}
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0} className="flex-1" size="lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cofnij
              </Button>
              <Button onClick={handleNext} disabled={!answers[currentQuestionData.questionId]} className="flex-1" size="lg">
                {currentQuestionIndex === totalQuestions - 1 ? "Zakończ" : "Dalej"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default QuestionnaireDetail;