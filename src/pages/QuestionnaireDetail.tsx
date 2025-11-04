import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ClipboardList, Clock, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const questionnairesData = {
  "1": {
    name: "MTQ48",
    fullName: "Mental Toughness Questionnaire 48",
    description: "Kompleksowe narzędzie mierzące odporność psychiczną w 4 wymiarach: Wyzwanie, Zaangażowanie, Kontrola, Pewność siebie",
    items: 48,
    duration: "10-15 min",
    scales: ["Wyzwanie", "Zaangażowanie", "Kontrola emocjonalna", "Kontrola życiowa", "Pewność w relacjach", "Pewność w umiejętnościach"],
    info: "MTQ48 to złoty standard pomiaru mental toughness w sporcie. Bazuje na modelu 4C (Challenge, Commitment, Control, Confidence). Wysokie wyniki korelują z lepszą wydolnością pod presją, niższym poziomem lęku i wyższą satysfakcją z kariery sportowej.",
    scaleLabels: ["Całkowicie się nie zgadzam", "Nie zgadzam się", "Neutralnie", "Zgadzam się", "Całkowicie się zgadzam"],
    questions: [
      { id: 1, text: "Zazwyczaj odnoszę sukcesy w sytuacjach, które tego wymagają", scale: "Wyzwanie" },
      { id: 2, text: "Czuję się pewnie w kontaktach z innymi ludźmi", scale: "Pewność w relacjach" },
      { id: 3, text: "Trudności mnie nie zniechęcają", scale: "Zaangażowanie" },
      { id: 4, text: "Potrafię zachować spokój w trudnych sytuacjach", scale: "Kontrola emocjonalna" },
      { id: 5, text: "Potrafię wpływać na to, co mi się przydarza", scale: "Kontrola życiowa" },
      { id: 6, text: "Wierzę w swoje umiejętności", scale: "Pewność w umiejętnościach" },
      { id: 7, text: "Często biorę udział w sytuacjach, w których jestem testowany", scale: "Wyzwanie" },
      { id: 8, text: "Mogę liczyć na siebie w trudnych chwilach", scale: "Pewność w umiejętnościach" },
      { id: 9, text: "Z łatwością nawiązuję nowe znajomości", scale: "Pewność w relacjach" },
      { id: 10, text: "Nie rezygnuję łatwo z tego, co zaczynam", scale: "Zaangażowanie" },
      { id: 11, text: "Zwykle potrafię wpłynąć na innych, aby zrobili to, co chcę", scale: "Kontrola życiowa" },
      { id: 12, text: "Rzadko się denerwuję", scale: "Kontrola emocjonalna" },
      { id: 13, text: "Lubię wyzwania", scale: "Wyzwanie" },
      { id: 14, text: "Dobrze radzę sobie z nieprzewidzianymi sytuacjami", scale: "Kontrola emocjonalna" },
      { id: 15, text: "Jestem osobą, która dąży do celu", scale: "Zaangażowanie" },
      { id: 16, text: "Czuję, że mogę kontrolować sytuacje wokół mnie", scale: "Kontrola życiowa" },
      { id: 17, text: "Zwykle jestem w stanie przekonać kogoś do swojego punktu widzenia", scale: "Pewność w relacjach" },
      { id: 18, text: "Jestem pewny swoich decyzji", scale: "Pewność w umiejętnościach" },
      { id: 19, text: "Zmiana nie jest dla mnie problemem", scale: "Wyzwanie" },
      { id: 20, text: "Kontynuuję pracę nad czymś, nawet gdy inni by zrezygnowali", scale: "Zaangażowanie" }
    ]
  },
  "2": {
    name: "SAS-2",
    fullName: "Sport Anxiety Scale - 2",
    description: "Kwestionariusz mierzący lęk w sporcie w trzech wymiarach",
    items: 15,
    duration: "5-8 min",
    scales: ["Lęk somatyczny", "Zmartwienie", "Zaburzenia koncentracji"],
    info: "SAS-2 mierzy lęk specyficzny dla kontekstu sportowego. Rozróżnia trzy komponenty: somatyczny (napięcie fizyczne), kognitywny (zmartwienie o wynik) i behawioralny (problemy z koncentracją). Przydatny w diagnostyce lęku przedstartowego.",
    scaleLabels: ["Wcale", "Trochę", "Umiarkowanie", "Bardzo"],
    questions: [
      { id: 1, text: "Czuję napięcie w żołądku przed zawodami", scale: "Lęk somatyczny" },
      { id: 2, text: "Martwię się, że nie osiągnę swoich celów", scale: "Zmartwienie" },
      { id: 3, text: "Trudno mi się skupić na zadaniu", scale: "Zaburzenia koncentracji" },
      { id: 4, text: "Moje ciało jest spięte przed zawodami", scale: "Lęk somatyczny" },
      { id: 5, text: "Martwię się, że zawiodę innych", scale: "Zmartwienie" },
      { id: 6, text: "Mój umysł błądzi podczas zawodów", scale: "Zaburzenia koncentracji" },
      { id: 7, text: "Czuję napięcie mięśni przed startem", scale: "Lęk somatyczny" },
      { id: 8, text: "Martwię się, że popełnię błędy", scale: "Zmartwienie" },
      { id: 9, text: "Trudno mi utrzymać uwagę na tym, co robię", scale: "Zaburzenia koncentracji" },
      { id: 10, text: "Czuję 'motyle w brzuchu' przed zawodami", scale: "Lęk somatyczny" },
      { id: 11, text: "Martwię się o ocenę mojej wydolności", scale: "Zmartwienie" },
      { id: 12, text: "Rozpraszam się łatwo", scale: "Zaburzenia koncentracji" },
      { id: 13, text: "Moje serce bije szybciej przed zawodami", scale: "Lęk somatyczny" },
      { id: 14, text: "Martwię się, że zawiodę siebie", scale: "Zmartwienie" },
      { id: 15, text: "Mam trudności z koncentracją na instrukcjach", scale: "Zaburzenia koncentracji" }
    ]
  },
  "3": {
    name: "CSAI-2R",
    fullName: "Competitive State Anxiety Inventory - 2 Revised",
    description: "Narzędzie do pomiaru lęku przedstartowego i pewności siebie",
    items: 17,
    duration: "5-7 min",
    scales: ["Lęk poznawczy", "Lęk somatyczny", "Pewność siebie"],
    info: "CSAI-2R mierzy stan lęku (nie cechę) - jak zawodnik czuje się TERAZ, przed konkretnym wydarzeniem. Idealny do monitorowania zmian w stanie psychicznym przed zawodami. Należy wypełniać 30-60 minut przed startem.",
    scaleLabels: ["Wcale", "Nieco", "Umiarkowanie", "Bardzo"],
    questions: [
      { id: 1, text: "Martwię się o wynik tego startu", scale: "Lęk poznawczy" },
      { id: 2, text: "Czuję napięcie w swoim ciele", scale: "Lęk somatyczny" },
      { id: 3, text: "Czuję się pewnie, że poradzę sobie pod presją", scale: "Pewność siebie" },
      { id: 4, text: "Mam negatywne myśli o mojej wydolności", scale: "Lęk poznawczy" },
      { id: 5, text: "Czuję, że moje ciało jest sztywne", scale: "Lęk somatyczny" },
      { id: 6, text: "Wierzę, że mogę osiągnąć swój cel", scale: "Pewność siebie" },
      { id: 7, text: "Martwię się, że nie wystąpię dobrze", scale: "Lęk poznawczy" },
      { id: 8, text: "Mój żołądek jest napięty", scale: "Lęk somatyczny" },
      { id: 9, text: "Jestem pewny, że wykonam to dobrze", scale: "Pewność siebie" },
      { id: 10, text: "Przechodzą mi przez głowę myśli o porażce", scale: "Lęk poznawczy" },
      { id: 11, text: "Czuję napięcie w ramionach i szyi", scale: "Lęk somatyczny" },
      { id: 12, text: "Czuję się mentalnie zrelaksowany", scale: "Pewność siebie" },
      { id: 13, text: "Boję się, że nie spełnię oczekiwań", scale: "Lęk poznawczy" },
      { id: 14, text: "Moje dłonie sąспocone", scale: "Lęk somatyczny" },
      { id: 15, text: "Jestem pewny, bo wiem, że jestem przygotowany", scale: "Pewność siebie" },
      { id: 16, text: "Nie mogę przestać myśleć o popełnieniu błędów", scale: "Lęk poznawczy" },
      { id: 17, text: "Czuję 'motyle' w żołądku", scale: "Lęk somatyczny" }
    ]
  },
  "4": {
    name: "TOPS",
    fullName: "Test of Performance Strategies",
    description: "Kwestionariusz oceniający strategie psychologiczne stosowane w treningu i zawodach",
    items: 64,
    duration: "15-20 min",
    scales: ["Automatyzm", "Kontrola emocjonalna", "Wyznaczanie celów", "Imagery", "Aktywacja", "Relaks", "Samoocena", "Self-talk"],
    info: "TOPS ocenia 16 strategii mentalnych (8 w treningu, 8 w zawodach). To narzędzie diagnostyczne pokazujące, które techniki psychologiczne zawodnik używa często, a które wymaga rozwinięcia. Idealny punkt wyjścia do planowania treningu mentalnego.",
    scaleLabels: ["Nigdy", "Rzadko", "Czasami", "Często", "Zawsze"],
    questions: [
      { id: 1, text: "[TRENING] Wyznaczam sobie konkretne cele treningowe", scale: "Wyznaczanie celów" },
      { id: 2, text: "[TRENING] Używam technik relaksacyjnych przed treningiem", scale: "Relaks" },
      { id: 3, text: "[TRENING] Wizualizuję wykonanie techniki przed jej ćwiczeniem", scale: "Imagery" },
      { id: 4, text: "[TRENING] Mówię sobie pozytywne rzeczy podczas treningu", scale: "Self-talk" },
      { id: 5, text: "[TRENING] Kontroluję swój poziom energii", scale: "Aktywacja" },
      { id: 6, text: "[TRENING] Analizuję swoją wydolność po treningu", scale: "Samoocena" },
      { id: 7, text: "[TRENING] Wykonuję ruchy automatycznie, bez myślenia", scale: "Automatyzm" },
      { id: 8, text: "[TRENING] Kontroluję swoje emocje, gdy coś idzie nie tak", scale: "Kontrola emocjonalna" },
      { id: 9, text: "[ZAWODY] Mam jasny cel na każde zawody", scale: "Wyznaczanie celów" },
      { id: 10, text: "[ZAWODY] Używam technik oddechowych, aby się zrelaksować", scale: "Relaks" },
      { id: 11, text: "[ZAWODY] Wyobrażam sobie idealny przebieg zawodów", scale: "Imagery" },
      { id: 12, text: "[ZAWODY] Motywuję się pozytywnym self-talkiem", scale: "Self-talk" },
      { id: 13, text: "[ZAWODY] Reguluję swój poziom pobudzenia", scale: "Aktywacja" },
      { id: 14, text: "[ZAWODY] Oceniam swoją wydolność po każdej akcji", scale: "Samoocena" },
      { id: 15, text: "[ZAWODY] Działam instynktownie, bez nadmiernego myślenia", scale: "Automatyzm" },
      { id: 16, text: "[ZAWODY] Utrzymuję kontrolę emocjonalną pod presją", scale: "Kontrola emocjonalna" },
      { id: 17, text: "[TRENING] Dzielę cele długoterminowe na krótkoterminowe", scale: "Wyznaczanie celów" },
      { id: 18, text: "[TRENING] Pracuję nad rozluźnieniem napięcia mięśniowego", scale: "Relaks" },
      { id: 19, text: "[TRENING] Mentalnie ćwiczę nowe umiejętności", scale: "Imagery" },
      { id: 20, text: "[TRENING] Zastępuję negatywne myśli pozytywnymi", scale: "Self-talk" }
    ]
  },
  "5": {
    name: "POMS",
    fullName: "Profile of Mood States",
    description: "Profil nastroju - narzędzie do szybkiej oceny stanu emocjonalnego zawodnika",
    items: 30,
    duration: "5-10 min",
    scales: ["Napięcie", "Depresja", "Złość", "Wigor", "Zmęczenie", "Dezorientacja"],
    info: "POMS to szybki 'snapshot' nastroju zawodnika. Idealny profil ('iceberg profile') to niskie wyniki w Napięciu, Depresji, Złości, Zmęczeniu, Dezorientacji + wysoki w Wigorze. Używaj regularnie (np. co tydzień) do monitorowania przeciążenia treningowego.",
    scaleLabels: ["Wcale", "Trochę", "Umiarkowanie", "Dość", "Bardzo"],
    questions: [
      { id: 1, text: "Czuję się napięty", scale: "Napięcie" },
      { id: 2, text: "Czuję się przygnębiony", scale: "Depresja" },
      { id: 3, text: "Czuję się rozdrażniony", scale: "Złość" },
      { id: 4, text: "Czuję się pełen energii", scale: "Wigor" },
      { id: 5, text: "Czuję się zmęczony", scale: "Zmęczenie" },
      { id: 6, text: "Czuję się zdezorientowany", scale: "Dezorientacja" },
      { id: 7, text: "Czuję się niespokojny", scale: "Napięcie" },
      { id: 8, text: "Czuję się nieszczęśliwy", scale: "Depresja" },
      { id: 9, text: "Czuję złość", scale: "Złość" },
      { id: 10, text: "Czuję się pełen życia", scale: "Wigor" },
      { id: 11, text: "Czuję się wyczerpany", scale: "Zmęczenie" },
      { id: 12, text: "Czuję się zagubiony", scale: "Dezorientacja" },
      { id: 13, text: "Czuję się zdenerwowany", scale: "Napięcie" },
      { id: 14, text: "Czuję się beznadziejnie", scale: "Depresja" },
      { id: 15, text: "Czuję frustrację", scale: "Złość" },
      { id: 16, text: "Czuję się aktywny", scale: "Wigor" },
      { id: 17, text: "Czuję się słaby", scale: "Zmęczenie" },
      { id: 18, text: "Mam trudności z myśleniem", scale: "Dezorientacja" },
      { id: 19, text: "Czuję niepokój", scale: "Napięcie" },
      { id: 20, text: "Czuję smutek", scale: "Depresja" },
      { id: 21, text: "Czuję zirytowanie", scale: "Złość" },
      { id: 22, text: "Czuję się pełen wigoru", scale: "Wigor" },
      { id: 23, text: "Czuję się wyczerpany fizycznie", scale: "Zmęczenie" },
      { id: 24, text: "Nie mogę się skoncentrować", scale: "Dezorientacja" },
      { id: 25, text: "Czuję się spięty", scale: "Napięcie" },
      { id: 26, text: "Czuję się bezwartościowy", scale: "Depresja" },
      { id: 27, text: "Czuję gniew", scale: "Złość" },
      { id: 28, text: "Czuję entuzjazm", scale: "Wigor" },
      { id: 29, text: "Czuję się wyczerpany mentalnie", scale: "Zmęczenie" },
      { id: 30, text: "Czuję się oszołomiony", scale: "Dezorientacja" }
    ]
  }
};

