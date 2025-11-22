// Six Sigma Questionnaire Data Structure

export interface Question {
  id: string;
  text: string;
  competence: string;
  reversed: boolean;
  keyIndicator?: boolean;
  category: 'thought' | 'body' | 'behavior'; // Triangulacja
}

export interface QuestionnaireDefinition {
  id: string;
  name: string;
  fullName: string;
  description: string;
  duration: string;
  questions: Question[];
  scaleType: 5 | 7;
  scaleLabels: {
    min: string;
    max: string;
  };
}

// Six Sigma Full (36 pytań + 6 kontekstowych)
export const sixSigmaFull: QuestionnaireDefinition = {
  id: 'six_sigma_full',
  name: 'Six Sigma',
  fullName: 'Six Sigma - Pełny Profil Kompetencji',
  description: 'Kompleksowa ocena 6 kompetencji psychologicznych w sporcie',
  duration: '10-12 min',
  scaleType: 5,
  scaleLabels: {
    min: 'Wcale się nie zgadzam',
    max: 'Całkowicie się zgadzam'
  },
  questions: [
    // AKTYWACJA (6 pytań)
    { id: 'akt_1', text: 'Kiedy wychodzę na trening, czuję w ciele energię i gotowość.', competence: 'Aktywacja', reversed: false, keyIndicator: true, category: 'body' },
    { id: 'akt_2', text: 'Przed ważnym startem mam nogi jak z waty i czuję się słaby/a.', competence: 'Aktywacja', reversed: true, category: 'body' },
    { id: 'akt_3', text: 'Umiem uspokoić oddech, gdy czuję, że serce bije mi za szybko przed startem.', competence: 'Aktywacja', reversed: false, category: 'behavior' },
    { id: 'akt_4', text: 'Często na rozgrzewce ziewam i czuję się śpiący.', competence: 'Aktywacja', reversed: true, category: 'body' },
    { id: 'akt_5', text: 'Czuję "motyle w brzuchu" przed meczem, ale to przyjemne uczucie gotowości, a nie strach.', competence: 'Aktywacja', reversed: false, category: 'thought' },
    { id: 'akt_6', text: 'Wieczorem po ciężkim treningu potrafię się wyciszyć i szybko zasnąć.', competence: 'Aktywacja', reversed: false, category: 'behavior' },

    // KONTROLA (6 pytań)
    { id: 'kon_1', text: 'Kiedy sędzia podejmie złą decyzję potrafię zachować spokój i nie dyskutować.', competence: 'Kontrola', reversed: false, keyIndicator: true, category: 'behavior' },
    { id: 'kon_2', text: 'Gdy coś mi nie wychodzi, macham rękami, krzyczę lub płaczę.', competence: 'Kontrola', reversed: true, category: 'behavior' },
    { id: 'kon_3', text: 'W kluczowych momentach w czasie zawodów moja głowa pozostaje chłodna.', competence: 'Kontrola', reversed: false, category: 'thought' },
    { id: 'kon_4', text: 'Kiedy się wścieknę, gram agresywniej i częściej fauluję/psuję.', competence: 'Kontrola', reversed: true, category: 'behavior' },
    { id: 'kon_5', text: 'Potrafię oddzielić to, co dzieje się w szkole/domu, od tego, co robię na treningu.', competence: 'Kontrola', reversed: false, category: 'thought' },
    { id: 'kon_6', text: 'Gdy przeciwnik mnie prowokuje, łatwo daję się wyprowadzić z równowagi.', competence: 'Kontrola', reversed: true, category: 'body' },

    // RESET (6 pytań)
    { id: 'res_1', text: 'Po błędzie moją pierwszą reakcją jest: "naprawiam/walczę dalej"', competence: 'Reset', reversed: false, keyIndicator: true, category: 'behavior' },
    { id: 'res_2', text: 'Kiedy zepsuję proste zagranie, myślę o tym przez kolejne kilka minut.', competence: 'Reset', reversed: true, category: 'thought' },
    { id: 'res_3', text: 'Błąd traktuję jak informację ("co poprawić"), a nie jak dowód, że jestem słaby.', competence: 'Reset', reversed: false, category: 'thought' },
    { id: 'res_4', text: 'Po nieudanej akcji boję się zaryzykować ponownie, żeby znowu nie zepsuć.', competence: 'Reset', reversed: true, category: 'behavior' },
    { id: 'res_5', text: 'Po błędzie potrafię się "zrestartować" i wrócić do skupienia w kilka sekund.', competence: 'Reset', reversed: false, category: 'behavior' },
    { id: 'res_6', text: 'Po nieudanym starcie, jestem smutny/a lub zły/a przez resztę dnia.', competence: 'Reset', reversed: true, category: 'thought' },

    // FOKUS (6 pytań)
    { id: 'fok_1', text: 'Podczas gry słyszę tylko trenera (i zespół), a nie hałas dookoła.', competence: 'Fokus', reversed: false, keyIndicator: true, category: 'behavior' },
    { id: 'fok_2', text: 'W czasie zawodów zdarza mi się patrzeć na rodziców lub kibiców na trybunach.', competence: 'Fokus', reversed: true, category: 'behavior' },
    { id: 'fok_3', text: 'Zauważam w trakcie startu szczegóły, których inni nie widzą.', competence: 'Fokus', reversed: false, category: 'body' },
    { id: 'fok_4', text: 'Kiedy jestem bardzo zmęczony/a, zaczynam popełniać błędy z nieuwagi.', competence: 'Fokus', reversed: true, category: 'behavior' },
    { id: 'fok_5', text: 'Gdy wykonuję nudne lub powtarzalne ćwiczenie, robię je z taką samą dokładnością jak te ciekawe.', competence: 'Fokus', reversed: false, category: 'behavior' },
    { id: 'fok_6', text: 'Zdarza mi się "wyłączyć" i zamyślić, gdy trener długo tłumaczy taktykę.', competence: 'Fokus', reversed: true, category: 'thought' },

    // PEWNOŚĆ (6 pytań)
    { id: 'pew_1', text: 'Wchodzę w start z przekonaniem, że jestem dobrze przygotowany i dam radę.', competence: 'Pewność', reversed: false, keyIndicator: true, category: 'thought' },
    { id: 'pew_2', text: 'Przed meczem często martwię się, że zawiodę trenera, rodziców bądź drużynę.', competence: 'Pewność', reversed: true, category: 'thought' },
    { id: 'pew_3', text: 'Kiedy gram przeciwko teoretycznie lepszemu rywalowi, traktuję to jak wyzwanie, a nie zagrożenie.', competence: 'Pewność', reversed: false, category: 'thought' },
    { id: 'pew_4', text: 'Często porównuję się z innymi i czuję, że są ode mnie lepsi.', competence: 'Pewność', reversed: true, category: 'thought' },
    { id: 'pew_5', text: 'Ufam swoim umiejętnościom – wiem, co potrafię.', competence: 'Pewność', reversed: false, category: 'thought' },
    { id: 'pew_6', text: 'Kiedy mój przeciwnik jest lepszy od siebie, od razu zakładam, że przegram.', competence: 'Pewność', reversed: true, category: 'thought' },

    // DETERMINACJA (6 pytań)
    { id: 'det_1', text: 'Kiedy ćwiczenie zaczyna boleć (pieką mięśnie), cisnę dalej.', competence: 'Determinacja', reversed: false, keyIndicator: true, category: 'behavior' },
    { id: 'det_2', text: 'Gdy coś mi długo nie wychodzi, mam ochotę zmienić ćwiczenie lub odpuścić.', competence: 'Determinacja', reversed: true, category: 'behavior' },
    { id: 'det_3', text: 'Na treningu pracuję tak samo mocno, gdy trener patrzy, i tak samo, gdy nie patrzy.', competence: 'Determinacja', reversed: false, category: 'behavior' },
    { id: 'det_4', text: 'Nie potrafię określić, dlaczego biorę udział w treningach', competence: 'Determinacja', reversed: true, category: 'thought' },
    { id: 'det_5', text: 'Lubię ciężkie treningi, bo wiem, że dzięki nim staję się lepszy/a.', competence: 'Determinacja', reversed: false, category: 'thought' },
    { id: 'det_6', text: 'Czasami odpuszczam w końcówce, jeśli wiem, że i tak nie wygram.', competence: 'Determinacja', reversed: true, category: 'behavior' },
  ]
};

