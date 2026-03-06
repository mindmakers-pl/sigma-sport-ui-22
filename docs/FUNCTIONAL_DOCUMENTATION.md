# Dokumentacja Funkcjonalna Aplikacji Sigma Sport

---

## 1. ROLE UŻYTKOWNIKÓW

Aplikacja obsługuje 3 role (przełączane przez `localStorage`, brak prawdziwej autentykacji):

| Rola | Nawigacja | Opis |
|------|-----------|------|
| **Trener** (`trainer`) | Kokpit, Zawodnicy, Kluby, Biblioteka, Ustawienia | Domyślna rola. Zarządzanie zawodnikami, sesjami pomiarowymi, klubami |
| **Zawodnik** (`athlete`) | Kokpit (zawodnika), Trening, Ustawienia | Widok dla sportowca - treningi, wyniki |
| **Admin** (`admin`) | Admin, Zawodnicy, Kluby, Biblioteka, Ustawienia | Zarządzanie trenerami, globalny widok |

---

## 2. MAPA TRAS (ROUTING)

```text
/landing                          → Strona marketingowa (Index)
/                                 → Dashboard (Kokpit trenera)
/panel-zawodnika                  → AthletePanel (Kokpit zawodnika)
/panel-admin                      → AdminPanel
/zawodnicy                        → Athletes (lista zawodników)
/zawodnicy/:id                    → AthleteProfile (profil zawodnika)
/zawodnicy/:athleteId/sesja/:sessionId        → SessionDetail
/zawodnicy/:athleteId/sesja/:sessionId/six-sigma → SixSigmaReport
/zawodnicy/:athleteId/trening/:trainingId     → TrainingDetail
/zawodnicy/:athleteId/postepy/:gameType       → ProgressReport
/kluby                            → Clubs (lista klubów)
/kluby/:id                        → ClubDetail (szczegóły klubu)
/kluby/:id/zarzadzaj              → ClubManagement (edycja klubu)
/biblioteka                       → Library
/biblioteka/cwiczenie/:id         → ExerciseDetail
/biblioteka/kwestionariusz/:id    → QuestionnaireDetail
/biblioteka/gry/{scan|control|focus|memo|tracker} → Gry (tryb biblioteki)
/trening                          → Training (widok zawodnika)
/ustawienia                       → Settings
/{scan|control|focus|tracker|memo}/:athleteId  → Gry (tryb pomiarowy/treningowy)
```

---

## 3. INWENTARYZACJA WIDOKÓW

### 3.1 Landing Page (`/landing` → `Index.tsx`)
**Funkcjonalności:** Strona marketingowa - Navbar, Hero, Features, CTA, Footer.
**Backend:** Brak. Strona statyczna.

---

### 3.2 Dashboard / Kokpit Trenera (`/` → `Dashboard.tsx`)
**Funkcjonalności:**
- Statystyki: liczba aktywnych zawodników, klubów, treningów w tygodniu (hardcoded: "48"), średnia wydajność (hardcoded: "87%")
- Szybkie akcje: Dodaj zawodnika (nawigacja do `/zawodnicy`), Dodaj klub (nawigacja do `/kluby`)
- Rozpocznij pomiar: wyszukiwarka zawodników z autokompletacją, nawigacja do `zawodnicy/:id?tab=dodaj-pomiar`
- Ostatnia aktywność: hardcoded lista 3 pozycji
- Lista "Moje kluby" (pierwsze 3)
- Sekcja "Spostrzeżenia" - placeholder na AI

**Backend (hooki):**
- `useAthletes()` → `supabase.from('athletes').select('*')`
- `useClubs()` → `supabase.from('clubs').select('*')`

---

### 3.3 Panel Zawodnika (`/panel-zawodnika` → `AthletePanel.tsx`)
**Funkcjonalności:**
- Statystyki: sesje w miesiącu (z DB), średni HRV (hardcoded: "68"), dni treningowe (hardcoded: "12"), osiągnięcia (hardcoded: "5")
- Lista ostatnich sesji (5 najnowszych)
- Dostępne wyzwania: Scan, Control, Focus, Tracker

**Backend:**
- `useSessions(mockAthleteId)` → `supabase.from('sessions').select('*').eq('athlete_id', ...)`
- ⚠️ UWAGA: używa hardcoded `mockAthleteId = "athlete-1"` - nie działa z prawdziwymi danymi

---

