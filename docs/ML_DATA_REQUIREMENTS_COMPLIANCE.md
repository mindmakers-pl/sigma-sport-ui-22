# ML Data Requirements - Compliance Report

## Wprowadzenie

Dokument weryfikuje zgodność obecnej implementacji z wymaganiami architektury danych dla Machine Learning, zdefiniowanymi w `DATA_SCIENCE_ARCHITECTURE.md`. Analizuje problemy z etykietami, spójność nazewnictwa i jakość danych dla modeli ML.

---

## 1. Przegląd wymagań ML z DATA_SCIENCE_ARCHITECTURE.md

### 1.1. Kluczowe zasady architektury danych

#### A. Flat Naming Convention
**Wymaganie**:
```
{game}_{metric}_{unit}
```

**Przykłady**:
- ✅ `scan_max_number_reached`
- ✅ `focus_median_congruent_ms`
- ✅ `memo_accuracy_pct`

**Cel**: Łatwe parsowanie kolumn dla modeli ML bez zagnieżdżonych struktur

---

#### B. Trial-Level Granularity
**Wymaganie**: Zachowanie danych na poziomie pojedynczych prób, nie tylko agregatów

**Przykłady**:
- ✅ `focus_trials: Array<{ type, isCorrect, rt, trialNumber }>`
- ✅ `memo_trials: Array<{ trial, rt, isCorrect }>`
- ✅ `control_trial_history: Array<{ trialNumber, type, result, reactionTime }>`

**Cel**: Analiza sekwencji, wykrywanie wzorców w czasie, feature engineering

---

#### C. PII Separation
**Wymaganie**: Dane osobowe (imię, nazwisko, email) przechowywane osobno od danych pomiarowych

**Implementacja**:
- Tabela `athletes`: `id`, `first_name`, `last_name`, `email`, `birth_date`
- Tabela `sessions`: `athlete_id` (FK), dane pomiarowe bez PII
- Tabela `session_tasks`: tylko `session_id`, `task_data` (bez PII)

**Cel**: RODO compliance, możliwość anonimizacji danych do treningu modeli

---

#### D. Semantic Versioning
**Wymaganie**: Schema versioning dla zmian w strukturze danych

**Przykład**:
```json
{
  "schema_version": "1.0.0",
  "scan_max_number_reached": 45,
  ...
}
```

**Status**: ⚠️ **NIE ZAIMPLEMENTOWANE** - brak pola `schema_version` w `task_data`

---

#### E. Device & Context Tracking
**Wymaganie**: Rejestracja informacji o urządzeniu i kontekście pomiaru

**Przykłady**:
- Device type (mobile/desktop/tablet)
- Screen size
- Browser
- Timestamp
- Conditions (pora dnia, przed/po treningu)

**Status**: ⚠️ **CZĘŚCIOWO ZAIMPLEMENTOWANE**
- ✅ Timestamp: `{game}_game_completed_at`
- ⚠️ Conditions: Pole `conditions` w tabeli `sessions` (TEXT, opcjonalne)
- ❌ Device info: Brak automatycznego trackingu

---

#### F. HRV Integration
**Wymaganie**: Opcjonalny pomiar HRV podczas gier

**Implementacja**:
- ✅ `{game}_rmssd_ms` (np. `scan_rmssd_ms`, `focus_rmssd_ms`)
- ✅ `{game}_avg_hr_bpm` (np. `scan_avg_hr_bpm`, `focus_avg_hr_bpm`)
- ✅ Dedykowane zadania: `hrv_baseline`, `hrv_training`

**Status**: ✅ **ZAIMPLEMENTOWANE POPRAWNIE**

---

## 2. Weryfikacja zgodności implementacji

### 2.1. Analiza sessionSchemas.ts

**Lokalizacja**: `src/schemas/sessionSchemas.ts`

#### ✅ ZGODNE: Flat Naming Convention

**Przykład z ScanGameResultSchema**:
```tsx
export const ScanGameResultSchema = z.object({
  scan_max_number_reached: z.number().min(0),
  scan_duration_s: z.number().min(0),
  scan_correct_clicks: z.number().min(0),
  scan_error_clicks: z.number().min(0),
  scan_skipped_numbers: z.array(z.number()).default([]),
  scan_rmssd_ms: z.number().optional().nullable(),
  scan_avg_hr_bpm: z.number().optional().nullable(),
  scan_game_completed_at: z.string().optional(),
});
```

