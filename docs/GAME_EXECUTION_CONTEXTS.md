# Konteksty Wykonania Gier - Szczegółowa Analiza

## Wprowadzenie

System gier kognitywnych w aplikacji działa w **trzech różnych kontekstach wykonania**, z których każdy ma unikalną logikę zapisu, nawigacji i przeznaczenie. Dokument ten zawiera szczegółowy opis każdego kontekstu, zidentyfikowane problemy oraz różnice w implementacji.

---

## Kontekst 1: Library Mode (Biblioteka)

### Opis
Tryb demonstracyjny dostępny z poziomu `/biblioteka?tab=wyzwania`. Użytkownik może wypróbować dowolną grę bez logowania, bez powiązania z zawodnikiem.

### Charakterystyka
- **athleteId**: `undefined`
- **mode**: `undefined`
- **Zapis wyników**: ❌ NIE - wyniki nie są zapisywane nigdzie
- **Przeznaczenie**: Demo/Showcase funkcjonalności aplikacji
- **Nawigacja powrotna**: `/biblioteka?tab=wyzwania`

### Flow użytkownika
```
1. Użytkownik → /biblioteka?tab=wyzwania
2. Klik na przycisk gry (np. "Gra Focus")
3. Przekierowanie → /biblioteka/focus (bez parametrów URL)
4. Rozgrywka
5. Ekran wyników (GameResultsButtons) → Przycisk "Wróć do Biblioteki"
6. Powrót → /biblioteka?tab=wyzwania
```

### Implementacja techniczna
**Kod wywołania** (`Library.tsx`, linia ~280):
```tsx
navigate('/biblioteka/focus');
```

**Props przekazywane do gry**:
```tsx
<FocusGame 
  onComplete={(data) => console.log('Demo result:', data)}
  onGoToCockpit={() => navigate('/biblioteka?tab=wyzwania')}
/>
```

### Zidentyfikowane problemy
✅ **Brak problemów** - tryb działa zgodnie z założeniami

---

## Kontekst 2: Training Mode (Trening)

### Opis
Tryb treningowy dostępny z zakładki "Trening" w profilu zawodnika. Służy do regularnych ćwiczeń zawodnika, wyniki zapisywane są w tabeli `trainings`.

### Charakterystyka
- **athleteId**: `string` (UUID zawodnika)
- **mode**: `'training'`
- **Zapis wyników**: ✅ TAK - tabela `trainings`
- **Przeznaczenie**: Regularne ćwiczenia i rozwój umiejętności
- **Nawigacja powrotna**: `/zawodnicy/{athleteId}?tab=trening`

### Flow użytkownika
```
1. Użytkownik → /zawodnicy/{athleteId}?tab=trening
2. Klik na przycisk gry (np. "Gra Scan")
3. Przekierowanie → /biblioteka/scan?athleteId={id}&mode=training
4. Rozgrywka
5. Zapis wyniku do tabeli trainings
6. Ekran wyników → Przycisk "Wróć do Kokpitu"
7. Powrót → /zawodnicy/{athleteId}?tab=trening
```

### Implementacja techniczna
**Kod wywołania** (`AthleteProfile.tsx`, linia ~814):
```tsx
onClick={() => navigate(`/biblioteka/${game}?athleteId=${id}&mode=training`)}
```

**Props przekazywane do gry**:
```tsx
<ScanGame 
  athleteId="abc-123"
  mode="training"
  onComplete={async (data) => {
    // Zapis do trainings
    await supabase.from('trainings').insert({
      athlete_id: athleteId,
      task_type: 'scan',
      date: new Date().toISOString(),
      results: data
    });
  }}
  onGoToCockpit={() => navigate(`/zawodnicy/${athleteId}?tab=trening`)}
/>
```

### Struktura zapisu w tabeli `trainings`
```json
{
  "id": "uuid",
  "athlete_id": "uuid",
  "task_type": "scan",
  "date": "2025-11-24T12:00:00Z",
  "results": {
    "scan_max_number_reached": 45,
    "scan_duration_s": 120,
    "scan_correct_clicks": 43,
    "scan_error_clicks": 2,
    "scan_skipped_numbers": [23, 37],
    "scan_rmssd_ms": 45.2,
    "scan_avg_hr_bpm": 72
  },
  "created_at": "2025-11-24T12:00:00Z"
}
```