### 3.4 Panel Admin (`/panel-admin` → `AdminPanel.tsx`)
**Funkcjonalności:**
- Statystyki: liczba trenerów, zawodników, klubów
- Lista trenerów z możliwością dodawania (Dialog: imię, email, telefon)
- Skróty nawigacyjne do Zawodników, Klubów, Biblioteki

**Backend:**
- `useTrainers()` → `supabase.from('trainers').select('*')` + `insert`
- `useAthletes()` → `supabase.from('athletes').select('*')`
- `useClubs()` → `supabase.from('clubs').select('*')`

---

### 3.5 Lista Zawodników (`/zawodnicy` → `Athletes.tsx`, 712 linii)
**Funkcjonalności:**
- Tabela zawodników z paginacją (10/stronę)
- Wyszukiwanie po imieniu/nazwisku
- Filtry: klub, dyscyplina
- Dodawanie zawodnika (Dialog z polami: imię*, nazwisko*, email, telefon, klub, trener, dyscyplina, płeć, data urodzenia, notatki, dane rodzica/opiekuna)
- Tryb selekcji: zaznaczanie wielu → archiwizacja / przywracanie
- Przełączanie widoku: aktywni / zarchiwizowani
- Kliknięcie w wiersz → nawigacja do `/zawodnicy/:id`

**Backend:**
- `useAthletes()` → `.select('*')`, `.insert()`, `.update({ archived: true })`, `.update({ archived: false })`
- `useClubs()` → `.select('*')` (do filtrów i listy trenerów klubu)

---

### 3.6 Profil Zawodnika (`/zawodnicy/:id` → `AthleteProfile.tsx`, 2068 linii)

Najbardziej złożony widok aplikacji. Zawiera 6 zakładek (tabs):

#### Tab: Informacje (`?tab=informacje`)
- Wyświetlanie danych zawodnika (imię, klub, trener, dyscyplina, kontakt, dane rodzica)
- Edycja profilu (Dialog z formularzem)
- Historia notatek: dodawanie, edycja, usuwanie notatek z timestampem

#### Tab: Dodaj Pomiar (`?tab=dodaj-pomiar`)
- "Kokpit pomiarowy" z sekwencją 6 zadań: `six_sigma → hrv_baseline → scan → focus → memo → sigma_feedback`
- Automatyczne wznawianie niezakończonych sesji (`in_progress === true`)
- Wybór warunków pomiaru (gabinet/boisko/etc.)
- Po zakończeniu każdego zadania → auto-save do DB → przejście do następnego
- Każde zadanie renderuje odpowiedni komponent (QuestionnaireSelector + QuestionnaireRunner, HRVBaselineForm, ScanGame, FocusGame, MemoGame, SigmaFeedbackForm)
- Finalizacja sesji: oznacza `in_progress: false`, `completed_at`
- Alternatywny tryb: SessionWizardNew (wizard)

#### Tab: Trening (`?tab=trening`)
- Lista treningów z tabelą (TrainingsTable)
- Wybór gry treningowej: scan, control, focus, memo, tracker
- Renderowanie wybranej gry w trybie treningowym
- Po ukończeniu gry → zapis do tabeli `trainings`

#### Tab: Raporty (`?tab=raporty`)
- Pod-zakładki: sigma-score, hrv, focus, scan, memo
- Wykresy (RadarChart, BarChart, LineChart) z danych sesji
- Filtrowanie po warunkach i benchmarkach
- Porównanie dwóch sesji (A vs B)
- Nawigacja do szczegółów sesji i raportów postępów

#### Tab: Porównanie (`?tab=porownanie`)
- Wybór dwóch sesji do porównania
- Wykresy porównawcze

#### Tab: Sigma Score (`?tab=sigma-score`)
- Interpretacja AI (przez edge function `analyze-sigma-score`)

**Backend:**
- `useAthletes()` → `.select('*')`, `.update()` (profil, notatki)
- `useSessions(id)` → `.select('*')`, `.insert()`, `.update()` (sesje pomiarowe)
- `useTrainings(id)` → `.select('*')`, `.insert()` (treningi)
- `useClubs()` → `.select('*')` (dane klubu)
- `validateTaskData()` → walidacja Zod z `sessionSchemas.ts`
- Edge Function: `analyze-sigma-score` (Gemini API)

---

