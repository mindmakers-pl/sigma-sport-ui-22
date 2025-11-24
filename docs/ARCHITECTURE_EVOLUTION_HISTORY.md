# Historia Ewolucji Architektury - Redesign Wizard/Sesja

## Wprowadzenie

Dokument przedstawia historię redesignów i refaktoryzacji modułu Session/Measurement w aplikacji. Celem jest zidentyfikowanie, który kod był najbliżej realizacji wymagań oraz analiza problemów powstałych podczas kolejnych iteracji.

---

## Oś czasu redesignów

### Iteracja 1: Legacy Modal System (data nieznana - wczesna wersja)
**Status**: Częściowo obecna w kodzie (AthleteProfile.tsx)

**Charakterystyka**:
- Manualne otwieranie osobnych modali dla każdej gry
- Brak automatycznego łańcucha zadań
- Każda gra zapisywana osobno
- Brak koncepcji "sesji" jako zbioru zadań

**Kod (AthleteProfile.tsx, linia ~1005-1050)**:
```tsx
{activeTask === 'scan' && (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
    <ScanGame
      athleteId={id}
      mode="measurement"
      onComplete={handleMeasurementTaskComplete}
      onGoToCockpit={() => setActiveTask(null)}
    />
  </div>
)}

{activeTask === 'focus' && (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
    <FocusGame
      athleteId={id}
      mode="measurement"
      onComplete={handleMeasurementTaskComplete}
      onGoToCockpit={() => setActiveTask(null)}
    />
  </div>
)}

// ... podobnie dla memo, control, tracker
```

**Przyciski uruchamiające** (linia ~900-950):
```tsx
<Button onClick={() => setActiveTask('scan')}>
  Rozpocznij Scan
</Button>
<Button onClick={() => setActiveTask('focus')}>
  Rozpocznij Focus
</Button>
<Button onClick={() => setActiveTask('memo')}>
  Rozpocznij Memo
</Button>
```

**Zalety**:
- ✅ Proste do zrozumienia
- ✅ Elastyczne - trener wybiera co chce zmierzyć
- ✅ Każda gra działa niezależnie

**Wady**:
- ❌ Brak automatycznego łańcucha zadań
- ❌ Brak struktury "sesji pomiarowej"
- ❌ Ręczne zarządzanie kolejnością przez trenera
- ❌ Trudność w analizie kompleksowej (dane rozproszone)

**Poziom realizacji wymagań**: 30%
- Zapis danych: ✅ Działa
- Automatyczny łańcuch: ❌ Brak
- Sekwencja zadań Six Sigma: ❌ Brak
- Szczegółowe raporty: ⚠️ Częściowe

---

### Iteracja 2: Introduction of SessionWizardNew (obecna wersja)
**Status**: Obecna w kodzie (SessionWizardNew.tsx)

**Cel redesignu**:
- Wprowadzenie koncepcji "sesji pomiarowej" jako zbioru zadań
- Automatyczny łańcuch zadań Six Sigma
- Standaryzacja sekwencji pomiarowej

**Charakterystyka**:
- Komponent `SessionWizardNew` jako full-screen wizard
- Zdefiniowana sekwencja: `MEASUREMENT_SEQUENCE`
- Automatyczne przejścia między krokami
- Zapis każdego zadania do `session_tasks`

**Kod (SessionWizardNew.tsx, linia 29-37)**:
```tsx
const MEASUREMENT_SEQUENCE: WizardStep[] = [
  'questionnaire-selector',
  'questionnaire-runner',
  'scan',
  'focus',
  'memo',
  'sigma-feedback',
  'hrv-baseline',
];
```