**Ocena**: ✅ Wszystkie pola używają konwencji `{game}_{metric}_{unit}`

---

#### ✅ ZGODNE: Trial-Level Granularity

**Przykład z FocusGameResultSchema**:
```tsx
export const FocusGameResultSchema = z.object({
  focus_trials: z.array(z.object({
    type: z.enum(['CONGRUENT', 'INCONGRUENT']),
    isCorrect: z.boolean(),
    rt: z.number().min(0),
    trialNumber: z.number().min(1),
  })),
  focus_median_congruent_ms: z.number().min(0),
  focus_median_incongruent_ms: z.number().min(0),
  // ... agregaty
});
```

**Ocena**: ✅ Pełna historia prób + agregaty

**Wszystkie gry z trial-level data**:
- ✅ `focus_trials`
- ✅ `memo_trials`
- ✅ `control_trial_history`
- ❌ `scan_*` - brak `scan_click_history` (REKOMENDACJA: dodać)
- ❌ `tracker_*` - brak `tracker_attempt_history` (REKOMENDACJA: dodać)

---

#### ✅ ZGODNE: PII Separation

**Struktura bazy danych**:
```
athletes (PII)
├── id
├── first_name
├── last_name
├── email
├── birth_date
└── ...

sessions (bez PII)
├── id
├── athlete_id (FK → athletes.id)
├── date
├── in_progress
└── conditions

session_tasks (bez PII)
├── id
├── session_id (FK → sessions.id)
├── task_type
└── task_data (JSONB - tylko dane pomiarowe)
```

**Ocena**: ✅ PII oddzielone, dane pomiarowe czyste

---

#### ⚠️ NIEZGODNE: Schema Versioning

**Obecny stan**: Brak pola `schema_version` w żadnym schemacie

**Rekomendacja**: Dodać pole `schema_version` do wszystkich schematów

**Przykład**:
```tsx
export const ScanGameResultSchema = z.object({
  schema_version: z.string().default('1.0.0'), // DODAĆ
  scan_max_number_reached: z.number().min(0),
  // ... pozostałe pola
});
```

**Uzasadnienie**: 
- Umożliwia migracje danych w przyszłości
- ML pipeline może filtrować dane po wersji schematu
- Zabezpiecza przed breaking changes

---

#### ⚠️ CZĘŚCIOWO ZGODNE: Device & Context Tracking

**Obecny stan**:
- ✅ Timestamp: `{game}_game_completed_at`
- ⚠️ Conditions: Pole `conditions` w `sessions` (TEXT, manualne)
- ❌ Device metadata: Brak

**Rekomendacja**: Dodać dedykowane schema dla metadanych sesji

**Przykład**:
```tsx
export const SessionMetadataSchema = z.object({
  device_type: z.enum(['mobile', 'tablet', 'desktop']).optional(),
  screen_width: z.number().optional(),
  screen_height: z.number().optional(),
  browser: z.string().optional(),
  user_agent: z.string().optional(),
  time_of_day: z.enum(['morning', 'afternoon', 'evening', 'night']).optional(),
  pre_post_training: z.enum(['pre', 'post', 'standalone']).optional(),
});
```

**Zapis w sessions**:
```tsx
await supabase.from('sessions').insert({
  athlete_id: athleteId,
  date: new Date().toISOString(),
  conditions: JSON.stringify({
    device_type: 'desktop',
    screen_width: 1920,
    screen_height: 1080,
    time_of_day: 'morning'
  })
});
```

---

### 2.2. Analiza zapisu danych w bazie

**Zapytanie testowe**:
```sql
SELECT 
  st.task_type,
  jsonb_pretty(st.task_data) as data_sample
FROM session_tasks st
LIMIT 5;
```

