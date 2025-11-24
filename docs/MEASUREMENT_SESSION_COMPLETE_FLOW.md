# Measurement Session - Kompletny Flow (Pożądane Działanie)

## Wprowadzenie

Dokument opisuje **idealny, kompletny flow** dla modułu Measurement Session, który służy do kompleksowej oceny stanu zawodnika poprzez sekwencję standaryzowanych zadań kognitywnych, kwestionariuszy i pomiarów fizjologicznych.

---

## 1. Wejście do Kokpitu Zawodnika

### Punkt wejścia
```
/zawodnicy/{athleteId}
```

### Widok początkowy
- Zakładki: **Pomiar** | Trening | Sesje | Profil
- Domyślnie aktywna zakładka: **Pomiar**
- Widoczny przycisk: **"Rozpocznij Pomiar Six Sigma"**

### Akcja użytkownika
```tsx
<Button onClick={() => setActiveTask('six_sigma')}>
  Rozpocznij Pomiar Six Sigma
</Button>
```

**UWAGA**: Tutaj jest obecny bug - obecnie ustawia się `setActiveTask('kwestionariusz')` zamiast `'six_sigma'`.

---

## 2. Otwarcie Session Wizard

### Renderowanie komponentu
```tsx
{activeTask === 'six_sigma' && (
  <SessionWizardNew
    athleteId={id}
    onClose={() => setActiveTask(null)}
    onSaveSession={() => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setActiveTask(null);
    }}
  />
)}
```

### UI Wizarda
- **Tryb wyświetlania**: Full-screen overlay lub modal
- **Nawigacja**: Brak możliwości powrotu bez anulowania
- **Wskaźnik postępu**: "Krok X/7" (opcjonalnie pasek postępu)
- **Przycisk anulowania**: "Anuluj pomiar" (czerwony, z potwierdzeniem)

---

## 3. Sekwencja Zadań (MEASUREMENT_SEQUENCE)

### Kolejność kroków

```tsx
const MEASUREMENT_SEQUENCE: WizardStep[] = [
  'questionnaire-selector',    // Krok 1: Wybór kwestionariuszy
  'questionnaire-runner',       // Krok 2: Wypełnienie kwestionariuszy
  'scan',                       // Krok 3: Gra Scan
  'focus',                      // Krok 4: Gra Focus
  'memo',                       // Krok 5: Gra Memo
  'sigma-feedback',             // Krok 6: Feedback subiektywny
  'hrv-baseline',               // Krok 7: Pomiar HRV
];
```

### Charakterystyka sekwencji
- **Automatyczny łańcuch**: Po zakończeniu kroku automatyczne przejście do następnego
- **Brak możliwości przeskoczenia**: Wszystkie kroki są obowiązkowe
- **Zapis po każdym kroku**: Wyniki zapisywane natychmiast do `session_tasks`
- **Odporność na błędy**: Jeśli krok się nie powiedzie, nie przechodzi dalej

---

## 4. Szczegółowy opis każdego kroku

### Krok 1: Questionnaire Selector

**Komponent**: `QuestionnaireSelector`

**Cel**: Wybór kwestionariuszy Six Sigma do wypełnienia

**UI**:
- Lista dostępnych kwestionariuszy (np. "Koncentracja", "Pamięć", "Kontrola")
- Checkboxy do wyboru
- Przycisk "Dalej" (aktywny tylko gdy wybrano ≥1 kwestionariusz)

**Kod**:
```tsx
<QuestionnaireSelector
  onSelect={(questionnaires) => {
    setSelectedQuestionnaires(questionnaires);
    setCurrentStepIndex(1); // Przejście do questionnaire-runner
  }}
/>
```

**Wyjście**:
```tsx
selectedQuestionnaires: string[] // np. ['concentration', 'memory']
```

**Zapis do bazy**: ❌ Nie (tylko przechowanie w state wizarda)

---

### Krok 2: Questionnaire Runner

**Komponent**: `QuestionnaireRunner`

**Cel**: Wypełnienie wybranych kwestionariuszy Six Sigma