export default function QuestionnaireDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const questionnaire = questionnairesData[id as keyof typeof questionnairesData];

  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  if (!questionnaire) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Kwestionariusz nie został znaleziony</h1>
          <Button onClick={() => navigate("/biblioteka")}>
            Wróć do biblioteki
          </Button>
        </div>
      </div>
    );
  }

  const handleAnswer = (value: number) => {
    setAnswers({ ...answers, [questionnaire.questions[currentQuestion].id]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questionnaire.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
      toast({
        title: "Kwestionariusz ukończony!",
        description: "Wyniki zostały zapisane. W pełnej wersji zostaną przeanalizowane i dodane do profilu zawodnika.",
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questionnaire.questions.length) * 100;
  const currentAnswer = answers[questionnaire.questions[currentQuestion]?.id];

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Kwestionariusz ukończony!</CardTitle>
              <CardDescription>
                Dziękujemy za wypełnienie kwestionariusza {questionnaire.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Odpowiedzi udzielone</p>
                <p className="text-3xl font-bold">{Object.keys(answers).length} / {questionnaire.questions.length}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                W pełnej wersji systemu wyniki zostaną automatycznie przeanalizowane i dodane do profilu zawodnika wraz z interpretacją dla każdej skali pomiarowej.
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Button onClick={() => {
                  setIsStarted(false);
                  setIsCompleted(false);
                  setCurrentQuestion(0);
                  setAnswers({});
                }}>
                  Wypełnij ponownie
                </Button>
                <Button variant="outline" onClick={() => navigate("/biblioteka")}>
                  Wróć do biblioteki
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/biblioteka")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót do biblioteki
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <ClipboardList className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{questionnaire.name}</CardTitle>
                  <CardDescription className="text-base mt-1">{questionnaire.fullName}</CardDescription>
                </div>
              </div>

              <div className="flex gap-3">
                <Badge variant="outline" className="flex items-center gap-1">
                  {questionnaire.items} pozycji
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {questionnaire.duration}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Opis</h3>
                <p className="text-sm text-muted-foreground">{questionnaire.description}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Informacje naukowe</h4>
                    <p className="text-sm text-blue-800">{questionnaire.info}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Skale pomiarowe</h3>
                <div className="flex flex-wrap gap-2">
                  {questionnaire.scales.map((scale, index) => (
                    <Badge key={index} variant="secondary">
                      {scale}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={() => setIsStarted(true)} className="w-full" size="lg">
                  Rozpocznij wypełnianie
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  To wersja demonstracyjna. W pełnej wersji wyniki będą zapisywane do profilu zawodnika.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const question = questionnaire.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Pytanie {currentQuestion + 1} z {questionnaire.questions.length}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <Badge variant="outline" className="w-fit mb-3">{question.scale}</Badge>
            <CardTitle className="text-xl leading-relaxed">{question.text}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={currentAnswer?.toString()} onValueChange={(value) => handleAnswer(parseInt(value))}>
              <div className="space-y-3">
                {questionnaire.scaleLabels.map((label, index) => (
                  <div key={index} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer font-normal">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex-1"
          >
            Poprzednie
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentAnswer === undefined}
            className="flex-1"
          >
            {currentQuestion === questionnaire.questions.length - 1 ? "Zakończ" : "Następne"}
          </Button>
        </div>

        {/* Help text */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          Wybierz odpowiedź, która najlepiej opisuje Twoje aktualne odczucia
        </p>
      </div>
    </div>
  );
}
