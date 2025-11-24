# Schema Dump - Technical Report

## Wprowadzenie

Raport techniczny przedstawiający dokładną strukturę bazy danych, schemat walidacji (Zod), i wszystkie etykiety używane w module Measurement Session. Dokument jest przeznaczony dla data scientists i ML engineers potrzebujących szczegółowej wiedzy o strukturze danych.

---

## 1. Struktura Bazy Danych Supabase

### 1.1. Tabela: `sessions`

**Opis**: Metadane sesji pomiarowej zawodnika

**Kolumny**:

| Kolumna | Typ | Nullable | Default | Opis |
|---------|-----|----------|---------|------|
| `id` | uuid | NO | `gen_random_uuid()` | Primary key |
| `athlete_id` | uuid | NO | - | Foreign key → `athletes.id` |
| `date` | timestamp with time zone | NO | - | Data rozpoczęcia sesji |
| `in_progress` | boolean | YES | `true` | Czy sesja jest w trakcie |
| `completed_at` | timestamp with time zone | YES | `null` | Data zakończenia sesji |
| `conditions` | text | YES | `null` | Kontekst sesji (JSON string lub plain text) |
| `results` | jsonb | YES | `'{}'::jsonb` | **UWAGA**: Obecnie nieużywane (legacy) |
| `created_at` | timestamp with time zone | YES | `now()` | Timestamp utworzenia rekordu |

**Klucz obcy**:
- `athlete_id` → `athletes.id` (ON DELETE CASCADE - usuń sesje gdy usuwasz zawodnika)

**Indeksy**:
- Primary key: `id`
- Index: `athlete_id` (dla szybkiego filtrowania sesji po zawodniku)
- Index: `date` (dla sortowania chronologicznego)

**RLS Policies**:
- `Allow anon to view sessions`: SELECT - wszystkie sesje widoczne
- `Allow anon to insert sessions`: INSERT - każdy może utworzyć sesję
- `Allow anon to update sessions`: UPDATE - każdy może aktualizować sesje
- `Allow anon to delete sessions`: DELETE - każdy może usuwać sesje

**Przykładowy rekord**:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "athlete_id": "athlete-uuid-here",
  "date": "2025-11-24T12:00:00.000Z",
  "in_progress": false,
  "completed_at": "2025-11-24T12:30:00.000Z",
  "conditions": "{\"device_type\":\"desktop\",\"time_of_day\":\"morning\"}",
  "results": {},
  "created_at": "2025-11-24T12:00:00.000Z"
}
```

**UWAGA o kolumnie `results`**:
- Typ: `jsonb`
- Default: `{}`
- **Status**: LEGACY - obecnie nieużywane
- **Historia**: Wcześniej przechowywano wszystkie wyniki w tym jednym polu JSONB
- **Obecne rozwiązanie**: Wyniki przechowywane w `session_tasks` (normalizacja)
- **Rekomendacja**: Można usunąć w przyszłej migracji (po upewnieniu się, że nie ma starych danych)

---

### 1.2. Tabela: `session_tasks`

**Opis**: Wyniki poszczególnych zadań w sesji pomiarowej

**Kolumny**:

| Kolumna | Typ | Nullable | Default | Opis |
|---------|-----|----------|---------|------|
| `id` | uuid | NO | `gen_random_uuid()` | Primary key |
| `session_id` | uuid | NO | - | Foreign key → `sessions.id` |
| `task_type` | text | NO | - | Typ zadania (np. 'scan', 'focus') |
| `task_data` | jsonb | NO | - | **TUTAJ SĄ WSZYSTKIE WYNIKI** |
| `created_at` | timestamp with time zone | YES | `now()` | Timestamp zapisu zadania |

**Klucze obce**:
- `session_id` → `sessions.id` (ON DELETE CASCADE)

**Indeksy**:
- Primary key: `id`
- Index: `session_id` (dla szybkiego pobierania wszystkich zadań sesji)
- GIN Index: `task_data` (dla szybkiego JSONB query)

**RLS Policies**:
- `Allow anon to view session_tasks`: SELECT
- `Allow anon to insert session_tasks`: INSERT
- `Allow anon to update session_tasks`: UPDATE
- `Allow anon to delete session_tasks`: DELETE

**Przykładowe rekordy**:

```json
// Rekord 1: Six Sigma Questionnaire
{
  "id": "task-uuid-1",
  "session_id": "session-uuid",
  "task_type": "six_sigma",
  "task_data": {
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
      }
    ],
    "modifierScores": [
      {
        "id": "stress",
        "name": "Stres",
        "rawScore": 2.3,
        "normalizedScore": 0.46,
        "impact": "negative"
      }
    ],
    "overallScore": 3.9,
    "responses": [
      { "questionId": "q1_concentration", "value": 4 },
      { "questionId": "q2_concentration", "value": 5 }
    ]
  },
  "created_at": "2025-11-24T12:05:00.000Z"
}