**UI**:
- Iteracja przez wybrane kwestionariusze
- Dla każdego pytania: slider 1-5 lub przyciski wyboru
- Przycisk "Następne pytanie"
- Po ostatnim pytaniu: "Zakończ kwestionariusze"

**Kod**:
```tsx
<QuestionnaireRunner
  questionnaires={selectedQuestionnaires}
  onComplete={async (results) => {
    await handleStepComplete('six_sigma', results);
    // Automatyczne przejście do kroku 3 (scan)
  }}
/>
```

**Wyjście (przykład)**:
```json
{
  "validation": {
    "isValid": true,
    "straightLining": false,
    "reverseInconsistency": false,
    "speeding": false
  },
  "competencyScores": [
    {
      "id": "concentration",
      "name": "Koncentracja",
      "rawScore": 4.2,
      "normalizedScore": 0.84,
      "interpretation": "Powyżej średniej"
    },
    {
      "id": "memory",
      "name": "Pamięć",
      "rawScore": 3.8,
      "normalizedScore": 0.76,
      "interpretation": "Średni"
    }
  ],
  "modifierScores": [
    {
      "id": "stress",
      "name": "Stres",
      "rawScore": 2.1,
      "normalizedScore": 0.42,
      "impact": "negative"
    }
  ],
  "overallScore": 3.9,
  "responses": [
    { "questionId": "q1_concentration", "value": 4 },
    { "questionId": "q2_concentration", "value": 5 },
    // ... wszystkie odpowiedzi
  ]
}
```

**Zapis do bazy**: ✅ Tak

```sql
INSERT INTO session_tasks (session_id, task_type, task_data)
VALUES (
  'session-uuid',
  'six_sigma',
  '{ "validation": {...}, "competencyScores": [...], ... }'
);
```

---

### Krok 3: Scan Game

**Komponent**: `ScanGame`

**Cel**: Test uwagi wzrokowej i zdolności skanowania

**UI**:
- Siatka liczb od 1 do 100
- Zadanie: klikać liczby po kolei (1→2→3→...)
- Timer odlicza czas
- Pomiar HRV w tle (opcjonalnie)

**Kod**:
```tsx
<ScanGame
  athleteId={athleteId}
  mode="measurement"
  onComplete={async (results) => {
    await handleStepComplete('scan', results);
    // Automatyczne przejście do kroku 4 (focus)
  }}
/>
```

**Wyjście**:
```json
{
  "scan_max_number_reached": 45,
  "scan_duration_s": 120,
  "scan_correct_clicks": 43,
  "scan_error_clicks": 2,
  "scan_skipped_numbers": [23, 37],
  "scan_rmssd_ms": 45.2,
  "scan_avg_hr_bpm": 72,
  "scan_game_completed_at": "2025-11-24T12:10:00Z"
}
```

**Zapis do bazy**: ✅ Tak (`task_type: 'scan'`)

**Po zakończeniu**:
- Krótki ekran "Zapisano wyniki Scan" (1-2 sekundy)
- Automatyczne przejście do Focus Game

---

### Krok 4: Focus Game (Stroop Test)

**Komponent**: `FocusGame`

**Cel**: Test hamowania reakcji i kontroli uwagi

**UI**:
- Słowo koloru wyświetlane w określonym kolorze
- Zadanie: naciśnij klawisz odpowiadający KOLOROWI tekstu (nie znaczeniu słowa)
- 40 prób (20 congruent, 20 incongruent)

**Kod**:
```tsx
<FocusGame
  athleteId={athleteId}
  mode="measurement"
  onComplete={async (results) => {
    await handleStepComplete('focus', results);
    // Automatyczne przejście do kroku 5 (memo)
  }}
/>
```

**Wyjście**:
```json
{
  "focus_trials": [
    {
      "type": "CONGRUENT",
      "isCorrect": true,
      "rt": 456,
      "trialNumber": 1
    },
    {
      "type": "INCONGRUENT",
      "isCorrect": true,
      "rt": 589,
      "trialNumber": 2
    }
    // ... 40 prób
  ],
  "focus_median_congruent_ms": 450,
  "focus_median_incongruent_ms": 550,
  "focus_accuracy_pct": 95,
  "focus_total_trials": 40,
  "focus_correct_trials": 38,
  "focus_rmssd_ms": 42.1,
  "focus_avg_hr_bpm": 75,
  "focus_game_completed_at": "2025-11-24T12:15:00Z"
}
```