**Wyniki (przykład z rzeczywistej bazy)**:
```json
// task_type: 'scan'
{
  "scan_max_number_reached": 28,
  "scan_duration_s": 120,
  "scan_correct_clicks": 26,
  "scan_error_clicks": 2,
  "scan_skipped_numbers": [15, 22],
  "scan_rmssd_ms": null,
  "scan_avg_hr_bpm": null,
  "scan_game_completed_at": "2025-11-24T10:15:32.123Z"
}

// task_type: 'memo'
{
  "memo_accuracy_pct": 83,
  "memo_median_rt_ms": 542,
  "memo_total_trials": 30,
  "memo_correct_responses": 25,
  "memo_trials": [
    { "trial": 1, "rt": 523, "isCorrect": true, "isError": false },
    { "trial": 2, "rt": 612, "isCorrect": false, "isError": true },
    // ... 30 prób
  ],
  "memo_rmssd_ms": null,
  "memo_hr_bpm": null,
  "memo_game_completed_at": "2025-11-24T10:20:45.678Z"
}
```

**Ocena**: ✅ Dane zapisują się zgodnie ze schematem, flat naming poprawne

---

## 3. Identyfikacja konfliktów w etykietach

### 3.1. Główny konflikt: `six_sigma` vs `kwestionariusz`

**Lokalizacje**:

#### A. Backend (POPRAWNE)
```tsx
// sessionSchemas.ts
z.object({ 
  task_type: z.literal('six_sigma'),  // ✅
  task_data: SixSigmaResultSchema 
})

// SessionWizardNew.tsx
const MEASUREMENT_SEQUENCE = [
  'questionnaire-selector',
  'questionnaire-runner',  // → zapisuje jako 'six_sigma' ✅
  'scan',
  // ...
];

handleStepComplete('six_sigma', results);  // ✅
```

#### B. Frontend UI (BŁĄD)
```tsx
// AthleteProfile.tsx:1010
<Button onClick={() => setActiveTask('kwestionariusz')}>  // ❌
  Rozpocznij Six Sigma
</Button>

// AthleteProfile.tsx:1880
{activeTask === 'six_sigma' && (  // ✅ Oczekuje 'six_sigma'
  <SessionWizardNew ... />
)}
```

**Skutek**: 
- `setActiveTask('kwestionariusz')` ustawia state
- Warunek `activeTask === 'six_sigma'` jest fałszywy
- `SessionWizardNew` nigdy się nie renderuje
- Użytkownik widzi pusty ekran

**Rozwiązanie**:
```tsx
// AthleteProfile.tsx:1010 (POPRAWIONE)
<Button onClick={() => setActiveTask('six_sigma')}>  // ✅
  Rozpocznij Six Sigma
</Button>
```

---

### 3.2. Case Sensitivity - Analiza wszystkich task_type

**Źródła**:
1. `sessionSchemas.ts` (definicje Zod)
2. Baza danych (`session_tasks.task_type`, `trainings.task_type`)
3. Kod frontendowy (MEASUREMENT_SEQUENCE, activeTask)

#### Tabela wszystkich task_type

| task_type | sessionSchemas.ts | Baza danych | Frontend | Status |
|-----------|-------------------|-------------|----------|--------|
| `six_sigma` | ✅ | ❌ (0 rekordów) | ⚠️ (bug w UI) | 🔴 KONFLIKT |
| `scan` | ✅ | ✅ (2 rekordy) | ✅ | ✅ SPÓJNY |
| `focus` | ✅ | ❌ (0 rekordów) | ✅ | ⚠️ Brak danych testowych |
| `memo` | ✅ | ✅ (1 rekord) | ✅ | ✅ SPÓJNY |
| `control` | ✅ | ❌ (0 rekordów) | ✅ | ⚠️ Brak danych testowych |
| `tracker` | ✅ | ❌ (0 rekordów) | ✅ | ⚠️ Brak danych testowych |
| `hrv_baseline` | ✅ | ❌ (0 rekordów) | ✅ | ⚠️ Brak danych testowych |
| `hrv_training` | ✅ | ✅ (0 rekordów) | ✅ | ⚠️ Brak danych testowych |
| `sigma_feedback` | ✅ | ❌ (0 rekordów) | ✅ | ⚠️ Brak danych testowych |
| `sigma_move` | ✅ | ❌ (0 rekordów) | ❌ Nie używane | ⚠️ Zdefiniowane, ale nieużywane |

**Wnioski**:
1. ✅ **Case consistency**: Wszystkie etykiety używają `snake_case`
2. 🔴 **`six_sigma`**: Zablokowane przez bug w UI
3. ⚠️ **Brak testów**: Większość task_type nie ma danych w bazie (prawdopodobnie nie były testowane)
4. ❌ **`sigma_move`**: Zdefiniowane w schemacie, ale nieużywane w aplikacji