// Rekord 2: Scan Game
{
  "id": "task-uuid-2",
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
    "scan_game_completed_at": "2025-11-24T12:10:00.000Z"
  },
  "created_at": "2025-11-24T12:10:00.000Z"
}

// Rekord 3: Focus Game
{
  "id": "task-uuid-3",
  "session_id": "session-uuid",
  "task_type": "focus",
  "task_data": {
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
      // ... 40 total trials
    ],
    "focus_median_congruent_ms": 450,
    "focus_median_incongruent_ms": 550,
    "focus_accuracy_pct": 95,
    "focus_total_trials": 40,
    "focus_correct_trials": 38,
    "focus_rmssd_ms": 42.1,
    "focus_avg_hr_bpm": 75,
    "focus_game_completed_at": "2025-11-24T12:15:00.000Z"
  },
  "created_at": "2025-11-24T12:15:00.000Z"
}
```

**KLUCZOWA OBSERWACJA**: Cała logika ML będzie parsowała kolumnę `task_data`. Jest to JSONB, więc można używać Postgres JSONB operatorów:

```sql
-- Przykład: Znajdź wszystkie sesje z accuracy > 90%
SELECT * FROM session_tasks
WHERE task_type = 'focus'
  AND (task_data->>'focus_accuracy_pct')::float > 90;

-- Przykład: Średnia HRV dla wszystkich gier Scan
SELECT AVG((task_data->>'scan_rmssd_ms')::float) as avg_hrv
FROM session_tasks
WHERE task_type = 'scan'
  AND task_data->>'scan_rmssd_ms' IS NOT NULL;
