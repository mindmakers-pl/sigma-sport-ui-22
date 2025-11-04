import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Target, BookOpen, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const exercisesData = {
  "1": {
    title: "Skanowanie wzrokowe 360°",
    module: "Moduł 1",
    strategy: "Trening uwagi",
    duration: "5 min",
    difficulty: "Średni",
    objective: "Rozwijanie szybkości percepcji wzrokowej i świadomości przestrzennej zawodnika poprzez systematyczne skanowanie otoczenia.",
    description: "Ćwiczenie polega na treningu szybkiego skanowania pola widzenia w celu identyfikacji kluczowych bodźców. Zawodnik uczy się filtrować istotne informacje i ignorować dystrakcje.",
    equipment: ["Markery kolorowe (4 kolory)", "Stoper", "Przestrzeń treningowa min. 10m x 10m"],
    steps: [
      {
        title: "Przygotowanie (30 sek)",
        content: "Rozmieść 12 markerów w różnych kolorach losowo w przestrzeni treningowej. Zawodnik staje w centrum i przyjmuje pozycję sportową."
      },
      {
        title: "Faza 1: Skanowanie statyczne (2 min)",
        content: "Zawodnik ma 10 sekund na zapamiętanie położenia wszystkich markerów danego koloru. Następnie zamyka oczy i wskazuje ich lokalizację. Powtórz dla każdego koloru."
      },
      {
        title: "Faza 2: Skanowanie dynamiczne (2 min)",
        content: "Zawodnik wykonuje wolny jogging w obrębie przestrzeni. Na komendę trenera (np. 'Czerwony!') zatrzymuje się i wskazuje wszystkie markery danego koloru w jak najkrótszym czasie."
      },
      {
        title: "Faza 3: Skanowanie pod presją (30 sek)",
        content: "Zawodnik wykonuje sprint między markerami, jednocześnie licząc wszystkie markery określonego koloru. Tempo maksymalne przy zachowaniu precyzji."
      }
    ],
    coachingTips: [
      "Obserwuj czy zawodnik używa peryferyjnego pola widzenia, czy tylko obraca głową",
      "Stopniowo zwiększaj tempo i liczbę dystraktorów",
      "Zachęcaj do werbalnego nazywania kolorów - aktywuje to dodatkowe obszary mózgu",
      "Monitoruj poziom zmęczenia - ćwiczenie jest kognitywnie wymagające"
    ],
    adaptations: {
      easier: "Ogranicz do 2 kolorów, zwiększ czas skanowania do 15 sekund",
      harder: "Dodaj dystraktor dźwiękowy, zmień pozycje markerów między rundami, ogranicz czas do 5 sekund"
    },
    metrics: ["Liczba poprawnie zidentyfikowanych markerów", "Czas reakcji", "Błędy (fałszywe alarmy)"]
  },
  "2": {
    title: "Oddech rezonansowy",
    module: "Moduł 4",
    strategy: "Regulacja arousal",
    duration: "8 min",
    difficulty: "Łatwy",
    objective: "Nauczenie zawodnika techniki regulacji poziomu pobudzenia poprzez kontrolowaną manipulację częstością oddechową w celu osiągnięcia optymalnego stanu wydolności.",
    description: "Oddech rezonansowy (ok. 5-6 oddechów/minutę) synchronizuje rytmy sercowe i oddechowe, aktywując układ przywspółczulny i zwiększając zmienność rytmu serca (HRV). To narzędzie do szybkiej regulacji stresu przed i podczas zawodów.",
    equipment: ["Matę lub krzesło", "Timer/aplikację z metronomem oddechowym (opcjonalnie)", "Ciche pomieszczenie"],
    steps: [
      {
        title: "Pozycja wyjściowa (1 min)",
        content: "Zawodnik siada wygodnie z prostymi plecami, stopy płasko na podłodze. Ręce spoczywają na udach lub brzuchu. Oczy zamknięte lub skierowane w dół."
      },
      {
        title: "Ustalenie rytmu bazowego (2 min)",
        content: "Wdech przez nos na 5 sekund (powolne napełnianie płuc od dołu). Wydech przez nos lub usta na 5 sekund (równie powolne opróżnianie). Zachowaj naturalność - nie forsuj."
      },
      {
        title: "Faza rezonansowa (4 min)",
        content: "Kontynuuj rytm 5-5. Skup uwagę na ruchu powietrza, rozszerzaniu się brzucha przy wdechu i jego opadaniu przy wydechu. Jeśli myśli odchodzą, łagodnie wróć do obserwacji oddechu."
      },
      {
        title: "Powrót (1 min)",
        content: "Stopniowo pozwól oddechowi wrócić do naturalnego rytmu. Przed otwarciem oczu zrób 3 głębokie oddechy. Zanotuj swój stan emocjonalny (skala 1-10)."
      }
    ],
    coachingTips: [
      "Oddech rezonansowy to nie hyperventylacja - ma być POWOLNY i GŁĘBOKI",
      "Pierwsza sesja może być trudna - zawodnik może czuć zawroty głowy. Skróć do 3-4 minut",
      "Najlepiej ćwiczyć codziennie o tej samej porze (np. rano po przebudzeniu)",
      "Można używać jako 'reset' między rundami/setami na zawodach"
    ],
    adaptations: {
      easier: "Skróć cykl do 4-4 (wdech-wydech po 4 sekundy), skróć czas do 5 minut",
      harder: "Wydłuż cykl do 6-6, dodaj wizualizację (np. wyobraź sobie falę oceaniczną), zastosuj w warunkach stresowych (np. przed zawodami)"
    },
    metrics: ["Częstość oddechowa (oddechów/min)", "Subiektywny poziom relaksu (1-10)", "HRV baseline (jeśli mierzony)"]
  },
  "3": {
    title: "Wizualizacja idealnego wykonania",
    module: "Moduł 3",
    strategy: "Trening wyobrażeniowy",
    duration: "10 min",
    difficulty: "Średni",
    objective: "Programowanie mózgu na sukces poprzez mentalne odtwarzanie idealnej sekwencji ruchowej z pełnym zaangażowaniem wszystkich zmysłów.",
    description: "Wizualizacja to jeden z najpotężniejszych narzędzi sportowych. Neuronaukowo udowodniono, że mentalne odtwarzanie aktywuje te same obszary mózgu co faktyczne wykonanie. Regularny trening imagery poprawia wykonanie i pewność siebie.",
    equipment: ["Ciche, nieoświetlone pomieszczenie", "Opcjonalnie: nagranie z instrukcją guided imagery"],
    steps: [
      {
        title: "Relaksacja (2 min)",
        content: "Pozycja leżąca lub siedząca. 10 głębokich oddechów. Świadomie rozluźnij mięśnie od stóp po głowę (progressive relaxation)."
      },
      {
        title: "Wybór sekwencji (1 min)",
        content: "Zdefiniuj konkretną akcję sportową do wizualizacji (np. rzut judoka, strzał na bramkę, start sprintera). Im bardziej precyzyjna, tym lepiej."
      },
      {
        title: "Wizualizacja zewnętrzna (2 min)",
        content: "Zobacz siebie z zewnątrz (jak na filmie) wykonującego akcję IDEALNIE. Zwolnione tempo. Zauważ każdy szczegół: pozycję ciała, ruch, moment kulminacyjny, skuteczność."
      },
      {
        title: "Wizualizacja wewnętrzna (4 min)",
        content: "Przenieś się do środka - zobacz oczami zawodnika. Poczuj napięcie mięśni, ciężar ciała, ruch w przestrzeni. Usłysz dźwięki (okrzyki, oddech). Poczuj emocje (pewność, flow, radość po sukcesie). Powtórz 3-5 razy."
      },
      {
        title: "Zakotwiczenie (1 min)",
        content: "Połącz wyobrażenie z gestem fizycznym (np. zaciskasz pięść). To 'kotwica' do aktywowania tego stanu na zawodach."
      }
    ],
    coachingTips: [
      "Jakość > ilość. Lepiej 3 minuty pełnego zanurzenia niż 15 minut rozkojarzenia",
      "Zawodnik musi wizualizować SUKCES, nie porażkę. To programowanie mózgu",
      "Najlepsze momenty: przed snem (przechodzi do pamięci długotrwałej) i rano po przebudzeniu",
      "Połącz z praktyką: wizualizuj przed treningiem technicznym"
    ],
    adaptations: {
      easier: "Skup się tylko na wizualizacji zewnętrznej, skróć do 5 minut, używaj gotowego nagrania guided imagery",
      harder: "Dodaj element stresu (wyobraź sobie pełne trybuny, decydujący moment), wizualizuj całą sekwencję zawodów, dodaj wizualizację radzenia sobie z błędami"
    },
    metrics: ["Żywość obrazu (1-10)", "Kontrola nad obrazem (1-10)", "Zaangażowanie emocjonalne (1-10)", "Czas utrzymania koncentracji"]
  },
  "4": {
    title: "Stop-Signal Task",
    module: "Moduł 2",
    strategy: "Kontrola impulsów",
    duration: "7 min",
    difficulty: "Trudny",
    objective: "Trening hamowania impulsywnych reakcji i rozwijanie kontroli wykonawczej poprzez zadanie wymagające szybkiego zatrzymania już rozpoczętej akcji.",
    description: "Stop-Signal Task (SST) to klasyczne ćwiczenie neuropsychologiczne adaptowane do sportu. Trenuje zdolność do szybkiego anulowania działania w odpowiedzi na sygnał stopu - kluczowa umiejętność w sytuacjach wymagających elastyczności taktycznej.",
    equipment: ["Aplikacja SST (lub papierowa wersja z kartami)", "Stoper", "2 kolorowe znaczniki (zielony i czerwony)"],
    steps: [
      {
        title: "Instrukcja (1 min)",
        content: "Zawodnik siedzi przed ekranem/kartami. Zadanie: gdy zobaczysz ZIELONY sygnał, naciśnij przycisk/wykonaj akcję (np. skok). Gdy zobaczysz CZERWONY - zatrzymaj się natychmiast, nawet jeśli już zacząłeś ruch."
      },
      {
        title: "Faza treningowa (2 min)",
        content: "10 prób treningowych: 70% sygnałów zielonych (GO), 30% czerwonych (STOP). Czerwony pojawia się z różnym opóźnieniem (100-400ms po zielonym). Bez presji czasu - zrozumienie zasad."
      },
      {
        title: "Faza testowa (3 min)",
        content: "40 prób testowych w szybkim tempie (co 2-3 sekundy nowy sygnał). Monitoruj: (1) czas reakcji na GO, (2) procent skutecznych STOP, (3) błędy (reakcja na STOP)."
      },
      {
        title: "Analiza (1 min)",
        content: "Omów wyniki z zawodnikiem. Idealny balans: szybka reakcja na GO (poniżej 300ms) + wysoka skuteczność STOP (>70%). Jeśli zawodnik ma niską skuteczność STOP, może świadomie spowalniać GO - to strategia unikania, nie kontrola."
      }
    ],
    coachingTips: [
      "SST to trudne ćwiczenie - początkujący mogą czuć frustrację. Normalizuj błędy",
      "Kluczowy parametr: Stop-Signal Reaction Time (SSRT) - im krótszy, tym lepsza kontrola",
      "Transfer na sport: reprezentuje sytuacje typu 'nie bierz tego faulu', 'anuluj atak'",
      "Progres widać po 4-6 tygodniach regularnych sesji (2-3x/tydzień)"
    ],
    adaptations: {
      easier: "Zwiększ proporcję STOP do 50%, wydłuż opóźnienie sygnału STOP do 500ms, zmniejsz liczbę prób do 20",
      harder: "Skróć opóźnienie STOP do 50-150ms, dodaj trzeci sygnał (np. żółty = zmiana akcji), wykonuj podczas wysiłku fizycznego (np. cycling)"
    },
    metrics: ["Czas reakcji GO (ms)", "Procent skutecznych STOP (%)", "SSRT - Stop-Signal Reaction Time (ms)", "Liczba błędów"]
  },
  "5": {
    title: "Anchoring (kotwiczenie stanu)",
    module: "Moduł 6",
    strategy: "Zarządzanie stanem",
    duration: "6 min",
    difficulty: "Średni",
    objective: "Stworzenie psychofizjologicznej 'kotwicy' pozwalającej na szybkie wywołanie optymalnego stanu emocjonalnego i mentalnego w sytuacjach stresowych.",
    description: "Anchoring to technika NLP wykorzystująca zjawisko warunkowania klasycznego. Poprzez wielokrotne łączenie specyficznego gestu/bodźca z pożądanym stanem emocjonalnym, zawodnik tworzy 'skrót' do tego stanu.",
    equipment: ["Brak (tylko zawodnik i trener)"],
    steps: [
      {
        title: "Identyfikacja stanu docelowego (1 min)",
        content: "Zawodnik definiuje optymalny stan, który chce wywoływać (np. 'spokojne skupienie', 'agresywna pewność', 'energiczna radość'). Nadaj mu nazwę."
      },
      {
        title: "Przypomnienie szczytowego momentu (2 min)",
        content: "Zawodnik zamyka oczy i przypomina sobie konkretną sytuację, gdy czuł ten stan w 100%. Odtwarza ją zmysłowo: co widział, słyszał, czuł w ciele, jakie emocje. Intensywność stanu 8-10/10."
      },
      {
        title: "Ustanowienie kotwicy (2 min)",
        content: "W momencie SZCZYTU intensywności (punkt kulminacyjny wspomnień), zawodnik wykonuje specyficzny gest (np. zaciska lewą pięść, dotyka dłonią serca, klepie się w udo). Gest musi być: (1) unikalny, (2) dyskretny, (3) łatwy do odtworzenia. Powtórz 3 razy."
      },
      {
        title: "Testowanie kotwicy (1 min)",
        content: "Zawodnik wychodzi ze stanu (myśli o czymś neutralnym przez 30 sek). Następnie aktywuje kotwicę (wykonuje gest). Czy stan wraca? Intensywność 1-10? Jeśli <5, powtórz proces."
      }
    ],
    coachingTips: [
      "Kotwica wymaga wzmocnienia - używaj jej przed każdym treningiem/zawodami",
      "Można mieć kilka kotwic (np. jedna na aktywację, inna na relaks)",
      "Najlepsze kotwice to te łączące gest + słowo + wizualizację",
      "Jeśli kotwica przestaje działać, odśwież wspomnienie szczytowego momentu"
    ],
    adaptations: {
      easier: "Użyj zewnętrznej kotwicy (np. ulubiona piosenka, zapach), skróć do tworzenia jednej kotwicy",
      harder: "Stwórz 'stack kotwic' (kilka stanów łączonych w jednym geście), testuj kotwicę w warunkach stresowych, dodaj wizualną kotwicę (obraz mentalny)"
    },
    metrics: ["Intensywność przywołanego stanu (1-10)", "Szybkość aktywacji (sekundy)", "Trwałość efektu (minuty)"]
  },
  "6": {
    title: "Progressive Muscle Relaxation",
    module: "Moduł 4",
    strategy: "Regulacja arousal",
    duration: "12 min",
    difficulty: "Łatwy",
    objective: "Redukcja napięcia mięśniowego i poziomu stresu poprzez systematyczne napinanie i rozluźnianie grup mięśniowych.",
    description: "PMR (Progressive Muscle Relaxation) to technika Jacobsona. Poprzez kontrast napięcie-rozluźnienie, zawodnik uczy się rozpoznawać i kontrolować napięcie w ciele - często nieświadome w sytuacjach stresowych.",
    equipment: ["Mata do ćwiczeń", "Ciche pomieszczenie", "Opcjonalnie: nagranie z instrukcją"],
    steps: [
      {
        title: "Pozycja i instrukcja (1 min)",
        content: "Zawodnik leży na plecach, oczy zamknięte. Instrukcja: Będziemy napinać grupy mięśni na 5 sekund, potem rozluźniać na 10 sekund. Skup się na różnicy między napięciem a rozluźnieniem."
      },
      {
        title: "Sekwencja dolna (3 min)",
        content: "Stopy i łydki (zaciśnij palce, napnij łydki) → rozluźnienie. Uda (napnij mięśnie ud) → rozluźnienie. Pośladki (zaciśnij) → rozluźnienie. Po każdej grupie 10 sek relaksu."
      },
      {
        title: "Sekwencja środkowa (3 min)",
        content: "Brzuch (wciągnij, napnij) → rozluźnienie. Klatka piersiowa (wdech głęboki, wstrzymaj) → wydech i rozluźnienie. Plecy (ściągnij łopatki) → rozluźnienie."
      },
      {
        title: "Sekwencja górna (3 min)",
        content: "Ręce i ramiona (zaciśnij pięści, napnij biceps) → rozluźnienie. Barki (podciągnij do uszu) → opuść i rozluźnij. Szyja (przesuń głowę do przodu) → rozluźnienie. Twarz (zaciśnij szczękę, zmarszcz czoło) → rozluźnienie."
      },
      {
        title: "Skanowanie ciała (2 min)",
        content: "Mentalnie przeskanuj ciało od stóp do głowy. Jeśli znajdziesz napięcie, wyślij tam oddech i pozwól rozluźnić. Zanim wstaniesz, zrób 3 głębokie oddechy."
      }
    ],
    coachingTips: [
      "PMR najlepiej działa wieczorem przed snem - poprawia jakość regeneracji",
      "Pierwsze 2-3 sesje mogą być trudne - zawodnik może nie czuć różnicy. To normalne",
      "Można używać skróconej wersji (5 min) jako rozgrzewka psychiczna przed zawodami",
      "Jeśli zawodnik ma chroniczne kontuzje, pomiń te obszary"
    ],
    adaptations: {
      easier: "Skróć do 4 grup mięśni (nogi, tułów, ręce, twarz), skróć czas napięcia do 3 sekund",
      harder: "Dodaj wizualizację (wyobraź sobie, że napięcie spływa z ciała), połącz z oddechem rezonansowym, wykonuj w pozycji siedzącej (trudniejsze)"
    },
    metrics: ["Subiektywny poziom napięcia przed/po (1-10)", "Czas potrzebny na zaśnięcie (minuty)", "Jakość snu (1-10)"]
  },
  "7": {
    title: "Self-talk pozytywny",
    module: "Moduł 5",
    strategy: "Odporność psychiczna",
    duration: "4 min",
    difficulty: "Łatwy",
    objective: "Przeprogramowanie wewnętrznego dialogu z krytycznego na wspierający, co zwiększa pewność siebie i odporność na presję.",
    description: "Self-talk to wewnętrzna narracja, którą prowadzimy sami ze sobą. Negatywny self-talk sabotuje wydolność. Pozytywny - buduje resilience i koncentrację. To nie 'pozytywne myślenie', ale realistyczny, konstruktywny dialog wewnętrzny.",
    equipment: ["Arkusz do zapisu (dziennik self-talk)", "Długopis"],
    steps: [
      {
        title: "Identyfikacja negatywnego self-talk (1 min)",
        content: "Zawodnik wypisuje 3 najczęstsze negatywne myśli, które pojawiają się pod presją (np. 'Nie dam rady', 'Zawsze popełniam ten błąd', 'Jestem beznadziejny'). Konkretne cytaty."
      },
      {
        title: "Analiza myśli (1 min)",
        content: "Dla każdej myśli zadaj pytania: Czy to FAKT czy OPINIA? Czy to POMAGA czy PRZESZKADZA? Co by powiedział trener/kolega w tej sytuacji? Jaka część tej myśli jest prawdziwa?"
      },
      {
        title: "Przeformułowanie (1.5 min)",
        content: "Zamień każdą myśl na wersję konstruktywną (nie fałszywie pozytywną). Przykład: 'Nie dam rady' → 'To trudne, ale przygotowywałem się. Skupiam się na następnej akcji.' Zapisz wszystkie 3."
      },
      {
        title: "Trening zastępowania (30 sek)",
        content: "Zawodnik głośno wypowiada starą myśl, po czym natychmiast przerywa ('STOP!') i wypowiada nową wersję. Fizyczny gest (np. klaśnięcie) pomaga przerwać wzorzec. Powtórz 2-3 razy dla każdej myśli."
      }
    ],
    coachingTips: [
      "Self-talk to nawyk - zmiana wymaga 3-4 tygodni konsekwentnej praktyki",
      "Zachęcaj do używania 'ja' zamiast 'ty' (np. 'Jestem gotowy' zamiast 'Jesteś gotowy')",
      "Pozytywny self-talk przed akcją → instrukcyjny ('Wyskok, prowadzenie, strzał'). Po błędzie → wspierający ('Następna piłka')",
      "Dziennik self-talk: codzienne zapisywanie 1 negatywnej myśli i jej przekształcenia"
    ],
    adaptations: {
      easier: "Zacznij od 1 myśli, użyj gotowych szablonów ('Daję radę', 'Skupiam się na procesie'), wizualizuj trenera mówiącego te słowa",
      harder: "Rozszerz do 10 myśli, dodaj kategoryzację (lęk, złość, frustracja), stosuj w czasie rzeczywistym na treningach, nagraj 'bibliotekę' pozytywnych stwierdzeń na telefon"
    },
    metrics: ["Liczba automatycznych negatywnych myśli (dziennie)", "Szybkość przeformułowania (sekundy)", "Subiektywne poczucie kontroli nad myślami (1-10)"]
  },
  "8": {
    title: "Medytacja w ruchu",
    module: "Moduł 6",
    strategy: "Flow",
    duration: "15 min",
    difficulty: "Trudny",
    objective: "Osiągnięcie stanu flow poprzez pełną obecność w prostym, powtarzalnym ruchu - brama do szczytowej wydajności w sporcie.",
    description: "Medytacja w ruchu (kinhin w Zen, walking meditation) łączy koncentrację medytacyjną z aktywnością fizyczną. W sporcie to trening 'bycia w ciele' bez oceniania - fundament flow state.",
    equipment: ["Otwarta przestrzeń lub bieżnia", "Opcjonalnie: metronom (dla rytmu)"],
    steps: [
      {
        title: "Wybór ruchu (1 min)",
        content: "Zawodnik wybiera prosty, powtarzalny ruch podstawowy dla swojej dyscypliny (np. dribbling, podania do ściany, jogging, shadowboxing). Ma być AUTOMATYCZNY, NIE wymagający myślenia."
      },
      {
        title: "Ustawienie intencji (1 min)",
        content: "Instrukcja: 'Przez następne 10 minut Twoim jedynym zadaniem jest PEŁNA OBECNOŚĆ w ruchu. Nie myśl o technice, wyniku, niczym innym. Tylko ruch, oddech, czucie.'"
      },
      {
        title: "Faza wejścia (3 min)",
        content: "Rozpocznij ruch w tempie 50% maksymalnego. Skieruj uwagę na: (1) kontakt stóp z ziemią, (2) rytm oddechu, (3) napięcie i rozluźnienie mięśni. Gdy myśli odchodzą (a będą), łagodnie wróć do odczuć ciała."
      },
      {
        title: "Faza flow (8 min)",
        content: "Stopniowo zwiększ tempo do 70-80%. Pozwól ciału 'przejąć kontrolę'. Umysł obserwuje, nie steruje. Szukasz momentu, gdy 'znikasz' - jest tylko ruch. Może przyjść lub nie - obie opcje są OK."
      },
      {
        title: "Faza wyjścia (2 min)",
        content: "Stopniowo zwalniaj. Zatrzymaj się. Stój w ciszy przez 1 minutę, obserwując pulsowanie, oddech, emocje. Co zauważasz? Czy były momenty pełnej obecności?"
      }
    ],
    coachingTips: [
      "Flow nie da się wymusić - im bardziej się 'starasz', tym dalej od celu. To paradoks",
      "Pierwsze 5-10 sesji mogą być frustrujące - to normalne. Flow to umiejętność wymagająca czasu",
      "Najlepszy czas: po rozgrzewce, przed treningiem technicznym, gdy ciało jest 'ciepłe' ale świeże",
      "Postęp: początkowo flow trwa sekundy. Po miesiącach - minuty. U mistrzów - całe zawody"
    ],
    adaptations: {
      easier: "Skróć do 8 minut, użyj najprostszego ruchu (np. marsz), dodaj zewnętrzną kotwicę (muzyka binauralna), pozwól na myśli (nie walcz z nimi)",
      harder: "Wydłuż do 30 minut, dodaj element nieprzewidywalności (zmienne tempo, dystraktor), praktykuj w warunkach zawodów, połącz z wizualizacją idealnego wykonania"
    },
    metrics: ["Liczba 'powrotów' do ruchu po rozproszeniu", "Długość najdłuższego okresu pełnej obecności (sekundy)", "Subiektywne doświadczenie flow (1-10)", "Transfer na trening/zawody (1-10)"]
  }
};