### 3.7 Szczegóły Sesji (`/zawodnicy/:athleteId/sesja/:sessionId` → `SessionDetail.tsx`, 1528 linii)
**Funkcjonalności:**
- Przegląd zakończonej sesji pomiarowej
- Lista zakończonych zadań (z `session.results`)
- Raporty per zadanie: FocusGameReport, ScanGameReport, MemoGameReport
- Generowanie interpretacji Sigma Score (AI via edge function)
- Nawigacja do pełnego raportu Six Sigma

**Backend:**
- `useSessions(athleteId)` → `.select('*')`
- `useSessionTasks(sessionId)` → `supabase.from('session_tasks').select('*').eq('session_id', ...)`
- `useAthletes()` → `.select('*')`
- Edge Function: `analyze-sigma-score`

---

### 3.8 Raport Six Sigma (`/zawodnicy/:athleteId/sesja/:sessionId/six-sigma` → `SixSigmaReport.tsx`, 773 linii)
**Funkcjonalności:**
- Pełny raport kwestionariusza Six Sigma
- Wyniki kompetencji z interpretacją
- Walidacja danych (straight-lining, speeding, reverse inconsistency)
- Wyniki modyfikatorów kontekstowych
- Eksport danych

**Backend:**
- `useSessions(athleteId)` → dane sesji
- `useAthletes()` → dane zawodnika

---

### 3.9 Szczegóły Treningu (`/zawodnicy/:athleteId/trening/:trainingId` → `TrainingDetail.tsx`, 203 linii)
**Funkcjonalności:**
- Wyświetlanie wyników pojedynczego treningu
- Raporty per gra: FocusGameReport, ScanGameReport, MemoGameReport, ControlGameReport, TrackerGameReport
- Eksport JSON i CSV

**Backend:**
- `useTrainings(athleteId)` → `.select('*')`

---

### 3.10 Raport Postępów (`/zawodnicy/:athleteId/postepy/:gameType` → `ProgressReport.tsx`, 394 linii)
**Funkcjonalności:**
- Porównanie wyników wielu treningów tego samego typu (np. wszystkie Focus)
- Wykresy trendu (LineChart)
- Opcjonalne filtrowanie po wybranych ID treningów (query param `ids`)
- Eksport danych

**Backend:**
- `useTrainings(athleteId)` → `.select('*')` filtrowane po `task_type`

---

### 3.11 Lista Klubów (`/kluby` → `Clubs.tsx`, 172 linii)
**Funkcjonalności:**
- Lista klubów jako karty
- Dodawanie klubu (Dialog: nazwa, miasto, dyscypliny)
- Liczba członków klubu (liczona z tabeli athletes po `club_id`)
- Kliknięcie → nawigacja do `/kluby/:id`

**Backend:**
- `useClubs()` → `.select('*')`, `.insert()`
- `useAthletes()` → `.select('*')` (do zliczania członków)

---

### 3.12 Szczegóły Klubu (`/kluby/:id` → `ClubDetail.tsx`, 1628 linii)
**Funkcjonalności:**
- Zakładki: Zawodnicy, Sigma Teams (Go, Sprints, Pro), Statystyki
- Tab Zawodnicy: tabela z filtrowaniem, dodawanie zawodnika do klubu, archiwizacja
- Tab Sigma Teams Go: scenariusz treningowy z 12 spotkaniami, konspekty ćwiczeń, uruchamianie gier (ScanGame, FocusGame, ControlGame)
- Tab Sigma Teams Sprints: moduły tematyczne
- Tab Statystyki: wykresy, porównania sesji

**Backend:**
- `useClubs()` → `.select('*')`, `.update()`
- `useAthletes()` → `.select('*')`, `.insert()`, archiwizacja
- Dane treningowe z `libraryData.ts` (statyczne)

---

### 3.13 Zarządzanie Klubem (`/kluby/:id/zarzadzaj` → `ClubManagement.tsx`, 613 linii)
**Funkcjonalności:**
- Edycja nazwy, miasta, dyscyplin klubu
- Zarządzanie trenerami klubu (dodawanie/usuwanie z `coaches` JSONB)
- Zakupione programy (Sigma Teams Go, Sprints, Pro) - przełączniki
- Notatki klubu

**Backend:**
- `useClubs()` → `.select('*')`, `.update()`

---