```

---

### 1.3. Tabela: `trainings`

**Opis**: Wyniki treningów zawodnika (poza sesjami pomiarowymi)

**Kolumny**:

| Kolumna | Typ | Nullable | Default | Opis |
|---------|-----|----------|---------|------|
| `id` | uuid | NO | `gen_random_uuid()` | Primary key |
| `athlete_id` | uuid | NO | - | Foreign key → `athletes.id` |
| `task_type` | text | NO | - | Typ gry (np. 'scan', 'focus') |
| `results` | jsonb | NO | - | Wyniki gry (taka sama struktura jak `task_data`) |
| `date` | timestamp with time zone | NO | - | Data treningu |
| `created_at` | timestamp with time zone | YES | `now()` | Timestamp utworzenia |

**Różnica vs `session_tasks`**:
- `trainings`: Pojedyncze gry w trybie treningowym
- `session_tasks`: Zadania w ramach kompleksowej sesji pomiarowej

**Przykładowy rekord**:
```json
{
  "id": "training-uuid",
  "athlete_id": "athlete-uuid",
  "task_type": "scan",
  "results": {
    "scan_max_number_reached": 38,
    "scan_duration_s": 120,
    "scan_correct_clicks": 36,
    "scan_error_clicks": 2,
    "scan_skipped_numbers": [25],
    "scan_rmssd_ms": null,
    "scan_avg_hr_bpm": null
  },
  "date": "2025-11-23T15:30:00.000Z",
  "created_at": "2025-11-23T15:30:00.000Z"
}
```

**Zapytania SQL - obecne dane w bazie**:
```sql
-- Ilość treningów w bazie
SELECT task_type, COUNT(*) as count
FROM trainings
GROUP BY task_type;
```

**Wynik z rzeczywistej bazy**:
```
task_type | count
----------|------
scan      | 2
memo      | 1
```

---

### 1.4. Tabela: `athletes`

**Opis**: Dane osobowe zawodników (PII)

**Kolumny** (najważniejsze):

| Kolumna | Typ | Nullable | Default | Opis |
|---------|-----|----------|---------|------|
| `id` | uuid | NO | `gen_random_uuid()` | Primary key |
| `first_name` | text | NO | - | Imię |
| `last_name` | text | NO | - | Nazwisko |
| `email` | text | YES | - | Email |
| `phone` | text | YES | - | Telefon |
| `birth_date` | date | YES | - | Data urodzenia |
| `birth_year` | integer | YES | - | Rok urodzenia (alternatywa) |
| `gender` | text | YES | - | Płeć |
| `discipline` | text | YES | - | Dyscyplina sportu |
| `club_id` | uuid | YES | - | FK → `clubs.id` |
| `archived` | boolean | YES | `false` | Czy zawodnik jest zarchiwizowany |
| `created_at` | timestamp with time zone | YES | `now()` | Data utworzenia |

**UWAGA PII**: Ta tabela zawiera Personally Identifiable Information. Dla ML:
- Używaj tylko `athlete_id` w analizach
- Imię/nazwisko/email **NIGDY** nie powinny trafiać do modeli ML
- Do anonimizacji: hash `athlete_id` przed eksportem do ML pipeline

---

## 2. WSZYSTKIE task_type i ich spójność

### 2.1. Źródła definicji task_type

**Źródło 1: Zod Schema (`sessionSchemas.ts`)**

Lista wszystkich zdefiniowanych `task_type` w `SessionTaskSchema`:

```tsx
z.discriminatedUnion('task_type', [
  z.object({ task_type: z.literal('six_sigma'), ... }),
  z.object({ task_type: z.literal('scan'), ... }),
  z.object({ task_type: z.literal('focus'), ... }),
  z.object({ task_type: z.literal('memo'), ... }),
  z.object({ task_type: z.literal('control'), ... }),
  z.object({ task_type: z.literal('tracker'), ... }),
  z.object({ task_type: z.literal('hrv_baseline'), ... }),
  z.object({ task_type: z.literal('hrv_training'), ... }),
  z.object({ task_type: z.literal('sigma_feedback'), ... }),
  z.object({ task_type: z.literal('sigma_move'), ... }),
]);
```

**Źródło 2: Frontend (`SessionWizardNew.tsx`)**

```tsx
const MEASUREMENT_SEQUENCE: WizardStep[] = [
  'questionnaire-selector',     // → zapisuje jako 'six_sigma'
  'questionnaire-runner',       // → zapisuje jako 'six_sigma'
  'scan',
  'focus',
  'memo',
  'sigma-feedback',             // → zapisuje jako 'sigma_feedback'
  'hrv-baseline',               // → zapisuje jako 'hrv_baseline'
];
```

**Źródło 3: Baza danych (rzeczywiste dane)**

```sql
-- Zapytanie: Wszystkie task_type w session_tasks
SELECT DISTINCT task_type FROM session_tasks;
```

**Wynik**:
```
task_type
----------
scan
memo
```

```sql
-- Zapytanie: Wszystkie task_type w trainings
SELECT DISTINCT task_type FROM trainings;
```

**Wynik**:
```
task_type
----------
scan
memo
```

---

### 2.2. Tabela wszystkich task_type z case sensitivity

| task_type | Schema (Zod) | Frontend (Wizard) | DB (session_tasks) | DB (trainings) | Status |
|-----------|--------------|-------------------|--------------------|----------------|--------|
| `six_sigma` | ✅ zdefiniowane | ✅ używane | ❌ 0 rekordów | ❌ 0 rekordów | 🔴 ZABLOKOWANE (bug w UI) |
| `scan` | ✅ zdefiniowane | ✅ używane | ✅ 2 rekordy | ✅ 2 rekordy | ✅ DZIAŁA |
| `focus` | ✅ zdefiniowane | ✅ używane | ❌ 0 rekordów | ❌ 0 rekordów | ⚠️ Brak testów |
| `memo` | ✅ zdefiniowane | ✅ używane | ✅ 1 rekord | ✅ 1 rekord | ✅ DZIAŁA |
| `control` | ✅ zdefiniowane | ❌ nieużywane w wizard | ❌ 0 rekordów | ❌ 0 rekordów | ⚠️ Zdefiniowane, ale nieużywane |
| `tracker` | ✅ zdefiniowane | ❌ nieużywane w wizard | ❌ 0 rekordów | ❌ 0 rekordów | ⚠️ Zdefiniowane, ale nieużywane |
| `hrv_baseline` | ✅ zdefiniowane | ✅ używane | ❌ 0 rekordów | ❌ 0 rekordów | ⚠️ Brak testów |
| `hrv_training` | ✅ zdefiniowane | ❌ nieużywane w wizard | ❌ 0 rekordów | ❌ 0 rekordów | ⚠️ Zdefiniowane, ale nieużywane |
| `sigma_feedback` | ✅ zdefiniowane | ✅ używane | ❌ 0 rekordów | ❌ 0 rekordów | ⚠️ Brak testów |
| `sigma_move` | ✅ zdefiniowane | ❌ nieużywane | ❌ 0 rekordów | ❌ 0 rekordów | ⚠️ Zdefiniowane, ale całkowicie nieużywane |

**KLUCZOWE WNIOSKI**:

1. **Case Consistency**: ✅ Wszystkie etykiety używają `snake_case` (małe litery + underscore)
2. **Blocker**: 🔴 `six_sigma` zablokowane przez bug `'kwestionariusz'` w UI
3. **Nieużywane**: `control`, `tracker`, `hrv_training`, `sigma_move` - zdefiniowane w schemacie, ale nie w wizard
4. **Brak testów**: `focus`, `hrv_baseline`, `sigma_feedback` - w wizard, ale nigdy nie wykonane (0 rekordów)

---

### 2.3. Domain Tags

**Zapytanie**: Czy w kodzie używane są jakieś `domain_tags`?

**Wynik**: ❌ **NIE** - brak użycia `domain_tags` w projekcie

**Sprawdzone lokalizacje**:
- `sessionSchemas.ts`: brak pola `domain_tags`
- Baza danych: brak kolumny `domain_tags` w żadnej tabeli
- Frontend: brak wzmianki o `domain_tags` w komponentach

**Możliwa przyszła implementacja** (jeśli potrzebne):
```tsx
// Przykład: Dodanie domain_tags do sesji
export const SessionMetadataSchema = z.object({
  domain_tags: z.array(z.enum([
    'COGNITIVE',      // Testy kognitywne (scan, focus, memo)
    'PHYSIOLOGICAL',  // Pomiary fizjologiczne (HRV)
    'SUBJECTIVE',     // Kwestionariusze (six_sigma, sigma_feedback)
    'PHYSICAL',       // Aktywność fizyczna (sigma_move)
  ])).optional(),
});
```

---

## 3. Zod Schema - Szczegółowa Struktura

### 3.1. Przegląd wszystkich schematów

**Plik**: `src/schemas/sessionSchemas.ts` (243 linie)

**Zawartość**:
- 10 schematów dla różnych typów zadań
- 1 discriminated union (`SessionTaskSchema`)
- 1 funkcja walidacyjna (`validateTaskData`)
- TypeScript type exports

---

### 3.2. Schema 1: SixSigmaResultSchema

**Linie**: 6-32

```tsx
export const SixSigmaResultSchema = z.object({
  validation: z.object({
    isValid: z.boolean(),
    straightLining: z.boolean(),
    reverseInconsistency: z.boolean(),
    speeding: z.boolean(),
  }),
  competencyScores: z.array(z.object({
    id: z.string(),
    name: z.string(),
    rawScore: z.number(),
    normalizedScore: z.number(),
    interpretation: z.string(),
  })),
  modifierScores: z.array(z.object({
    id: z.string(),
    name: z.string(),
    rawScore: z.number(),
    normalizedScore: z.number(),
    impact: z.enum(['positive', 'neutral', 'negative']),
  })),
  overallScore: z.number(),
  responses: z.array(z.object({
    questionId: z.string(),
    value: z.number(),
  })).optional(),
});
```

**Pola Required vs Optional**:

| Pole | Required | Optional | Typ | Opis |
|------|----------|----------|-----|------|
| `validation` | ✅ | | object | Wyniki walidacji odpowiedzi |
| `validation.isValid` | ✅ | | boolean | Czy kwestionariusz jest ważny |
| `validation.straightLining` | ✅ | | boolean | Czy użytkownik odpowiadał zawsze tak samo |
| `validation.reverseInconsistency` | ✅ | | boolean | Niespójność w pytaniach odwróconych |
| `validation.speeding` | ✅ | | boolean | Czy wypełniono zbyt szybko |
| `competencyScores` | ✅ | | array | Wyniki dla kompetencji |
| `competencyScores[].id` | ✅ | | string | ID kompetencji |
| `competencyScores[].name` | ✅ | | string | Nazwa kompetencji |
| `competencyScores[].rawScore` | ✅ | | number | Surowy wynik (1-5) |
| `competencyScores[].normalizedScore` | ✅ | | number | Znormalizowany wynik (0-1) |
| `competencyScores[].interpretation` | ✅ | | string | Interpretacja słowna |
| `modifierScores` | ✅ | | array | Modyfikatory (stress, fatigue, etc.) |
| `modifierScores[].id` | ✅ | | string | ID modyfikatora |
| `modifierScores[].name` | ✅ | | string | Nazwa modyfikatora |
| `modifierScores[].rawScore` | ✅ | | number | Surowy wynik |
| `modifierScores[].normalizedScore` | ✅ | | number | Znormalizowany wynik |
| `modifierScores[].impact` | ✅ | | enum | Wpływ (positive/neutral/negative) |
| `overallScore` | ✅ | | number | Ogólny wynik Six Sigma |
| `responses` | | ✅ | array | **OPCJONALNE** - wszystkie odpowiedzi |
| `responses[].questionId` | | ✅ | string | ID pytania |
| `responses[].value` | | ✅ | number | Odpowiedź (1-5) |

**UWAGA**: Pole `responses` jest **opcjonalne**, co oznacza, że można zapisać tylko agregaty bez surowych odpowiedzi. Dla ML **REKOMENDACJA**: zawsze zapisywać `responses` (trial-level data).

---

### 3.3. Schema 2: ScanGameResultSchema

**Linie**: 36-46

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

**Pola Required vs Optional**:

| Pole | Required | Optional | Nullable | Default | Typ | Opis |
|------|----------|----------|----------|---------|-----|------|
| `scan_max_number_reached` | ✅ | | | | number (≥0) | Najwyższa osiągnięta liczba |
| `scan_duration_s` | ✅ | | | | number (≥0) | Czas gry w sekundach |
| `scan_correct_clicks` | ✅ | | | | number (≥0) | Poprawne kliknięcia |
| `scan_error_clicks` | ✅ | | | | number (≥0) | Błędne kliknięcia |
| `scan_skipped_numbers` | ✅ | | | `[]` | number[] | Pominięte liczby |
| `scan_rmssd_ms` | | ✅ | ✅ | | number | HRV (RMSSD) w milisekundach |
| `scan_avg_hr_bpm` | | ✅ | ✅ | | number | Średnie tętno w BPM |
| `scan_game_completed_at` | | ✅ | | | string (ISO 8601) | Timestamp zakończenia |

**BRAK**: `scan_click_history` (trial-level data) - **REKOMENDACJA**: dodać w przyszłości

---

### 3.4. Schema 3: FocusGameResultSchema

**Linie**: 50-66

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
  focus_accuracy_pct: z.number().min(0).max(100),
  focus_total_trials: z.number().min(0),
  focus_correct_trials: z.number().min(0),
  focus_rmssd_ms: z.number().optional().nullable(),
  focus_avg_hr_bpm: z.number().optional().nullable(),
  focus_game_completed_at: z.string().optional(),
});
```