### Zidentyfikowane problemy
⚠️ **PROBLEM 1**: Tabela `TrainingsTable` nie wyświetla szczegółowych wyników gier
- Dane są zapisywane w kolumnie `results` jako JSONB
- Brak renderowania pogłębionych raportów (np. FocusGameReport)
- Wyświetlane tylko podstawowe metryki w tabeli

⚠️ **PROBLEM 2**: Brak standaryzacji `task_type`
- W niektórych miejscach używane są małe litery: `'scan'`, `'focus'`
- W innych miejscach mogą być inne warianty
- **Wymaga weryfikacji case sensitivity**

✅ **Działające elementy**:
- Zapis do bazy danych działa poprawnie
- Nawigacja powrotna działa
- Parametry URL są prawidłowo przekazywane

---

## Kontekst 3: Measurement Mode (Pomiar)

### Opis
Tryb pomiarowy dostępny z zakładki "Pomiar" w profilu zawodnika. Służy do kompleksowej oceny stanu zawodnika poprzez sekwencję zadań. Wyniki zapisywane są w dwóch tabelach: `sessions` (metadane sesji) + `session_tasks` (wyniki poszczególnych zadań).

### Charakterystyka
- **athleteId**: `string` (UUID zawodnika)
- **mode**: `'measurement'`
- **Zapis wyników**: ✅ TAK - tabele `sessions` + `session_tasks`
- **Przeznaczenie**: Kompleksowa ocena stanu zawodnika
- **Nawigacja powrotna**: `/zawodnicy/{athleteId}?tab=dodaj-pomiar`
- **Sekwencja**: Wieloetapowy wizard z automatycznym łańcuchem zadań

### Flow użytkownika (OCZEKIWANY)
```
1. Użytkownik → /zawodnicy/{athleteId}?tab=dodaj-pomiar
2. Klik "Rozpocznij Pomiar"
3. Otwarcie SessionWizardNew (modal/full-screen)
4. Krok 1: Wybór kwestionariuszy Six Sigma (QuestionnaireSelector)
5. Krok 2: Wypełnienie kwestionariuszy (QuestionnaireRunner)
6. Krok 3: Gra Scan
7. Krok 4: Gra Focus
8. Krok 5: Gra Memo
9. Krok 6: Formularz Sigma Feedback
10. Krok 7: Pomiar HRV Baseline
11. Automatyczny zapis każdego zadania do session_tasks
12. Zamknięcie wizarda → Powrót do /zawodnicy/{athleteId}?tab=dodaj-pomiar
13. Wyświetlenie nowej sesji w tabeli z możliwością wejścia w szczegóły
```

### Implementacja techniczna

**Sekwencja zadań** (`SessionWizardNew.tsx`, linia 29-37):
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

**Kod wywołania** (`AthleteProfile.tsx`, linia ~1010):
```tsx
{activeTask === 'six_sigma' && (
  <SessionWizardNew
    athleteId={id!}
    onClose={() => setActiveTask(null)}
    onSaveSession={() => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setActiveTask(null);
    }}
  />
)}
```

**Zapis do bazy danych** (`SessionWizardNew.tsx`, linia ~55-110):
```tsx
const handleStepComplete = async (stepType: string, data: any) => {
  // 1. Tworzenie sesji (jeśli pierwsza)
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

  // 2. Zapis task_data do session_tasks
  await supabase.from('session_tasks').insert({
    session_id: sessionId,
    task_type: stepType,
    task_data: data
  });

  // 3. Przejście do kolejnego kroku
  setCurrentStepIndex(prev => prev + 1);
};
```

### Struktura zapisu w bazie danych

**Tabela `sessions`**:
```json
{
  "id": "uuid",
  "athlete_id": "uuid",
  "date": "2025-11-24T12:00:00Z",
  "in_progress": false,
  "completed_at": "2025-11-24T12:30:00Z",
  "conditions": null,
  "results": {},
  "created_at": "2025-11-24T12:00:00Z"
}
```