### 3.14 Biblioteka (`/biblioteka` → `Library.tsx`, 372 linii)
**Funkcjonalności:**
- 4 zakładki: Scenariusze treningów, Wyzwania, Ćwiczenia, Kwestionariusze
- Scenariusze: 6 modułów treningowych (dane statyczne)
- Wyzwania: 5 gier (Scan, Control, Focus, Memo, Tracker) → nawigacja do `/biblioteka/gry/:game`
- Ćwiczenia: 8 ćwiczeń z filtrami moduł/strategia → nawigacja do `/biblioteka/cwiczenie/:id`
- Kwestionariusze: 3 kwestionariusze Six Sigma (Full, Lite, Mood) → nawigacja do `/biblioteka/kwestionariusz/:id`

**Backend:** Brak. Wszystkie dane statyczne z `libraryData.ts` i `sixSigmaQuestionnaires.ts`.

---

### 3.15 Szczegóły Ćwiczenia (`/biblioteka/cwiczenie/:id` → `ExerciseDetail.tsx`, 505 linii)
**Funkcjonalności:** Opis ćwiczenia, kroki, wskazówki trenerskie, sprzęt. Dane hardcoded.
**Backend:** Brak.

---

### 3.16 Szczegóły Kwestionariusza (`/biblioteka/kwestionariusz/:id` → `QuestionnaireDetail.tsx`, 351 linii)
**Funkcjonalności:** Podgląd i interaktywne wypełnienie kwestionariusza Six Sigma (Full, Lite, Mood). Losowa kolejność pytań. Wyświetlanie wyników po ukończeniu.
**Backend:** Brak. Dane z `sixSigmaQuestionnaires.ts`.

---

### 3.17 Trening - widok zawodnika (`/trening` → `Training.tsx`, 176 linii)
**Funkcjonalności:** Lista dostępnych gier treningowych (Scan, Control, Focus, Tracker). Historia treningów (hardcoded). Nawigacja do gry.
**Backend:** Brak (hardcoded historia).

---

### 3.18 Ustawienia (`/ustawienia` → `Settings.tsx`, 172 linii)
**Funkcjonalności:** Formularz profilu (imię, nazwisko, email, telefon). Preferencje powiadomień (przełączniki).
**Backend:** Brak. Dane w `localStorage`.

---

### 3.19 Gry kognitywne (5 gier)

| Gra | Komponent | Hook | Opis |
|-----|-----------|------|------|
| Sigma Scan | `ScanGame.tsx` | inline logic | Szybkość percepcji, reakcja wzrokowo-ruchowa |
| Sigma Control | `ControlGame.tsx` | `useControlGame.ts` | Kontrola impulsów, Go/No-Go |
| Sigma Focus | `FocusGame.tsx` | `useFocusGame.ts` | Test Stroopa, koncentracja |
| Sigma Memo | `MemoGame.tsx` | `useBackGame.ts` | N-Back, pamięć robocza |
| Sigma Tracker | `TrackerGame.tsx` | `useTrackerGame.ts` | Śledzenie wielu obiektów |

Każda gra może działać w 3 kontekstach:
- **Biblioteka** (brak `athleteId`) → tylko podgląd/demo, bez zapisu
- **Pomiar** (`athleteId` + `mode=measurement`) → zapis do `sessions.results`
- **Trening** (`athleteId` + `mode=training`) → zapis do tabeli `trainings`

**Backend (tryb treningowy/pomiarowy):**
- `supabase.from('trainings').insert()` (trening)
- `supabase.from('sessions').update()` (pomiar, przez AthleteProfile)

---

## 4. ŚCIEŻKI UŻYTKOWNIKA

### 4.1 Trener: Przeprowadzenie sesji pomiarowej
```text
/ (Dashboard)
  → Wyszukaj zawodnika w "Rozpocznij pomiar"
  → /zawodnicy/:id?tab=dodaj-pomiar
  → Wybierz warunki pomiaru
  → Rozpocznij sekwencję:
    1. Kwestionariusz Six Sigma (QuestionnaireSelector → QuestionnaireRunner)
    2. HRV Baseline (HRVBaselineForm)
    3. Sigma Scan (ScanGame, mode=measurement)
    4. Sigma Focus (FocusGame, mode=measurement)
    5. Sigma Memo (MemoGame, mode=measurement)
    6. Sigma Feedback (SigmaFeedbackForm)
  → Auto-save po każdym kroku
  → Zakończ sesję
  → /zawodnicy/:id?tab=raporty
```

### 4.2 Trener: Przeglądanie raportów
```text
/ (Dashboard)
  → /zawodnicy → /zawodnicy/:id?tab=raporty
  → Wybierz sesję → /zawodnicy/:athleteId/sesja/:sessionId
  → Generuj interpretację AI
  → /zawodnicy/:athleteId/sesja/:sessionId/six-sigma (pełny raport)
```

