# Architektura Danych dla Data Science
## Dokumentacja Standardów Prywatności, Bezpieczeństwa i Potencjału Naukowego

**Data utworzenia:** 2025-11-22  
**Wersja:** 1.0  
**Status:** Implementacja w toku

---

## 1. Executive Summary

System **SigmaTest** został zaprojektowany z myślą o:
- **Prywatności i bezpieczeństwie danych osobowych** zgodnie z RODO/GDPR
- **Jakości danych naukowych** umożliwiającej publikacje akademickie
- **Separacji PII** (Personally Identifiable Information) od danych pomiarowych
- **Powtarzalności i dokumentacji** procedur pomiarowych

---

## 2. Separacja Danych Osobowych (PII) od Danych Pomiarowych

### 2.1 Struktura Danych Zawodnika (Athlete Profile)

**Tabela: `athlete_profiles`** *(dane osobowe - dostęp ograniczony)*

```typescript
{
  id: string,                    // UUID, klucz główny
  firstName: string,             // Imię (osobno)
  lastName: string,              // Nazwisko (osobno)
  gender: 'male' | 'female' | 'other',
  birthDate: Date,
  email: string,
  phone: string,
  club: string,
  coach: string,
  discipline: string,
  
  // Dane rodzica/opiekuna (osobno)
  parentFirstName: string,
  parentLastName: string,
  parentPhone: string,
  parentEmail: string,
  
  // Metadata
  createdAt: Date,
  archived: boolean,
  notes: string                  // Notatki trenera (prywatne)
}
```

**Kluczowe decyzje architektoniczne:**
- ✅ Imię i nazwisko przechowywane osobno (nie jako jedno pole `name`)
- ✅ Dane rodzica rozdzielone na `firstName` / `lastName`
- ✅ Płeć (gender) jako pole wymagane dla demografii
- ✅ Data urodzenia pełna (nie tylko rok) dla precyzyjnych analiz wiekowych

---

### 2.2 Struktura Danych Pomiarowych (Measurement Sessions)

**Tabela: `measurement_sessions`** *(dane pomiarowe - eksportowalne z ID)*

```typescript
{
  session_id: string,            // UUID
  athlete_id: string,            // Referencja do athlete_profiles (TYLKO ID)
  
  // Metadata sesji
  date: Date,
  measurement_context: 'individual' | 'group',  // NOWE POLE
  device: 'polar_h10',                          // Zahardcodowane
  
  // Kontekst przedpomiarowy (kwestionariusz)
  pre_questionnaire: {
    wellbeing: 1-5,
    motivation: 1-5,
    stress: 1-5,
    measurement_context: 'individual' | 'group',
    timestamp: Date
  },
  
  // Baseline HRV
  baseline_hrv: {
    hrv_max: number,
    hr_mean: number,
    rmssd_mean: number,
    device: 'polar_h10',
    protocol: '3min_resting_baseline',
    breathing_instruction: 'resonant_breathing_recommended',
    timestamp: Date
  },
  
  // Wyniki gier (trial-level data)
  scan_results: { trials: [...], summary: {...} },
  control_results: { trials: [...], summary: {...} },
  focus_results: { trials: [...], summary: {...} },
  
  // HRV podczas treningu
  hrv_training: {
    hr_data: [...],
    rmssd_data: [...],
    device: 'polar_h10'
  },
  
  // Status
  completedAt: Date,
  inProgress: boolean
}
```

**Kluczowe decyzje:**
- ✅ **Separacja PII**: Brak imienia/nazwiska w rekordach pomiarowych
- ✅ **ID-based linking**: Powiązanie przez `athlete_id` (UUID)
- ✅ **Trial-level granularity**: Każda próba zapisana osobno (nie tylko agregaty)
- ✅ **Device tracking**: Polar H10 zahardcodowane jako urządzenie referencyjne
- ✅ **Measurement context**: Flagowanie pomiaru indywidualnego vs grupowego
- ✅ **Temporal metadata**: Każdy pomiar ma timestamp

---