**Zapis do bazy**: ✅ Tak (`task_type: 'focus'`)

---

### Krok 5: Memo Game (N-back)

**Komponent**: `MemoGame`

**Cel**: Test pamięci roboczej

**UI**:
- Sekwencja pozycji na planszy 3×3
- Zadanie: naciśnij spację, gdy pozycja jest taka sama jak N kroków wcześniej
- Poziom trudności: 2-back

**Kod**:
```tsx
<MemoGame
  athleteId={athleteId}
  mode="measurement"
  onComplete={async (results) => {
    await handleStepComplete('memo', results);
    // Automatyczne przejście do kroku 6 (sigma-feedback)
  }}
/>
```

**Wyjście**:
```json
{
  "memo_accuracy_pct": 85,
  "memo_median_rt_ms": 520,
  "memo_total_trials": 30,
  "memo_correct_responses": 26,
  "memo_trials": [
    {
      "trial": 1,
      "rt": 512,
      "isCorrect": true,
      "isError": false
    }
    // ... 30 prób
  ],
  "memo_rmssd_ms": 48.3,
  "memo_hr_bpm": 78,
  "memo_game_completed_at": "2025-11-24T12:20:00Z"
}
```

**Zapis do bazy**: ✅ Tak (`task_type: 'memo'`)

---

### Krok 6: Sigma Feedback Form

**Komponent**: `SigmaFeedbackForm`

**Cel**: Subiektywna ocena stanu zawodnika

**UI**:
- Slidery 1-10 dla:
  - Zmęczenie (fatigue)
  - Stres (stress)
  - Jakość snu (sleep_quality)
- Input numeryczny: Godziny snu (sleep_hours)
- Slider 1-10: Nastrój (mood)
- Textarea: Notatki (opcjonalnie)

**Kod**:
```tsx
<SigmaFeedbackForm
  onComplete={async (feedback) => {
    await handleStepComplete('sigma_feedback', feedback);
    // Automatyczne przejście do kroku 7 (hrv-baseline)
  }}
/>
```

**Wyjście**:
```json
{
  "feedback_fatigue": 3,
  "feedback_stress": 5,
  "feedback_sleep_quality": 7,
  "feedback_sleep_hours": 7.5,
  "feedback_mood": 8,
  "feedback_notes": "Czuję się dobrze, gotowy do treningu",
  "feedback_timestamp": "2025-11-24T12:25:00Z"
}
```

**Zapis do bazy**: ✅ Tak (`task_type: 'sigma_feedback'`)

---

### Krok 7: HRV Baseline Measurement

**Komponent**: `HRVBaselineForm`

**Cel**: Pomiar podstawowego HRV w spoczynku

**UI**:
- Instrukcja: "Usiądź wygodnie, oddychaj normalnie"
- Timer: 60 sekund pomiaru
- Wyświetlanie HR w czasie rzeczywistym (opcjonalnie)
- Przycisk "Rozpocznij pomiar"

**Kod**:
```tsx
<HRVBaselineForm
  onComplete={async (hrvData) => {
    await handleStepComplete('hrv_baseline', hrvData);
    // To ostatni krok - zamknięcie wizarda
  }}
/>
```

**Wyjście**:
```json
{
  "hrv_baseline": 52.3,
  "hrv_timestamp": "2025-11-24T12:30:00Z",
  "hrv_measurement_duration_s": 60
}
```

**Zapis do bazy**: ✅ Tak (`task_type: 'hrv_baseline'`)

**Po zakończeniu**:
- Wiadomość: "Pomiar zakończony! Zapisano wszystkie wyniki."
- Przycisk "Wróć do Kokpitu"
- Ustawienie `in_progress: false` w tabeli `sessions`
- Ustawienie `completed_at: now()` w tabeli `sessions`

---

## 5. Logika Zapisu Danych

### 5.1. Tworzenie sesji (pierwszy krok)