### 4.3 Trener: Zarządzanie klubem
```text
/ → /kluby → /kluby/:id
  → Tab "Zawodnicy": dodaj/archiwizuj zawodników
  → Tab "Sigma Teams": konspekty treningów, uruchamianie gier
  → /kluby/:id/zarzadzaj: edycja danych klubu, trenerzy, programy
```

### 4.4 Trener: Sesja treningowa zawodnika
```text
/zawodnicy/:id?tab=trening
  → Wybierz grę (np. Focus)
  → Gra się uruchamia w trybie treningowym
  → Po zakończeniu → zapis do tabeli `trainings`
  → Widok historii treningów (TrainingsTable)
  → /zawodnicy/:athleteId/postepy/:gameType (raport postępów)
```

### 4.5 Zawodnik: Samodzielny trening
```text
/panel-zawodnika
  → /trening
  → Wybierz wyzwanie → /{game}/training
  → Gra się uruchamia
```

### 4.6 Admin: Zarządzanie systemem
```text
/panel-admin
  → Dodaj trenera (Dialog)
  → Nawigacja do /zawodnicy, /kluby, /biblioteka
```

---

## 5. BACKEND: TABELE I OPERACJE

| Tabela | Operacje | Używana przez |
|--------|----------|---------------|
| `athletes` | SELECT, INSERT, UPDATE (archive/restore), DELETE | useAthletes → Dashboard, Athletes, AthleteProfile, ClubDetail, AdminPanel |
| `sessions` | SELECT (by athlete_id), INSERT, UPDATE (results, in_progress, completed_at), DELETE | useSessions → AthleteProfile, SessionDetail, SixSigmaReport, AthletePanel |
| `session_tasks` | SELECT (by session_id), INSERT, UPDATE, DELETE | useSessionTasks → SessionDetail |
| `trainings` | SELECT (by athlete_id), INSERT, UPDATE, DELETE | useTrainings → AthleteProfile, TrainingDetail, ProgressReport |
| `clubs` | SELECT, INSERT, UPDATE, DELETE | useClubs → Dashboard, Athletes, Clubs, ClubDetail, ClubManagement, AthleteProfile |
| `trainers` | SELECT, INSERT, UPDATE, DELETE | useTrainers → AdminPanel |
| `user_roles` | (ma RLS ale nie jest używana w kodzie frontendu) | Brak użycia |

### Edge Functions
| Funkcja | Endpoint | Opis | Używana przez |
|---------|----------|------|---------------|
| `analyze-sigma-score` | POST | Analiza AI (Gemini) danych sesji. Generuje interpretację Six Sigma. | SessionDetail.tsx |

---

## 6. DANE STATYCZNE (bez backendu)

| Plik | Zawartość | Używany przez |
|------|-----------|---------------|
| `libraryData.ts` | Ćwiczenia, scenariusze treningów, kwestionariusze (metadata), sprinty Sigma Teams | Library, ExerciseDetail, ClubDetail |
| `sixSigmaQuestionnaires.ts` | Pełna definicja 3 kwestionariuszy Six Sigma (pytania, skale, kompetencje) | QuestionnaireDetail, QuestionnaireRunner |
| `sixSigmaScoring.ts` | Logika scoringowa kwestionariuszy (walidacja, normalizacja, interpretacja) | Powinien być używany przez QuestionnaireRunner, ale **aktualnie nie jest wywoływany** |
| `sessionSchemas.ts` | Schematy walidacji Zod dla danych sesji | AthleteProfile (validateTaskData) |

---

## 7. UWAGI KRYTYCZNE

1. **Brak autentykacji** - role przełączane przez `localStorage`, tabele mają RLS "Allow anon" z `true` - zero bezpieczeństwa
2. **AthletePanel** używa hardcoded `mockAthleteId` - nie działa z prawdziwymi danymi
3. **Settings** zapisuje dane do `localStorage`, nie do bazy
4. **Dashboard** - statystyki "Treningi w tym tygodniu" (48) i "Średnia wydajność" (87%) są hardcoded
5. **scoreQuestionnaire()** z `sixSigmaScoring.ts` nie jest wywoływany - dane kwestionariuszy nie są scorowane
6. **session_tasks** - tabela istnieje w DB, ale jest używana tylko do odczytu w SessionDetail; zadania sesji są zapisywane jako JSON w `sessions.results`
