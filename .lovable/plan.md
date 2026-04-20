

## Dokument: Konspekty + Schemat bazy danych (Markdown)

Stworzę plik `docs/KONSPEKTY_AND_DB_SCHEMA.md` zawierający kompletną zawartość konspektów ćwiczeń i programów Sigma Teams wraz z systemem tagowania i propozycją struktury bazy danych.

### Zawartość dokumentu

**Sekcja 1: Inwentaryzacja zawartości (źródło: `src/data/libraryData.ts`)**

1. **Biblioteka Ćwiczeń** (9 ćwiczeń, `ex-1` do `ex-9`)
   - Pełna treść: `Oddech Rezonansowy`, `Body Scan`, `Semafor`, `Rozpoznawanie rozproszeń`, `Zauważam i wracam`, `Koncentracja progresywna`, `Skrypt AUN`, `Reset Emocjonalny`, `Wizualizacja sukcesu`
   - Każde ćwiczenie zawiera: `id`, `title`, `description`, `duration`, `category`, `objective`, `equipment[]`, `steps[{title, content}]`, `coachingTips[]`, `adaptations{easier, harder}`, `metrics[]`

2. **Gry kognitywne** (5 gier, `game-scan`, `game-focus`, `game-control`, `game-memo`, `game-tracker`)
   - Metadata + instrukcje + cel pomiarowy

3. **Programy Sigma Teams**
   - **Sigma Go!** (`sigma-go-demo`) — 60-min trening demonstracyjny, 9 kroków, training guidance
   - **Sigma Sprint 1: Trening Uwagi** (status: completed, 5 spotkań `m1-1` … `m1-5`)
   - **Sigma Sprint 2: Kontrola Impulsów** (status: in-progress, 5 spotkań `m2-1` … `m2-5`)
   - **Sigma Sprint 3: Trening Wyobrażeniowy** (status: planned, 5 spotkań `m3-1` … `m3-5`)
   - **Sigma Pro** (placeholder — w kodzie tylko zakładka, brak danych)
   - Każde spotkanie: `goal`, `steps[]`, `relatedExercises[]`, opcjonalnie `trainingGuidance`, `isMeasurement` (flaga sesji pomiarowej)

4. **Kwestionariusze** (3): `six_sigma_full`, `six_sigma_lite`, `six_sigma_mood`

**Sekcja 2: System tagowania**

Zaproponuję ujednolicony słownik tagów rozdzielony na osie:

| Oś tagowania | Wartości | Zastosowanie |
|---|---|---|
| `category` | `breathing`, `focus`, `control`, `visualization`, `game`, `assessment` | Typ ćwiczenia |
| `competency` | `attention`, `inhibition`, `working_memory`, `arousal_regulation`, `emotional_control`, `imagery` | Mapowanie do Six Sigma |
| `intensity` | `low`, `medium`, `high` | Obciążenie kognitywne |
| `context` | `pre_competition`, `in_competition`, `recovery`, `daily_practice`, `team`, `individual` | Moment stosowania |
| `age_group` | `youth_u14`, `junior_14_18`, `senior_18plus` | Grupa docelowa |
| `equipment_required` | `none`, `cards`, `app`, `mat`, `timer` | Wymagany sprzęt |
| `program` | `sigma_go`, `sigma_sprint_1`, `sigma_sprint_2`, `sigma_sprint_3`, `sigma_pro` | Przynależność do programu |
| `module` | `attention_training`, `impulse_control`, `imagery_training` | Moduł tematyczny |

Każde z 9 ćwiczeń + 5 gier + 15 spotkań sprintów + Sigma Go będzie w dokumencie otagowane wg powyższych osi.

**Sekcja 3: Proponowany schemat bazy danych**

Tabele do utworzenia (jako rekomendacja, bez wykonywania migracji):

```text
exercises
  id (uuid, pk)
  slug (text, unique)              -- np. 'ex-1', 'game-scan'
  title (text)
  description (text)
  duration_text (text)             -- '5-10 min'
  duration_min (int), duration_max (int)
  category (text)                  -- enum
  objective (text)
  equipment (text[])
  coaching_tips (text[])
  adaptation_easier (text)
  adaptation_harder (text)
  metrics (text[])
  is_game (bool)                   -- true dla game-*
  game_component (text, nullable)  -- 'ScanGame', 'FocusGame'...
  created_at, updated_at

exercise_steps
  id (uuid, pk)
  exercise_id (uuid, fk -> exercises)
  order_index (int)
  title (text)
  content (text)

tags
  id (uuid, pk)
  axis (text)                      -- 'category', 'competency', etc.
  value (text)                     -- 'breathing', 'attention'...
  label_pl (text)
  unique(axis, value)

exercise_tags
  exercise_id (uuid, fk)
  tag_id (uuid, fk)
  pk(exercise_id, tag_id)

programs
  id (uuid, pk)
  slug (text)                      -- 'sigma-go', 'sigma-sprint-1'...
  title (text)
  description (text)
  type (text)                      -- 'demo', 'sprint', 'pro'
  total_meetings (int)
  duration_text (text)
  training_guidance (text)
  order_index (int)

meetings
  id (uuid, pk)
  program_id (uuid, fk -> programs)
  slug (text)                      -- 'm1-1', 'm2-3'...
  order_index (int)
  title (text)
  goal (text)
  is_measurement (bool)
  training_guidance (text, nullable)
  default_status (text)            -- 'completed','in-progress','planned' (template)

meeting_steps
  id (uuid, pk)
  meeting_id (uuid, fk)
  order_index (int)
  content (text)                   -- pełna treść kroku z numeracją

meeting_exercises                  -- M:N meeting <-> exercise (relatedExercises)
  meeting_id (uuid, fk)
  exercise_id (uuid, fk)
  order_index (int)
  pk(meeting_id, exercise_id)

club_program_meetings              -- konkretne instancje per klub (planowane daty, ukończenie)
  id (uuid, pk)
  club_id (uuid, fk -> clubs)
  meeting_id (uuid, fk -> meetings)
  scheduled_date (timestamptz, nullable)
  completed_at (timestamptz, nullable)
  notes (text)
```

Dla każdej tabeli: notatka o wymaganych RLS policies (po wprowadzeniu auth) — `exercises`, `programs`, `meetings`, `tags` jako globalna biblioteka (SELECT dla wszystkich `authenticated`), `club_program_meetings` z policy `club_member` (po wdrożeniu `user_roles`).

**Sekcja 4: Mapping źródło → tabela**

Tabela pokazująca, skąd w obecnym kodzie pochodzi każde pole (`libraryData.ts → exercises`, `Sprint.meetings → meetings`, `Meeting.outline.relatedExercises → meeting_exercises`).

**Sekcja 5: Plan migracji danych**

Krótka instrukcja: jak wyeksportować obecne dane statyczne z `libraryData.ts` do INSERT-ów SQL — bez wykonywania, tylko opis.

### Output

Plik: `docs/KONSPEKTY_AND_DB_SCHEMA.md` (pojedynczy plik markdown w repo, ~1500-2000 linii ze względu na pełną treść 9 konspektów ćwiczeń + 16 spotkań).

### Co NIE wchodzi w zakres

- Brak wykonywania migracji SQL (tylko propozycja schematu w dokumencie)
- Brak refactoru `libraryData.ts`
- Brak zmian w UI