**Moment**: Po wybraniu kwestionariuszy, przed rozpoczęciem wypełniania

**Kod**:
```tsx
const handleStepComplete = async (stepType: string, data: any) => {
  // Jeśli to pierwszy krok, utwórz sesję
  if (!sessionId) {
    const { data: newSession, error } = await supabase
      .from('sessions')
      .insert({
        athlete_id: athleteId,
        date: new Date().toISOString(),
        in_progress: true,
        conditions: null,
        results: {}
      })
      .select()
      .single();

    if (error) throw error;
    setSessionId(newSession.id);
  }

  // ... dalszy kod zapisu
};
```

**Utworzona sesja**:
```json
{
  "id": "session-uuid",
  "athlete_id": "athlete-uuid",
  "date": "2025-11-24T12:00:00Z",
  "in_progress": true,
  "completed_at": null,
  "conditions": null,
  "results": {},
  "created_at": "2025-11-24T12:00:00Z"
}
```

---

### 5.2. Zapis każdego zadania

**Moment**: Po zakończeniu każdego kroku (questionnaires, scan, focus, memo, feedback, hrv)

**Kod**:
```tsx
const handleStepComplete = async (stepType: string, data: any) => {
  // ... tworzenie sesji (jeśli potrzebne)

  // Walidacja danych przed zapisem
  const validation = validateTaskData(stepType, data);
  if (!validation.success) {
    toast.error(`Błąd walidacji: ${validation.error}`);
    return;
  }

  // Zapis do session_tasks
  const { error } = await supabase
    .from('session_tasks')
    .insert({
      session_id: sessionId,
      task_type: stepType,
      task_data: validation.data
    });

  if (error) {
    toast.error('Błąd zapisu danych');
    console.error(error);
    return;
  }

  toast.success(`Zapisano wyniki: ${stepType}`);

  // Przejście do kolejnego kroku
  setCurrentStepIndex(prev => prev + 1);
};
```

**Przykładowe rekordy w `session_tasks`**:
```json
[
  {
    "id": "uuid-1",
    "session_id": "session-uuid",
    "task_type": "six_sigma",
    "task_data": { /* wyniki kwestionariuszy */ },
    "created_at": "2025-11-24T12:05:00Z"
  },
  {
    "id": "uuid-2",
    "session_id": "session-uuid",
    "task_type": "scan",
    "task_data": { /* wyniki gry scan */ },
    "created_at": "2025-11-24T12:10:00Z"
  },
  {
    "id": "uuid-3",
    "session_id": "session-uuid",
    "task_type": "focus",
    "task_data": { /* wyniki gry focus */ },
    "created_at": "2025-11-24T12:15:00Z"
  }
  // ... pozostałe zadania
]
```

---

### 5.3. Zamknięcie sesji (ostatni krok)

**Moment**: Po zakończeniu HRV Baseline (ostatnie zadanie)

**Kod**:
```tsx
const handleStepComplete = async (stepType: string, data: any) => {
  // ... zapis task_data (jak wyżej)

  // Jeśli to ostatni krok, zamknij sesję
  if (currentStepIndex === MEASUREMENT_SEQUENCE.length - 1) {
    await supabase
      .from('sessions')
      .update({
        in_progress: false,
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    toast.success('Pomiar zakończony!');
    onSaveSession(); // Callback do AthleteProfile
  } else {
    // Przejście do kolejnego kroku
    setCurrentStepIndex(prev => prev + 1);
  }
};
```

**Zaktualizowana sesja**:
```json
{
  "id": "session-uuid",
  "athlete_id": "athlete-uuid",
  "date": "2025-11-24T12:00:00Z",
  "in_progress": false,
  "completed_at": "2025-11-24T12:30:00Z",
  "conditions": null,
  "results": {},
  "created_at": "2025-11-24T12:00:00Z"
}
```

---

## 6. Nawigacja i UX po zakończeniu

### 6.1. Zamknięcie wizarda

**Akcja**: Kliknięcie "Wróć do Kokpitu" lub automatyczne zamknięcie po ostatnim kroku