**Pola Required vs Optional**:

| Pole | Required | Optional | Nullable | Typ | Opis |
|------|----------|----------|----------|-----|------|
| `focus_trials` | ✅ | | | array | **Trial-level data** ✅ |
| `focus_trials[].type` | ✅ | | | enum | 'CONGRUENT' lub 'INCONGRUENT' |
| `focus_trials[].isCorrect` | ✅ | | | boolean | Czy odpowiedź była poprawna |
| `focus_trials[].rt` | ✅ | | | number (≥0) | Reaction time w ms |
| `focus_trials[].trialNumber` | ✅ | | | number (≥1) | Numer próby |
| `focus_median_congruent_ms` | ✅ | | | number (≥0) | Mediana RT dla congruent |
| `focus_median_incongruent_ms` | ✅ | | | number (≥0) | Mediana RT dla incongruent |
| `focus_accuracy_pct` | ✅ | | | number (0-100) | Dokładność w procentach |
| `focus_total_trials` | ✅ | | | number (≥0) | Liczba wszystkich prób |
| `focus_correct_trials` | ✅ | | | number (≥0) | Liczba poprawnych odpowiedzi |
| `focus_rmssd_ms` | | ✅ | ✅ | number | HRV podczas gry |
| `focus_avg_hr_bpm` | | ✅ | ✅ | number | Średnie tętno |
| `focus_game_completed_at` | | ✅ | | string | Timestamp zakończenia |

