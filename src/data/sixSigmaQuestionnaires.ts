// Six Sigma Questionnaires Data Structure
// Based on scientific literature: ACSI-28, SAS-2, MTQ48, Grit Scale

export interface SixSigmaQuestion {
  id: string;
  text: string;
  type: 'direct' | 'reverse'; // [+] or [R]
  domain: 'thoughts' | 'body' | 'behavior'; // Triangulation
  isKeyIndicator?: boolean; // Key Indicator gets x1.5-2.0 weight
  weight?: number; // Custom weight (default: 1.0, KI: 1.5-2.0)
}

export interface SixSigmaCompetency {
  id: string;
  name: string;
  description: string;
  questions: SixSigmaQuestion[];
}

export interface SixSigmaModifier {
  id: string;
  name: string;
  description: string;
  question: string;
  impactArea: string[]; // Which competencies it affects
}

export interface SixSigmaQuestionnaire {
  id: string;
  name: string;
  shortName: string;
  description: string;
  usage: string;
  frequency: string;
  estimatedTime: string;
  scale: 5 | 7;
  scaleLabels: {
    min: string;
    max: string;
  };
  competencies: SixSigmaCompetency[];
  modifiers?: SixSigmaModifier[];
}

// COMPETENCY DEFINITIONS

const activationQuestions: SixSigmaQuestion[] = [
  {
    id: 'act_1',
    text: 'Kiedy wychodzę na trening, czuję w ciele energię i gotowość.',
    type: 'direct',
    domain: 'body',
    isKeyIndicator: true,
    weight: 1.5
  },
  {
    id: 'act_2',
    text: 'Przed ważnym startem mam nogi jak z waty i czuję się słaby/a.',
    type: 'reverse',
    domain: 'body',
    weight: 1.0
  },
  {
    id: 'act_3',
    text: 'Umiem uspokoić oddech, gdy czuję, że serce bije mi za szybko przed startem.',
    type: 'direct',
    domain: 'behavior',
    weight: 1.0
  },
  {
    id: 'act_4',
    text: 'Często na rozgrzewce ziewam i czuję się śpiący/a.',
    type: 'reverse',
    domain: 'body',
    weight: 1.0
  },
  {
    id: 'act_5',
    text: 'Czuję "motyle w brzuchu" przed meczem, ale to przyjemne uczucie gotowości, a nie strach.',
    type: 'direct',
    domain: 'thoughts',
    weight: 1.0
  },
  {
    id: 'act_6',
    text: 'Wieczorem po ciężkim treningu potrafię się wyciszyć i szybko zasnąć.',
    type: 'direct',
    domain: 'behavior',
    weight: 1.0
  }
];

const controlQuestions: SixSigmaQuestion[] = [
  {
    id: 'con_1',
    text: 'Kiedy sędzia podejmie złą decyzję, potrafię zachować spokój i nie dyskutować.',
    type: 'direct',
    domain: 'behavior',
    isKeyIndicator: true,
    weight: 1.5
  },
  {
    id: 'con_2',
    text: 'Gdy coś mi nie wychodzi, macham rękami, krzyczę lub płaczę.',
    type: 'reverse',
    domain: 'behavior',
    weight: 1.0
  },
  {
    id: 'con_3',
    text: 'W kluczowych momentach w czasie zawodów moja głowa pozostaje chłodna.',
    type: 'direct',
    domain: 'thoughts',
    weight: 1.0
  },
  {
    id: 'con_4',
    text: 'Kiedy się wścieknę, gram agresywniej i częściej fauluję/psuję.',
    type: 'reverse',
    domain: 'behavior',
    weight: 1.0
  },
  {
    id: 'con_5',
    text: 'Potrafię oddzielić to, co dzieje się w szkole/domu, od tego, co robię na treningu.',
    type: 'direct',
    domain: 'thoughts',
    weight: 1.0
  },
  {
    id: 'con_6',
    text: 'Gdy przeciwnik mnie prowokuje, łatwo daję się wyprowadzić z równowagi.',
    type: 'reverse',
    domain: 'behavior',
    weight: 1.0
  }
];