**Kod**:
```tsx
onSaveSession={() => {
  queryClient.invalidateQueries({ queryKey: ['sessions'] });
  setActiveTask(null);
}}
```

**Efekt**:
- Zamknięcie wizarda (unmount `SessionWizardNew`)
- Odświeżenie listy sesji w zakładce "Sesje"
- Powrót do widoku `/zawodnicy/{athleteId}?tab=dodaj-pomiar`

---

### 6.2. Wyświetlenie nowej sesji w tabeli

**Lokalizacja**: Zakładka "Sesje" w profilu zawodnika

**Tabela sesji**:
| Data | Status | Zadania | Akcje |
|------|--------|---------|-------|
| 2025-11-24 12:00 | ✅ Zakończona | 7 zadań | 👁️ Zobacz szczegóły |
| 2025-11-20 10:00 | ✅ Zakończona | 7 zadań | 👁️ Zobacz szczegóły |

**Kod**:
```tsx
<Button onClick={() => navigate(`/sesje/${session.id}`)}>
  Zobacz szczegóły
</Button>
```

---

### 6.3. Strona szczegółów sesji

**Route**: `/sesje/{sessionId}`

**Komponent**: `SessionDetail.tsx`

**Zawartość**:
1. **Nagłówek sesji**
   - Data i czas
   - Zawodnik
   - Status (zakończona/w trakcie)

2. **Lista zadań z wynikami**
   - Six Sigma: Wyniki kwestionariuszy z interpretacją
   - Scan: Raport z gry (ScanGameReport)
   - Focus: Raport z gry (FocusGameReport)
   - Memo: Raport z gry (MemoGameReport)
   - Sigma Feedback: Wykresy subiektywnych ocen
   - HRV Baseline: Wykres HRV

3. **Podsumowanie sesji**
   - Ogólny stan zawodnika
   - Zalecenia dla trenera
   - Przycisk "Eksportuj PDF"

**Kod (uproszczony)**:
```tsx
const SessionDetail = () => {
  const { sessionId } = useParams();
  const { data: session } = useQuery({
    queryKey: ['sessions', sessionId],
    queryFn: async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*, session_tasks(*)')
        .eq('id', sessionId)
        .single();
      return data;
    }
  });

  return (
    <div>
      <h1>Sesja pomiarowa - {format(session.date, 'dd.MM.yyyy HH:mm')}</h1>
      
      {session.session_tasks.map(task => (
        <div key={task.id}>
          {task.task_type === 'six_sigma' && (
            <SixSigmaReport data={task.task_data} />
          )}
          {task.task_type === 'scan' && (
            <ScanGameReport data={task.task_data} />
          )}
          {task.task_type === 'focus' && (
            <FocusGameReport data={task.task_data} />
          )}
          {task.task_type === 'memo' && (
            <MemoGameReport data={task.task_data} />
          )}
          {task.task_type === 'sigma_feedback' && (
            <FeedbackReport data={task.task_data} />
          )}
          {task.task_type === 'hrv_baseline' && (
            <HRVReport data={task.task_data} />
          )}
        </div>
      ))}
    </div>
  );
};
```

---

## 7. Obsługa błędów i edge cases

### 7.1. Przerwanie sesji w połowie

**Scenariusz**: Użytkownik zamyka wizard przed zakończeniem wszystkich kroków

**Pożądane zachowanie**:
1. Wyświetlenie dialogu potwierdzenia: "Czy na pewno chcesz anulować pomiar? Dotychczasowe dane zostaną zapisane."
2. Opcje:
   - "Kontynuuj pomiar" (zamknięcie dialogu)
   - "Anuluj pomiar" (zapisanie stanu i zamknięcie)

**Kod**:
```tsx
const handleClose = () => {
  if (currentStepIndex > 0 && currentStepIndex < MEASUREMENT_SEQUENCE.length - 1) {
    // Sesja w trakcie - pokaż dialog
    setShowCancelDialog(true);
  } else {
    // Sesja nie rozpoczęta lub zakończona - bezpośrednie zamknięcie
    onClose();
  }
};

const handleCancelConfirm = async () => {
  // Oznacz sesję jako przerwana
  await supabase
    .from('sessions')
    .update({
      in_progress: false,
      conditions: 'Przerwano przez użytkownika'
    })
    .eq('id', sessionId);

  onClose();
};
```

