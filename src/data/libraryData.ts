// Mock data symulujące dane z Biblioteki
// W przyszłości dane te będą pobierane z API/bazy danych

export interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: 'breathing' | 'focus' | 'control' | 'visualization' | 'game';
  objective?: string;
  equipment?: string[];
  steps?: Array<{ title: string; content: string }>;
  coachingTips?: string[];
  adaptations?: {
    easier?: string;
    harder?: string;
  };
  metrics?: string[];
}

export interface Meeting {
  id: string;
  title: string;
  date: Date | null;
  completed: boolean;
  isMeasurement: boolean;
  outline: {
    goal: string;
    steps: string[];
    relatedExercises: string[]; // IDs ćwiczeń z biblioteki
    trainingGuidance?: string; // Wskazówki prowadzenia treningu
  };
}

export interface Sprint {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'planned';
  totalMeetings: number;
  completedMeetings: number;
  meetings: Meeting[];
}

// Biblioteka Ćwiczeń
export const exerciseLibrary: Exercise[] = [
  {
    id: 'ex-1',
    title: 'Oddech Rezonansowy',
    description: 'Technika oddechu z częstotliwością 5.5 oddechu na minutę, synchronizująca układy nerwowe.',
    duration: '5-10 min',
    category: 'breathing',
    objective: 'Nauczenie zawodnika techniki regulacji poziomu pobudzenia poprzez kontrolowaną manipulację częstością oddechową.',
    equipment: ['Matę lub krzesło', 'Timer/aplikację z metronomem oddechowym (opcjonalnie)', 'Ciche pomieszczenie'],
    steps: [
      { title: 'Pozycja wyjściowa (1 min)', content: 'Zawodnik siada wygodnie z prostymi plecami, stopy płasko na podłodze. Ręce spoczywają na udach lub brzuchu. Oczy zamknięte lub skierowane w dół.' },
      { title: 'Ustalenie rytmu bazowego (2 min)', content: 'Wdech przez nos na 5 sekund (powolne napełnianie płuc od dołu). Wydech przez nos lub usta na 5 sekund (równie powolne opróżnianie). Zachowaj naturalność - nie forsuj.' },
      { title: 'Faza rezonansowa (4 min)', content: 'Kontynuuj rytm 5-5. Skup uwagę na ruchu powietrza, rozszerzaniu się brzucha przy wdechu i jego opadaniu przy wydechu. Jeśli myśli odchodzą, łagodnie wróć do obserwacji oddechu.' },
      { title: 'Powrót (1 min)', content: 'Stopniowo pozwól oddechowi wrócić do naturalnego rytmu. Przed otwarciem oczu zrób 3 głębokie oddechy. Zanotuj swój stan emocjonalny (skala 1-10).' }
    ],
    coachingTips: [
      'Oddech rezonansowy to nie hyperventylacja - ma być POWOLNY i GŁĘBOKI',
      'Pierwsza sesja może być trudna - zawodnik może czuć zawroty głowy. Skróć do 3-4 minut',
      'Najlepiej ćwiczyć codziennie o tej samej porze (np. rano po przebudzeniu)',
      'Można używać jako "reset" między rundami/setami na zawodach'
    ],
    adaptations: {
      easier: 'Skróć cykl do 4-4 (wdech-wydech po 4 sekundy), skróć czas do 5 minut',
      harder: 'Wydłuż cykl do 6-6, dodaj wizualizację (np. wyobraź sobie falę oceaniczną)'
    },
    metrics: ['Częstość oddechowa (oddechów/min)', 'Subiektywny poziom relaksu (1-10)', 'HRV baseline']
  },
  {
    id: 'ex-2',
    title: 'Body Scan',
    description: 'Systematyczne skanowanie ciała z uwagą na oddech i napięcie mięśniowe.',
    duration: '10-15 min',
    category: 'focus',
    objective: 'Rozwijanie świadomości cielesnej i umiejętności identyfikacji napięć mięśniowych poprzez metodyczne skanowanie poszczególnych części ciała.',
    equipment: ['Mata do ćwiczeń', 'Ciche pomieszczenie', 'Opcjonalnie: nagranie z instrukcją guided body scan'],
    steps: [
      { title: 'Pozycja wyjściowa (1 min)', content: 'Zawodnik leży na plecach w wygodnej pozycji, ręce wzdłuż ciała, stopy lekko rozstawione. Oczy zamknięte. Kilka głębokich oddechów.' },
      { title: 'Skanowanie stóp i nóg (3 min)', content: 'Przenieś uwagę na stopy. Zauważ wszystkie odczucia - ciepło, chłód, ucisk, pulsowanie. Nie oceniaj, tylko obserwuj. Przesuń uwagę na kostki, łydki, kolana, uda. Po kolei.' },
      { title: 'Skanowanie tułowia (3 min)', content: 'Skup się na biodrach, pośladkach, dolnej części pleców. Zauważ punkty kontaktu z matą. Przesuń na brzuch - czy napina się przy wdechu? Klatka piersiowa, górna część pleców.' },
      { title: 'Skanowanie rąk i ramion (2 min)', content: 'Palce dłoni, dłonie, nadgarstki, przedramiona, łokcie, ramiona, barki. Czy gdzieś jest napięcie? Jeśli tak, wyślij tam oddech.' },
      { title: 'Skanowanie głowy (2 min)', content: 'Szyja, kark, szczęka (często napięta!), policzki, oczy, czoło, czubek głowy. Pozwól całej twarzy się rozluźnić.' },
      { title: 'Całościowe skanowanie (2 min)', content: 'Przesuń uwagę przez całe ciało jak fala - od stóp do głowy. Jeśli znajdziesz obszar napięcia, zatrzymaj się tam na 2-3 oddechy.' },
      { title: 'Powrót (1 min)', content: 'Delikatnie porusz palcami rąk i nóg. Rozciągnij się. Otwórz oczy. Wstań powoli.' }
    ],
    coachingTips: [
      'Body Scan to nie relaksacja - to trening UWAGI na ciele. Niektórzy mogą czuć się bardziej świadomi napięć',
      'Normalnie, że myśli odchodzą. Za każdym razem łagodnie wracaj do ciała',
      'Można robić skróconą wersję (5 min) siedząc - świetne przed zawodami',
      'Zawodnicy kontuzjowani mogą czuć dyskomfort w pewnych obszarach - zachęć do obserwacji bez osądu'
    ],
    adaptations: {
      easier: 'Skróć do 3 obszarów (nogi, tułów, głowa), użyj nagrania z instrukcją, skróć czas do 8 minut',
      harder: 'Wydłuż do 20 minut, skanuj w pozycji siedzącej (trudniejsze utrzymanie uwagi), dodaj świadomość oddechu w każdym obszarze'
    },
    metrics: ['Liczba momentów rozproszenia uwagi', 'Zidentyfikowane obszary napięcia', 'Subiektywny poziom relaksu przed/po (1-10)']
  },
  {
    id: 'ex-3',
    title: 'Semafor',
    description: 'Ćwiczenie kontroli impulsów - reaguj tylko na zielone światło, ignoruj czerwone.',
    duration: '5 min',
    category: 'control',
    objective: 'Trening hamowania impulsywnych reakcji poprzez szybkie przetwarzanie sygnałów wizualnych i selekcję odpowiedniej odpowiedzi.',
    equipment: ['3 kartony kolorowe (zielony, żółty, czerwony)', 'Lub aplikacja z kolorowymi sygnałami', 'Stoper'],
    steps: [
      { title: 'Instrukcja (30 sek)', content: 'Trener pokazuje karty w losowej kolejności. ZIELONA = klaśnij w dłonie. ŻÓŁTA = tupnij stopą. CZERWONA = nic nie rób (zahamuj impuls).' },
      { title: 'Faza treningowa - wolne tempo (2 min)', content: '20 prób, interwał 5 sekund. Kolejność: zielona, żółta, czerwona, zielona, czerwona, żółta... Losowo. Zawodnik może popełniać błędy - to normalne.' },
      { title: 'Faza szybka - presja czasu (2 min)', content: '30 prób, interwał 2 sekundy. Szybkie tempo! 50% czerwonych (wymagają hamowania). Monitoruj liczbę błędów (reakcja na czerwone = błąd).' },
      { title: 'Analiza (30 sek)', content: 'Policz błędy. Ideał: <3 błędy w fazie szybkiej. Omów: Czy zawodnik spowalniał na czerwone (strategia unikania)? Czy utrzymał szybkość?' }
    ],
    coachingTips: [
      'Semafor to prostsza wersja testu Go/NoGo - świetny start dla młodszych zawodników',
      'Kluczowe: zawodnik musi utrzymać SZYBKOŚĆ reakcji na zielone/żółte, nie tylko skupić się na hamowaniu',
      'Można dodać dystraktory: trener mówi kolory werbalnie, ale pokazuje inne - konflikt!',
      'Transfer na sport: "czerwone światło" to np. sytuacja faulowa, prowokacja przeciwnika'
    ],
    adaptations: {
      easier: 'Tylko 2 sygnały (zielony = działaj, czerwony = stop), wydłuż interwał do 4 sekund, zmniejsz liczbę czerwonych do 30%',
      harder: 'Dodaj czwarty kolor (niebieski = skok), skróć interwał do 1 sekundy, dodaj dystraktory dźwiękowe, wykonuj podczas wysiłku fizycznego'
    },
    metrics: ['Liczba błędów (reakcja na czerwone)', 'Czas reakcji na zielone/żółte (ms)', 'Procent poprawnych odpowiedzi (%)']
  },
  {
    id: 'ex-4',
    title: 'Rozpoznawanie rozproszeń',
    description: 'Identyfikacja zewnętrznych i wewnętrznych źródeł rozproszenia uwagi.',
    duration: '10 min',
    category: 'focus',
    objective: 'Zwiększenie świadomości metacognitywnej poprzez identyfikację i kategoryzację typowych dystraktów występujących w kontekście sportowym.',
    equipment: ['Arkusz do zapisu', 'Długopis', 'Opcjonalnie: nagranie dźwięków z zawodów (tło)'],
    steps: [
      { title: 'Wprowadzenie (2 min)', content: 'Wyjaśnij 2 typy rozproszeń: ZEWNĘTRZNE (dźwięki, ruch, pogoda) i WEWNĘTRZNE (myśli, emocje, odczucia fizyczne). Poproś o przykłady z treningów/meczów.' },
      { title: 'Mapa rozproszeń - zewnętrzne (3 min)', content: 'Zawodnik zamyka oczy i wyobraża sobie sytuację meczową. Zapisuje 5 zewnętrznych rozproszeń (np. okrzyki kibiców, błąd sędziego, ruch przeciwnika, pogoda, ból kontuzji).' },
      { title: 'Mapa rozproszeń - wewnętrzne (3 min)', content: 'Teraz 5 wewnętrznych (np. "co pomyślą inni", wspomnienie błędu, lęk przed porażką, myśli o wyniku, irytacja). Bądź szczery - to dla Ciebie.' },
      { title: 'Kategoryzacja i ranking (2 min)', content: 'Zaznacz 3 najbardziej rozpraszające. Oceń (1-10) jak bardzo wpływają na grę. To Twoja "lista obserwacji" - teraz wiesz, czego szukać.' }
    ],
    coachingTips: [
      'To ćwiczenie diagnostyczne - nie ma poprawnych/złych odpowiedzi',
      'Zawodnicy często odkrywają, że WEWNĘTRZNE rozproszenia są silniejsze niż zewnętrzne',
      'Zachowaj te listy - będą bazą do ćwiczeń "Zauważam i wracam"',
      'Normalizuj - wszyscy zawodnicy mają rozproszenia, różnica jest w reakcji na nie'
    ],
    adaptations: {
      easier: 'Ogranicz do 3 rozproszeń każdego typu, podaj gotową listę do wyboru, skróć do 7 minut',
      harder: 'Rozszerz do 10 rozproszeń, dodaj kategorię "fizjologiczne" (głód, zmęczenie), stwórz mapę dla różnych faz meczu (początek, środek, koniec)'
    },
    metrics: ['Liczba zidentyfikowanych rozproszeń', 'Najsilniejsze rozproszenie (1-10)', 'Świadomość metacognitywna (samoocena)']
  },
  {
    id: 'ex-5',
    title: 'Technika "Zauważam i wracam"',
    description: 'Praktyka powrotu do obecności po zauważeniu rozproszenia.',
    duration: '15 min',
    category: 'focus',
    objective: 'Nauka szybkiego powrotu do koncentracji po zauważeniu rozproszenia poprzez protokół 3-krokowy: Zauważam → Nazywam → Wracam.',
    equipment: ['Timer', 'Arkusz z listą rozproszeń (z ćwiczenia ex-4)', 'Opcjonalnie: metronom/dzwonek co 2 minuty'],
    steps: [
      { title: 'Wprowadzenie protokołu (3 min)', content: 'Wyjaśnij 3 kroki: 1) ZAUWAŻAM - dostrzegam, że myśli odeszły. 2) NAZYWAM - "To rozproszenie" (bez oceny). 3) WRACAM - kieruję uwagę na oddech/ciało/zadanie. Demo przez trenera.' },
      { title: 'Praktyka z oddechem (5 min)', content: 'Zawodnik skupia się na oddechu. Gdy zauważy, że myśli odeszły, stosuje protokół. Nie walcz z myślami - po prostu wracaj. Licznik: ile razy musiałeś wrócić? (To SUKCES, nie porażka!)' },
      { title: 'Praktyka z zadaniem sportowym (5 min)', content: 'Zawodnik wykonuje proste zadanie ruchowe (np. żonglerka, dribling). Świadomie wprowadź rozproszenia (głośne dźwięki, pytania). Zawodnik stosuje protokół i wraca do zadania.' },
      { title: 'Refleksja (2 min)', content: 'Co było najtrudniejsze? Krok 1 (zauważanie)? 2 (nie osądzanie)? 3 (powrót)? Jaki był Twój "sygnał" że myśli odeszły? (np. napięcie, błąd w zadaniu)' }
    ],
    coachingTips: [
      'To najpotężniejsza technika w całym programie - fundament mindfulness sportowego',
      'Zawodnicy często myślą że "dużo powrotów = porażka". ODWROTNIE! Każdy powrót to trening mózgu',
      'Nazwanie rozproszenia (krok 2) zapobiega reakcji emocjonalnej na nie',
      'Stosuj "Zauważam i wracam" jako mantrę przed zawodami'
    ],
    adaptations: {
      easier: 'Skróć do 10 minut, użyj tylko praktyki z oddechem, dzwonek co 1 minutę przypomina o powrocie',
      harder: 'Wydłuż do 20 minut, dodaj symulację meczową pod presją, wprowadź dystraktory emocjonalne (wspomnienia porażek), brak dzwonka - pełna autonomia'
    },
    metrics: ['Liczba powrotów (im więcej, tym lepiej!)', 'Czas zauważenia rozproszenia (sekundy)', 'Jakość powrotu (1-10)']
  },
  {
    id: 'ex-6',
    title: 'Koncentracja progresywna',
    description: 'Stopniowe zwiększanie czasu koncentracji od 30 sekund do 5 minut.',
    duration: '20 min',
    category: 'focus',
    objective: 'Systematyczne wydłużanie czasu utrzymania koncentracji na jednym obiekcie poprzez progresywny trening - od krótkich do długich interwałów.',
    equipment: ['Stoper/timer', 'Obiekt do koncentracji (piłka, punkt na ścianie, lub oddech)', 'Dziennik treningowy'],
    steps: [
      { title: 'Test bazowy (2 min)', content: 'Zawodnik koncentruje się na wybranym obiekcie/oddechu tak długo jak potrafi BEZ rozproszenia. Zmierz czas do pierwszego odejścia myśli. To Twój baseline.' },
      { title: 'Seria 30 sekund x 3 (2 min)', content: '3 rundy po 30 sekund koncentracji, 20 sekund przerwy. Jeśli myśli odchodzą - "Zauważam i wracam". Cel: utrzymać przez cały czas.' },
      { title: 'Seria 1 minuta x 3 (4 min)', content: '3 rundy po 1 minucie, 30 sekund przerwy. Trudniejsze! Jeśli udało się wszystkie 3 - przenieś się dalej.' },
      { title: 'Seria 2 minuty x 2 (5 min)', content: '2 rundy po 2 minuty, 1 minuta przerwy. To już maraton koncentracji. Używaj oddechu jako "kotwicy powrotu".' },
      { title: 'Seria 3 minuty x 1 (3 min)', content: 'Pojedyncza runda 3 minuty. Jeśli udało się - jesteś na poziomie zaawansowanym!' },
      { title: 'Test końcowy (2 min)', content: 'Powtórz test bazowy. Zmierz czas do pierwszego rozproszenia. Czy poprawiłeś wynik?' },
      { title: 'Analiza (2 min)', content: 'Zapisz: baseline, najdłuższy udany interwał, liczba rozproszeń. To Twój punkt odniesienia na następną sesję.' }
    ],
    coachingTips: [
      'Koncentracja to jak mięsień - rozwija się przez systematyczny trening, nie jednorazowy wysiłek',
      'Jeśli zawodnik nie przechodzi poziomu - zostaje na nim przez kolejną sesję. Bez wstydu!',
      'Młodsi zawodnicy (<14 lat): zacznij od 15 sekund, wydłużaj wolniej',
      'Można robić na treningu: koncentracja na piłce przed strzałem, na rękawicy przed ciosem, etc.'
    ],
    adaptations: {
      easier: 'Zacznij od 15 sekund, wydłużaj po 15 sekund, skróć całość do 15 minut, używaj obiektów zewnętrznych (łatwiejsze niż oddech)',
      harder: 'Zacznij od 1 minuty, cel: 10 minut ciągłej koncentracji, dodaj dystraktory (dźwięki, ruch), koncentracja podczas wysiłku fizycznego'
    },
    metrics: ['Czas bazowy (sekundy)', 'Najdłuższy udany interwał (sekundy)', 'Liczba rozproszeń na rundę', 'Procentowa poprawa baseline']
  },
  {
    id: 'game-scan',
    title: 'Sigma Scan',
    description: 'Gra treningowa - szybkość skanowania wzrokowego. Znajdź zielone koło tak szybko jak potrafisz.',
    duration: '3-5 min',
    category: 'game',
    objective: 'Pomiar i trening szybkości percepcji wzrokowej - kluczowej umiejętności w sporcie.',
    steps: [
      { title: 'Instrukcje', content: 'Klikaj na zielone koło tak szybko jak potrafisz. Unikaj klikania innych kształtów i kolorów.' },
      { title: 'Test', content: 'Przeprowadzisz 10 prób. Każda próba to nowa siatka z ukrytym zielonym kołem.' }
    ]
  },
  {
    id: 'game-focus',
    title: 'Sigma Focus',
    description: 'Gra treningowa - uwaga selektywna. Wybieraj kolor napisu, ignorując jego znaczenie.',
    duration: '3-5 min',
    category: 'game',
    objective: 'Pomiar efektu interferencji i zdolności do selekcji istotnych informacji pod presją.',
    steps: [
      { title: 'Instrukcje', content: 'Wybierz przycisk odpowiadający KOLOROWI NAPISU, ignorując znaczenie słowa.' },
      { title: 'Test', content: 'Wykonasz 20 prób. Próby zgodne (słowo i kolor pasują) i niezgodne (konflikt).' }
    ]
  },
  {
    id: 'game-control',
    title: 'Sigma Control',
    description: 'Gra treningowa - kontrola inhibicyjna. Test Go/NoGo - klikaj na zielone O, NIE klikaj na czerwone X.',
    duration: '3-5 min',
    category: 'game',
    objective: 'Pomiar zdolności hamowania impulsywnych reakcji - fundamentu samokontroli sportowej.',
    steps: [
      { title: 'Instrukcje', content: 'Klikaj ekran gdy zobaczysz ZIELONE O. NIE KLIKAJ gdy zobaczysz CZERWONE X.' },
      { title: 'Test', content: 'Test trwa 2 minuty. Próby pojawiają się losowo z różnymi odstępami czasu.' }
    ]
  },
  {
    id: 'ex-7',
    title: 'Skrypt AUN',
    description: 'Technika Aktywacji Uwagi Natychmiastowej - szybkie skupienie przed akcją.',
    duration: '2-3 min',
    category: 'control',
    objective: 'Stworzenie mentalnego "przełącznika" pozwalającego na błyskawiczne wejście w stan pełnej koncentracji przed kluczową akcją sportową.',
    equipment: ['Brak - tylko zawodnik i trener'],
    steps: [
      { title: 'Wprowadzenie do AUN (30 sek)', content: 'AUN to 3-słowny skrypt uruchamiany przed każdą ważną akcją: STOP. ODDECH. CEL. To Twój mental reset w 5 sekund.' },
      { title: 'Krok 1: STOP (30 sek)', content: 'Zawodnik zatrzymuje automatyczne myśli gestem fizycznym (np. zaciska pięść, dotyka klatki piersiowej). Gest musi być szybki, dyskretny, zawsze ten sam. Przećwicz 5 razy.' },
      { title: 'Krok 2: ODDECH (30 sek)', content: 'Jeden głęboki wdech nosem (3 sek) + wydech ustami (3 sek). To reset układu nerwowego. Przećwicz razem z gestem STOP.' },
      { title: 'Krok 3: CEL (30 sek)', content: 'Werbalizuj (w myślach lub szeptem) JEDNO SŁOWO opisujące cel akcji (np. "Precyzja", "Eksplozja", "Spokój"). Przećwicz pełny cykl STOP-ODDECH-CEL 5 razy.' },
      { title: 'Symulacja (30 sek)', content: 'Trener wywołuje symulację (np. "Za 10 sekund rzut karny"). Zawodnik stosuje AUN. Ocena (1-10): Czy poczułeś zmianę stanu?' }
    ],
    coachingTips: [
      'AUN to NOT medytacja - to pre-performance routine jak w NBA przed rzutem wolnym',
      'Zawodnicy muszą wymyślić SWÓJ gest i SWOJE słowo-cel. Personalizacja = skuteczność',
      'Stosuj przed KAŻDYM treningiem przez 2 tygodnie - dopiero wtedy staje się automatem',
      'Badania pokazują: rutyny skracają czas reakcji i zwiększają konsystencję wykonania'
    ],
    adaptations: {
      easier: 'Wydłuż oddech do 5-5 sekund, pozwól na dłuższy gest (np. seria uderzeń w uda), używaj zewnętrznego przypomnienia (kartka z "AUN")',
      harder: 'Skróć całość do 3 sekund, stosuj pod presją czasu, dodaj wizualizację idealnego wykonania, stosuj w warunkach rozpraszających'
    },
    metrics: ['Czas wykonania AUN (sekundy)', 'Zmiana stanu emocjonalnego przed/po (1-10)', 'Konsystencja stosowania (% sytuacji)']
  },
  {
    id: 'ex-8',
    title: 'Reset Emocjonalny',
    description: 'Szybka technika odzyskiwania spokoju po błędzie lub emocji.',
    duration: '1-2 min',
    category: 'control',
    objective: 'Opanowanie protokołu natychmiastowej regulacji emocji negatywnych (frustracja, złość, lęk) w trakcie rywalizacji sportowej.',
    equipment: ['Brak'],
    steps: [
      { title: 'Krok 1: Fizyczne odłączenie (10 sek)', content: 'Po błędzie/emocji: odwróć się, zrób 3 kroki w bok, lub odejdź do linii bocznej. FIZYCZNIE przerwij sytuację. To sygnał dla mózgu: "Ta akcja się skończyła".' },
      { title: 'Krok 2: Oddech resetujący (20 sek)', content: 'Seria 3 głębokich oddechów: Wdech nosem (4 sek) + wstrzymanie (2 sek) + wydech ustami (6 sek). Przy wydechu wizualizuj "wypuszczanie" emocji.' },
      { title: 'Krok 3: Self-talk resetujący (10 sek)', content: 'Wypowiedz w myślach krótką frazę resetującą (wybierz SWOJĄ): "Następna piłka", "Reset", "Teraz", "Jestem tutaj". Tylko forward, zero rozpamiętywania.' },
      { title: 'Krok 4: Powrót do gry (20 sek)', content: 'Aktywuj ciało (podskocz, klaśnij, potrząśnij rękami). Skup się na NASTĘPNEJ akcji, nie poprzedniej. Wróć do pozycji z nastawieniem "fresh start".' }
    ],
    coachingTips: [
      'Reset Emocjonalny = najważniejsza umiejętność w sporcie. Różnica między dobrymi a wielkimi',
      'Pierwsze 2 tygodnie: zawodnicy będą resetować PO 2-3 minutach. To OK! Stopniowo skracaj',
      'Kluczowe: NIE ANALIZUJ błędu podczas resetu. Analiza = PÓŹNIEJ. Teraz = tylko RESET',
      'Trenerzy: sami stosujcie reset przed komunikacją z zawodnikiem po jego błędzie!'
    ],
    adaptations: {
      easier: 'Wydłuż czas do 2-3 minut, dodaj fizyczne "otrząsanie się" (dosłownie!), użyj zewnętrznego sygnału (trener krzyczy "RESET")',
      harder: 'Skróć do 30 sekund, stosuj podczas ciągłej gry (brak fizycznego odłączenia), dodaj pozytywną wizualizację następnej akcji'
    },
    metrics: ['Czas powrotu do stanu bazowego (sekundy)', 'Liczba błędów PO resecie vs PRZED (porównanie)', 'Samoocena jakości resetu (1-10)']
  },
  {
    id: 'ex-9',
    title: 'Wizualizacja sukcesu',
    description: 'Mentalne przećwiczenie idealnego wykonania akcji sportowej.',
    duration: '10-15 min',
    category: 'visualization',
    objective: 'Programowanie mózgu na sukces poprzez wielozmysłowe odtwarzanie idealnej sekwencji ruchowej z pełnym zaangażowiem emocjonalnym.',
    equipment: ['Ciche pomieszczenie', 'Mata lub krzesło', 'Opcjonalnie: nagranie z instrukcją guided imagery'],
    steps: [
      { title: 'Relaksacja (2 min)', content: 'Pozycja leżąca lub siedząca, oczy zamknięte. 10 głębokich oddechów. Świadomie rozluźnij mięśnie od stóp po głowę (progressive relaxation).' },
      { title: 'Wybór sekwencji (1 min)', content: 'Zdefiniuj konkretną akcję sportową do wizualizacji (np. rzut judoka, strzał na bramkę, start sprintera). Im bardziej precyzyjna, tym lepiej.' },
      { title: 'Wizualizacja zewnętrzna (2 min)', content: 'Zobacz siebie z zewnątrz (jak na filmie) wykonującego akcję IDEALNIE. Zwolnione tempo. Zauważ każdy szczegół: pozycję ciała, ruch, moment kulminacyjny, skuteczność.' },
      { title: 'Wizualizacja wewnętrzna (5 min)', content: 'Przenieś się do środka - zobacz oczami zawodnika. Poczuj napięcie mięśni, ciężar ciała, ruch w przestrzeni. Usłysz dźwięki (okrzyki, oddech). Poczuj emocje (pewność, flow, radość po sukcesie). Powtórz 3-5 razy.' },
      { title: 'Zakotwiczenie (1 min)', content: 'Połącz wyobrażenie z gestem fizycznym (np. zaciskasz pięść). To "kotwica" do aktywowania tego stanu na zawodach.' },
      { title: 'Powrót (1 min)', content: 'Stopniowo wróć do świadomości ciała. Porusz palcami, rozciągnij się. Otwórz oczy. Zatrzymaj "smak" sukcesu.' }
    ],
    coachingTips: [
      'Jakość > ilość. Lepiej 3 minuty pełnego zanurzenia niż 15 minut rozkojarzenia',
      'Zawodnik MUSI wizualizować SUKCES, nie porażkę. To programowanie mózgu na wzorzec',
      'Najlepsze momenty: przed snem (przechodzi do pamięci długotrwałej) i rano po przebudzeniu',
      'Połącz z praktyką: wizualizuj przed treningiem technicznym - mózg już będzie "rozgrzany"'
    ],
    adaptations: {
      easier: 'Skup się tylko na wizualizacji zewnętrznej, skróć do 5 minut, używaj gotowego nagrania guided imagery, wizualizuj pojedyncze proste ruchy',
      harder: 'Dodaj element stresu (wyobraź sobie pełne trybuny, decydujący moment), wizualizuj całą sekwencję zawodów (od rozgrzewki do podium), dodaj wizualizację radzenia sobie z błędami i powrotu'
    },
    metrics: ['Żywość obrazu (1-10)', 'Kontrola nad obrazem (1-10)', 'Zaangażowanie emocjonalne (1-10)', 'Czas utrzymania koncentracji (minuty)']
  }
];