**✅ MOCNA STRONA**: Pełne trial-level data dla ML (sekwencja RT, types, accuracy)

---

### 3.5. Schema 4: MemoGameResultSchema

**Linie**: 70-85

```tsx
export const MemoGameResultSchema = z.object({
  memo_accuracy_pct: z.number().min(0).max(100),
  memo_median_rt_ms: z.number().min(0),
  memo_total_trials: z.number().min(0),
  memo_correct_responses: z.number().min(0),
  memo_trials: z.array(z.object({
    trial: z.number().min(1),
    rt: z.number().min(0),
    isCorrect: z.boolean(),
    isError: z.boolean().optional(),
  })).optional(),
  memo_rmssd_ms: z.number().optional().nullable(),
  memo_hr_bpm: z.number().optional().nullable(),
  memo_game_completed_at: z.string().optional(),
});
```

**Pola Required vs Optional**:

| Pole | Required | Optional | Nullable | Typ | Opis |
|------|----------|----------|----------|-----|------|
| `memo_accuracy_pct` | ✅ | | | number (0-100) | Dokładność |
| `memo_median_rt_ms` | ✅ | | | number (≥0) | Mediana RT |
| `memo_total_trials` | ✅ | | | number (≥0) | Liczba prób |
| `memo_correct_responses` | ✅ | | | number (≥0) | Poprawne odpowiedzi |
| `memo_trials` | | ✅ | | array | **OPCJONALNE trial-level data** ⚠️ |
| `memo_trials[].trial` | | ✅ | | number (≥1) | Numer próby |
| `memo_trials[].rt` | | ✅ | | number (≥0) | Reaction time |
| `memo_trials[].isCorrect` | | ✅ | | boolean | Poprawność |
| `memo_trials[].isError` | | ✅ | | boolean | Czy błąd |
| `memo_rmssd_ms` | | ✅ | ✅ | number | HRV |
| `memo_hr_bpm` | | ✅ | ✅ | number | Tętno |
| `memo_game_completed_at` | | ✅ | | string | Timestamp |