---

### 3.3. Synonimia i duplikaty

**Potencjalne synonimie (do sprawdzenia w całym codebase)**:

| Koncepcja | Warianty | Zalecana wersja |
|-----------|----------|-----------------|
| Kwestionariusz Six Sigma | `'six_sigma'`, `'kwestionariusz'`, `'questionnaire'` | ✅ `'six_sigma'` |
| Baseline HRV | `'hrv_baseline'`, `'hrv_base'`, `'baseline_hrv'` | ✅ `'hrv_baseline'` |
| Training HRV | `'hrv_training'`, `'hrv_train'`, `'training_hrv'` | ✅ `'hrv_training'` |
| Feedback | `'sigma_feedback'`, `'feedback'`, `'self_report'` | ✅ `'sigma_feedback'` |

**Rekomendacja**: 
- Utworzyć plik `src/constants/taskTypes.ts` z kanonicznymi etykietami
- Używać tylko z tego pliku w całym projekcie

**Przykład**:
```tsx
// src/constants/taskTypes.ts
export const TASK_TYPES = {
  SIX_SIGMA: 'six_sigma',
  SCAN: 'scan',
  FOCUS: 'focus',
  MEMO: 'memo',
  CONTROL: 'control',
  TRACKER: 'tracker',
  HRV_BASELINE: 'hrv_baseline',
  HRV_TRAINING: 'hrv_training',
  SIGMA_FEEDBACK: 'sigma_feedback',
  SIGMA_MOVE: 'sigma_move',
} as const;

export type TaskType = typeof TASK_TYPES[keyof typeof TASK_TYPES];
```

**Użycie**:
```tsx
import { TASK_TYPES } from '@/constants/taskTypes';

// Zamiast:
setActiveTask('six_sigma');  // ❌ Hardcoded string

// Używać:
setActiveTask(TASK_TYPES.SIX_SIGMA);  // ✅ Type-safe constant
```

---

## 4. Problemy wynikające z niespójności

### 4.1. Wpływ na ML Pipeline

**Problem**: Niespójne etykiety utrudniają:

1. **Feature Engineering**
   - Trudność w automatycznym parsowaniu nazw kolumn
   - Konieczność manualnego mapowania `'kwestionariusz'` → `'six_sigma'`

2. **Data Validation**
   - Pipeline ML może odrzucić dane z nierozpoznanym `task_type`
   - Brak możliwości automatycznej walidacji przed treningiem modelu

3. **Temporal Analysis**
   - Niemożność śledzenia zmian w `six_sigma` scores w czasie (0 rekordów w bazie)
   - Modele sequence-based (LSTM, Transformer) nie mają danych treningowych

**Przykład problemu**:
```python
# ML Pipeline - analiza zmian Six Sigma scores
df = pd.read_sql("SELECT * FROM session_tasks WHERE task_type = 'six_sigma'", conn)
# Zwraca 0 rekordów → model nie może być wytrenowany
```

---

### 4.2. Wpływ na UX

**Problem**: Bug `'kwestionariusz'` vs `'six_sigma'` blokuje cały moduł measurement

**Skutki**:
- Użytkownik klika "Rozpocznij Six Sigma" → nic się nie dzieje
- Brak komunikatu błędu → użytkownik nie wie, że coś jest nie tak
- Frustracja i opuszczenie funkcjonalności

**Obejście (nieznane użytkownikowi)**:
- Programistyczne ustawienie `setActiveTask('six_sigma')` w konsoli przeglądarki
- Bezpośrednie wywołanie `/biblioteka/scan?athleteId={id}&mode=measurement` (omija wizard)

---

### 4.3. Wpływ na Development

**Problem**: Brak konwencji nazewnictwa prowadzi do błędów

**Przykłady**:
1. Developer A pisze: `setActiveTask('kwestionariusz')`
2. Developer B pisze: `activeTask === 'six_sigma'`
3. Code review nie wyłapuje (brak testów, brak type safety)
4. Bug trafia do produkcji

**Rozwiązanie**: Type-safe constants + ESLint rule