**Tabela `session_tasks`** (przykładowe rekordy):
```json
// Task 1: Six Sigma Questionnaire
{
  "id": "uuid-1",
  "session_id": "session-uuid",
  "task_type": "six_sigma",
  "task_data": {
    "validation": {
      "isValid": true,
      "straightLining": false,
      "reverseInconsistency": false,
      "speeding": false
    },
    "competencyScores": [...],
    "modifierScores": [...],
    "overallScore": 3.8,
    "responses": [...]
  },
  "created_at": "2025-11-24T12:05:00Z"
}

// Task 2: Scan Game
{
  "id": "uuid-2",
  "session_id": "session-uuid",
  "task_type": "scan",
  "task_data": {
    "scan_max_number_reached": 45,
    "scan_duration_s": 120,
    "scan_correct_clicks": 43,
    "scan_error_clicks": 2,
    "scan_skipped_numbers": [23, 37],
    "scan_rmssd_ms": 45.2,
    "scan_avg_hr_bpm": 72,
    "scan_game_completed_at": "2025-11-24T12:10:00Z"
  },
  "created_at": "2025-11-24T12:10:00Z"
}

// Task 3: Focus Game
{
  "id": "uuid-3",
  "session_id": "session-uuid",
  "task_type": "focus",
  "task_data": {
    "focus_trials": [...],
    "focus_median_congruent_ms": 450,
    "focus_median_incongruent_ms": 550,
    "focus_accuracy_pct": 95,
    "focus_total_trials": 40,
    "focus_correct_trials": 38,
    "focus_rmssd_ms": 42.1,
    "focus_avg_hr_bpm": 75,
    "focus_game_completed_at": "2025-11-24T12:15:00Z"
  },
  "created_at": "2025-11-24T12:15:00Z"
}
```

### Zidentyfikowane problemy

#### 🔴 PROBLEM KRYTYCZNY 1: Konflikt etykiet w UI (`six_sigma` vs `kwestionariusz`)

**Lokalizacja**: `AthleteProfile.tsx`, linia 1010

**Błędny kod**:
```tsx
<Button 
  onClick={() => setActiveTask('kwestionariusz')}  // ❌ BŁĄD!
>
  Rozpocznij Six Sigma
</Button>
```

**Logika renderowania** (linia 1880):
```tsx
{activeTask === 'six_sigma' && (  // ✅ Oczekuje 'six_sigma'
  <SessionWizardNew ... />
)}
```

**Skutek**: 
- Po kliknięciu przycisku "Rozpocznij Six Sigma" ustawia się `activeTask = 'kwestionariusz'`
- Warunek `activeTask === 'six_sigma'` jest FAŁSZYWY
- `SessionWizardNew` nigdy się nie renderuje
- Użytkownik widzi pusty ekran

**Rozwiązanie**:
```tsx
<Button 
  onClick={() => setActiveTask('six_sigma')}  // ✅ POPRAWNIE
>
  Rozpocznij Six Sigma
</Button>
```

#### ⚠️ PROBLEM 2: Brak wyświetlania szczegółowych raportów po zakończeniu sesji

**Opis**:
- Dane zapisują się poprawnie do `session_tasks`
- Tabela sesji pokazuje tylko datę i status
- Brak możliwości wejścia w szczegóły sesji i zobaczenia raportów z gier
- `SessionDetail.tsx` prawdopodobnie nie renderuje komponentów raportów (FocusGameReport, ScanGameReport, etc.)

**Rozwiązanie**:
- Strona `/sesje/{sessionId}` powinna pobierać wszystkie `session_tasks` dla danej sesji
- Dla każdego `task_type` renderować odpowiedni komponent raportu
- Przykład: `task_type === 'focus'` → `<FocusGameReport data={task_data} />`

#### ⚠️ PROBLEM 3: Nawigacja po zakończeniu gry w kontekście measurement

**Opis**:
Gry w trybie measurement nie powinny pokazywać standardowego ekranu `GameResultsButtons`, ponieważ są częścią wizarda. Powinny automatycznie przechodzić do kolejnego kroku.

**Obecny stan**:
- Gry używają `onComplete` callback
- Wizard powinien automatycznie przechodzić dalej
- Ale wizualne UX może być nieprzejrzyste dla użytkownika

