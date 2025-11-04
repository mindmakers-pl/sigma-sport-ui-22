// Mock data symulujące dane z Biblioteki
// W przyszłości dane te będą pobierane z API/bazy danych

export interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: 'breathing' | 'focus' | 'control' | 'visualization' | 'game';
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
    category: 'breathing'
  },
  {
    id: 'ex-2',
    title: 'Body Scan',
    description: 'Systematyczne skanowanie ciała z uwagą na oddech i napięcie mięśniowe.',
    duration: '10-15 min',
    category: 'focus'
  },
  {
    id: 'ex-3',
    title: 'Semafor',
    description: 'Ćwiczenie kontroli impulsów - reaguj tylko na zielone światło, ignoruj czerwone.',
    duration: '5 min',
    category: 'control'
  },
  {
    id: 'ex-4',
    title: 'Rozpoznawanie rozproszeń',
    description: 'Identyfikacja zewnętrznych i wewnętrznych źródeł rozproszenia uwagi.',
    duration: '10 min',
    category: 'focus'
  },
  {
    id: 'ex-5',
    title: 'Technika "Zauważam i wracam"',
    description: 'Praktyka powrotu do obecności po zauważeniu rozproszenia.',
    duration: '15 min',
    category: 'focus'
  },
  {
    id: 'ex-6',
    title: 'Koncentracja progresywna',
    description: 'Stopniowe zwiększanie czasu koncentracji od 30 sekund do 5 minut.',
    duration: '20 min',
    category: 'focus'
  },
  {
    id: 'game-scan',
    title: 'Sigma Scan',
    description: 'Gra treningowa - szybkość skanowania wzrokowego.',
    duration: '3-5 min',
    category: 'game'
  },
  {
    id: 'game-focus',
    title: 'Sigma Focus',
    description: 'Gra treningowa - uwaga selektywna.',
    duration: '3-5 min',
    category: 'game'
  },
  {
    id: 'game-control',
    title: 'Sigma Control',
    description: 'Gra treningowa - kontrola inhibicyjna.',
    duration: '3-5 min',
    category: 'game'
  },
  {
    id: 'ex-7',
    title: 'Skrypt AUN',
    description: 'Technika Aktywacji Uwagi Natychmiastowej - szybkie skupienie przed akcją.',
    duration: '2-3 min',
    category: 'control'
  },
  {
    id: 'ex-8',
    title: 'Reset Emocjonalny',
    description: 'Szybka technika odzyskiwania spokoju po błędzie lub emocji.',
    duration: '1-2 min',
    category: 'control'
  },
  {
    id: 'ex-9',
    title: 'Wizualizacja sukcesu',
    description: 'Mentalne przećwiczenie idealnego wykonania akcji sportowej.',
    duration: '10-15 min',
    category: 'visualization'
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
          '3. Krok 1: Nauka Skryptu AUN - "Stop. Oddech. Cel." (15 min)',
          '4. Praktyka: Symulacja sytuacji przedmeczowych (15 min)',
          '5. Trening gier Sigma (10 min)',
          '6. Podsumowanie i zadanie domowe - stosować AUN przed każdym treningiem (5 min)'
        ],
        relatedExercises: ['ex-7', 'ex-1', 'game-control']
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