// Sprint 1: Trening Uwagi (Ukończony)
export const sprint1: Sprint = {
  id: 'sprint-1',
  title: 'Sigma Sprint 1: Trening Uwagi',
  status: 'completed',
  totalMeetings: 5,
  completedMeetings: 5,
  meetings: [
    {
      id: 'm1-1',
      title: 'Spotkanie 1.1: Wprowadzenie i Pomiar Baseline',
      date: new Date('2024-01-08'),
      completed: true,
      isMeasurement: true,
      outline: {
        goal: 'Przeprowadzenie pierwszego pomiaru bazowego zawodników w celu ustalenia poziomu wyjściowego umiejętności kognitywnych i fizjologicznych.',
        steps: [
          '1. Wprowadzenie do programu (10 min) - omówienie celów, harmonogramu i zasad',
          '2. Wypełnienie kwestionariusza wstępnego (5 min)',
          '3. Test Sigma Scan - szybkość skanowania wzrokowego (3 min)',
          '4. Test Sigma Control - kontrola inhibicyjna (3 min)',
          '5. Test Sigma Focus - uwaga selektywna (3 min)',
          '6. Pomiar HRV baseline (10 min)',
          '7. Podsumowanie i omówienie dalszych kroków (5 min)'
        ],
        relatedExercises: ['game-scan', 'game-control', 'game-focus']
      }
    },
    {
      id: 'm1-2',
      title: 'Spotkanie 1.2: Podstawy świadomości oddechowej',
      date: new Date('2024-01-15'),
      completed: true,
      isMeasurement: false,
      outline: {
        goal: 'Wprowadzenie do świadomości oddechowej jako fundamentu kontroli uwagi. Nauka techniki oddechu rezonansowego.',
        steps: [
          '1. Rozgrzewka kognitywna - test Scan (5 min)',
          '2. Wprowadzenie teoretyczne - wpływ oddechu na układ nerwowy (10 min)',
          '3. Ćwiczenie: Oddech rezonansowy 5.5/min (15 min)',
          '4. Ćwiczenie: Body Scan z oddechem (10 min)',
          '5. Trening gry Sigma Focus (10 min)',
          '6. Podsumowanie i zadanie domowe (5 min)'
        ],
        relatedExercises: ['ex-1', 'ex-2', 'game-focus']
      }
    },
    {
      id: 'm1-3',
      title: 'Spotkanie 1.3: Rozpoznawanie rozproszeń',
      date: new Date('2024-01-22'),
      completed: true,
      isMeasurement: false,
      outline: {
        goal: 'Nauka identyfikacji zewnętrznych i wewnętrznych źródeł rozproszenia uwagi. Praktyka powrotu do obecności.',
        steps: [
          '1. Rozgrzewka - test Control (5 min)',
          '2. Analiza sytuacji rozpraszających w sporcie (10 min)',
          '3. Ćwiczenie: Rozpoznawanie myśli automatycznych (10 min)',
          '4. Praktyka: Technika "Zauważam i wracam" (15 min)',
          '5. Trening gry Sigma Scan (10 min)',
          '6. Refleksja i zadanie domowe (5 min)'
        ],
        relatedExercises: ['ex-4', 'ex-5', 'game-scan', 'game-control']
      }
    },
    {
      id: 'm1-4',
      title: 'Spotkanie 1.4: Trening koncentracji z progresją',
      date: new Date('2024-01-29'),
      completed: true,
      isMeasurement: false,
      outline: {
        goal: 'Zastosowanie poznanych technik w praktyce sportowej. Stopniowe zwiększanie trudności i czasu utrzymania koncentracji.',
        steps: [
          '1. Rozgrzewka - wszystkie gry Sigma (10 min)',
          '2. Progresywny trening koncentracji na oddechu (15 min)',
          '3. Ćwiczenie: Koncentracja w ruchu (10 min)',
          '4. Symulacja sytuacji meczowej z rozproszeniami (15 min)',
          '5. Podsumowanie modułu i przygotowanie do pomiaru (5 min)'
        ],
        relatedExercises: ['ex-6', 'game-scan', 'game-focus', 'game-control']
      }
    },
    {
      id: 'm1-5',
      title: 'Spotkanie 1.5: Pomiar Kontrolny M2',
      date: new Date('2024-02-05'),
      completed: true,
      isMeasurement: true,
      outline: {
        goal: 'Pomiar postępu po zakończeniu Modułu 1. Weryfikacja poprawy w zakresie uwagi, koncentracji i parametrów fizjologicznych.',
        steps: [
          '1. Krótkie przypomnienie technik z modułu (5 min)',
          '2. Wypełnienie kwestionariusza kontrolnego (5 min)',
          '3. Test Sigma Scan (3 min)',
          '4. Test Sigma Control (3 min)',
          '5. Test Sigma Focus (3 min)',
          '6. Pomiar HRV baseline (10 min)',
          '7. Analiza wyników i feedback indywidualny (10 min)'
        ],
        relatedExercises: ['game-scan', 'game-control', 'game-focus']
      }
    }
  ]
};