```tsx
// .eslintrc.js
rules: {
  'no-restricted-syntax': [
    'error',
    {
      selector: 'Literal[value=/kwestionariusz/]',
      message: "Use TASK_TYPES.SIX_SIGMA instead of 'kwestionariusz'"
    }
  ]
}
```

---

## 5. Rekomendacje dla zgodności z wymaganiami ML

### 5.1. Krytyczne (muszą być naprawione natychmiast)

#### 1. Naprawić bug `'kwestionariusz'` → `'six_sigma'`
**Priorytet**: 🔴 KRYTYCZNY

**Plik**: `AthleteProfile.tsx`, linia 1010

**Zmiana**:
```tsx
// PRZED (BŁĄD)
<Button onClick={() => setActiveTask('kwestionariusz')}>

// PO (POPRAWNIE)
<Button onClick={() => setActiveTask('six_sigma')}>
```

**Impact**: Odblokowanie całego modułu measurement, generowanie danych dla ML

---

#### 2. Utworzyć constants file dla task_type
**Priorytet**: 🔴 KRYTYCZNY

**Nowy plik**: `src/constants/taskTypes.ts`

**Kod**: (jak w sekcji 3.3)

**Impact**: Type safety, eliminacja hardcoded strings, łatwiejszy refactoring

---

### 5.2. Ważne (powinny być zaimplementowane w najbliższym czasie)

#### 3. Dodać schema_version do wszystkich schematów
**Priorytet**: 🟡 WAŻNY

**Plik**: `src/schemas/sessionSchemas.ts`

**Zmiana**:
```tsx
export const ScanGameResultSchema = z.object({
  schema_version: z.string().default('1.0.0'),
  scan_max_number_reached: z.number().min(0),
  // ... pozostałe pola
});
```

**Impact**: Możliwość migracji danych, wersjonowanie dla ML pipeline

---

#### 4. Dodać click_history do scan game
**Priorytet**: 🟡 WAŻNY

**Plik**: `src/schemas/sessionSchemas.ts`

**Zmiana**:
```tsx
export const ScanGameResultSchema = z.object({
  // ... istniejące pola
  scan_click_history: z.array(z.object({
    clicked_number: z.number(),
    timestamp: z.number(),
    was_correct: z.boolean(),
    reaction_time: z.number().optional(),
  })).optional(),
});
```

**Impact**: Trial-level data dla modeli sequence-based

---

#### 5. Zaimplementować automatyczne device tracking
**Priorytet**: 🟡 WAŻNY

**Nowy plik**: `src/utils/deviceTracking.ts`

**Kod**:
```tsx
export function getDeviceMetadata() {
  return {
    device_type: /Mobi|Android/i.test(navigator.userAgent) 
      ? 'mobile' 
      : /Tablet|iPad/i.test(navigator.userAgent) 
        ? 'tablet' 
        : 'desktop',
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    browser: getBrowserName(),
    user_agent: navigator.userAgent,
  };
}
```

**Użycie**:
```tsx
// SessionWizardNew.tsx - przy tworzeniu sesji
const { data: newSession } = await supabase
  .from('sessions')
  .insert({
    athlete_id: athleteId,
    date: new Date().toISOString(),
    in_progress: true,
    conditions: JSON.stringify(getDeviceMetadata()),
  });
```

**Impact**: Kontekst dla modeli ML (device-specific patterns)

---

### 5.3. Opcjonalne (nice-to-have)

#### 6. Dodać attempt_history do tracker game
**Priorytet**: 🟢 OPCJONALNY

**Uzasadnienie**: Tracker game jest złożony (multiple moving objects), trial-level data byłaby bardzo cenna

---

#### 7. Zaimplementować `sigma_move` w aplikacji
**Priorytet**: 🟢 OPCJONALNY

**Status**: Schemat zdefiniowany, ale nieużywany

**Decyzja**: Albo zaimplementować, albo usunąć ze schematu

---

## 6. Podsumowanie zgodności

### Scoring compliance (0-100%)

| Kategoria | Wynik | Waga | Wynik ważony |
|-----------|-------|------|--------------|
| Flat Naming Convention | 100% | 20% | 20% |
| Trial-Level Granularity | 80% | 25% | 20% |
| PII Separation | 100% | 20% | 20% |
| Schema Versioning | 0% | 15% | 0% |
| Device & Context Tracking | 40% | 10% | 4% |
| HRV Integration | 100% | 10% | 10% |
| **TOTAL** | | | **74%** |