### 2.3 Struktura Danych Treningowych

**Tabela: `training_sessions`** *(dane treningowe - mniej restrykcyjne)*

```typescript
{
  training_id: string,
  athlete_id: string,            // Referencja tylko przez ID
  game_type: 'scan' | 'control' | 'focus',
  date: Date,
  results: {
    trials: [...],               // Trial-level data
    summary: {...}
  },
  completedAt: Date
}
```

---

## 3. Eksport Danych - Prywatność i Anonimizacja

### 3.1 Polityka Eksportu

**JSON / CSV / PDF exports:**
```json
{
  "athlete_id": "550e8400-e29b-41d4-a716-446655440000",
  "session_id": "...",
  "date": "2025-11-22T14:30:00Z",
  "measurement_context": "individual",
  
  // BRAK: firstName, lastName, parentName, parentEmail, phone
  
  "focus_median_rt_ms": 523,
  "focus_accuracy_pct": 92.5,
  "focus_interference_cost_ms": 47,
  // ... inne metryki
}
```

**Zasady:**
- ❌ **Nigdy nie eksportuj PII** w plikach JSON/CSV/PDF
- ✅ **Używaj tylko ID** jako identyfikatora
- ✅ **Flat metric naming**: `{game}_{metric}_{unit}` (np. `focus_median_rt_ms`)
- ✅ **Timestampy w ISO 8601**: Dla kompatybilności międzynarodowej

---

### 3.2 Dostęp do Pełnych Danych

**Dostęp trenerski (w aplikacji):**
- Trener widzi **pełne imię i nazwisko** w interfejsie
- Eksport zawiera **tylko ID**
- Mapowanie ID → imię/nazwisko **tylko w aplikacji** (nie w eksportach)

**Dostęp do data science:**
- Badacze otrzymują **de-identified dataset** (tylko ID)
- Osobno: **demographic table** z minimalnym zestawem (wiek, płeć, dyscyplina)
- **Brak możliwości re-identyfikacji** bez klucza mapowania

---

## 4. Standardy Data Science

### 4.1 Trial-Level Granularity

**Przykład: Sigma Focus (Stroop Test)**

```typescript
{
  trial_id: 1,
  trial_type: 'congruent' | 'incongruent',
  stimulus_word: 'CZERWONY',
  stimulus_color: 'red',
  user_response: 'red',
  correct: true,
  reaction_time_ms: 487,
  timestamp_relative_ms: 1234,
  timestamp_absolute: Date
}
```

**Dlaczego trial-level?**
- ✅ Możliwość późniejszej re-analizy (nowe algorytmy)
- ✅ Detekcja anomalii (outliers per trial, nie tylko agregaty)
- ✅ Time-series analysis (fatigue detection)
- ✅ Porównania z literaturą naukową (publikacje wymagają raw data)

---

### 4.2 Metadata Każdego Pomiaru

**Obowiązkowe pola:**
```typescript
{
  device: 'polar_h10',
  protocol: '3min_resting_baseline',
  measurement_context: 'individual' | 'group',
  timestamp: ISO8601,
  app_version: string,
  calibration_status: boolean
}
```

---

### 4.3 Quality Flags (PLANOWANE - DO IMPLEMENTACJI)

```typescript
{
  data_quality_flag: 'valid' | 'questionable' | 'invalid',
  quality_notes: string,
  outlier_detection: {
    rt_outliers_removed: number,
    method: 'iqr' | 'z-score'
  }
}
```

**ACTION POINT 1:** Dodać system flagowania jakości danych przez trenera
- [ ] UI checkbox "Pomiar zakłócony / warunki niestandardowe"
- [ ] Pole tekstowe dla notatek o warunkach pomiaru
- [ ] Automatyczna detekcja outlierów (IQR method)

---

### 4.4 Environmental Metadata (PLANOWANE)

```typescript
{
  environmental: {
    temperature_celsius: number,
    noise_level: 'quiet' | 'moderate' | 'noisy',
    time_of_day: 'morning' | 'afternoon' | 'evening'
  }
}
```