// Six Sigma Lite (12 pytań - 2 na kompetencję)
export const sixSigmaLite: QuestionnaireDefinition = {
  id: 'six_sigma_lite',
  name: 'Six Sigma Lite',
  fullName: 'Six Sigma Lite - Szybka Sonda',
  description: 'Szybka ocena 6 kompetencji - do użycia po każdym Sprincie',
  duration: '3-4 min',
  scaleType: 5,
  scaleLabels: {
    min: 'Wcale się nie zgadzam',
    max: 'Całkowicie się zgadzam'
  },
  questions: [
    // AKTYWACJA (2 pytania - KI + Walidator)
    { id: 'akt_1', text: 'Kiedy wychodzę na trening, czuję w ciele energię i gotowość.', competence: 'Aktywacja', reversed: false, keyIndicator: true, category: 'body' },
    { id: 'akt_2', text: 'Przed ważnym startem mam nogi jak z waty i czuję się słaby/a.', competence: 'Aktywacja', reversed: true, category: 'body' },

    // KONTROLA (2 pytania)
    { id: 'kon_3', text: 'W kluczowych momentach w czasie zawodów moja głowa pozostaje chłodna.', competence: 'Kontrola', reversed: false, keyIndicator: true, category: 'thought' },
    { id: 'kon_2', text: 'Gdy coś mi nie wychodzi, macham rękami, krzyczę lub płaczę.', competence: 'Kontrola', reversed: true, category: 'behavior' },

    // RESET (2 pytania)
    { id: 'res_1', text: 'Po błędzie moją pierwszą reakcją jest: "Walczę dalej".', competence: 'Reset', reversed: false, keyIndicator: true, category: 'behavior' },
    { id: 'res_2', text: 'Kiedy zepsuję prostą akcję, myślę o tym przez kolejne minuty.', competence: 'Reset', reversed: true, category: 'thought' },

    // FOKUS (2 pytania)
    { id: 'fok_1', text: 'Podczas gry słyszę tylko trenera, a nie hałas dookoła.', competence: 'Fokus', reversed: false, keyIndicator: true, category: 'behavior' },
    { id: 'fok_2', text: 'W czasie meczu zdarza mi się patrzeć na rodziców/kibiców.', competence: 'Fokus', reversed: true, category: 'behavior' },

    // PEWNOŚĆ (2 pytania)
    { id: 'pew_5', text: 'Ufam swoim umiejętnościom – wiem, co potrafię.', competence: 'Pewność', reversed: false, keyIndicator: true, category: 'thought' },
    { id: 'pew_6', text: 'Kiedy gram z kimś lepszym, od razu zakładam, że przegram.', competence: 'Pewność', reversed: true, category: 'thought' },

    // DETERMINACJA (2 pytania)
    { id: 'det_1', text: 'Kiedy ćwiczenie zaczyna boleć, cisnę dalej.', competence: 'Determinacja', reversed: false, keyIndicator: true, category: 'behavior' },
    { id: 'det_6', text: 'Czasami odpuszczam w końcówce, jeśli wiem, że nie wygram.', competence: 'Determinacja', reversed: true, category: 'behavior' },
  ]
};