const resetQuestions: SixSigmaQuestion[] = [
  {
    id: 'res_1',
    text: 'Po błędzie moją pierwszą reakcją jest: "naprawiam/walczę dalej".',
    type: 'direct',
    domain: 'behavior',
    isKeyIndicator: true,
    weight: 1.5
  },
  {
    id: 'res_2',
    text: 'Kiedy zepsuję proste zagranie, myślę o tym przez kolejne kilka minut.',
    type: 'reverse',
    domain: 'thoughts',
    weight: 1.0
  },
  {
    id: 'res_3',
    text: 'Błąd traktuję jak informację ("co poprawić"), a nie jak dowód, że jestem słaby/a.',
    type: 'direct',
    domain: 'thoughts',
    weight: 1.0
  },
  {
    id: 'res_4',
    text: 'Po nieudanej akcji boję się zaryzykować ponownie, żeby znowu nie zepsuć.',
    type: 'reverse',
    domain: 'thoughts',
    weight: 1.0
  },
  {
    id: 'res_5',
    text: 'Po błędzie potrafię się "zrestartować" i wrócić do skupienia w kilka sekund.',
    type: 'direct',
    domain: 'behavior',
    weight: 1.0
  },
  {
    id: 'res_6',
    text: 'Po nieudanym starcie jestem smutny/a lub zły/a przez resztę dnia.',
    type: 'reverse',
    domain: 'body',
    weight: 1.0
  }
];

const focusQuestions: SixSigmaQuestion[] = [
  {
    id: 'foc_1',
    text: 'Podczas gry słyszę tylko trenera (i zespół), a nie hałas dookoła.',
    type: 'direct',
    domain: 'behavior',
    isKeyIndicator: true,
    weight: 1.5
  },
  {
    id: 'foc_2',
    text: 'W czasie zawodów zdarza mi się patrzeć na rodziców lub kibiców na trybunach.',
    type: 'reverse',
    domain: 'behavior',
    weight: 1.0
  },
  {
    id: 'foc_3',
    text: 'Zauważam w trakcie startu szczegóły, których inni nie widzą.',
    type: 'direct',
    domain: 'thoughts',
    weight: 1.0
  },
  {
    id: 'foc_4',
    text: 'Kiedy jestem bardzo zmęczony/a, zaczynam popełniać błędy z nieuwagi.',
    type: 'reverse',
    domain: 'behavior',
    weight: 1.0
  },
  {
    id: 'foc_5',
    text: 'Gdy wykonuję nudne lub powtarzalne ćwiczenie, robię je z taką samą dokładnością jak te ciekawe.',
    type: 'direct',
    domain: 'behavior',
    weight: 1.0
  },
  {
    id: 'foc_6',
    text: 'Zdarza mi się "wyłączyć" i zamyślić, gdy trener długo tłumaczy taktykę.',
    type: 'reverse',
    domain: 'thoughts',
    weight: 1.0
  }
];

const confidenceQuestions: SixSigmaQuestion[] = [
  {
    id: 'conf_1',
    text: 'Wchodzę w start z przekonaniem, że jestem dobrze przygotowany/a i dam radę.',
    type: 'direct',
    domain: 'thoughts',
    isKeyIndicator: true,
    weight: 1.5
  },
  {
    id: 'conf_2',
    text: 'Przed meczem często martwię się, że zawiodę trenera, rodziców lub drużynę.',
    type: 'reverse',
    domain: 'thoughts',
    weight: 1.0
  },
  {
    id: 'conf_3',
    text: 'Kiedy gram przeciwko teoretycznie lepszemu rywalowi, traktuję to jak wyzwanie, a nie zagrożenie.',
    type: 'direct',
    domain: 'thoughts',
    weight: 1.0
  },
  {
    id: 'conf_4',
    text: 'Często porównuję się z innymi i czuję, że są ode mnie lepsi.',
    type: 'reverse',
    domain: 'thoughts',
    weight: 1.0
  },
  {
    id: 'conf_5',
    text: 'Ufam swoim umiejętnościom – wiem, co potrafię.',
    type: 'direct',
    domain: 'thoughts',
    weight: 1.0
  },
  {
    id: 'conf_6',
    text: 'Kiedy mój przeciwnik jest lepszy ode mnie, od razu zakładam, że przegram.',
    type: 'reverse',
    domain: 'thoughts',
    weight: 1.0
  }
];