**Stan sesji po przerwaniu**:
```json
{
  "id": "session-uuid",
  "in_progress": false,
  "completed_at": null,
  "conditions": "Przerwano przez użytkownika"
}
```

---

### 7.2. Błąd zapisu danych

**Scenariusz**: Błąd sieciowy lub walidacji podczas zapisu `session_task`

**Pożądane zachowanie**:
1. Toast z informacją o błędzie
2. Możliwość powtórzenia zapisu (przycisk "Spróbuj ponownie")
3. NIE przechodzić do kolejnego kroku bez zapisu

**Kod**:
```tsx
const handleStepComplete = async (stepType: string, data: any) => {
  try {
    const { error } = await supabase
      .from('session_tasks')
      .insert({
        session_id: sessionId,
        task_type: stepType,
        task_data: data
      });

    if (error) throw error;

    toast.success(`Zapisano: ${stepType}`);
    setCurrentStepIndex(prev => prev + 1);
  } catch (error) {
    console.error('Save error:', error);
    toast.error('Nie udało się zapisać wyników. Spróbuj ponownie.');
    // Użytkownik pozostaje na tym samym kroku
  }
};
```

---

### 7.3. Wznawianie przerwanych sesji

**Scenariusz**: Użytkownik przerwał sesję, chce kontynuować od miejsca przerwania

**Pożądane zachowanie**:
1. Wykrycie sesji z `in_progress: true` dla danego zawodnika
2. Dialog: "Znaleziono rozpoczętą sesję. Czy chcesz kontynuować?"
3. Opcje:
   - "Kontynuuj" (wznowienie od ostatniego zapisanego kroku)
   - "Rozpocznij nową" (anulowanie starej sesji, start od początku)

**Kod**:
```tsx
useEffect(() => {
  const checkInProgressSession = async () => {
    const { data: inProgressSession } = await supabase
      .from('sessions')
      .select('*, session_tasks(*)')
      .eq('athlete_id', athleteId)
      .eq('in_progress', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (inProgressSession) {
      setExistingSession(inProgressSession);
      setShowResumeDialog(true);
    }
  };

  checkInProgressSession();
}, [athleteId]);
```

---

## 8. Tagowanie i rejestracja w historii

### 8.1. Automatyczne tagi czasowe

**Każde zadanie otrzymuje timestamp**:
```json
{
  "task_type": "focus",
  "task_data": {
    "focus_game_completed_at": "2025-11-24T12:15:00Z",
    // ... pozostałe dane
  },
  "created_at": "2025-11-24T12:15:00Z"
}
```

### 8.2. Tagi kontekstowe (opcjonalnie)

**Możliwość dodania kontekstu do sesji**:
- Pora dnia (rano/wieczór)
- Przed/po treningu
- Warunki zewnętrzne

**UI**: Dodatkowe pole w pierwszym kroku wizarda

**Zapis**:
```json
{
  "conditions": "Rano, przed treningiem, 6h snu"
}
```

---

## 9. Renderowanie raportów pogłębionych

### 9.1. Komponenty raportów

**Dla każdego typu zadania istnieje dedykowany komponent raportu**:

| task_type | Komponent raportu | Lokalizacja |
|-----------|-------------------|-------------|
| `six_sigma` | `SixSigmaReport` | `src/components/reports/SixSigmaReport.tsx` |
| `scan` | `ScanGameReport` | `src/components/reports/ScanGameReport.tsx` |
| `focus` | `FocusGameReport` | `src/components/reports/FocusGameReport.tsx` |
| `memo` | `MemoGameReport` | `src/components/reports/MemoGameReport.tsx` |
| `sigma_feedback` | `FeedbackReport` | `src/components/reports/FeedbackReport.tsx` |
| `hrv_baseline` | `HRVReport` | `src/components/reports/HRVReport.tsx` |

### 9.2. Przykład: FocusGameReport

**Props**:
```tsx
interface FocusGameReportProps {
  data: FocusGameResult;
}
```