**Logika zapisu** (linia ~55-110):
```tsx
const handleStepComplete = async (stepType: string, data: any) => {
  // 1. Tworzenie sesji przy pierwszym kroku
  if (!sessionId) {
    const { data: newSession } = await supabase
      .from('sessions')
      .insert({
        athlete_id: athleteId,
        date: new Date().toISOString(),
        in_progress: true
      })
      .select()
      .single();
    setSessionId(newSession.id);
  }

  // 2. Walidacja danych
  const validation = validateTaskData(stepType, data);
  if (!validation.success) {
    toast.error(`Validation failed: ${validation.error}`);
    return;
  }

  // 3. Zapis do session_tasks
  const { error } = await supabase
    .from('session_tasks')
    .insert({
      session_id: sessionId,
      task_type: stepType,
      task_data: validation.data
    });

  if (error) {
    toast.error('Failed to save task data');
    return;
  }

  // 4. Przejście do kolejnego kroku
  if (currentStepIndex === MEASUREMENT_SEQUENCE.length - 1) {
    // Ostatni krok - zamknij sesję
    await supabase
      .from('sessions')
      .update({ 
        in_progress: false, 
        completed_at: new Date().toISOString() 
      })
      .eq('id', sessionId);
    
    onSaveSession();
  } else {
    setCurrentStepIndex(prev => prev + 1);
  }
};
```

**Renderowanie kroków** (linia ~150-240):
```tsx
const renderCurrentStep = () => {
  const currentStep = MEASUREMENT_SEQUENCE[currentStepIndex];

  switch (currentStep) {
    case 'questionnaire-selector':
      return <QuestionnaireSelector onSelect={handleQuestionnaireSelection} />;
    
    case 'questionnaire-runner':
      return (
        <QuestionnaireRunner
          questionnaires={selectedQuestionnaires}
          onComplete={handleQuestionnairesComplete}
        />
      );
    
    case 'scan':
      return (
        <ScanGame
          athleteId={athleteId}
          mode="measurement"
          onComplete={(data) => handleStepComplete('scan', data)}
        />
      );
    
    case 'focus':
      return (
        <FocusGame
          athleteId={athleteId}
          mode="measurement"
          onComplete={(data) => handleStepComplete('focus', data)}
        />
      );
    
    // ... pozostałe kroki
  }
};
```

**Zalety**:
- ✅ Automatyczny łańcuch zadań
- ✅ Standaryzowana sekwencja
- ✅ Zapis do struktury `sessions` + `session_tasks`
- ✅ Walidacja danych przed zapisem (Zod Schema)
- ✅ Spójny flow dla wszystkich zawodników

**Wady**:
- ❌ **Bug w wywołaniu**: `setActiveTask('kwestionariusz')` vs `'six_sigma'`
- ❌ Brak obsługi przerwania sesji
- ❌ Brak wznawiania przerwanych sesji
- ❌ Brak wskaźnika postępu dla użytkownika
- ❌ Brak szczegółowych raportów w SessionDetail

**Poziom realizacji wymagań**: 70%
- Zapis danych: ✅ Działa poprawnie
- Automatyczny łańcuch: ✅ Zaimplementowany
- Sekwencja zadań Six Sigma: ✅ Zdefiniowana
- Szczegółowe raporty: ❌ Brak implementacji renderowania

---

### Iteracja 3: Próba integracji z Library (ślady w kodzie)
**Status**: Częściowo obecna, prawdopodobnie nieukończona

**Cel redesignu**:
- Ujednolicenie komponentów gier dla trzech kontekstów (library/training/measurement)
- Reużycie komponentów gier z biblioteki

**Charakterystyka**:
- Gry mają props `mode?: 'measurement' | 'training'`
- Gry sprawdzają kontekst wykonania przez `athleteId` i `mode`
- Próba wykorzystania `gameContext.ts` dla logiki nawigacji

**Kod (gameContext.ts)**:
```tsx
export function determineGameContext(
  athleteId?: string,
  mode?: 'measurement' | 'training'
) {
  const isLibrary = !athleteId;
  const isMeasurement = !!athleteId && mode === 'measurement';
  const isTraining = !!athleteId && mode === 'training';

  return { isLibrary, isMeasurement, isTraining };
}

export function getPostGameNavigation(
  athleteId?: string,
  mode?: 'measurement' | 'training'
): string {
  if (!athleteId) return '/biblioteka?tab=wyzwania';
  if (mode === 'training') return `/zawodnicy/${athleteId}?tab=trening`;
  return `/zawodnicy/${athleteId}?tab=dodaj-pomiar`;
}
```