**⚠️ UWAGA**: `memo_trials` jest **opcjonalne** - REKOMENDACJA: zawsze zapisywać dla ML

---

### 3.6. Schema 5: HRVBaselineSchema

**Linie**: 89-94

```tsx
export const HRVBaselineSchema = z.object({
  hrv_baseline: z.number().min(0),
  hrv_timestamp: z.string(),
  hrv_measurement_duration_s: z.number().optional(),
});
```

**Pola Required vs Optional**:

| Pole | Required | Optional | Typ | Opis |
|------|----------|----------|-----|------|
| `hrv_baseline` | ✅ | | number (≥0) | Wartość HRV baseline |
| `hrv_timestamp` | ✅ | | string (ISO 8601) | Czas pomiaru |
| `hrv_measurement_duration_s` | | ✅ | number | Czas trwania pomiaru w sekundach |

---

### 3.7. Schema 6: HRVTrainingSchema

**Linie**: 98-103

```tsx
export const HRVTrainingSchema = z.object({
  hrv_training: z.number().min(0),
  hrv_timestamp: z.string(),
  hrv_measurement_duration_s: z.number().optional(),
});
```

**Identyczna struktura jak HRVBaselineSchema**, tylko nazwa pola: `hrv_training` zamiast `hrv_baseline`

---

### 3.8. Schema 7: SigmaFeedbackSchema

**Linie**: 107-116

```tsx
export const SigmaFeedbackSchema = z.object({
  feedback_fatigue: z.number().min(1).max(10),
  feedback_stress: z.number().min(1).max(10),
  feedback_sleep_quality: z.number().min(1).max(10),
  feedback_sleep_hours: z.number().min(0).max(24),
  feedback_mood: z.number().min(1).max(10),
  feedback_notes: z.string().optional(),
  feedback_timestamp: z.string(),
});
```

**Pola Required vs Optional**:

| Pole | Required | Optional | Range | Typ | Opis |
|------|----------|----------|-------|-----|------|
| `feedback_fatigue` | ✅ | | 1-10 | number | Poziom zmęczenia |
| `feedback_stress` | ✅ | | 1-10 | number | Poziom stresu |
| `feedback_sleep_quality` | ✅ | | 1-10 | number | Jakość snu |
| `feedback_sleep_hours` | ✅ | | 0-24 | number | Godziny snu |
| `feedback_mood` | ✅ | | 1-10 | number | Nastrój |
| `feedback_notes` | | ✅ | | string | Dodatkowe notatki |
| `feedback_timestamp` | ✅ | | | string | Timestamp |

---

### 3.9. Schema 8: SigmaMoveSchema

**Linie**: 120-129