**ACTION POINT 2:** Rozszerzyć kwestionariusz przedpomiarowy o:
- [ ] Pytanie: "Jak długo spałeś ostatniej nocy?" (sleep_hours: number)
- [ ] Pytanie: "Co jadłeś w ciągu ostatnich 3 godzin?" (recent_meal: string)
- [ ] Pytanie: "Czy czujesz się zmęczony?" (fatigue_level: 1-5)

**UWAGA:** Nie może być 40 pytań dla dzieci ani długie listy dla trenera w pomiarze grupowym!

**Rekomendacja:**
- **Pomiar indywidualny**: Zawodnik wypełnia 5-7 pytań kontrolnych (krótki kwestionariusz)
- **Pomiar grupowy**: Trener zaznacza TYLKO kontekst ("trening w klubie") + opcjonalnie jedną flagę "warunki niestandardowe"
- **Baseline**: Pytania demograficzne (wiek, płeć) zbierane przy rejestracji zawodnika, NIE przy każdej sesji

---

## 5. HRV Baseline - Protokół

### 5.1 Obecny Protokół

```
Czas trwania: 3 minuty
Urządzenie: Polar H10 (zahardcodowane)
Instrukcja dla zawodnika:
  - Siedzieć spokojnie
  - Patrzeć przed siebie
  - Oddychać naturalnie
  
Metryki rejestrowane:
  - HRV Max (rMSSD)
  - HR mean (średnie tętno)
  - Timestamp
```

**Pytanie: Czy zawodnik powinien oddychać rezonansowo?**
- **Odpowiedź:** Rekomendowane, ale nie wymuszane
- **Instrukcja:** "Oddychaj spokojnie i równomiernie, najlepiej w rytmie 6 oddechów/minutę (wdech 5s, wydech 5s)"
- **Flaga w danych:** `breathing_instruction: 'resonant_breathing_recommended'`

**Pytanie: Czy baseline w każdej sesji?**
- **Odpowiedź:** NIE w każdej sesji pomiarowej
- **Zalecenie:** Baseline co 4-6 tygodni (tracking zmian długoterminowych)
- **Flaga w danych:** `baseline_type: 'initial' | 'follow-up'`

**ACTION POINT 3:** Dodać logikę przypomnienia o baseline
- [ ] System sugeruje baseline jeśli ostatni był > 4 tygodnie temu
- [ ] UI opcja "Pomiń baseline" z potwierdzeniem

---

## 6. Zgody (Consent Management)

### 6.1 Typy Zgód

```typescript
{
  athlete_id: string,
  
  consents: {
    training_data_collection: {
      granted: boolean,
      timestamp: Date,
      version: string          // Wersja dokumentu zgody
    },
    
    measurement_data_collection: {
      granted: boolean,
      timestamp: Date,
      version: string
    },
    
    data_science_research: {
      granted: boolean,
      timestamp: Date,
      version: string,
      scope: 'anonymous_only' | 'pseudonymized' | 'full'
    },
    
    marketing_communication: {
      granted: boolean,
      timestamp: Date,
      version: string
    }
  },
  
  // Audit trail
  consent_history: [
    {
      consent_type: string,
      action: 'granted' | 'revoked',
      timestamp: Date,
      version: string
    }
  ]
}
```

**ACTION POINT 4:** Zdefiniować treść zgód z radcą prawnym
- [ ] Zgoda na przetwarzanie danych osobowych (RODO Art. 6)
- [ ] Zgoda na wykorzystanie danych w badaniach (anonimizacja)
- [ ] Określić podstawę prawną: zgoda vs interes prawnie uzasadniony

**ACTION POINT 5:** Decyzja architektoniczna - gdzie przechowywać zgody?
- **Opcja A:** W aplikacji (tabela `athlete_consents`)
- **Opcja B:** W HubSpot CRM
- **Opcja C:** Hybrid - aplikacja + sync przez n8n/Make