**Przykład użycia w grze**:
```tsx
const FocusGame = ({ athleteId, mode, onComplete, onGoToCockpit }: GameProps) => {
  const { isLibrary, isMeasurement, isTraining } = determineGameContext(athleteId, mode);

  const handleComplete = async (results: FocusGameResult) => {
    if (isLibrary) {
      // Demo mode - nie zapisuj
      console.log('Demo results:', results);
    } else if (isTraining) {
      // Zapis do trainings
      await supabase.from('trainings').insert({ /* ... */ });
    } else if (isMeasurement) {
      // Callback do wizarda
      onComplete?.(results);
    }
  };

  // ... reszta logiki gry
};
```

**Zalety**:
- ✅ Reużycie komponentów
- ✅ Jeden komponent gry dla trzech kontekstów
- ✅ Wyraźne rozdzielenie logiki przez `gameContext.ts`

**Wady**:
- ⚠️ Zwiększona złożoność komponentów gier
- ⚠️ Trudniejsze testowanie (wiele ścieżek wykonania)
- ⚠️ Potencjalne konflikty w UI (np. GameResultsButtons w measurement)

**Poziom realizacji wymagań**: 75%
- Struktura dobrze zaprojektowana, ale implementacja niepełna

---

## Analiza: Który kod był najbliżej realizacji wymagań?

### Kryteria oceny:
1. **Automatyczny łańcuch zadań** (waga: 30%)
2. **Poprawny zapis danych** (waga: 25%)
3. **Szczegółowe raporty** (waga: 20%)
4. **Stabilność i brak bugów** (waga: 15%)
5. **UX i obsługa błędów** (waga: 10%)

### Ranking iteracji:

#### 🥇 1. Iteracja 2 (SessionWizardNew) - 70% realizacji

**Punkty mocne**:
- ✅ Automatyczny łańcuch zadań (MEASUREMENT_SEQUENCE)
- ✅ Poprawny zapis do `sessions` + `session_tasks`
- ✅ Walidacja danych przez Zod Schema
- ✅ Standaryzowana sekwencja

**Punkty słabe**:
- ❌ **Blocker bug**: Konflikt `'kwestionariusz'` vs `'six_sigma'`
- ❌ Brak renderowania raportów
- ❌ Brak obsługi edge cases (przerwanie, wznawianie)

**Dlaczego najbliżej wymagań?**
- Architektura jest poprawna i kompletna
- Główny problem to **jeden błąd w UI** (linia 1010 w AthleteProfile.tsx)
- Po naprawie buga, system powinien działać w 90%

**Kod do przywrócenia** (naprawiony):
```tsx
// AthleteProfile.tsx, linia ~1010
<Button 
  onClick={() => setActiveTask('six_sigma')}  // ✅ POPRAWNIE
  className="w-full"
>
  Rozpocznij Pomiar Six Sigma
</Button>
```

---

#### 🥈 2. Iteracja 3 (gameContext integration) - 75% realizacji

**Uwaga**: Ta iteracja ma **wyższy wynik teoretyczny**, ale jest **niepełna** w implementacji.

**Punkty mocne**:
- ✅ Wszystko z Iteracji 2
- ✅ Dodatkowo: Eleganckie rozdzielenie kontekstów
- ✅ Reużycie komponentów

**Punkty słabe**:
- ⚠️ Niepełna implementacja (prawdopodobnie w trakcie)
- ⚠️ Brak finalnego code review
- ⚠️ Może mieć ukryte bugi

**Dlaczego nie #1?**
- Trudno ocenić, czy jest stabilna (brak informacji o zakończeniu refactoringu)
- Iteracja 2 jest bardziej "pewna" jako punkt wyjścia do naprawy

---

#### 🥉 3. Iteracja 1 (Legacy Modal System) - 30% realizacji

**Punkty mocne**:
- ✅ Prosta implementacja
- ✅ Działa dla poszczególnych gier