// Six Sigma Mood (6 pytań kontekstowych/korygujących)
export const sixSigmaMood: QuestionnaireDefinition = {
  id: 'six_sigma_mood',
  name: 'Six Sigma Mood',
  fullName: 'Six Sigma Mood - Kontekst i Stan',
  description: 'Pytania o stan zawodnika - modyfikatory wyniku',
  duration: '1-2 min',
  scaleType: 5,
  scaleLabels: {
    min: 'Wcale',
    max: 'Bardzo'
  },
  questions: [
    { id: 'mood_sen', text: 'W ostatnim tygodniu budziłem się wypoczęty i pełny energii.', competence: 'Sen', reversed: false, category: 'body' },
    { id: 'mood_stres', text: 'Obecnie mam "luz" w szkole i w domu, nic mnie mocno nie martwi.', competence: 'Stres', reversed: false, category: 'thought' },
    { id: 'mood_zdrowie', text: 'Nic mnie nie boli, nie mam żadnych drobnych urazów, które przeszkadzają w grze.', competence: 'Zdrowie', reversed: false, category: 'body' },
    { id: 'mood_atmosfera', text: 'Czuję się lubiany i akceptowany w mojej drużynie.', competence: 'Atmosfera', reversed: false, category: 'thought' },
    { id: 'mood_dieta', text: 'Dbam o to, co jem i piję przed treningiem, żeby mieć siłę.', competence: 'Dieta', reversed: false, category: 'behavior' },
    { id: 'mood_flow', text: 'Sport sprawia mi teraz dużą frajdę, cieszę się na każdy trening.', competence: 'Flow', reversed: false, category: 'thought' },
  ]
};

export const allSixSigmaQuestionnaires = [
  sixSigmaFull,
  sixSigmaLite,
  sixSigmaMood
];