**Rekomendacja:** **Opcja C (Hybrid)**
- Aplikacja: Szybki dostęp, kontrola techniczna
- HubSpot: Backup, marketing automation, CRM integration
- n8n/Make: Real-time sync (webhook triggered)

---

### 6.2 Wariantowanie Bazy Danych vs Zgoda Obligatoryjna

**Pytanie:** Czy wariantować bazę danych w zależności od zgody na badania?

**Odpowiedź:** **NIE** - lepsza jest zgoda obligatoryjna z anonimizacją

**Rekomendowana polityka:**
```
Warunkiem udziału w programie SigmaTest jest zgoda na:
1. Przetwarzanie danych osobowych (identyfikowalnych) przez trenera/klub
2. Wykorzystanie ANONIMIZOWANYCH danych w badaniach naukowych

Dane eksportowane do celów naukowych:
- Zawierają tylko ID (nie imię/nazwisko)
- Zawierają wiek, płeć, dyscyplinę (demografia)
- NIE zawierają danych kontaktowych
```

**Uzasadnienie:**
- ✅ Prostsza architektura (jedna baza, nie dwie warianty)
- ✅ Większy dataset dla nauki (lepsza jakość badań)
- ✅ Zgodne z RODO (anonimizacja = nie są to dane osobowe)
- ✅ Transparentne dla użytkownika (jasny model zgody)

**ACTION POINT 6:** Sformułować klauzulę informacyjną
- [ ] Wyjaśnić cel przetwarzania danych
- [ ] Wyjaśnić proces anonimizacji
- [ ] Wyjaśnić korzyści z udziału w badaniach

---

## 7. Bluetooth Integration - Polar H10

### 7.1 Chrome Web Bluetooth API

**Pytanie:** Czy można łączyć Polar H10 przez Bluetooth w aplikacji webowej?

**Odpowiedź:** **TAK** - przez Web Bluetooth API

**Implementacja:**
```typescript
// Przykład: Połączenie z Polar H10
const device = await navigator.bluetooth.requestDevice({
  filters: [{ services: ['heart_rate'] }],
  optionalServices: ['battery_service']
});

const server = await device.gatt.connect();
const service = await server.getPrimaryService('heart_rate');
const characteristic = await service.getCharacteristic('heart_rate_measurement');

characteristic.startNotifications();
characteristic.addEventListener('characteristicvaluechanged', (event) => {
  const value = event.target.value;
  const heartRate = value.getUint8(1);
  console.log('Heart Rate:', heartRate);
});
```

**Kompatybilność:**
- ✅ Chrome (desktop + Android)
- ✅ Edge
- ❌ Safari (brak wsparcia Web Bluetooth)
- ❌ Firefox (eksperymentalne wsparcie)

**Rekomendacja:**
- **Krótkoterminowo:** Zahardcodować `device: 'polar_h10'` w metadanych
- **Długoterminowo:** Zaimplementować Web Bluetooth API dla automatycznego zbierania HR/HRV
- **Fallback:** Manualny input jeśli Bluetooth niedostępny

**ACTION POINT 7:** Roadmap integracji Bluetooth
- [ ] Prototyp Web Bluetooth API (proof of concept)
- [ ] UI do parowania urządzeń
- [ ] Real-time HRV display podczas pomiaru
- [ ] Automatyczny zapis do sesji

---

## 8. Data Versioning & Schema Evolution

### 8.1 Wersjonowanie Danych (PLANOWANE)

```typescript
{
  schema_version: '1.2.0',
  data_format_version: '2024-11-22',
  app_version: '0.3.5'
}
```

**Dlaczego to ważne dla nauki:**
- Publikacje wymagają specyfikacji wersji protokołu
- Zmiany w grze (timing, ilość prób) = nowa wersja
- Możliwość porównania datasetu A vs B (różne wersje)

**ACTION POINT 8:** Zaimplementować wersjonowanie
- [ ] Dodać `schema_version` do każdej sesji
- [ ] Changelog zmian w protokołach pomiarowych
- [ ] Migracje danych przy zmianach schematu

---

## 9. Luki i Rekomendacje