export default function ExerciseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const exercise = exercisesData[id as keyof typeof exercisesData];

  if (!exercise) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ćwiczenie nie zostało znalezione</h1>
          <Button onClick={() => navigate("/biblioteka")}>
            Wróć do biblioteki
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/biblioteka")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót do biblioteki
          </Button>

          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{exercise.title}</h1>
              <p className="text-muted-foreground">{exercise.module} • {exercise.strategy}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">{exercise.difficulty}</Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {exercise.duration}
              </Badge>
            </div>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Cel ćwiczenia</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{exercise.objective}</p>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Opis</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{exercise.description}</p>
          </CardContent>
        </Card>

        {/* Equipment */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Wymagane wyposażenie</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {exercise.equipment.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Instrukcja krok po kroku</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {exercise.steps.map((step, index) => (
              <div key={index}>
                <div className="flex items-start gap-3 mb-2">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.content}</p>
                  </div>
                </div>
                {index < exercise.steps.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Coaching Tips */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle>Wskazówki dla trenera</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {exercise.coachingTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Adaptations */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="text-lg text-green-800">Wariant łatwiejszy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700">{exercise.adaptations.easier}</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="text-lg text-orange-800">Wariant trudniejszy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-700">{exercise.adaptations.harder}</p>
            </CardContent>
          </Card>
        </div>

        {/* Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Metryki do monitorowania</CardTitle>
            <CardDescription>Te parametry pozwolą Ci śledzić postępy zawodnika</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {exercise.metrics.map((metric, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">{metric}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