**Zalecenie**:
- Po zakończeniu gry pokazać krótki ekran "Zapisano wyniki" (1-2 sekundy)
- Automatyczne przejście do kolejnego kroku wizarda
- Wskaźnik postępu (np. "Krok 3/7")

#### ⚠️ PROBLEM 4: Brak obsługi przerwania sesji

**Opis**:
- Jeśli użytkownik zamknie wizard w połowie, sesja pozostaje z `in_progress: true`
- Brak mechanizmu wznawiania przerwanych sesji
- Brak opcji "Anuluj sesję"

**Rozwiązanie**:
- Dodać przycisk "Anuluj pomiar" w wizardzie
- Ustawić `in_progress: false` przy zamykaniu bez ukończenia wszystkich kroków
- Lub: dodać możliwość wznowienia sesji z miejsca przerwania

---

## Porównanie kontekstów

| Aspekt | Library | Training | Measurement |
|--------|---------|----------|-------------|
| **athleteId** | ❌ brak | ✅ tak | ✅ tak |
| **mode** | ❌ brak | `'training'` | `'measurement'` |
| **Zapis do DB** | ❌ nie | ✅ `trainings` | ✅ `sessions` + `session_tasks` |
| **Sekwencja zadań** | ❌ pojedyncza gra | ❌ pojedyncza gra | ✅ wieloetapowy wizard |
| **Nawigacja** | `/biblioteka` | `/zawodnicy/{id}?tab=trening` | `/zawodnicy/{id}?tab=dodaj-pomiar` |
| **Parametry URL** | brak | `?athleteId={id}&mode=training` | nie używane (modal/wizard) |
| **Główny problem** | ✅ brak | ⚠️ brak szczegółowych raportów | 🔴 konflikt `six_sigma`/`kwestionariusz` |

---

## Zalecenia dla spójności systemu

### 1. Standaryzacja nazewnictwa `task_type`
**Wszystkie etykiety powinny używać snake_case i małych liter**:
- ✅ `'six_sigma'`
- ✅ `'scan'`
- ✅ `'focus'`
- ✅ `'memo'`
- ✅ `'sigma_feedback'`
- ✅ `'hrv_baseline'`
- ✅ `'hrv_training'`
- ✅ `'control'`
- ✅ `'tracker'`

### 2. Ujednolicenie struktury propsów gry
Wszystkie komponenty gier powinny akceptować te same propsy:
```tsx
interface GameProps {
  athleteId?: string;
  mode?: 'measurement' | 'training';
  onComplete?: (data: any) => void;
  onGoToCockpit?: () => void;
}
```

### 3. Wydzielenie logiki nawigacji
Utworzyć wspólny util do określania ścieżki powrotu:
```tsx
// utils/gameContext.ts
export function getPostGameNavigation(
  athleteId?: string,
  mode?: 'measurement' | 'training'
): string {
  if (!athleteId) return '/biblioteka?tab=wyzwania';
  if (mode === 'training') return `/zawodnicy/${athleteId}?tab=trening`;
  return `/zawodnicy/${athleteId}?tab=dodaj-pomiar`;
}
```

### 4. Rozdzielenie odpowiedzialności komponentów
- **GameResultsButtons**: tylko dla library i training
- **SessionWizardNew**: obsługuje measurement (bez GameResultsButtons)
- Gry nie powinny renderować UI nawigacyjnego w trybie measurement

---

## Podsumowanie

System gier działa w trzech kontekstach z różnymi celami i implementacjami. Najpoważniejsze problemy:

1. 🔴 **KRYTYCZNY**: Konflikt `'kwestionariusz'` vs `'six_sigma'` blokuje cały moduł measurement
2. ⚠️ **WAŻNY**: Brak szczegółowych raportów z sesji i treningów
3. ⚠️ **WAŻNY**: Niespójna nawigacja po zakończeniu gier w różnych kontekstach

Priorytetowe działania:
1. Naprawić bug w `AthleteProfile.tsx` (linia 1010)
2. Zaimplementować pełne renderowanie raportów w `SessionDetail.tsx`
3. Wystandaryzować nazewnictwo i propsy gier