// Sprint 2: Kontrola Impulsów (W toku)
export const sprint2: Sprint = {
  id: 'sprint-2',
  title: 'Sigma Sprint 2: Kontrola Impulsów',
  status: 'in-progress',
  totalMeetings: 5,
  completedMeetings: 2,
  meetings: [
    {
      id: 'm2-1',
      title: 'Spotkanie 2.1: Wprowadzenie do AUN',
      date: new Date('2024-02-12'),
      completed: true,
      isMeasurement: false,
      outline: {
        goal: 'Nauka techniki Aktywacji Uwagi Natychmiastowej (AUN) - szybkiego skupienia przed kluczową akcją.',
        steps: [
          '1. Rozgrzewka Mentalna - Pogadaj z ekipą o tym, kiedy trudno jest "się przełączyć" (10 min)',
          '2. Wprowadzenie do "Reflektora Uwagi" - demo trenerskie (5 min)',
          '3. Krok 1: Nauka Skryptu @ex-7 AUN - "Stop. Oddech. Cel." (15 min)',
          '4. Praktyka: Symulacja sytuacji przedmeczowych (15 min)',
          '5. Trening gier Sigma z @game-control (10 min)',
          '6. Podsumowanie i zadanie domowe - stosować AUN przed każdym treningiem (5 min)'
        ],
        relatedExercises: ['ex-7', 'ex-1', 'game-control'],
        trainingGuidance: 'Kluczowe jest pokazanie, że AUN to nie "medytacja", ale konkretne narzędzie bojowe. Używaj analogii sportowych - "To jak spalony przed sprintem - przygotowujesz się mentalnie do eksplozji". Pozwól zawodnikom wymyślić własne warianty skryptu, dopóki zachowują strukturę: Zatrzymanie → Reset → Fokus.'
      }
    },
    {
      id: 'm2-2',
      title: 'Spotkanie 2.2: Kontrola reakcji emocjonalnej',
      date: new Date('2024-02-19'),
      completed: true,
      isMeasurement: false,
      outline: {
        goal: 'Nauka rozpoznawania i zarządzania silnymi emocjami w trakcie rywalizacji sportowej.',
        steps: [
          '1. Rozgrzewka - Semafor (ćwiczenie kontroli impulsów) (10 min)',
          '2. Analiza sytuacji prowokujących - video z meczów (10 min)',
          '3. Wprowadzenie: Reset Emocjonalny (technika 3 kroków) (10 min)',
          '4. Praktyka: Symulacje stresu w grze (15 min)',
          '5. Trening wszystkich gier Sigma (10 min)',
          '6. Refleksja grupowa - co pomogło? (5 min)'
        ],
        relatedExercises: ['ex-3', 'ex-8', 'game-control', 'game-focus']
      }
    },
    {
      id: 'm2-3',
      title: 'Spotkanie 2.3: Hamowanie automatyzmów',
      date: null,
      completed: false,
      isMeasurement: false,
      outline: {
        goal: 'Rozwijanie zdolności świadomej kontroli nad automatycznymi reakcjami i impulsami.',
        steps: [
          '1. Rozgrzewka - test Control (poziom trudny) (5 min)',
          '2. Wprowadzenie: Czym są automatyzmy? Kiedy pomagają, a kiedy szkodzą? (10 min)',
          '3. Ćwiczenie: Identyfikacja własnych automatyzmów sportowych (10 min)',
          '4. Praktyka: "Zatrzymaj i Wybierz" - świadome decyzje w grze (20 min)',
          '5. Trening gier Sigma (10 min)',
          '6. Podsumowanie - dziennik automatyzmów (5 min)'
        ],
        relatedExercises: ['game-control', 'ex-3', 'ex-7']
      }
    },
    {
      id: 'm2-4',
      title: 'Spotkanie 2.4: Kontrola w sytuacjach presji',
      date: null,
      completed: false,
      isMeasurement: false,
      outline: {
        goal: 'Praktyczne zastosowanie technik kontroli w symulowanych sytuacjach wysokiej presji.',
        steps: [
          '1. Rozgrzewka - kompletna bateria testów Sigma (15 min)',
          '2. Przypomnienie wszystkich technik z modułu (10 min)',
          '3. Symulacja: Sytuacje meczowe pod presją czasu (20 min)',
          '4. Analiza grupowa - co działało, co nie? (10 min)',
          '5. Przygotowanie do pomiaru kontrolnego (5 min)'
        ],
        relatedExercises: ['game-scan', 'game-control', 'game-focus', 'ex-7', 'ex-8']
      }
    },
    {
      id: 'm2-5',
      title: 'Spotkanie 2.5: Pomiar Kontrolny M3',
      date: null,
      completed: false,
      isMeasurement: true,
      outline: {
        goal: 'Pomiar postępu po zakończeniu Modułu 2. Weryfikacja poprawy w zakresie kontroli impulsów i reakcji emocjonalnych.',
        steps: [
          '1. Krótkie przypomnienie technik z modułu (5 min)',
          '2. Wypełnienie kwestionariusza kontrolnego (5 min)',
          '3. Test Sigma Scan (3 min)',
          '4. Test Sigma Control (3 min)',
          '5. Test Sigma Focus (3 min)',
          '6. Pomiar HRV baseline (10 min)',
          '7. Analiza wyników i feedback indywidualny (10 min)'
        ],
        relatedExercises: ['game-scan', 'game-control', 'game-focus']
      }
    }
  ]
};