**Zawartość**:
- **Metryki podstawowe**: Accuracy, Median RT (congruent vs incongruent)
- **Interference Cost**: Różnica RT między incongruent a congruent
- **Wykres**: RT dla każdej próby (scatter plot)
- **Analiza błędów**: Które próby były niepoprawne
- **HRV**: Jeśli dostępne, wykres HRV podczas gry

**Kod (uproszczony)**:
```tsx
const FocusGameReport = ({ data }: FocusGameReportProps) => {
  const interferenceCost = data.focus_median_incongruent_ms - data.focus_median_congruent_ms;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Focus Game (Stroop Test)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <MetricCard 
            label="Dokładność" 
            value={`${data.focus_accuracy_pct}%`} 
          />
          <MetricCard 
            label="Median RT (Congruent)" 
            value={`${data.focus_median_congruent_ms} ms`} 
          />
          <MetricCard 
            label="Median RT (Incongruent)" 
            value={`${data.focus_median_incongruent_ms} ms`} 
          />
          <MetricCard 
            label="Interference Cost" 
            value={`${interferenceCost} ms`} 
          />
        </div>

        <div className="mt-6">
          <h3>Wykres czasów reakcji</h3>
          <LineChart data={data.focus_trials} />
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## 10. Podsumowanie idealnego flow

### Krok po kroku:
1. ✅ Użytkownik wchodzi w profil zawodnika
2. ✅ Klika "Rozpocznij Pomiar Six Sigma"
3. ✅ Otwiera się SessionWizardNew (full-screen)
4. ✅ Krok 1: Wybiera kwestionariusze Six Sigma
5. ✅ Krok 2: Wypełnia kwestionariusze → Zapis do `session_tasks` (task_type: 'six_sigma')
6. ✅ Krok 3: Rozgrywa Scan Game → Zapis (task_type: 'scan')
7. ✅ Krok 4: Rozgrywa Focus Game → Zapis (task_type: 'focus')
8. ✅ Krok 5: Rozgrywa Memo Game → Zapis (task_type: 'memo')
9. ✅ Krok 6: Wypełnia Sigma Feedback → Zapis (task_type: 'sigma_feedback')
10. ✅ Krok 7: Wykonuje pomiar HRV → Zapis (task_type: 'hrv_baseline')
11. ✅ Sesja zostaje zamknięta (`in_progress: false`, `completed_at: now()`)
12. ✅ Powrót do kokpitu zawodnika
13. ✅ W zakładce "Sesje" pojawia się nowa sesja
14. ✅ Kliknięcie "Zobacz szczegóły" → SessionDetail
15. ✅ Wyświetlenie szczegółowych raportów z każdego zadania

### Kluczowe zasady:
- **Automatyczny łańcuch**: Brak ręcznego wyboru kolejności zadań
- **Zapis natychmiastowy**: Po każdym kroku dane trafiają do `session_tasks`
- **Odporność na błędy**: Błąd zapisu nie przerywa sesji, tylko blokuje przejście dalej
- **Pełna historia**: Wszystkie dane z trial-level granularity dla ML
- **Szczegółowe raporty**: Każde zadanie ma dedykowany komponent wizualizacji

---

## 11. Obecne problemy do naprawy

### 🔴 KRYTYCZNY
1. **Bug w AthleteProfile.tsx (linia 1010)**: `setActiveTask('kwestionariusz')` → powinno być `setActiveTask('six_sigma')`

### ⚠️ WAŻNE
2. **Brak renderowania raportów w SessionDetail**: Komponent nie wyświetla szczegółowych raportów z poszczególnych zadań
3. **Brak obsługi przerwania sesji**: Nie ma dialogu potwierdzenia przy zamykaniu wizarda w połowie
4. **Brak wznawiania sesji**: Nie wykrywa sesji z `in_progress: true`

### 💡 OPCJONALNE ULEPSZENIA
5. Wskaźnik postępu w wizardzie (pasek "Krok X/7")
6. Możliwość dodania notatek kontekstowych do sesji
7. Eksport sesji do PDF
8. Porównanie wyników między sesjami (wykres zmian w czasie)