```tsx
export const SigmaMoveSchema = z.object({
  move_exercise_type: z.string(),
  move_duration_minutes: z.number().min(0),
  move_intensity: z.number().min(1).max(10),
  move_heart_rate_avg: z.number().min(0).optional(),
  move_heart_rate_max: z.number().min(0).optional(),
  move_notes: z.string().optional(),
  move_timestamp: z.string(),
});
```

**Status**: ⚠️ Zdefiniowane, ale **NIE UŻYWANE** w aplikacji

---

### 3.10. Schema 9: ControlGameResultSchema

**Linie**: 133-149

```tsx
export const ControlGameResultSchema = z.object({
  control_go_hits: z.number().min(0),
  control_go_misses: z.number().min(0),
  control_nogo_errors: z.number().min(0),
  control_median_rt_ms: z.number().min(0),
  control_total_trials: z.number().min(0),
  control_trial_history: z.array(z.object({
    trialNumber: z.number(),
    type: z.enum(['Go', 'NoGo']),
    result: z.string(),
    reactionTime: z.number().optional(),
  })).optional(),
  control_rmssd_ms: z.number().optional().nullable(),
  control_avg_hr_bpm: z.number().optional().nullable(),
  control_game_completed_at: z.string().optional(),
});
```

**Status**: Zdefiniowane, ale **NIE W WIZARD** (nie jest częścią MEASUREMENT_SEQUENCE)

---

### 3.11. Schema 10: TrackerGameResultSchema

**Linie**: 153-162

```tsx
export const TrackerGameResultSchema = z.object({
  tracker_level: z.number().min(1),
  tracker_final_score_correct: z.number().min(0),
  tracker_final_score_total: z.number().min(0),
  tracker_mistakes: z.number().min(0),
  tracker_rmssd_ms: z.number().optional().nullable(),
  tracker_avg_hr_bpm: z.number().optional().nullable(),
  tracker_game_completed_at: z.string().optional(),
});
```

**Status**: Zdefiniowane, ale **NIE W WIZARD**

**BRAK**: `tracker_attempt_history` (trial-level data)

---

### 3.12. Discriminated Union: SessionTaskSchema

**Linie**: 167-208

```tsx
export const SessionTaskSchema = z.discriminatedUnion('task_type', [
  z.object({ task_type: z.literal('six_sigma'), task_data: SixSigmaResultSchema }),
  z.object({ task_type: z.literal('scan'), task_data: ScanGameResultSchema }),
  z.object({ task_type: z.literal('focus'), task_data: FocusGameResultSchema }),
  z.object({ task_type: z.literal('memo'), task_data: MemoGameResultSchema }),
  z.object({ task_type: z.literal('control'), task_data: ControlGameResultSchema }),
  z.object({ task_type: z.literal('tracker'), task_data: TrackerGameResultSchema }),
  z.object({ task_type: z.literal('hrv_baseline'), task_data: HRVBaselineSchema }),
  z.object({ task_type: z.literal('hrv_training'), task_data: HRVTrainingSchema }),
  z.object({ task_type: z.literal('sigma_feedback'), task_data: SigmaFeedbackSchema }),
  z.object({ task_type: z.literal('sigma_move'), task_data: SigmaMoveSchema }),
]);
```

**Znaczenie**: Zod automatycznie rozpoznaje typ `task_data` na podstawie `task_type`. To zapewnia **type safety** w TypeScript.

**Przykład użycia**:
```tsx
const task = {
  task_type: 'focus',
  task_data: {
    focus_trials: [...],
    focus_median_congruent_ms: 450,
    // ...
  }
};

// Zod sprawdzi, czy task_data ma wszystkie wymagane pola dla 'focus'
const validated = SessionTaskSchema.parse(task);
// TypeScript wie, że validated.task_data ma typ FocusGameResult
```

---

### 3.13. Funkcja walidacyjna: validateTaskData

**Linie**: 213-228

```tsx
export function validateTaskData(taskType: string, taskData: unknown): {
  success: boolean;
  data?: any;
  error?: string;
} {
  try {
    const validated = SessionTaskSchema.parse({ task_type: taskType, task_data: taskData });
    return { success: true, data: validated.task_data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Validation failed: ${errorMessages}` };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}
```

**Użycie w SessionWizardNew**:
```tsx
const validation = validateTaskData('focus', focusResults);
if (!validation.success) {
  toast.error(`Validation failed: ${validation.error}`);
  return; // Nie zapisuj do bazy
}