// Sprint 3: Trening Wyobrażeniowy (Zaplanowany)
export const sprint3: Sprint = {
  id: 'sprint-3',
  title: 'Sigma Sprint 3: Trening Wyobrażeniowy',
  status: 'planned',
  totalMeetings: 5,
  completedMeetings: 0,
  meetings: [
    {
      id: 'm3-1',
      title: 'Spotkanie 3.1: Wprowadzenie do wizualizacji',
      date: null,
      completed: false,
      isMeasurement: false,
      outline: {
        goal: 'Poznanie podstaw treningu wyobrażeniowego i jego wpływu na wyniki sportowe.',
        steps: [
          '1. Rozgrzewka mentalna - test Sigma (5 min)',
          '2. Wprowadzenie teoretyczne - jak działa wizualizacja? (15 min)',
          '3. Pierwsze ćwiczenie - wizualizacja prostego ruchu (15 min)',
          '4. Praktyka: Wizualizacja sukcesu w sporcie (15 min)',
          '5. Refleksja grupowa (5 min)',
          '6. Zadanie domowe - codzienna wizualizacja (5 min)'
        ],
        relatedExercises: ['ex-9']
      }
    },
    {
      id: 'm3-2',
      title: 'Spotkanie 3.2: Wizualizacja techniczna',
      date: null,
      completed: false,
      isMeasurement: false,
      outline: {
        goal: 'Mentalne przećwiczenie technicznych elementów wykonania akcji sportowej.',
        steps: [
          '1. Rozgrzewka - gry Sigma (10 min)',
          '2. Analiza techniki - wybór elementu do wizualizacji (10 min)',
          '3. Wizualizacja krok po kroku (20 min)',
          '4. Fizyczna praktyka z wykorzystaniem wizualizacji (15 min)',
          '5. Podsumowanie doświadczeń (5 min)'
        ],
        relatedExercises: ['ex-9', 'game-focus']
      }
    },
    {
      id: 'm3-3',
      title: 'Spotkanie 3.3: Wizualizacja taktyczna',
      date: null,
      completed: false,
      isMeasurement: false,
      outline: {
        goal: 'Mentalne przygotowanie do różnych scenariuszy taktycznych w rywalizacji.',
        steps: [
          '1. Rozgrzewka mentalna (5 min)',
          '2. Wprowadzenie - wizualizacja scenariuszy (10 min)',
          '3. Praktyka: Wizualizacja różnych sytuacji meczowych (25 min)',
          '4. Dyskusja grupowa - przygotowanie mentalne (15 min)',
          '5. Podsumowanie (5 min)'
        ],
        relatedExercises: ['ex-9', 'ex-1']
      }
    },
    {
      id: 'm3-4',
      title: 'Spotkanie 3.4: Wizualizacja emocjonalna',
      date: null,
      completed: false,
      isMeasurement: false,
      outline: {
        goal: 'Przygotowanie mentalne do radzenia sobie z emocjami w trakcie rywalizacji.',
        steps: [
          '1. Rozgrzewka - kompletna bateria Sigma (15 min)',
          '2. Wprowadzenie - emocje w wizualizacji (10 min)',
          '3. Praktyka: Wizualizacja trudnych momentów (20 min)',
          '4. Integracja wszystkich technik z programu (10 min)',
          '5. Przygotowanie do finalnego pomiaru (5 min)'
        ],
        relatedExercises: ['ex-9', 'ex-8', 'ex-7']
      }
    },
    {
      id: 'm3-5',
      title: 'Spotkanie 3.5: Pomiar Końcowy M4',
      date: null,
      completed: false,
      isMeasurement: true,
      outline: {
        goal: 'Finalny pomiar po zakończeniu całego programu Sigma Teams. Weryfikacja długoterminowego postępu.',
        steps: [
          '1. Krótkie przypomnienie wszystkich technik (10 min)',
          '2. Wypełnienie kwestionariusza końcowego (5 min)',
          '3. Test Sigma Scan (3 min)',
          '4. Test Sigma Control (3 min)',
          '5. Test Sigma Focus (3 min)',
          '6. Pomiar HRV baseline (10 min)',
          '7. Analiza wyników całego programu (15 min)',
          '8. Uroczyste zakończenie i certyfikaty (10 min)'
        ],
        relatedExercises: ['game-scan', 'game-control', 'game-focus']
      }
    }
  ]
};