const determinationQuestions: SixSigmaQuestion[] = [
  {
    id: 'det_1',
    text: 'Kiedy ćwiczenie zaczyna boleć (pieką mięśnie), cisnę dalej.',
    type: 'direct',
    domain: 'behavior',
    isKeyIndicator: true,
    weight: 1.5
  },
  {
    id: 'det_2',
    text: 'Gdy coś mi długo nie wychodzi, mam ochotę zmienić ćwiczenie lub odpuścić.',
    type: 'reverse',
    domain: 'thoughts',
    weight: 1.0
  },
  {
    id: 'det_3',
    text: 'Na treningu pracuję tak samo mocno, gdy trener patrzy, i tak samo, gdy nie patrzy.',
    type: 'direct',
    domain: 'behavior',
    weight: 1.0
  },
  {
    id: 'det_4',
    text: 'Nie potrafię określić, dlaczego biorę udział w treningach.',
    type: 'reverse',
    domain: 'thoughts',
    weight: 1.0
  },
  {
    id: 'det_5',
    text: 'Lubię ciężkie treningi, bo wiem, że dzięki nim staję się lepszy/a.',
    type: 'direct',
    domain: 'thoughts',
    weight: 1.0
  },
  {
    id: 'det_6',
    text: 'Czasami odpuszczam w końcówce, jeśli wiem, że i tak nie wygram.',
    type: 'reverse',
    domain: 'behavior',
    weight: 1.0
  }
];

// CONTEXTUAL MODIFIERS

const contextualModifiers: SixSigmaModifier[] = [
  {
    id: 'mod_sleep',
    name: 'Sen',
    description: 'Jakość regeneracji',
    question: 'W ostatnim tygodniu budziłem/łam się wypoczęty/a i pełny/a energii.',
    impactArea: ['activation']
  },
  {
    id: 'mod_stress',
    name: 'Stres pozasportowy',
    description: 'Obciążenie szkoła/dom',
    question: 'Obecnie mam "luz" w szkole i w domu, nic mnie mocno nie martwi.',
    impactArea: ['focus', 'control']
  },
  {
    id: 'mod_health',
    name: 'Zdrowie',
    description: 'Status ciała (urazy/ból)',
    question: 'Nic mnie nie boli, nie mam żadnych drobnych urazów, które przeszkadzają w grze.',
    impactArea: ['control', 'confidence']
  },
  {
    id: 'mod_social',
    name: 'Atmosfera',
    description: 'Wsparcie społeczne',
    question: 'Czuję się lubiany/a i akceptowany/a w mojej drużynie.',
    impactArea: ['confidence']
  },
  {
    id: 'mod_nutrition',
    name: 'Dieta',
    description: 'Nawyki żywieniowe',
    question: 'Dbam o to, co jem i piję przed treningiem, żeby mieć siłę.',
    impactArea: ['activation', 'determination']
  },
  {
    id: 'mod_flow',
    name: 'Flow',
    description: 'Satysfakcja/wypalenie',
    question: 'Sport sprawia mi teraz dużą frajdę, cieszę się na każdy trening.',
    impactArea: ['all'] // General burnout indicator
  }
];

// QUESTIONNAIRE DEFINITIONS