// Zapisz zwalidowane dane
await supabase.from('session_tasks').insert({
  session_id: sessionId,
  task_type: 'focus',
  task_data: validation.data
});
```

---

## 4. Podsumowanie dla ML Engineers

### 4.1. Kluczowe tabele

1. **`session_tasks`**: Główne źródło danych dla measurement sessions
2. **`trainings`**: Dane treningowe (pojedyncze gry)
3. **`sessions`**: Metadane sesji (timestamp, athlete_id, conditions)

### 4.2. Najważniejsze kolumny JSONB

- `session_tasks.task_data`: Wszystkie wyniki zadań
- `trainings.results`: Wyniki treningów
- `sessions.conditions`: Kontekst sesji (opcjonalnie JSON)

### 4.3. Required vs Optional pola - Podsumowanie

**Zawsze Required** (nie może być NULL):
- Podstawowe metryki: `{game}_accuracy_pct`, `{game}_median_rt_ms`, etc.
- Liczby prób: `{game}_total_trials`, `{game}_correct_*`
- Timestamps: `{game}_game_completed_at` (większość)

**Zawsze Optional** (może być NULL):
- HRV: `{game}_rmssd_ms`, `{game}_avg_hr_bpm`
- Trial-level data: `memo_trials`, `control_trial_history` (⚠️ POWINNY być required dla ML!)
- Notes: `feedback_notes`, `move_notes`

### 4.4. Case Sensitivity - WSZYSTKO JEST snake_case

✅ **Spójne nazewnictwo**: Wszystkie `task_type` używają `snake_case`:
- `six_sigma`, `sigma_feedback`, `sigma_move`
- `hrv_baseline`, `hrv_training`
- `scan`, `focus`, `memo`, `control`, `tracker`

❌ **Jedyny konflikt**: Bug w UI (`'kwestionariusz'` vs `'six_sigma'`)

### 4.5. Główny Blocker dla ML

🔴 **KRYTYCZNY**: Bug `'kwestionariusz'` → 0 rekordów `six_sigma` w bazie

**Skutek**: 
- Niemożność trenowania modeli predykcyjnych dla Six Sigma scores
- Brak analizy korelacji Six Sigma ↔ game performance
- Brak danych dla feature engineering

**Rozwiązanie**: 1 linijka kodu (zmiana w `AthleteProfile.tsx:1010`)

### 4.6. Dostęp do danych dla ML Pipeline

**Przykład: Eksport wszystkich danych Focus Game**

```sql
SELECT 
  s.date as session_date,
  s.athlete_id,
  st.task_type,
  st.task_data->>'focus_accuracy_pct' as accuracy,
  st.task_data->>'focus_median_congruent_ms' as median_congruent_rt,
  st.task_data->>'focus_median_incongruent_ms' as median_incongruent_rt,
  st.task_data->'focus_trials' as trials_json,
  st.created_at
FROM sessions s
JOIN session_tasks st ON st.session_id = s.id
WHERE st.task_type = 'focus'
  AND s.in_progress = false;
```

**Przykład: Eksport trial-level data (JSON unnest)**

```sql
SELECT 
  s.athlete_id,
  s.date,
  trial->>'trialNumber' as trial_num,
  trial->>'type' as trial_type,
  (trial->>'rt')::float as reaction_time,
  (trial->>'isCorrect')::boolean as is_correct
FROM sessions s
JOIN session_tasks st ON st.session_id = s.id,
LATERAL jsonb_array_elements(st.task_data->'focus_trials') as trial
WHERE st.task_type = 'focus';
```

---

## 5. Najważniejsze rekomendacje

### Dla Data Scientists:

1. 🔴 **PRIORYTET 1**: Zgłoś bug `'kwestionariusz'` → 0 danych Six Sigma
2. ⚠️ **PRIORYTET 2**: Dodać `schema_version` do wszystkich schematów
3. ⚠️ **PRIORYTET 3**: Zmusić frontend do zawsze zapisywania trial-level data (`memo_trials`, `six_sigma.responses`)
4. 💡 **Nice-to-have**: Dodać `scan_click_history`, `tracker_attempt_history`

### Dla Backend Developers:

1. Utworzyć `taskTypes.ts` constants (eliminacja hardcoded strings)
2. Dodać automatyczne device tracking przy tworzeniu sesji
3. Zaimplementować data validation pipeline przed zapisem do bazy

### Dla Frontend Developers:

1. 🔴 Naprawić bug w `AthleteProfile.tsx:1010`
2. Zaimplementować renderowanie raportów w `SessionDetail.tsx`
3. Dodać obsługę przerwania/wznawiania sesji

---

**Koniec raportu technicznego**