// Sigma Go! - Trening demonstracyjny
export const sigmaGoDemoTraining = {
  id: 'sigma-go-demo',
  title: 'Sigma Go! - Trening Demonstracyjny',
  description: 'Kompleksowy 60-minutowy trening demonstracyjny pokazujący możliwości programu Sigma.',
  duration: '60 min',
  outline: {
    goal: 'Przedstawienie podstawowych technik mentalnych i pomiarów kognitywnych w praktycznym, angażującym treningu.',
    steps: [
      '1. Powitanie i wprowadzenie do programu Sigma (5 min) - Opowiedz o trzech filarach: uwaga, kontrola, wyobraźnia',
      '2. Rozgrzewka mentalna z @game-scan (5 min) - Wszyscy zawodnicy wykonują test Sigma Scan',
      '3. Mini-wykład: Oddech i koncentracja (5 min) - Wyjaśnij związek między oddechem a układem nerwowym',
      '4. Ćwiczenie praktyczne: @ex-1 Oddech Rezonansowy (10 min) - Prowadź zawodników przez technikę 5.5 oddechu/min',
      '5. Demo kontroli impulsów z @game-control (5 min) - Pokaż jak szybkość reakcji łączy się z kontrolą',
      '6. Ćwiczenie grupowe: @ex-3 Semafor (10 min) - Praktyka hamowania impulsów',
      '7. Wprowadzenie do AUN - "Stop. Oddech. Cel." (10 min) - Naucz podstawowego @ex-7 skryptu aktywacji',
      '8. Mini-turniej z @game-focus (5 min) - Rywalizacja w trybie treningowym',
      '9. Podsumowanie i Q&A (5 min) - Odpowiedz na pytania, rozdaj materiały informacyjne'
    ],
    relatedExercises: ['game-scan', 'ex-1', 'game-control', 'ex-3', 'ex-7', 'game-focus'],
    trainingGuidance: `
**Jak prowadzić ten trening:**

• **Energia i entuzjazm**: To pierwszy kontakt zawodników z programem - pokaż że trening mentalny może być ciekawy i angażujący!

• **Praktyka > Teoria**: Minimalizuj wykłady, maksymalizuj działanie. Niech zawodnicy doświadczą, a potem wyjaśniaj.

• **Język prosty**: Unikaj żargonu naukowego. Mów "skupienie" zamiast "koncentracja uwagi", "spokój" zamiast "regulacja autonomiczna".

• **Przykłady ze sportu**: Kiedy wyjaśniasz techniki, odwoływuj się do konkretnych sytuacji meczowych (rzut karny, pressujący przeciwnik, etc.)

• **Zachęcaj do pytań**: Stwórz bezpieczną atmosferę - nie ma głupich pytań, każde doświadczenie jest wartościowe.

• **Obserwuj reakcje**: Jeśli widzisz znudzenie - przyspiesz tempo. Jeśli widzisz zagubienie - zwolnij i wyjaśnij jeszcze raz.

• **Zakończ z motywacją**: Ostatnie zdanie powinno brzmieć: "To dopiero początek - w pełnym programie nauczycie się technik, które zmienią waszą grę!"
    `
  }
};

