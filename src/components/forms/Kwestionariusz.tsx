import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

interface KwestionariuszProps {
  onComplete: (taskName: string, result: any) => void;
}

const questions = [
  {
    id: "q1",
    text: "Jak oceniasz swoje samopoczucie przed treningiem?",
    options: ["Bardzo słabe", "Słabe", "Neutralne", "Dobre", "Bardzo dobre"]
  },
  {
    id: "q2",
    text: "Jak oceniasz swoją motywację do treningu?",
    options: ["Bardzo niska", "Niska", "Neutralna", "Wysoka", "Bardzo wysoka"]
  },
  {
    id: "q3",
    text: "Jak oceniasz poziom stresu przed treningiem?",
    options: ["Bardzo wysoki", "Wysoki", "Neutralny", "Niski", "Bardzo niski"]
  }
];

const Kwestionariusz = ({ onComplete }: KwestionariuszProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const isAllAnswered = questions.every(q => answers[q.id]);

  const handleSubmit = () => {
    console.log('Zapisuję odpowiedzi kwestionariusza:', answers);
    setIsSubmitted(true);
  };

  const handleStartFirstChallenge = () => {
    onComplete('kwestionariusz', { answers });
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardContent className="pt-6 space-y-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-white">
              ✅ Dziękujemy, zapisaliśmy Twoje odpowiedzi
            </h2>
            <Button 
              onClick={handleStartFirstChallenge}
              size="lg"
              className="w-full"
            >
              Rozpocznij Pierwsze Wyzwanie
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl bg-slate-800 border-slate-700 my-8">
        <CardContent className="pt-6 space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Kwestionariusz Przedtreningowy</h2>
            <p className="text-slate-300 text-sm">Odpowiedz na poniższe pytania</p>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <Label className="text-slate-200 font-medium">
                  {index + 1}. {question.text}
                </Label>
                <RadioGroup
                  value={answers[question.id] || ""}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                >
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={option} 
                        id={`${question.id}-${optionIndex}`}
                        className="border-slate-500"
                      />
                      <Label 
                        htmlFor={`${question.id}-${optionIndex}`}
                        className="text-slate-300 cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={!isAllAnswered}
            className="w-full"
            size="lg"
          >
            Zapisz Kwestionariusz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Kwestionariusz;