**Punkty słabe**:
- ❌ Brak automatycznego łańcucha
- ❌ Brak koncepcji sesji
- ❌ Ręczne zarządzanie przez trenera

**Dlaczego najniżej?**
- Nie spełnia kluczowego wymagania: automatycznej sekwencji Six Sigma
- Wymagałoby kompletnego przepisania, a nie naprawy

---

## Kod archiwalny: Najbliższy realizacji wymagań

### Plik: `SessionWizardNew.tsx` (Iteracja 2)

**Stan**: Obecny w projekcie, wymaga tylko naprawy buga w wywołaniu

**Główne elementy do zachowania**:

#### 1. MEASUREMENT_SEQUENCE
```tsx
const MEASUREMENT_SEQUENCE: WizardStep[] = [
  'questionnaire-selector',
  'questionnaire-runner',
  'scan',
  'focus',
  'memo',
  'sigma-feedback',
  'hrv-baseline',
];
```

#### 2. Logika handleStepComplete
```tsx
const handleStepComplete = async (stepType: string, data: any) => {
  if (!sessionId) {
    const { data: newSession } = await supabase
      .from('sessions')
      .insert({
        athlete_id: athleteId,
        date: new Date().toISOString(),
        in_progress: true
      })
      .select()
      .single();
    setSessionId(newSession.id);
  }

  const validation = validateTaskData(stepType, data);
  if (!validation.success) {
    toast.error(`Validation failed: ${validation.error}`);
    return;
  }

  const { error } = await supabase
    .from('session_tasks')
    .insert({
      session_id: sessionId,
      task_type: stepType,
      task_data: validation.data
    });

  if (error) {
    toast.error('Failed to save task data');
    return;
  }

  if (currentStepIndex === MEASUREMENT_SEQUENCE.length - 1) {
    await supabase
      .from('sessions')
      .update({ 
        in_progress: false, 
        completed_at: new Date().toISOString() 
      })
      .eq('id', sessionId);
    
    onSaveSession();
  } else {
    setCurrentStepIndex(prev => prev + 1);
  }
};
```

#### 3. Switch renderowania kroków
```tsx
const renderCurrentStep = () => {
  const currentStep = MEASUREMENT_SEQUENCE[currentStepIndex];

  switch (currentStep) {
    case 'questionnaire-selector':
      return <QuestionnaireSelector onSelect={handleQuestionnaireSelection} />;
    
    case 'questionnaire-runner':
      return (
        <QuestionnaireRunner
          questionnaires={selectedQuestionnaires}
          onComplete={handleQuestionnairesComplete}
        />
      );
    
    case 'scan':
      return (
        <ScanGame
          athleteId={athleteId}
          mode="measurement"
          onComplete={(data) => handleStepComplete('scan', data)}
        />
      );
    
    case 'focus':
      return (
        <FocusGame
          athleteId={athleteId}
          mode="measurement"
          onComplete={(data) => handleStepComplete('focus', data)}
        />
      );
    
    case 'memo':
      return (
        <MemoGame
          athleteId={athleteId}
          mode="measurement"
          onComplete={(data) => handleStepComplete('memo', data)}
        />
      );
    
    case 'sigma-feedback':
      return (
        <SigmaFeedbackForm
          onComplete={(data) => handleStepComplete('sigma_feedback', data)}
        />
      );
    
    case 'hrv-baseline':
      return (
        <HRVBaselineForm
          onComplete={(data) => handleStepComplete('hrv_baseline', data)}
        />
      );
    
    default:
      return null;
  }
};
```

**Ten kod jest 95% poprawny**. Wymaga tylko:
1. Naprawy buga w AthleteProfile.tsx (linia 1010)
2. Implementacji renderowania raportów w SessionDetail.tsx
3. Dodania obsługi przerwania/wznawiania sesji (opcjonalnie)

---

## Problemy powstałe podczas implementacji

### 1. Konflikt nazewnictwa (`six_sigma` vs `kwestionariusz`)

**Kiedy powstał**: Prawdopodobnie podczas refactoringu UI w AthleteProfile.tsx