export const sixSigmaFull: SixSigmaQuestionnaire = {
  id: 'six_sigma_full',
  name: 'Six Sigma',
  shortName: 'Pełna Bateria',
  description: 'Cześć! To nie jest klasówka i nikt Cię tu nie ocenia. To narzędzie, które tworzy mapę Twojego sportowego mózgu.\n\nOdpowiadaj tak, jak faktycznie czujesz, a nie tak, jak "wypada". Jeśli zaznaczysz prawdę, dowiemy się, co podkręcić, żebyś wygrywał. Jeśli skłamiesz, oszukasz tylko własny trening.\n\nTo zajmie około 5 minut. Gotowy sprawdzić swoje parametry?',
  usage: '',
  frequency: 'T0 (początek sezonu) + T-Final (koniec sezonu)',
  estimatedTime: '5 minut',
  scale: 5,
  scaleLabels: {
    min: 'To zupełnie nie o mnie',
    max: 'To o mnie'
  },
  competencies: [
    {
      id: 'activation',
      name: 'Aktywacja',
      description: 'Umiejętność regulacji energii i pobudzenia',
      questions: activationQuestions
    },
    {
      id: 'control',
      name: 'Kontrola',
      description: 'Stabilność emocjonalna w stresie',
      questions: controlQuestions
    },
    {
      id: 'reset',
      name: 'Reset',
      description: 'Zdolność powrotu do formy po błędzie',
      questions: resetQuestions
    },
    {
      id: 'focus',
      name: 'Fokus',
      description: 'Utrzymanie uwagi i odporność na rozpraszacze',
      questions: focusQuestions
    },
    {
      id: 'confidence',
      name: 'Pewność',
      description: 'Wiara w swoje umiejętności',
      questions: confidenceQuestions
    },
    {
      id: 'determination',
      name: 'Determinacja',
      description: 'Wytrwałość i grit',
      questions: determinationQuestions
    }
  ]
  // No modifiers in Full - they're in Mood
};

export const sixSigmaLite: SixSigmaQuestionnaire = {
  id: 'six_sigma_lite',
  name: 'Six Sigma Lite',
  shortName: 'Szybka Sonda',
  description: 'Czas na przegląd formy mentalnej po tym Sprincie. 12 pytań o to, jak Ci się trenowało w tym miesiącu.',
  usage: 'Nie analizuj za długo – pierwsza myśl jest zazwyczaj najlepsza!',
  frequency: 'Co 4 tygodnie (po każdym Sprincie)',
  estimatedTime: '90 sekund',
  scale: 5,
  scaleLabels: {
    min: 'To zupełnie nie o mnie',
    max: 'To o mnie'
  },
  competencies: [
    {
      id: 'activation',
      name: 'Aktywacja',
      description: 'Umiejętność regulacji energii i pobudzenia',
      questions: [activationQuestions[0], activationQuestions[1]] // KI + Reverse
    },
    {
      id: 'control',
      name: 'Kontrola',
      description: 'Stabilność emocjonalna w stresie',
      questions: [controlQuestions[0], controlQuestions[1]]
    },
    {
      id: 'reset',
      name: 'Reset',
      description: 'Zdolność powrotu do formy po błędzie',
      questions: [resetQuestions[0], resetQuestions[1]]
    },
    {
      id: 'focus',
      name: 'Fokus',
      description: 'Utrzymanie uwagi i odporność na rozpraszacze',
      questions: [focusQuestions[0], focusQuestions[1]]
    },
    {
      id: 'confidence',
      name: 'Pewność',
      description: 'Wiara w swoje umiejętności',
      questions: [confidenceQuestions[0], confidenceQuestions[1]]
    },
    {
      id: 'determination',
      name: 'Determinacja',
      description: 'Wytrwałość i grit',
      questions: [determinationQuestions[0], determinationQuestions[1]]
    }
  ]
  // No modifiers in Lite - they're in Mood
};

export const sixSigmaMood: SixSigmaQuestionnaire = {
  id: 'six_sigma_mood',
  name: 'Six Sigma Mood',
  shortName: 'Kontekst',
  description: 'Daj nam znać, jak wyglądał ostatni tydzień, a będziesz widział, jak Twoja dyspozycja i wyniki w wyzwaniach zależą także od tego, jak śpisz, co jesz i czy masz spokój w szkole.',
  usage: 'Odpowiadaj szczerze – to pomaga zrozumieć Twoje wyniki.',
  frequency: 'Przy każdym pomiarze',
  estimatedTime: '1 minuta',
  scale: 5,
  scaleLabels: {
    min: 'To zupełnie nie o mnie',
    max: 'To o mnie'
  },
  competencies: [], // Mood has no competencies, only modifiers
  modifiers: contextualModifiers
};

// EXPORT ALL QUESTIONNAIRES
export const allSixSigmaQuestionnaires = {
  full: sixSigmaFull,
  lite: sixSigmaLite,
  mood: sixSigmaMood
};