### 9.1 Luki Krytyczne (DO NAPRAWY)

❌ **Brak quality flags** - trener nie może oznaczyć pomiaru jako "zakłócony"
❌ **Brak schema versioning** - niemożliwe porównanie danych z różnych wersji app
❌ **Brak environmental metadata** - kontekst pomiaru zbyt ograniczony
❌ **Brak consent management** - zgody nie są śledzone w systemie

### 9.2 Luki Ważne (NICE TO HAVE)

⚠️ **Brak automatycznej integracji Bluetooth** - dane HR/HRV wpisywane ręcznie
⚠️ **Brak EEG support** - na przyszłość (nie teraz)
⚠️ **Brak data validation rules** - brak ostrzeżeń o nierealistycznych wartościach
⚠️ **Brak backup/restore** - ryzyko utraty danych

### 9.3 Mocne Strony

✅ **PII separation** - dane osobowe oddzielone od pomiarowych
✅ **Trial-level granularity** - każda próba zapisana osobno
✅ **Flat metric naming** - spójne nazewnictwo eksportów
✅ **ID-based exports** - brak PII w plikach eksportowych
✅ **Metadata tracking** - device, timestamp, context

---

## 10. Action Points - Podsumowanie

| ID | Priorytet | Zadanie | Status |
|----|-----------|---------|--------|
| AP1 | HIGH | Dodać UI flagowania jakości danych przez trenera | TODO |
| AP2 | MEDIUM | Rozszerzyć kwestionariusz o sleep/meal/fatigue | TODO |
| AP3 | MEDIUM | Dodać logikę przypomnienia o baseline co 4-6 tygodni | TODO |
| AP4 | HIGH | Zdefiniować treść zgód z radcą prawnym | TODO |
| AP5 | HIGH | Decyzja: zgody w app vs HubSpot vs hybrid | TODO |
| AP6 | HIGH | Sformułować klauzulę informacyjną RODO | TODO |
| AP7 | LOW | Roadmap integracji Web Bluetooth API | TODO |
| AP8 | MEDIUM | Zaimplementować schema versioning | TODO |

---

## 11. Compliance Checklist

### 11.1 RODO/GDPR

- ✅ **Art. 5(1)(a) - Lawfulness**: Przetwarzanie na podstawie zgody
- ✅ **Art. 5(1)(b) - Purpose limitation**: Cel określony (sport + nauka)
- ✅ **Art. 5(1)(c) - Data minimisation**: Zbieramy tylko niezbędne dane
- ✅ **Art. 5(1)(f) - Integrity**: Separacja PII, szyfrowanie (planowane)
- ⚠️ **Art. 13 - Information**: Klauzula informacyjna do napisania
- ⚠️ **Art. 17 - Right to erasure**: Mechanizm usuwania danych (do implementacji)

### 11.2 Dobra Praktyka Naukowa

- ✅ **Raw data preservation**: Trial-level data zachowane
- ✅ **Metadata documentation**: Device, timestamp, protocol
- ✅ **Reproducibility**: Wersjonowanie protokołów (planowane)
- ✅ **Anonymization**: ID-based exports bez PII
- ⚠️ **Data sharing**: Polityka udostępniania datasetu (do opracowania)

---

## 12. Podsumowanie

**System SigmaTest spełnia podstawowe standardy prywatności i jakości danych naukowych.**

**Główne zalety:**
- Separacja PII od danych pomiarowych
- Trial-level granularity dla re-analizy
- Spójne nazewnictwo metryk
- Metadata tracking

**Kluczowe obszary do rozwoju:**
- Quality flags i environmental metadata
- Consent management system
- Schema versioning
- Bluetooth integration

**Rekomendacja:** Aplikacja jest gotowa do MVP z małymi grupami testowymi. Przed skalowaniem produkcyjnym należy uzupełnić consent management i skonsultować się z radcą prawnym ws. RODO.

---

**Kontakt:** [Twój email / dane kontaktowe]  
**Ostatnia aktualizacja:** 2025-11-22