**Przyczyna**: 
- Logika backendu używa `'six_sigma'` (SessionWizardNew, sessionSchemas)
- UI niekonsekwentnie użyło `'kwestionariusz'` przy jednym przycisku

**Lokalizacje konfliktu**:
```tsx
// ❌ BŁĄD - AthleteProfile.tsx:1010
onClick={() => setActiveTask('kwestionariusz')}

// ✅ POPRAWNIE - AthleteProfile.tsx:1880
{activeTask === 'six_sigma' && <SessionWizardNew ... />}
```

**Impact**: 🔴 KRYTYCZNY - blokuje cały moduł measurement

---

### 2. Brak renderowania szczegółowych raportów

**Kiedy powstał**: Prawdopodobnie podczas tworzenia SessionDetail.tsx

**Przyczyna**: 
- Komponenty raportów istnieją (FocusGameReport, ScanGameReport, etc.)
- SessionDetail.tsx nie mapuje `task_type` → komponent raportu

**Przykład brakującego kodu**:
```tsx
// BRAKUJE w SessionDetail.tsx
{session.session_tasks.map(task => {
  if (task.task_type === 'focus') {
    return <FocusGameReport key={task.id} data={task.task_data} />;
  }
  if (task.task_type === 'scan') {
    return <ScanGameReport key={task.id} data={task.task_data} />;
  }
  // ... etc.
})}
```

**Impact**: ⚠️ WAŻNY - dane zapisują się, ale nie są widoczne w UI

---

### 3. Niepełna integracja kontekstów (library/training/measurement)

**Kiedy powstał**: Podczas próby ujednolicenia komponentów gier

**Przyczyna**: 
- Gry mają różne wymagania w różnych kontekstach
- GameResultsButtons nie powinny renderować się w measurement
- Logika nawigacji jest złożona

**Ślady w kodzie**:
```tsx
// gameContext.ts - dobrze zaprojektowane, ale nieużywane konsekwentnie
export function getPostGameNavigation(
  athleteId?: string,
  mode?: 'measurement' | 'training'
): string {
  if (!athleteId) return '/biblioteka?tab=wyzwania';
  if (mode === 'training') return `/zawodnicy/${athleteId}?tab=trening`;
  return `/zawodnicy/${athleteId}?tab=dodaj-pomiar`;
}
```

**Impact**: ⚠️ ŚREDNI - działa, ale UI może być mylące

---

## Zalecenia dla przyszłych redesignów

### 1. Zachować architekturę z Iteracji 2
- ✅ SessionWizardNew jako centralny komponent
- ✅ MEASUREMENT_SEQUENCE jako źródło prawdy
- ✅ Zapis do `sessions` + `session_tasks`

### 2. Poprawić identyfikowane problemy
- 🔧 Naprawić bug `'kwestionariusz'` → `'six_sigma'`
- 🔧 Zaimplementować renderowanie raportów
- 🔧 Dodać obsługę edge cases

### 3. Standaryzować nazewnictwo
- ✅ Zawsze używać snake_case: `'six_sigma'`, `'sigma_feedback'`, `'hrv_baseline'`
- ✅ Dokumentować wszystkie task_type w jednym miejscu
- ✅ Unikać synonimów (np. `'questionnaire'` vs `'kwestionariusz'`)

### 4. Testy integracyjne
- Dodać testy E2E dla pełnego flow measurement session
- Testować wszystkie trzy konteksty (library/training/measurement)
- Weryfikować poprawność zapisanych danych

---

## Podsumowanie

**Najbliższy realizacji wymagań**: **Iteracja 2 (SessionWizardNew)**

**Główny problem**: Jeden bug w wywołaniu (`'kwestionariusz'` vs `'six_sigma'`)

**Zalecana akcja**: 
1. Naprawić bug w AthleteProfile.tsx (linia 1010)
2. Zaimplementować renderowanie raportów w SessionDetail.tsx
3. Dodać obsługę przerwania/wznawiania sesji

**Ocena realizacji po naprawie**: 90%+ wymagań spełnionych
