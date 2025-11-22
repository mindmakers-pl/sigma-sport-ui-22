# Six Sigma Questionnaire System - Raport Implementacji

## Podsumowanie

Zaimplementowano kompleksowy system kwestionariuszy Six Sigma zgodnie ze specyfikacją naukową, obejmujący:
- 3 warianty kwestionariuszy (Full, Lite, Mood)
- UI wyboru i wypełniania (Likert 5-stopniowy, child-friendly)
- Algorytm scoringu z detekcją straight-lining
- Widok raportu z heksagonem i interpretacją wyników

## Struktura Kwestionariuszy

### Six Sigma Full (36 pytań + metadane)
- **Kiedy używać**: T0 (baseline) i T-Final (ewaluacja po sezonie)
- **Kompetencje**: Aktywacja, Kontrola, Reset, Fokus, Pewność, Determinacja (6 pytań każda)
- **Triangulacja**: Każda kompetencja ma pytania o Myśli, Ciało, Zachowanie
- **Key Indicators**: Pierwsze pytanie z sekcji ma wagę x1.5 w algorytmie

### Six Sigma Lite (12 pytań)
- **Kiedy używać**: Po każdym Sprincie (co miesiąc)
- **Konstrukcja**: 2 pytania na kompetencję (KI + Walidator Reverse)
- **Cel**: Szybka aktualizacja heksagonu bez survey fatigue

### Six Sigma Mood (6 pytań kontekstowych)
- **Obowiązkowy** w każdym pomiarze
- **Modyfikatory**: Sen, Stres, Zdrowie, Atmosfera, Dieta, Flow
- **Funkcja**: Wyjaśnianie spadków wyników przez czynniki zewnętrzne

## Algorytm Scoringu

### Mechanizm Reversal
```typescript
Wynik = 6 - Odpowiedź  // dla skali 5-stopniowej
```

### Wagi Key Indicators
- KI pytania: waga x1.5
- Pozostałe: waga x1.0

### Normalizacja
```typescript
normalizedScore = ((rawScore - 1) / (maxScore - 1)) * 100
```

### Wykrywacz Kłamstw (Straight-Lining Detection)
- Jeśli wszystkie odpowiedzi identyczne → ALERT
- Jeśli >80% odpowiedzi to ta sama wartość → PODEJRZENIE
- Dzięki pytaniom Reverse bezmyślne klikanie "5" daje ~50% wyniku

## UI/UX Features

### Questionnaire Selector
- Multiple choice kwestionariuszy przed rozpoczęciem
- Mood zawsze zaznaczony (obowiązkowy)
- Tylko jeden główny (Full LUB Lite)
- Wizualne badges wskazujące zastosowanie

### Questionnaire Fill Interface
- **Child-friendly design**: Duże kafelki (80-120px)
- **Likert scale**: 5 przycisków z oznaczeniem krańców
- **Progress bar**: Widoczny postęp
- **Responsive**: Mobilne i desktopowe layouty

### Report Components
- **Hexagon (Radar Chart)**: Profil 6 kompetencji
- **Bar Chart**: Szczegółowe wyniki
- **Interpretacja**: Automatyczne komentarze (wysoki/średni/niski)
- **Mood Modifiers** (widok trenera): Kontekst i ostrzeżenia
- **Warnings**: Automatyczne alerty o czynnikach zewnętrznych

## Integracja z Aplikacją

### Widok "Dodaj Pomiar"
1. Trener wybiera kwestionariusze (Selector)
2. Zawodnik wypełnia kolejno wybrane kwestionariusze
3. Algorytm oblicza wyniki automatycznie
4. Dane zapisywane w `athlete_sessions` w localStorage

### Widok Raportu Sesji
- Nowa karta "Six Sigma" w overview
- Dedykowany widok `/zawodnicy/:id/sesja/:sessionId?task=questionnaire`
- Dwa taby: "Dla zawodnika" | "Dla trenera"

## Funkcje Naukowe

### Triangulacja (Myśli-Ciało-Zachowanie)
Każda kompetencja badana z 3 perspektyw zapewnia spójność pomiaru.

### Walidacja Odpowiedzi
Pytania Reverse wykrywają nierzetelne wypełnianie automatycznie.

### Modyfikatory Kontekstowe
Mood questions pozwalają odróżnić braki kompetencji od zewnętrznych czynników (brak snu, stres, kontuzje).

## Action Points dla Ciebie

### HIGH PRIORITY
1. **Konsultacja prawna**: Zdefiniuj typy zgód (trening, pomiar, badania naukowe)
2. **Decyzja storage**: Czy zgody w app, HubSpot, czy hybrid z n8n sync
3. **Klauzula RODO**: Przygotuj information clause zgodną z polskim prawem

### MEDIUM
4. **Flagowanie jakości danych**: Dodać UI do ręcznego oznaczania sesji problematycznych?
5. **Baseline HRV reminder**: Czy tylko przy pierwszym pomiarze, czy co 4-6 tyg?
6. **Protokół baseline HRV**: Czy oddech rezonansowy obowiązkowy vs recommended?

## Pliki Utworzone

- `src/data/sixSigmaQuestionnaires.ts` - Definicje kwestionariuszy
- `src/utils/sixSigmaScoring.ts` - Algorytm scoringu
- `src/components/forms/QuestionnaireSelector.tsx` - UI wyboru
- `src/components/forms/SixSigmaQuestionnaire.tsx` - UI wypełniania
- `src/components/reports/SixSigmaReport.tsx` - Widok raportu z heksagonem
- `src/utils/generateMockSixSigmaData.ts` - Mock data generator

## Zgodność z DATA_SCIENCE_ARCHITECTURE.md

System spełnia wymagania:
- ✅ Trial-level granularity (każde pytanie zapisane osobno)
- ✅ Metadata capture (device: 'polar_h10', timestamp, measurement_context)
- ✅ Quality flags (straight-lining detection)
- ✅ Consent-ready structure (measurement_context: 'individual' | 'group')
- ✅ PII separation (questionnaire results używają athlete_id, nie imienia)