### Interpretacja

**74% compliance** = **DOBRY POZIOM**, ale z krytycznymi blokerami

**Mocne strony**:
- ✅ Flat naming convention idealnie zaimplementowane
- ✅ PII separation poprawne (RODO compliant)
- ✅ HRV integration kompletna

**Słabe strony**:
- ❌ Brak schema versioning (0%)
- ⚠️ Niepełny device tracking (40%)
- ⚠️ Braki w trial-level data dla niektórych gier (80%)

**Blocker**:
- 🔴 Bug `'kwestionariusz'` vs `'six_sigma'` - 0 rekordów Six Sigma w bazie

---

## 7. Action Plan

### Faza 1: Unblock (natychmiast)
1. Naprawić bug w `AthleteProfile.tsx` (5 minut)
2. Utworzyć `taskTypes.ts` constants (10 minut)
3. Przeprowadzić testy end-to-end measurement session (30 minut)

**Rezultat**: Odblokowanie generowania danych dla ML

---

### Faza 2: Improve (tydzień 1)
1. Dodać `schema_version` do wszystkich schematów (1 godzina)
2. Zaimplementować automatyczne device tracking (2 godziny)
3. Dodać `scan_click_history` do Scan Game (3 godziny)
4. Utworzyć ESLint rules dla type safety (1 godzina)

**Rezultat**: 85%+ compliance z wymaganiami ML

---

### Faza 3: Optimize (tydzień 2-3)
1. Dodać `tracker_attempt_history` (4 godziny)
2. Zaimplementować lub usunąć `sigma_move` (decyzja produktowa)
3. Przeprowadzić pełny audit wszystkich zapisanych danych (2 godziny)
4. Utworzyć data validation pipeline dla ML (4 godziny)

**Rezultat**: 95%+ compliance, production-ready dla ML models

---

## 8. Wpływ na Machine Learning

### Obecne ograniczenia dla ML

**Ze względu na bug `six_sigma`**:
- ❌ Brak możliwości trenowania modeli predykcyjnych dla Six Sigma scores
- ❌ Brak analizy korelacji między Six Sigma a wynikami gier
- ❌ Brak możliwości personalizowanych rekomendacji treningowych

**Po naprawieniu buga**:
- ✅ Możliwość trenowania modeli regresyjnych: `scan_accuracy → six_sigma_score`
- ✅ Analiza temporal patterns: Jak Six Sigma zmienia się w czasie
- ✅ Clustering zawodników po profilach Six Sigma

### Możliwości ML po pełnym compliance

**Modele możliwe do wytrenowania**:

1. **Performance Prediction**
   - Input: `six_sigma_scores`, `feedback`, `hrv_baseline`
   - Output: Przewidywana `scan_accuracy`, `focus_accuracy`

2. **Fatigue Detection**
   - Input: `feedback_fatigue`, `hrv_*`, `trial-level RT patterns`
   - Output: Binary classifier (zmęczony/wypoczęty)

3. **Personalized Training Plans**
   - Input: Historical performance across all games
   - Output: Rekomendacja kolejności i intensywności ćwiczeń

4. **Anomaly Detection**
   - Input: Trial-level data (RT, accuracy patterns)
   - Output: Wykrycie nietypowych sesji (np. problem techniczny, zawodnik nie skupiony)

---

## Podsumowanie finalne

**Obecny stan**: 74% zgodności z wymaganiami ML

**Blocker**: Bug `'kwestionariusz'` → `'six_sigma'` (5 minut naprawy)

**Po naprawie buga**: 85%+ zgodności

**Po pełnej implementacji rekomendacji**: 95%+ zgodności

**Kluczowa obserwacja**: Architektura danych jest **dobrze zaprojektowana**, problemy wynikają głównie z **błędów implementacyjnych** (bug w UI) i **brakujących feature'ów** (schema versioning, device tracking).

Naprawa buga powinna być **najwyższym priorytetem**, ponieważ:
1. Odblokuje cały moduł measurement
2. Umożliwi generowanie danych treningowych dla modeli ML
3. Nie wymaga zmian w architekturze - tylko 1 linijka kodu