// Eksport wszystkich sprintów
export const allSprints: Sprint[] = [sprint1, sprint2, sprint3];

// Funkcja pomocnicza do pobierania ćwiczenia po ID
export const getExerciseById = (id: string): Exercise | undefined => {
  return exerciseLibrary.find(ex => ex.id === id);
};

// Funkcja pomocnicza do pobierania sprintu po ID
export const getSprintById = (id: string): Sprint | undefined => {
  return allSprints.find(sprint => sprint.id === id);
};

// Funkcja pomocnicza do pobierania spotkania po ID
export const getMeetingById = (meetingId: string): { sprint: Sprint; meeting: Meeting } | undefined => {
  for (const sprint of allSprints) {
    const meeting = sprint.meetings.find(m => m.id === meetingId);
    if (meeting) {
      return { sprint, meeting };
    }
  }
  return undefined;
};

// KWESTIONARIUSZE - Six Sigma Framework
export const questionnaires = [
  {
    id: "six_sigma_full",
    name: "Six Sigma",
    description: "Kompleksowa ocena 6 kluczowych kompetencji psychologicznych. Przeprowadzaj na początku i końcu sezonu.",
    duration: "8-10 min",
    category: "Kompetencje Psychologiczne",
    frequency: "2x w sezonie (T0 + T-Final)"
  },
  {
    id: "six_sigma_lite",
    name: "Six Sigma Lite",
    description: "Szybka sonda monitorująca postępy. Key Indicators do śledzenia trendów.",
    duration: "2-3 min",
    category: "Kompetencje Psychologiczne",
    frequency: "Co 4 tygodnie (po każdym Sprincie)"
  },
  {
    id: "six_sigma_mood",
    name: "Six Sigma Mood",
    description: "Pytania kontekstowe o stan fizyczny, emocjonalny i środowiskowy. Zawsze towarzyszą pomiarom.",
    duration: "1-2 min",
    category: "Kompetencje Psychologiczne",
    frequency: "Przy każdym pomiarze"
  }
];
