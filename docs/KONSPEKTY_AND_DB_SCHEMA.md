# Konspekty Sigma Sport — Kompletna zawartość + Schemat bazy danych

> **Cel dokumentu:** Pełna inwentaryzacja zawartości merytorycznej (konspekty ćwiczeń, programy Sigma Teams, gry kognitywne, kwestionariusze) wraz z systemem tagowania i propozycją struktury bazy danych do migracji z plików statycznych (`src/data/libraryData.ts`) do PostgreSQL/Supabase.
>
> **Źródła:** `src/data/libraryData.ts`, `src/pages/ClubDetail.tsx`, `src/pages/Library.tsx`
>
> **Status:** Dokument referencyjny — nie wykonuje migracji SQL.

---

## Spis treści

1. [Inwentaryzacja zawartości](#1-inwentaryzacja-zawartości)
   - 1.1 [Biblioteka ćwiczeń (9 konspektów)](#11-biblioteka-ćwiczeń-9-konspektów)
   - 1.2 [Gry kognitywne (5 gier)](#12-gry-kognitywne-5-gier)
   - 1.3 [Programy Sigma Teams](#13-programy-sigma-teams)
   - 1.4 [Kwestionariusze](#14-kwestionariusze)
2. [System tagowania](#2-system-tagowania)
3. [Proponowany schemat bazy danych](#3-proponowany-schemat-bazy-danych)
4. [Mapping źródło → tabela](#4-mapping-źródło--tabela)
5. [Plan migracji danych](#5-plan-migracji-danych)

---

## 1. Inwentaryzacja zawartości

### 1.1 Biblioteka ćwiczeń (9 konspektów)

Każde ćwiczenie zawiera: `id`, `title`, `description`, `duration`, `category`, `objective`, `equipment[]`, `steps[{title, content}]`, `coachingTips[]`, `adaptations{easier, harder}`, `metrics[]`.

---

#### EX-1 — Oddech Rezonansowy

| Pole | Wartość |
|---|---|
| **slug** | `ex-1` |
| **Kategoria** | `breathing` |
| **Czas** | 5–10 min |
| **Opis** | Technika oddechu z częstotliwością 5.5 oddechu na minutę, synchronizująca układy nerwowe. |
| **Cel** | Nauczenie zawodnika techniki regulacji poziomu pobudzenia poprzez kontrolowaną manipulację częstością oddechową. |
| **Sprzęt** | Mata lub krzesło · Timer/aplikacja z metronomem oddechowym (opcjonalnie) · Ciche pomieszczenie |

**Kroki:**

1. **Pozycja wyjściowa (1 min)** — Zawodnik siada wygodnie z prostymi plecami, stopy płasko na podłodze. Ręce spoczywają na udach lub brzuchu. Oczy zamknięte lub skierowane w dół.
2. **Ustalenie rytmu bazowego (2 min)** — Wdech przez nos na 5 sekund (powolne napełnianie płuc od dołu). Wydech przez nos lub usta na 5 sekund (równie powolne opróżnianie). Zachowaj naturalność — nie forsuj.
3. **Faza rezonansowa (4 min)** — Kontynuuj rytm 5-5. Skup uwagę na ruchu powietrza, rozszerzaniu się brzucha przy wdechu i jego opadaniu przy wydechu. Jeśli myśli odchodzą, łagodnie wróć do obserwacji oddechu.
4. **Powrót (1 min)** — Stopniowo pozwól oddechowi wrócić do naturalnego rytmu. Przed otwarciem oczu zrób 3 głębokie oddechy. Zanotuj swój stan emocjonalny (skala 1–10).

**Wskazówki trenerskie:**
- Oddech rezonansowy to nie hyperventylacja — ma być POWOLNY i GŁĘBOKI
- Pierwsza sesja może być trudna — zawodnik może czuć zawroty głowy. Skróć do 3–4 minut
- Najlepiej ćwiczyć codziennie o tej samej porze (np. rano po przebudzeniu)
- Można używać jako "reset" między rundami/setami na zawodach

**Adaptacje:**
- *Łatwiej:* Skróć cykl do 4-4 (wdech-wydech po 4 sekundy), skróć czas do 5 minut
- *Trudniej:* Wydłuż cykl do 6-6, dodaj wizualizację (np. wyobraź sobie falę oceaniczną)

**Metryki:** Częstość oddechowa (oddechów/min) · Subiektywny poziom relaksu (1–10) · HRV baseline

**Tagi:** `category:breathing` · `competency:arousal_regulation` · `intensity:low` · `context:pre_competition` · `context:recovery` · `context:daily_practice` · `age_group:youth_u14` · `age_group:junior_14_18` · `age_group:senior_18plus` · `equipment_required:timer` · `equipment_required:mat` · `program:sigma_go` · `program:sigma_sprint_1` · `module:attention_training`

---

#### EX-2 — Body Scan

| Pole | Wartość |
|---|---|
| **slug** | `ex-2` |
| **Kategoria** | `focus` |
| **Czas** | 10–15 min |
| **Opis** | Systematyczne skanowanie ciała z uwagą na oddech i napięcie mięśniowe. |
| **Cel** | Rozwijanie świadomości cielesnej i umiejętności identyfikacji napięć mięśniowych poprzez metodyczne skanowanie poszczególnych części ciała. |
| **Sprzęt** | Mata do ćwiczeń · Ciche pomieszczenie · Opcjonalnie: nagranie z instrukcją guided body scan |

**Kroki:**

1. **Pozycja wyjściowa (1 min)** — Zawodnik leży na plecach w wygodnej pozycji, ręce wzdłuż ciała, stopy lekko rozstawione. Oczy zamknięte. Kilka głębokich oddechów.
2. **Skanowanie stóp i nóg (3 min)** — Przenieś uwagę na stopy. Zauważ wszystkie odczucia — ciepło, chłód, ucisk, pulsowanie. Nie oceniaj, tylko obserwuj. Przesuń uwagę na kostki, łydki, kolana, uda. Po kolei.
3. **Skanowanie tułowia (3 min)** — Skup się na biodrach, pośladkach, dolnej części pleców. Zauważ punkty kontaktu z matą. Przesuń na brzuch — czy napina się przy wdechu? Klatka piersiowa, górna część pleców.
4. **Skanowanie rąk i ramion (2 min)** — Palce dłoni, dłonie, nadgarstki, przedramiona, łokcie, ramiona, barki. Czy gdzieś jest napięcie? Jeśli tak, wyślij tam oddech.
5. **Skanowanie głowy (2 min)** — Szyja, kark, szczęka (często napięta!), policzki, oczy, czoło, czubek głowy. Pozwól całej twarzy się rozluźnić.
6. **Całościowe skanowanie (2 min)** — Przesuń uwagę przez całe ciało jak fala — od stóp do głowy. Jeśli znajdziesz obszar napięcia, zatrzymaj się tam na 2–3 oddechy.
7. **Powrót (1 min)** — Delikatnie porusz palcami rąk i nóg. Rozciągnij się. Otwórz oczy. Wstań powoli.

**Wskazówki trenerskie:**
- Body Scan to nie relaksacja — to trening UWAGI na ciele. Niektórzy mogą czuć się bardziej świadomi napięć
- Normalnie, że myśli odchodzą. Za każdym razem łagodnie wracaj do ciała
- Można robić skróconą wersję (5 min) siedząc — świetne przed zawodami
- Zawodnicy kontuzjowani mogą czuć dyskomfort w pewnych obszarach — zachęć do obserwacji bez osądu

**Adaptacje:**
- *Łatwiej:* Skróć do 3 obszarów (nogi, tułów, głowa), użyj nagrania z instrukcją, skróć czas do 8 minut
- *Trudniej:* Wydłuż do 20 minut, skanuj w pozycji siedzącej (trudniejsze utrzymanie uwagi), dodaj świadomość oddechu w każdym obszarze

**Metryki:** Liczba momentów rozproszenia uwagi · Zidentyfikowane obszary napięcia · Subiektywny poziom relaksu przed/po (1–10)

**Tagi:** `category:focus` · `competency:attention` · `competency:arousal_regulation` · `intensity:low` · `context:pre_competition` · `context:recovery` · `context:daily_practice` · `age_group:junior_14_18` · `age_group:senior_18plus` · `equipment_required:mat` · `program:sigma_sprint_1` · `module:attention_training`

---

#### EX-3 — Semafor

| Pole | Wartość |
|---|---|
| **slug** | `ex-3` |
| **Kategoria** | `control` |
| **Czas** | 5 min |
| **Opis** | Ćwiczenie kontroli impulsów — reaguj tylko na zielone światło, ignoruj czerwone. |
| **Cel** | Trening hamowania impulsywnych reakcji poprzez szybkie przetwarzanie sygnałów wizualnych i selekcję odpowiedniej odpowiedzi. |
| **Sprzęt** | 3 kartony kolorowe (zielony, żółty, czerwony) · Lub aplikacja z kolorowymi sygnałami · Stoper |

**Kroki:**

1. **Instrukcja (30 sek)** — Trener pokazuje karty w losowej kolejności. ZIELONA = klaśnij w dłonie. ŻÓŁTA = tupnij stopą. CZERWONA = nic nie rób (zahamuj impuls).
2. **Faza treningowa — wolne tempo (2 min)** — 20 prób, interwał 5 sekund. Kolejność: zielona, żółta, czerwona, zielona, czerwona, żółta… Losowo. Zawodnik może popełniać błędy — to normalne.
3. **Faza szybka — presja czasu (2 min)** — 30 prób, interwał 2 sekundy. Szybkie tempo! 50% czerwonych (wymagają hamowania). Monitoruj liczbę błędów (reakcja na czerwone = błąd).
4. **Analiza (30 sek)** — Policz błędy. Ideał: <3 błędy w fazie szybkiej. Omów: Czy zawodnik spowalniał na czerwone (strategia unikania)? Czy utrzymał szybkość?

**Wskazówki trenerskie:**
- Semafor to prostsza wersja testu Go/NoGo — świetny start dla młodszych zawodników
- Kluczowe: zawodnik musi utrzymać SZYBKOŚĆ reakcji na zielone/żółte, nie tylko skupić się na hamowaniu
- Można dodać dystraktory: trener mówi kolory werbalnie, ale pokazuje inne — konflikt!
- Transfer na sport: "czerwone światło" to np. sytuacja faulowa, prowokacja przeciwnika

**Adaptacje:**
- *Łatwiej:* Tylko 2 sygnały (zielony = działaj, czerwony = stop), wydłuż interwał do 4 sekund, zmniejsz liczbę czerwonych do 30%
- *Trudniej:* Dodaj czwarty kolor (niebieski = skok), skróć interwał do 1 sekundy, dodaj dystraktory dźwiękowe, wykonuj podczas wysiłku fizycznego

**Metryki:** Liczba błędów (reakcja na czerwone) · Czas reakcji na zielone/żółte (ms) · Procent poprawnych odpowiedzi (%)

**Tagi:** `category:control` · `competency:inhibition` · `intensity:medium` · `context:daily_practice` · `context:team` · `age_group:youth_u14` · `age_group:junior_14_18` · `age_group:senior_18plus` · `equipment_required:cards` · `equipment_required:timer` · `program:sigma_go` · `program:sigma_sprint_2` · `module:impulse_control`

---

#### EX-4 — Rozpoznawanie rozproszeń

| Pole | Wartość |
|---|---|
| **slug** | `ex-4` |
| **Kategoria** | `focus` |
| **Czas** | 10 min |
| **Opis** | Identyfikacja zewnętrznych i wewnętrznych źródeł rozproszenia uwagi. |
| **Cel** | Zwiększenie świadomości metacognitywnej poprzez identyfikację i kategoryzację typowych dystraktów występujących w kontekście sportowym. |
| **Sprzęt** | Arkusz do zapisu · Długopis · Opcjonalnie: nagranie dźwięków z zawodów (tło) |

**Kroki:**

1. **Wprowadzenie (2 min)** — Wyjaśnij 2 typy rozproszeń: ZEWNĘTRZNE (dźwięki, ruch, pogoda) i WEWNĘTRZNE (myśli, emocje, odczucia fizyczne). Poproś o przykłady z treningów/meczów.
2. **Mapa rozproszeń — zewnętrzne (3 min)** — Zawodnik zamyka oczy i wyobraża sobie sytuację meczową. Zapisuje 5 zewnętrznych rozproszeń (np. okrzyki kibiców, błąd sędziego, ruch przeciwnika, pogoda, ból kontuzji).
3. **Mapa rozproszeń — wewnętrzne (3 min)** — Teraz 5 wewnętrznych (np. "co pomyślą inni", wspomnienie błędu, lęk przed porażką, myśli o wyniku, irytacja). Bądź szczery — to dla Ciebie.
4. **Kategoryzacja i ranking (2 min)** — Zaznacz 3 najbardziej rozpraszające. Oceń (1–10) jak bardzo wpływają na grę. To Twoja "lista obserwacji" — teraz wiesz, czego szukać.

**Wskazówki trenerskie:**
- To ćwiczenie diagnostyczne — nie ma poprawnych/złych odpowiedzi
- Zawodnicy często odkrywają, że WEWNĘTRZNE rozproszenia są silniejsze niż zewnętrzne
- Zachowaj te listy — będą bazą do ćwiczeń "Zauważam i wracam"
- Normalizuj — wszyscy zawodnicy mają rozproszenia, różnica jest w reakcji na nie

**Adaptacje:**
- *Łatwiej:* Ogranicz do 3 rozproszeń każdego typu, podaj gotową listę do wyboru, skróć do 7 minut
- *Trudniej:* Rozszerz do 10 rozproszeń, dodaj kategorię "fizjologiczne" (głód, zmęczenie), stwórz mapę dla różnych faz meczu (początek, środek, koniec)

**Metryki:** Liczba zidentyfikowanych rozproszeń · Najsilniejsze rozproszenie (1–10) · Świadomość metacognitywna (samoocena)

**Tagi:** `category:focus` · `competency:attention` · `intensity:low` · `context:daily_practice` · `context:individual` · `age_group:junior_14_18` · `age_group:senior_18plus` · `equipment_required:none` · `program:sigma_sprint_1` · `module:attention_training`

---

#### EX-5 — Technika "Zauważam i wracam"

| Pole | Wartość |
|---|---|
| **slug** | `ex-5` |
| **Kategoria** | `focus` |
| **Czas** | 15 min |
| **Opis** | Praktyka powrotu do obecności po zauważeniu rozproszenia. |
| **Cel** | Nauka szybkiego powrotu do koncentracji po zauważeniu rozproszenia poprzez protokół 3-krokowy: Zauważam → Nazywam → Wracam. |
| **Sprzęt** | Timer · Arkusz z listą rozproszeń (z ćwiczenia ex-4) · Opcjonalnie: metronom/dzwonek co 2 minuty |

**Kroki:**

1. **Wprowadzenie protokołu (3 min)** — Wyjaśnij 3 kroki: 1) ZAUWAŻAM — dostrzegam, że myśli odeszły. 2) NAZYWAM — "To rozproszenie" (bez oceny). 3) WRACAM — kieruję uwagę na oddech/ciało/zadanie. Demo przez trenera.
2. **Praktyka z oddechem (5 min)** — Zawodnik skupia się na oddechu. Gdy zauważy, że myśli odeszły, stosuje protokół. Nie walcz z myślami — po prostu wracaj. Licznik: ile razy musiałeś wrócić? (To SUKCES, nie porażka!)
3. **Praktyka z zadaniem sportowym (5 min)** — Zawodnik wykonuje proste zadanie ruchowe (np. żonglerka, dribling). Świadomie wprowadź rozproszenia (głośne dźwięki, pytania). Zawodnik stosuje protokół i wraca do zadania.
4. **Refleksja (2 min)** — Co było najtrudniejsze? Krok 1 (zauważanie)? 2 (nie osądzanie)? 3 (powrót)? Jaki był Twój "sygnał" że myśli odeszły? (np. napięcie, błąd w zadaniu)

**Wskazówki trenerskie:**
- To najpotężniejsza technika w całym programie — fundament mindfulness sportowego
- Zawodnicy często myślą że "dużo powrotów = porażka". ODWROTNIE! Każdy powrót to trening mózgu
- Nazwanie rozproszenia (krok 2) zapobiega reakcji emocjonalnej na nie
- Stosuj "Zauważam i wracam" jako mantrę przed zawodami

**Adaptacje:**
- *Łatwiej:* Skróć do 10 minut, użyj tylko praktyki z oddechem, dzwonek co 1 minutę przypomina o powrocie
- *Trudniej:* Wydłuż do 20 minut, dodaj symulację meczową pod presją, wprowadź dystraktory emocjonalne (wspomnienia porażek), brak dzwonka — pełna autonomia

**Metryki:** Liczba powrotów (im więcej, tym lepiej!) · Czas zauważenia rozproszenia (sekundy) · Jakość powrotu (1–10)

**Tagi:** `category:focus` · `competency:attention` · `competency:emotional_control` · `intensity:medium` · `context:in_competition` · `context:daily_practice` · `age_group:junior_14_18` · `age_group:senior_18plus` · `equipment_required:timer` · `program:sigma_sprint_1` · `module:attention_training`

---

#### EX-6 — Koncentracja progresywna

| Pole | Wartość |
|---|---|
| **slug** | `ex-6` |
| **Kategoria** | `focus` |
| **Czas** | 20 min |
| **Opis** | Stopniowe zwiększanie czasu koncentracji od 30 sekund do 5 minut. |
| **Cel** | Systematyczne wydłużanie czasu utrzymania koncentracji na jednym obiekcie poprzez progresywny trening — od krótkich do długich interwałów. |
| **Sprzęt** | Stoper/timer · Obiekt do koncentracji (piłka, punkt na ścianie, lub oddech) · Dziennik treningowy |

**Kroki:**

1. **Test bazowy (2 min)** — Zawodnik koncentruje się na wybranym obiekcie/oddechu tak długo jak potrafi BEZ rozproszenia. Zmierz czas do pierwszego odejścia myśli. To Twój baseline.
2. **Seria 30 sekund × 3 (2 min)** — 3 rundy po 30 sekund koncentracji, 20 sekund przerwy. Jeśli myśli odchodzą — "Zauważam i wracam". Cel: utrzymać przez cały czas.
3. **Seria 1 minuta × 3 (4 min)** — 3 rundy po 1 minucie, 30 sekund przerwy. Trudniejsze! Jeśli udało się wszystkie 3 — przenieś się dalej.
4. **Seria 2 minuty × 2 (5 min)** — 2 rundy po 2 minuty, 1 minuta przerwy. To już maraton koncentracji. Używaj oddechu jako "kotwicy powrotu".
5. **Seria 3 minuty × 1 (3 min)** — Pojedyncza runda 3 minuty. Jeśli udało się — jesteś na poziomie zaawansowanym!
6. **Test końcowy (2 min)** — Powtórz test bazowy. Zmierz czas do pierwszego rozproszenia. Czy poprawiłeś wynik?
7. **Analiza (2 min)** — Zapisz: baseline, najdłuższy udany interwał, liczba rozproszeń. To Twój punkt odniesienia na następną sesję.

**Wskazówki trenerskie:**
- Koncentracja to jak mięsień — rozwija się przez systematyczny trening, nie jednorazowy wysiłek
- Jeśli zawodnik nie przechodzi poziomu — zostaje na nim przez kolejną sesję. Bez wstydu!
- Młodsi zawodnicy (<14 lat): zacznij od 15 sekund, wydłużaj wolniej
- Można robić na treningu: koncentracja na piłce przed strzałem, na rękawicy przed ciosem, etc.

**Adaptacje:**
- *Łatwiej:* Zacznij od 15 sekund, wydłużaj po 15 sekund, skróć całość do 15 minut, używaj obiektów zewnętrznych (łatwiejsze niż oddech)
- *Trudniej:* Zacznij od 1 minuty, cel: 10 minut ciągłej koncentracji, dodaj dystraktory (dźwięki, ruch), koncentracja podczas wysiłku fizycznego

**Metryki:** Czas bazowy (sekundy) · Najdłuższy udany interwał (sekundy) · Liczba rozproszeń na rundę · Procentowa poprawa baseline

**Tagi:** `category:focus` · `competency:attention` · `competency:working_memory` · `intensity:high` · `context:daily_practice` · `context:individual` · `age_group:junior_14_18` · `age_group:senior_18plus` · `equipment_required:timer` · `program:sigma_sprint_1` · `module:attention_training`

---

#### EX-7 — Skrypt AUN (Aktywacja Uwagi Natychmiastowej)

| Pole | Wartość |
|---|---|
| **slug** | `ex-7` |
| **Kategoria** | `control` |
| **Czas** | 2–3 min |
| **Opis** | Technika Aktywacji Uwagi Natychmiastowej — szybkie skupienie przed akcją. |
| **Cel** | Stworzenie mentalnego "przełącznika" pozwalającego na błyskawiczne wejście w stan pełnej koncentracji przed kluczową akcją sportową. |
| **Sprzęt** | Brak — tylko zawodnik i trener |

**Kroki:**

1. **Wprowadzenie do AUN (30 sek)** — AUN to 3-słowny skrypt uruchamiany przed każdą ważną akcją: STOP. ODDECH. CEL. To Twój mental reset w 5 sekund.
2. **Krok 1: STOP (30 sek)** — Zawodnik zatrzymuje automatyczne myśli gestem fizycznym (np. zaciska pięść, dotyka klatki piersiowej). Gest musi być szybki, dyskretny, zawsze ten sam. Przećwicz 5 razy.
3. **Krok 2: ODDECH (30 sek)** — Jeden głęboki wdech nosem (3 sek) + wydech ustami (3 sek). To reset układu nerwowego. Przećwicz razem z gestem STOP.
4. **Krok 3: CEL (30 sek)** — Werbalizuj (w myślach lub szeptem) JEDNO SŁOWO opisujące cel akcji (np. "Precyzja", "Eksplozja", "Spokój"). Przećwicz pełny cykl STOP-ODDECH-CEL 5 razy.
5. **Symulacja (30 sek)** — Trener wywołuje symulację (np. "Za 10 sekund rzut karny"). Zawodnik stosuje AUN. Ocena (1–10): Czy poczułeś zmianę stanu?

**Wskazówki trenerskie:**
- AUN to NOT medytacja — to pre-performance routine jak w NBA przed rzutem wolnym
- Zawodnicy muszą wymyślić SWÓJ gest i SWOJE słowo-cel. Personalizacja = skuteczność
- Stosuj przed KAŻDYM treningiem przez 2 tygodnie — dopiero wtedy staje się automatem
- Badania pokazują: rutyny skracają czas reakcji i zwiększają konsystencję wykonania

**Adaptacje:**
- *Łatwiej:* Wydłuż oddech do 5-5 sekund, pozwól na dłuższy gest (np. seria uderzeń w uda), używaj zewnętrznego przypomnienia (kartka z "AUN")
- *Trudniej:* Skróć całość do 3 sekund, stosuj pod presją czasu, dodaj wizualizację idealnego wykonania, stosuj w warunkach rozpraszających

**Metryki:** Czas wykonania AUN (sekundy) · Zmiana stanu emocjonalnego przed/po (1–10) · Konsystencja stosowania (% sytuacji)

**Tagi:** `category:control` · `competency:inhibition` · `competency:arousal_regulation` · `intensity:medium` · `context:pre_competition` · `context:in_competition` · `age_group:junior_14_18` · `age_group:senior_18plus` · `equipment_required:none` · `program:sigma_go` · `program:sigma_sprint_2` · `module:impulse_control`

---

#### EX-8 — Reset Emocjonalny

| Pole | Wartość |
|---|---|
| **slug** | `ex-8` |
| **Kategoria** | `control` |
| **Czas** | 1–2 min |
| **Opis** | Szybka technika odzyskiwania spokoju po błędzie lub emocji. |
| **Cel** | Opanowanie protokołu natychmiastowej regulacji emocji negatywnych (frustracja, złość, lęk) w trakcie rywalizacji sportowej. |
| **Sprzęt** | Brak |

**Kroki:**

1. **Krok 1: Fizyczne odłączenie (10 sek)** — Po błędzie/emocji: odwróć się, zrób 3 kroki w bok, lub odejdź do linii bocznej. FIZYCZNIE przerwij sytuację. To sygnał dla mózgu: "Ta akcja się skończyła".
2. **Krok 2: Oddech resetujący (20 sek)** — Seria 3 głębokich oddechów: Wdech nosem (4 sek) + wstrzymanie (2 sek) + wydech ustami (6 sek). Przy wydechu wizualizuj "wypuszczanie" emocji.
3. **Krok 3: Self-talk resetujący (10 sek)** — Wypowiedz w myślach krótką frazę resetującą (wybierz SWOJĄ): "Następna piłka", "Reset", "Teraz", "Jestem tutaj". Tylko forward, zero rozpamiętywania.
4. **Krok 4: Powrót do gry (20 sek)** — Aktywuj ciało (podskocz, klaśnij, potrząśnij rękami). Skup się na NASTĘPNEJ akcji, nie poprzedniej. Wróć do pozycji z nastawieniem "fresh start".

**Wskazówki trenerskie:**
- Reset Emocjonalny = najważniejsza umiejętność w sporcie. Różnica między dobrymi a wielkimi
- Pierwsze 2 tygodnie: zawodnicy będą resetować PO 2–3 minutach. To OK! Stopniowo skracaj
- Kluczowe: NIE ANALIZUJ błędu podczas resetu. Analiza = PÓŹNIEJ. Teraz = tylko RESET
- Trenerzy: sami stosujcie reset przed komunikacją z zawodnikiem po jego błędzie!

**Adaptacje:**
- *Łatwiej:* Wydłuż czas do 2–3 minut, dodaj fizyczne "otrząsanie się" (dosłownie!), użyj zewnętrznego sygnału (trener krzyczy "RESET")
- *Trudniej:* Skróć do 30 sekund, stosuj podczas ciągłej gry (brak fizycznego odłączenia), dodaj pozytywną wizualizację następnej akcji

**Metryki:** Czas powrotu do stanu bazowego (sekundy) · Liczba błędów PO resecie vs PRZED (porównanie) · Samoocena jakości resetu (1–10)

**Tagi:** `category:control` · `competency:emotional_control` · `competency:arousal_regulation` · `intensity:medium` · `context:in_competition` · `age_group:junior_14_18` · `age_group:senior_18plus` · `equipment_required:none` · `program:sigma_sprint_2` · `module:impulse_control`

---

#### EX-9 — Wizualizacja sukcesu

| Pole | Wartość |
|---|---|
| **slug** | `ex-9` |
| **Kategoria** | `visualization` |
| **Czas** | 10–15 min |
| **Opis** | Mentalne przećwiczenie idealnego wykonania akcji sportowej. |
| **Cel** | Programowanie mózgu na sukces poprzez wielozmysłowe odtwarzanie idealnej sekwencji ruchowej z pełnym zaangażowaniem emocjonalnym. |
| **Sprzęt** | Ciche pomieszczenie · Mata lub krzesło · Opcjonalnie: nagranie z instrukcją guided imagery |

**Kroki:**

1. **Relaksacja (2 min)** — Pozycja leżąca lub siedząca, oczy zamknięte. 10 głębokich oddechów. Świadomie rozluźnij mięśnie od stóp po głowę (progressive relaxation).
2. **Wybór sekwencji (1 min)** — Zdefiniuj konkretną akcję sportową do wizualizacji (np. rzut judoka, strzał na bramkę, start sprintera). Im bardziej precyzyjna, tym lepiej.
3. **Wizualizacja zewnętrzna (2 min)** — Zobacz siebie z zewnątrz (jak na filmie) wykonującego akcję IDEALNIE. Zwolnione tempo. Zauważ każdy szczegół: pozycję ciała, ruch, moment kulminacyjny, skuteczność.
4. **Wizualizacja wewnętrzna (5 min)** — Przenieś się do środka — zobacz oczami zawodnika. Poczuj napięcie mięśni, ciężar ciała, ruch w przestrzeni. Usłysz dźwięki (okrzyki, oddech). Poczuj emocje (pewność, flow, radość po sukcesie). Powtórz 3–5 razy.
5. **Zakotwiczenie (1 min)** — Połącz wyobrażenie z gestem fizycznym (np. zaciskasz pięść). To "kotwica" do aktywowania tego stanu na zawodach.
6. **Powrót (1 min)** — Stopniowo wróć do świadomości ciała. Porusz palcami, rozciągnij się. Otwórz oczy. Zatrzymaj "smak" sukcesu.

**Wskazówki trenerskie:**
- Jakość > ilość. Lepiej 3 minuty pełnego zanurzenia niż 15 minut rozkojarzenia
- Zawodnik MUSI wizualizować SUKCES, nie porażkę. To programowanie mózgu na wzorzec
- Najlepsze momenty: przed snem (przechodzi do pamięci długotrwałej) i rano po przebudzeniu
- Połącz z praktyką: wizualizuj przed treningiem technicznym — mózg już będzie "rozgrzany"

**Adaptacje:**
- *Łatwiej:* Skup się tylko na wizualizacji zewnętrznej, skróć do 5 minut, używaj gotowego nagrania guided imagery, wizualizuj pojedyncze proste ruchy
- *Trudniej:* Dodaj element stresu (wyobraź sobie pełne trybuny, decydujący moment), wizualizuj całą sekwencję zawodów (od rozgrzewki do podium), dodaj wizualizację radzenia sobie z błędami i powrotu

**Metryki:** Żywość obrazu (1–10) · Kontrola nad obrazem (1–10) · Zaangażowanie emocjonalne (1–10) · Czas utrzymania koncentracji (minuty)

**Tagi:** `category:visualization` · `competency:imagery` · `competency:emotional_control` · `intensity:low` · `context:pre_competition` · `context:daily_practice` · `age_group:junior_14_18` · `age_group:senior_18plus` · `equipment_required:mat` · `program:sigma_sprint_3` · `module:imagery_training`

---

### 1.2 Gry kognitywne (5 gier)

Gry są technicznie ćwiczeniami z `category=game` ale renderują dedykowane komponenty React. W bazie zostaną zapisane jako rekordy w `exercises` z flagą `is_game=true` i polem `game_component`.

#### GAME-SCAN — Sigma Scan

| Pole | Wartość |
|---|---|
| **slug** | `game-scan` |
| **Kategoria** | `game` |
| **Komponent** | `ScanGame` |
| **Czas** | 3–5 min |
| **Opis** | Gra treningowa — szybkość skanowania wzrokowego. Znajdź zielone koło tak szybko jak potrafisz. |
| **Cel** | Pomiar i trening szybkości percepcji wzrokowej — kluczowej umiejętności w sporcie. |

**Instrukcje:**
1. **Instrukcje** — Klikaj na zielone koło tak szybko jak potrafisz. Unikaj klikania innych kształtów i kolorów.
2. **Test** — Przeprowadzisz 10 prób. Każda próba to nowa siatka z ukrytym zielonym kołem.

**Tagi:** `category:game` · `category:assessment` · `competency:attention` · `intensity:medium` · `context:pre_competition` · `equipment_required:app` · `program:sigma_go` · `program:sigma_sprint_1` · `program:sigma_sprint_2` · `program:sigma_sprint_3`

---

#### GAME-FOCUS — Sigma Focus

| Pole | Wartość |
|---|---|
| **slug** | `game-focus` |
| **Kategoria** | `game` |
| **Komponent** | `FocusGame` |
| **Czas** | 3–5 min |
| **Opis** | Gra treningowa — uwaga selektywna. Wybieraj kolor napisu, ignorując jego znaczenie. |
| **Cel** | Pomiar efektu interferencji i zdolności do selekcji istotnych informacji pod presją. |

**Instrukcje:**
1. **Instrukcje** — Wybierz przycisk odpowiadający KOLOROWI NAPISU, ignorując znaczenie słowa.
2. **Test** — Wykonasz 20 prób. Próby zgodne (słowo i kolor pasują) i niezgodne (konflikt).

**Tagi:** `category:game` · `category:assessment` · `competency:attention` · `competency:inhibition` · `intensity:high` · `equipment_required:app` · `program:sigma_go` · `program:sigma_sprint_1` · `program:sigma_sprint_2`

---

#### GAME-CONTROL — Sigma Control

| Pole | Wartość |
|---|---|
| **slug** | `game-control` |
| **Kategoria** | `game` |
| **Komponent** | `ControlGame` |
| **Czas** | 3–5 min |
| **Opis** | Gra treningowa — kontrola inhibicyjna. Test Go/NoGo — klikaj na zielone O, NIE klikaj na czerwone X. |
| **Cel** | Pomiar zdolności hamowania impulsywnych reakcji — fundamentu samokontroli sportowej. |

**Instrukcje:**
1. **Instrukcje** — Klikaj ekran gdy zobaczysz ZIELONE O. NIE KLIKAJ gdy zobaczysz CZERWONE X.
2. **Test** — Test trwa 2 minuty. Próby pojawiają się losowo z różnymi odstępami czasu.

**Tagi:** `category:game` · `category:assessment` · `competency:inhibition` · `intensity:high` · `equipment_required:app` · `program:sigma_go` · `program:sigma_sprint_2`

---

#### GAME-MEMO — Sigma Memo

| Pole | Wartość |
|---|---|
| **slug** | `game-memo` |
| **Kategoria** | `game` |
| **Komponent** | `MemoGame` |
| **Czas** | 2–3 min |
| **Opis** | Gra treningowa — pamięć robocza 2-Back. Klikaj gdy kwadrat pojawi się w tym samym miejscu co dwa kroki temu. |
| **Cel** | Pomiar pamięci roboczej — umiejętności buforowania informacji i stałej aktualizacji. |

**Instrukcje:**
1. **Instrukcje** — Obserwuj kwadrat pojawiający się na siatce 3×3. Kliknij gdy pojawi się w tym samym miejscu co DWA KROKI TEMU.
2. **Test** — Wykonasz 22 próby. Pierwsze dwie to rozgrzewka — dopiero od trzeciej możesz zacząć klikać.

**Tagi:** `category:game` · `category:assessment` · `competency:working_memory` · `intensity:high` · `equipment_required:app` · `program:sigma_sprint_1` · `program:sigma_sprint_3`

---

#### GAME-TRACKER — Sigma Tracker

| Pole | Wartość |
|---|---|
| **slug** | `game-tracker` |
| **Kategoria** | `game` |
| **Komponent** | `TrackerGame` |
| **Czas** | 3–5 min |
| **Opis** | Trening śledzenia wielu obiektów (Multiple Object Tracking) i pamięci roboczej. |
| **Cel** | Pomiar zdolności jednoczesnego śledzenia wielu poruszających się obiektów — kluczowej umiejętności w sportach zespołowych. |

**Instrukcje:**
1. **Instrukcje** — Zapamiętaj oznaczone obiekty, śledź je gdy zaczną się poruszać razem z innymi obiektami i wskaż je po zatrzymaniu ruchu.

**Tagi:** `category:game` · `category:assessment` · `competency:attention` · `competency:working_memory` · `intensity:high` · `equipment_required:app` · `program:sigma_sprint_1` · `program:sigma_sprint_3`

---

### 1.3 Programy Sigma Teams

Programy to ustrukturyzowane sekwencje spotkań treningowych. Każde spotkanie ma cel, kroki, powiązane ćwiczenia i opcjonalnie wskazówki prowadzenia + flagę pomiarową.

#### SIGMA GO! — Trening Demonstracyjny (`sigma-go-demo`)

| Pole | Wartość |
|---|---|
| **slug** | `sigma-go` |
| **Typ** | `demo` |
| **Czas** | 60 min |
| **Liczba spotkań** | 1 (single-session) |
| **Opis** | Kompleksowy 60-minutowy trening demonstracyjny pokazujący możliwości programu Sigma. |
| **Cel** | Przedstawienie podstawowych technik mentalnych i pomiarów kognitywnych w praktycznym, angażującym treningu. |

**Kroki spotkania:**

1. Powitanie i wprowadzenie do programu Sigma (5 min) — Opowiedz o trzech filarach: uwaga, kontrola, wyobraźnia
2. Rozgrzewka mentalna z @game-scan (5 min) — Wszyscy zawodnicy wykonują test Sigma Scan
3. Mini-wykład: Oddech i koncentracja (5 min) — Wyjaśnij związek między oddechem a układem nerwowym
4. Ćwiczenie praktyczne: @ex-1 Oddech Rezonansowy (10 min) — Prowadź zawodników przez technikę 5.5 oddechu/min
5. Demo kontroli impulsów z @game-control (5 min) — Pokaż jak szybkość reakcji łączy się z kontrolą
6. Ćwiczenie grupowe: @ex-3 Semafor (10 min) — Praktyka hamowania impulsów
7. Wprowadzenie do AUN — "Stop. Oddech. Cel." (10 min) — Naucz podstawowego @ex-7 skryptu aktywacji
8. Mini-turniej z @game-focus (5 min) — Rywalizacja w trybie treningowym
9. Podsumowanie i Q&A (5 min) — Odpowiedz na pytania, rozdaj materiały informacyjne

**Powiązane ćwiczenia:** `game-scan`, `ex-1`, `game-control`, `ex-3`, `ex-7`, `game-focus`

**Wskazówki prowadzenia (`training_guidance`):**

> **Jak prowadzić ten trening:**
>
> - **Energia i entuzjazm**: To pierwszy kontakt zawodników z programem — pokaż że trening mentalny może być ciekawy i angażujący!
> - **Praktyka > Teoria**: Minimalizuj wykłady, maksymalizuj działanie. Niech zawodnicy doświadczą, a potem wyjaśniaj.
> - **Język prosty**: Unikaj żargonu naukowego. Mów "skupienie" zamiast "koncentracja uwagi", "spokój" zamiast "regulacja autonomiczna".
> - **Przykłady ze sportu**: Kiedy wyjaśniasz techniki, odwołuj się do konkretnych sytuacji meczowych (rzut karny, presujący przeciwnik, etc.)
> - **Zachęcaj do pytań**: Stwórz bezpieczną atmosferę — nie ma głupich pytań, każde doświadczenie jest wartościowe.
> - **Obserwuj reakcje**: Jeśli widzisz znudzenie — przyspiesz tempo. Jeśli widzisz zagubienie — zwolnij i wyjaśnij jeszcze raz.
> - **Zakończ z motywacją**: Ostatnie zdanie powinno brzmieć: "To dopiero początek — w pełnym programie nauczycie się technik, które zmienią waszą grę!"

**Tagi programu:** `program:sigma_go` · `module:attention_training` · `module:impulse_control` · `context:team`

---

#### SIGMA SPRINT 1 — Trening Uwagi (`sprint-1`, status: completed)

5 spotkań w cyklu 5-tygodniowym. Moduł: `attention_training`.

##### M1-1 — Spotkanie 1.1: Wprowadzenie i Pomiar Baseline 🎯 **POMIAROWE**

- **Goal:** Przeprowadzenie pierwszego pomiaru bazowego zawodników w celu ustalenia poziomu wyjściowego umiejętności kognitywnych i fizjologicznych.
- **Kroki:**
  1. Wprowadzenie do programu (10 min) — omówienie celów, harmonogramu i zasad
  2. Wypełnienie kwestionariusza wstępnego (5 min)
  3. Test Sigma Scan — szybkość skanowania wzrokowego (3 min)
  4. Test Sigma Control — kontrola inhibicyjna (3 min)
  5. Test Sigma Focus — uwaga selektywna (3 min)
  6. Pomiar HRV baseline (10 min)
  7. Podsumowanie i omówienie dalszych kroków (5 min)
- **Powiązane ćwiczenia:** `game-scan`, `game-control`, `game-focus`

##### M1-2 — Spotkanie 1.2: Podstawy świadomości oddechowej

- **Goal:** Wprowadzenie do świadomości oddechowej jako fundamentu kontroli uwagi. Nauka techniki oddechu rezonansowego.
- **Kroki:**
  1. Rozgrzewka kognitywna — test Scan (5 min)
  2. Wprowadzenie teoretyczne — wpływ oddechu na układ nerwowy (10 min)
  3. Ćwiczenie: Oddech rezonansowy 5.5/min (15 min)
  4. Ćwiczenie: Body Scan z oddechem (10 min)
  5. Trening gry Sigma Focus (10 min)
  6. Podsumowanie i zadanie domowe (5 min)
- **Powiązane ćwiczenia:** `ex-1`, `ex-2`, `game-focus`

##### M1-3 — Spotkanie 1.3: Rozpoznawanie rozproszeń

- **Goal:** Nauka identyfikacji zewnętrznych i wewnętrznych źródeł rozproszenia uwagi. Praktyka powrotu do obecności.
- **Kroki:**
  1. Rozgrzewka — test Control (5 min)
  2. Analiza sytuacji rozpraszających w sporcie (10 min)
  3. Ćwiczenie: Rozpoznawanie myśli automatycznych (10 min)
  4. Praktyka: Technika "Zauważam i wracam" (15 min)
  5. Trening gry Sigma Scan (10 min)
  6. Refleksja i zadanie domowe (5 min)
- **Powiązane ćwiczenia:** `ex-4`, `ex-5`, `game-scan`, `game-control`

##### M1-4 — Spotkanie 1.4: Trening koncentracji z progresją

- **Goal:** Zastosowanie poznanych technik w praktyce sportowej. Stopniowe zwiększanie trudności i czasu utrzymania koncentracji.
- **Kroki:**
  1. Rozgrzewka — wszystkie gry Sigma (10 min)
  2. Progresywny trening koncentracji na oddechu (15 min)
  3. Ćwiczenie: Koncentracja w ruchu (10 min)
  4. Symulacja sytuacji meczowej z rozproszeniami (15 min)
  5. Podsumowanie modułu i przygotowanie do pomiaru (5 min)
- **Powiązane ćwiczenia:** `ex-6`, `game-scan`, `game-focus`, `game-control`

##### M1-5 — Spotkanie 1.5: Pomiar Kontrolny M2 🎯 **POMIAROWE**

- **Goal:** Pomiar postępu po zakończeniu Modułu 1. Weryfikacja poprawy w zakresie uwagi, koncentracji i parametrów fizjologicznych.
- **Kroki:**
  1. Krótkie przypomnienie technik z modułu (5 min)
  2. Wypełnienie kwestionariusza kontrolnego (5 min)
  3. Test Sigma Scan (3 min)
  4. Test Sigma Control (3 min)
  5. Test Sigma Focus (3 min)
  6. Pomiar HRV baseline (10 min)
  7. Analiza wyników i feedback indywidualny (10 min)
- **Powiązane ćwiczenia:** `game-scan`, `game-control`, `game-focus`

---

#### SIGMA SPRINT 2 — Kontrola Impulsów (`sprint-2`, status: in-progress)

5 spotkań. Moduł: `impulse_control`.

##### M2-1 — Spotkanie 2.1: Wprowadzenie do AUN

- **Goal:** Nauka techniki Aktywacji Uwagi Natychmiastowej (AUN) — szybkiego skupienia przed kluczową akcją.
- **Kroki:**
  1. Rozgrzewka Mentalna — Pogadaj z ekipą o tym, kiedy trudno jest "się przełączyć" (10 min)
  2. Wprowadzenie do "Reflektora Uwagi" — demo trenerskie (5 min)
  3. Krok 1: Nauka Skryptu @ex-7 AUN — "Stop. Oddech. Cel." (15 min)
  4. Praktyka: Symulacja sytuacji przedmeczowych (15 min)
  5. Trening gier Sigma z @game-control (10 min)
  6. Podsumowanie i zadanie domowe — stosować AUN przed każdym treningiem (5 min)
- **Powiązane ćwiczenia:** `ex-7`, `ex-1`, `game-control`
- **Training guidance:** Kluczowe jest pokazanie, że AUN to nie "medytacja", ale konkretne narzędzie bojowe. Używaj analogii sportowych — "To jak spalony przed sprintem — przygotowujesz się mentalnie do eksplozji". Pozwól zawodnikom wymyślić własne warianty skryptu, dopóki zachowują strukturę: Zatrzymanie → Reset → Fokus.

##### M2-2 — Spotkanie 2.2: Kontrola reakcji emocjonalnej

- **Goal:** Nauka rozpoznawania i zarządzania silnymi emocjami w trakcie rywalizacji sportowej.
- **Kroki:**
  1. Rozgrzewka — Semafor (ćwiczenie kontroli impulsów) (10 min)
  2. Analiza sytuacji prowokujących — video z meczów (10 min)
  3. Wprowadzenie: Reset Emocjonalny (technika 3 kroków) (10 min)
  4. Praktyka: Symulacje stresu w grze (15 min)
  5. Trening wszystkich gier Sigma (10 min)
  6. Refleksja grupowa — co pomogło? (5 min)
- **Powiązane ćwiczenia:** `ex-3`, `ex-8`, `game-control`, `game-focus`

##### M2-3 — Spotkanie 2.3: Hamowanie automatyzmów

- **Goal:** Rozwijanie zdolności świadomej kontroli nad automatycznymi reakcjami i impulsami.
- **Kroki:**
  1. Rozgrzewka — test Control (poziom trudny) (5 min)
  2. Wprowadzenie: Czym są automatyzmy? Kiedy pomagają, a kiedy szkodzą? (10 min)
  3. Ćwiczenie: Identyfikacja własnych automatyzmów sportowych (10 min)
  4. Praktyka: "Zatrzymaj i Wybierz" — świadome decyzje w grze (20 min)
  5. Trening gier Sigma (10 min)
  6. Podsumowanie — dziennik automatyzmów (5 min)
- **Powiązane ćwiczenia:** `game-control`, `ex-3`, `ex-7`

##### M2-4 — Spotkanie 2.4: Kontrola w sytuacjach presji

- **Goal:** Praktyczne zastosowanie technik kontroli w symulowanych sytuacjach wysokiej presji.
- **Kroki:**
  1. Rozgrzewka — kompletna bateria testów Sigma (15 min)
  2. Przypomnienie wszystkich technik z modułu (10 min)
  3. Symulacja: Sytuacje meczowe pod presją czasu (20 min)
  4. Analiza grupowa — co działało, co nie? (10 min)
  5. Przygotowanie do pomiaru kontrolnego (5 min)
- **Powiązane ćwiczenia:** `game-scan`, `game-control`, `game-focus`, `ex-7`, `ex-8`

##### M2-5 — Spotkanie 2.5: Pomiar Kontrolny M3 🎯 **POMIAROWE**

- **Goal:** Pomiar postępu po zakończeniu Modułu 2. Weryfikacja poprawy w zakresie kontroli impulsów i reakcji emocjonalnych.
- **Kroki:**
  1. Krótkie przypomnienie technik z modułu (5 min)
  2. Wypełnienie kwestionariusza kontrolnego (5 min)
  3. Test Sigma Scan (3 min)
  4. Test Sigma Control (3 min)
  5. Test Sigma Focus (3 min)
  6. Pomiar HRV baseline (10 min)
  7. Analiza wyników i feedback indywidualny (10 min)
- **Powiązane ćwiczenia:** `game-scan`, `game-control`, `game-focus`

---

#### SIGMA SPRINT 3 — Trening Wyobrażeniowy (`sprint-3`, status: planned)

5 spotkań. Moduł: `imagery_training`.

##### M3-1 — Spotkanie 3.1: Wprowadzenie do wizualizacji

- **Goal:** Poznanie podstaw treningu wyobrażeniowego i jego wpływu na wyniki sportowe.
- **Kroki:**
  1. Rozgrzewka mentalna — test Sigma (5 min)
  2. Wprowadzenie teoretyczne — jak działa wizualizacja? (15 min)
  3. Pierwsze ćwiczenie — wizualizacja prostego ruchu (15 min)
  4. Praktyka: Wizualizacja sukcesu w sporcie (15 min)
  5. Refleksja grupowa (5 min)
  6. Zadanie domowe — codzienna wizualizacja (5 min)
- **Powiązane ćwiczenia:** `ex-9`

##### M3-2 — Spotkanie 3.2: Wizualizacja techniczna

- **Goal:** Mentalne przećwiczenie technicznych elementów wykonania akcji sportowej.
- **Kroki:**
  1. Rozgrzewka — gry Sigma (10 min)
  2. Analiza techniki — wybór elementu do wizualizacji (10 min)
  3. Wizualizacja krok po kroku (20 min)
  4. Fizyczna praktyka z wykorzystaniem wizualizacji (15 min)
  5. Podsumowanie doświadczeń (5 min)
- **Powiązane ćwiczenia:** `ex-9`, `game-focus`

##### M3-3 — Spotkanie 3.3: Wizualizacja taktyczna

- **Goal:** Mentalne przygotowanie do różnych scenariuszy taktycznych w rywalizacji.
- **Kroki:**
  1. Rozgrzewka mentalna (5 min)
  2. Wprowadzenie — wizualizacja scenariuszy (10 min)
  3. Praktyka: Wizualizacja różnych sytuacji meczowych (25 min)
  4. Dyskusja grupowa — przygotowanie mentalne (15 min)
  5. Podsumowanie (5 min)
- **Powiązane ćwiczenia:** `ex-9`, `ex-1`

##### M3-4 — Spotkanie 3.4: Wizualizacja emocjonalna

- **Goal:** Przygotowanie mentalne do radzenia sobie z emocjami w trakcie rywalizacji.
- **Kroki:**
  1. Rozgrzewka — kompletna bateria Sigma (15 min)
  2. Wprowadzenie — emocje w wizualizacji (10 min)
  3. Praktyka: Wizualizacja trudnych momentów (20 min)
  4. Integracja wszystkich technik z programu (10 min)
  5. Przygotowanie do finalnego pomiaru (5 min)
- **Powiązane ćwiczenia:** `ex-9`, `ex-8`, `ex-7`

##### M3-5 — Spotkanie 3.5: Pomiar Końcowy M4 🎯 **POMIAROWE**

- **Goal:** Finalny pomiar po zakończeniu całego programu Sigma Teams. Weryfikacja długoterminowego postępu.
- **Kroki:**
  1. Krótkie przypomnienie wszystkich technik (10 min)
  2. Wypełnienie kwestionariusza końcowego (5 min)
  3. Test Sigma Scan (3 min)
  4. Test Sigma Control (3 min)
  5. Test Sigma Focus (3 min)
  6. Pomiar HRV baseline (10 min)
  7. Analiza wyników całego programu (15 min)
  8. Uroczyste zakończenie i certyfikaty (10 min)
- **Powiązane ćwiczenia:** `game-scan`, `game-control`, `game-focus`

---

#### SIGMA PRO (`sigma-pro`, status: placeholder)

W kodzie istnieje tylko zakładka w `ClubDetail.tsx` — brak danych spotkań. Do uzupełnienia w przyszłości. Sugerowana struktura: 8–12 spotkań indywidualnych (1:1 z trenerem mentalnym), praca z elitarnymi zawodnikami, integracja wszystkich modułów.

---

### 1.4 Kwestionariusze

| ID | Nazwa | Czas | Częstotliwość | Opis |
|---|---|---|---|---|
| `six_sigma_full` | Six Sigma | 5 min | 2× w sezonie (T0 + T-Final) | Kompleksowa ocena 6 kluczowych kompetencji psychologicznych. |
| `six_sigma_lite` | Six Sigma Lite | 90 sek | Co 4 tygodnie (po każdym Sprincie) | Szybka sonda monitorująca postępy. Key Indicators. |
| `six_sigma_mood` | Six Sigma Mood | 1 min | Przy każdym pomiarze | Pytania kontekstowe o stan fizyczny, emocjonalny i środowiskowy. |

Pełna definicja pytań znajduje się w `src/data/sixSigmaQuestionnaires.ts` — pozostaje w obecnej strukturze (osobna tabela `questionnaires` opisana w sekcji 3).

---

## 2. System tagowania

Tagi są zorganizowane w **osie** (axes). Każde ćwiczenie/spotkanie/program może mieć wiele tagów z różnych osi.

### Słownik osi i wartości

| Oś (`axis`) | Wartości (`value`) | Etykieta PL | Zastosowanie |
|---|---|---|---|
| **`category`** | `breathing` | Oddech | Typ ćwiczenia |
| | `focus` | Koncentracja | |
| | `control` | Kontrola | |
| | `visualization` | Wizualizacja | |
| | `game` | Gra | |
| | `assessment` | Pomiar | |
| **`competency`** | `attention` | Uwaga | Mapowanie do Six Sigma |
| | `inhibition` | Hamowanie | |
| | `working_memory` | Pamięć robocza | |
| | `arousal_regulation` | Regulacja pobudzenia | |
| | `emotional_control` | Kontrola emocji | |
| | `imagery` | Wyobraźnia | |
| **`intensity`** | `low` | Niska | Obciążenie kognitywne |
| | `medium` | Średnia | |
| | `high` | Wysoka | |
| **`context`** | `pre_competition` | Przed zawodami | Moment stosowania |
| | `in_competition` | W trakcie zawodów | |
| | `recovery` | Regeneracja | |
| | `daily_practice` | Codzienna praktyka | |
| | `team` | Zespołowo | |
| | `individual` | Indywidualnie | |
| **`age_group`** | `youth_u14` | Dzieci do 14 lat | Grupa docelowa |
| | `junior_14_18` | Junior 14–18 | |
| | `senior_18plus` | Senior 18+ | |
| **`equipment_required`** | `none` | Brak | Wymagany sprzęt |
| | `cards` | Karty | |
| | `app` | Aplikacja | |
| | `mat` | Mata | |
| | `timer` | Timer | |
| **`program`** | `sigma_go` | Sigma Go! | Przynależność programowa |
| | `sigma_sprint_1` | Sprint 1 | |
| | `sigma_sprint_2` | Sprint 2 | |
| | `sigma_sprint_3` | Sprint 3 | |
| | `sigma_pro` | Sigma Pro | |
| **`module`** | `attention_training` | Trening uwagi | Moduł tematyczny |
| | `impulse_control` | Kontrola impulsów | |
| | `imagery_training` | Trening wyobrażeniowy | |

### Mapa tagów ćwiczeń (skrót)

| Slug | Category | Competency | Intensity | Programs |
|---|---|---|---|---|
| `ex-1` | breathing | arousal_regulation | low | sigma_go, sprint_1 |
| `ex-2` | focus | attention, arousal_regulation | low | sprint_1 |
| `ex-3` | control | inhibition | medium | sigma_go, sprint_2 |
| `ex-4` | focus | attention | low | sprint_1 |
| `ex-5` | focus | attention, emotional_control | medium | sprint_1 |
| `ex-6` | focus | attention, working_memory | high | sprint_1 |
| `ex-7` | control | inhibition, arousal_regulation | medium | sigma_go, sprint_2 |
| `ex-8` | control | emotional_control, arousal_regulation | medium | sprint_2 |
| `ex-9` | visualization | imagery, emotional_control | low | sprint_3 |
| `game-scan` | game, assessment | attention | medium | wszystkie |
| `game-focus` | game, assessment | attention, inhibition | high | sigma_go, sprint_1, sprint_2 |
| `game-control` | game, assessment | inhibition | high | sigma_go, sprint_2 |
| `game-memo` | game, assessment | working_memory | high | sprint_1, sprint_3 |
| `game-tracker` | game, assessment | attention, working_memory | high | sprint_1, sprint_3 |

---

## 3. Proponowany schemat bazy danych

> **Uwaga:** Sekcja czysto referencyjna. Nie zawiera wykonywanych migracji. Wartości enumów oraz RLS policies opisane słownie — do implementacji w osobnym kroku.

### 3.1 Tabela `exercises`

Globalna biblioteka ćwiczeń + gier (gry to ćwiczenia z `is_game=true`).

```sql
CREATE TABLE public.exercises (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                 TEXT NOT NULL UNIQUE,        -- 'ex-1', 'game-scan'
  title                TEXT NOT NULL,
  description          TEXT NOT NULL,
  duration_text        TEXT NOT NULL,               -- '5-10 min'
  duration_min_minutes INTEGER,                     -- 5
  duration_max_minutes INTEGER,                     -- 10
  category             TEXT NOT NULL,               -- enum: breathing/focus/control/visualization/game
  objective            TEXT,
  equipment            TEXT[] DEFAULT '{}',
  coaching_tips        TEXT[] DEFAULT '{}',
  adaptation_easier    TEXT,
  adaptation_harder    TEXT,
  metrics              TEXT[] DEFAULT '{}',
  is_game              BOOLEAN NOT NULL DEFAULT FALSE,
  game_component       TEXT,                        -- 'ScanGame', 'FocusGame', NULL dla zwykłych ćwiczeń
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_exercises_category ON public.exercises(category);
CREATE INDEX idx_exercises_is_game ON public.exercises(is_game);
```

**RLS:** Globalna biblioteka — `SELECT` dostępny dla wszystkich `authenticated`. Modyfikacje (`INSERT`/`UPDATE`/`DELETE`) tylko dla roli `admin` (przez `has_role()`).

---

### 3.2 Tabela `exercise_steps`

Kroki ćwiczeń (1:N do `exercises`).

```sql
CREATE TABLE public.exercise_steps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  UNIQUE(exercise_id, order_index)
);

CREATE INDEX idx_exercise_steps_exercise ON public.exercise_steps(exercise_id, order_index);
```

**RLS:** `SELECT` dla `authenticated`. Modyfikacje tylko `admin`.

---

### 3.3 Tabela `tags`

Słownik tagów (oś + wartość).

```sql
CREATE TABLE public.tags (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  axis     TEXT NOT NULL,                           -- 'category', 'competency', 'intensity', 'context', 'age_group', 'equipment_required', 'program', 'module'
  value    TEXT NOT NULL,                           -- 'breathing', 'attention'...
  label_pl TEXT NOT NULL,
  UNIQUE(axis, value)
);

CREATE INDEX idx_tags_axis ON public.tags(axis);
```

**RLS:** `SELECT` dla `authenticated`. Modyfikacje tylko `admin`.

---

### 3.4 Tabela `exercise_tags`

Relacja M:N ćwiczenia ↔ tagi.

```sql
CREATE TABLE public.exercise_tags (
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  tag_id      UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (exercise_id, tag_id)
);

CREATE INDEX idx_exercise_tags_tag ON public.exercise_tags(tag_id);
```

**RLS:** `SELECT` dla `authenticated`. Modyfikacje tylko `admin`.

---

### 3.5 Tabela `programs`

Programy Sigma Teams (Sigma Go, Sprint 1/2/3, Sigma Pro).

```sql
CREATE TABLE public.programs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT NOT NULL UNIQUE,           -- 'sigma-go', 'sigma-sprint-1'
  title             TEXT NOT NULL,
  description       TEXT,
  type              TEXT NOT NULL,                  -- enum: 'demo' / 'sprint' / 'pro'
  total_meetings    INTEGER NOT NULL DEFAULT 0,
  duration_text     TEXT,                           -- '60 min' (dla demo) / '5 spotkań po 60 min'
  training_guidance TEXT,                           -- markdown z instrukcją prowadzenia (poziom programu)
  order_index       INTEGER NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**RLS:** `SELECT` dla `authenticated`. Modyfikacje tylko `admin`.

---

### 3.6 Tabela `meetings`

Spotkania w ramach programu (template — bez powiązania z konkretnym klubem).

```sql
CREATE TABLE public.meetings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id        UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  slug              TEXT NOT NULL,                  -- 'm1-1', 'm2-3', 'sigma-go-demo'
  order_index       INTEGER NOT NULL,
  title             TEXT NOT NULL,
  goal              TEXT NOT NULL,
  is_measurement    BOOLEAN NOT NULL DEFAULT FALSE,
  training_guidance TEXT,                           -- opcjonalne wskazówki na poziomie spotkania
  UNIQUE(program_id, slug),
  UNIQUE(program_id, order_index)
);

CREATE INDEX idx_meetings_program ON public.meetings(program_id, order_index);
```

**RLS:** `SELECT` dla `authenticated`. Modyfikacje tylko `admin`.

---

### 3.7 Tabela `meeting_steps`

Kroki agendy spotkania (1:N do `meetings`).

```sql
CREATE TABLE public.meeting_steps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id  UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  content     TEXT NOT NULL,                       -- pełna treść kroku z numeracją + ewentualne @-refs
  UNIQUE(meeting_id, order_index)
);

CREATE INDEX idx_meeting_steps_meeting ON public.meeting_steps(meeting_id, order_index);
```

**RLS:** `SELECT` dla `authenticated`. Modyfikacje tylko `admin`.

---

### 3.8 Tabela `meeting_exercises`

M:N spotkania ↔ ćwiczenia (`relatedExercises` z konspektu).

```sql
CREATE TABLE public.meeting_exercises (
  meeting_id  UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (meeting_id, exercise_id)
);

CREATE INDEX idx_meeting_exercises_exercise ON public.meeting_exercises(exercise_id);
```

**RLS:** `SELECT` dla `authenticated`. Modyfikacje tylko `admin`.

---

### 3.9 Tabela `club_program_meetings`

Konkretne instancje spotkań przypisane do klubu (data zaplanowana, status ukończenia, notatki trenera).

```sql
CREATE TABLE public.club_program_meetings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id         UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  meeting_id      UUID NOT NULL REFERENCES public.meetings(id),
  scheduled_date  TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(club_id, meeting_id)
);

CREATE INDEX idx_club_program_meetings_club ON public.club_program_meetings(club_id);
CREATE INDEX idx_club_program_meetings_meeting ON public.club_program_meetings(meeting_id);
```

**RLS:**
- `SELECT` — trenerzy/coachowie przypisani do klubu (po wdrożeniu `user_roles` + relacji `trainers_clubs`)
- `INSERT`/`UPDATE`/`DELETE` — tylko trenerzy klubu lub `admin`
- Funkcja pomocnicza: `is_club_member(_user_id uuid, _club_id uuid)` jako `SECURITY DEFINER`

---

### 3.10 Tabela `questionnaires` (referencyjna — istnieje w `sixSigmaQuestionnaires.ts`)

```sql
CREATE TABLE public.questionnaires (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,                 -- 'six_sigma_full', 'six_sigma_lite', 'six_sigma_mood'
  name        TEXT NOT NULL,
  description TEXT,
  duration    TEXT,
  category    TEXT,
  frequency   TEXT,
  questions   JSONB NOT NULL DEFAULT '[]',          -- struktura pytań z sixSigmaQuestionnaires.ts
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**RLS:** `SELECT` dla `authenticated`. Modyfikacje tylko `admin`.

---

### 3.11 Trigger `update_updated_at`

Wspólny trigger dla wszystkich tabel z `updated_at`:

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Przykład zastosowania:
CREATE TRIGGER trg_exercises_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- (powtórzyć dla: programs, meetings, club_program_meetings, questionnaires)
```

---

### 3.12 Diagram relacji (ASCII)

```
                        ┌──────────┐
                        │ programs │
                        └────┬─────┘
                             │ 1:N
                             ▼
                        ┌──────────┐         ┌────────────────┐
                        │ meetings │◀────M:N─│ meeting_       │
                        └────┬─────┘         │ exercises      │
                             │ 1:N           └────────┬───────┘
                             ▼                        │
                       ┌─────────────┐                │
                       │ meeting_    │                │
                       │ steps       │                │
                       └─────────────┘                │
                             ▲                        │
                             │ 1:N                    ▼
                        ┌────────────────┐       ┌───────────┐
                        │ club_program_  │       │ exercises │◀──┐
                        │ meetings       │       └─────┬─────┘   │
                        └────────┬───────┘             │         │
                                 │                     │ 1:N     │
                                 │ N:1                 ▼         │
                                 ▼               ┌──────────┐    │
                            ┌───────┐            │ exercise │    │
                            │ clubs │            │ _steps   │    │
                            └───────┘            └──────────┘    │
                                                                  │
                                          ┌──────────┐  M:N      │
                                          │ tags     │◀──────────┤
                                          └──────────┘           │
                                                ▲                │
                                                │   ┌────────────┴───┐
                                                └───│ exercise_tags  │
                                                    └────────────────┘
```

---

## 4. Mapping źródło → tabela

| Źródło (`libraryData.ts`) | Tabela docelowa | Pole / kolumna |
|---|---|---|
| `Exercise.id` | `exercises.slug` | `'ex-1'`, `'game-scan'` |
| `Exercise.title` | `exercises.title` | |
| `Exercise.description` | `exercises.description` | |
| `Exercise.duration` (string) | `exercises.duration_text` + parse → `duration_min/max_minutes` | |
| `Exercise.category` | `exercises.category` + tag (`category:<value>`) | |
| `Exercise.objective` | `exercises.objective` | |
| `Exercise.equipment[]` | `exercises.equipment` (text[]) | |
| `Exercise.coachingTips[]` | `exercises.coaching_tips` (text[]) | |
| `Exercise.adaptations.easier` | `exercises.adaptation_easier` | |
| `Exercise.adaptations.harder` | `exercises.adaptation_harder` | |
| `Exercise.metrics[]` | `exercises.metrics` (text[]) | |
| `Exercise.steps[i].title` + `content` | `exercise_steps` (1 wiersz na step, `order_index = i`) | |
| Gry (`game-*`) | `exercises.is_game = true`, `exercises.game_component = '<Component>'` | |
| `Sprint.id` / `Sprint.title` / `Sprint.status` | `programs.slug` / `programs.title` (status = stan klubu, nie programu — pomijany w template) | |
| `sigmaGoDemoTraining` | `programs` (typ `'demo'`, `total_meetings=1`) + 1 rekord w `meetings` | |
| `Meeting.id` / `title` / `outline.goal` / `isMeasurement` | `meetings.slug` / `title` / `goal` / `is_measurement` | |
| `Meeting.outline.steps[]` (string[]) | `meeting_steps` (1 wiersz na element, `order_index = i`, content = full string) | |
| `Meeting.outline.relatedExercises[]` | `meeting_exercises` (lookup `slug → exercise_id`) | |
| `Meeting.outline.trainingGuidance` | `meetings.training_guidance` (nullable) | |
| `Meeting.date` / `Meeting.completed` / `Sprint.completedMeetings` | `club_program_meetings.scheduled_date` / `completed_at` (przeniesione na poziom instancji per klub — w template ich nie ma) | |
| `questionnaires[]` (z `libraryData.ts`) + `sixSigmaQuestionnaires.ts` | `questionnaires` + JSONB `questions` | |

---

## 5. Plan migracji danych

### 5.1 Kolejność wykonania

1. **Migracja schematu** — `supabase/migrations/<timestamp>_konspekty_schema.sql` z definicjami z sekcji 3 (tabele + indeksy + RLS + trigger).
2. **Seed słownika `tags`** — INSERT-y dla wszystkich osi i wartości z sekcji 2 (~35 rekordów).
3. **Seed `exercises` + `exercise_steps`** — 14 ćwiczeń × średnio 4 kroki = ~70 rekordów stepów.
4. **Seed `exercise_tags`** — relacje M:N na podstawie list tagów per ćwiczenie z sekcji 1.1/1.2 (~120 rekordów).
5. **Seed `programs`** — 5 rekordów (sigma-go, sprint-1, sprint-2, sprint-3, sigma-pro placeholder).
6. **Seed `meetings` + `meeting_steps` + `meeting_exercises`** — 16 spotkań (1 sigma-go + 5+5+5 sprint), ~100 stepów, ~60 powiązań exercise.
7. **Seed `questionnaires`** — 3 rekordy + struktura `questions` jako JSONB importowana z `sixSigmaQuestionnaires.ts`.
8. **Refaktor frontendowy:**
   - Zastąpić importy `exerciseLibrary`, `allSprints`, `sigmaGoDemoTraining`, `questionnaires` z `libraryData.ts` na zapytania Supabase (nowe hooki: `useExercises`, `usePrograms`, `useMeetings`, `useQuestionnaires`).
   - Zachować `libraryData.ts` jako fallback / źródło dla skryptu seedującego, ostatecznie usunąć.

### 5.2 Skrypt eksportu (rekomendacja)

Stworzyć jednorazowy skrypt Node/TS (`scripts/export-library-to-sql.ts`) który:

1. Importuje `exerciseLibrary`, `allSprints`, `sigmaGoDemoTraining` z `src/data/libraryData.ts`.
2. Generuje plik `.sql` z `INSERT INTO public.exercises ...`, `INSERT INTO public.exercise_steps ...` itd. używając UUID-ów generowanych po stronie skryptu (dla stabilnych referencji `meeting_exercises.exercise_id`).
3. Tagi przypisuje na podstawie statycznej mapy zdefiniowanej w skrypcie (ta sama mapa co w sekcji 2 niniejszego dokumentu).
4. Wynikowy plik `.sql` wykonujemy jako **drugą migrację** (`<timestamp>_konspekty_seed.sql`).

### 5.3 Walidacja po migracji

Zapytania kontrolne:

```sql
-- Liczba ćwiczeń = 14
SELECT COUNT(*) FROM public.exercises;

-- Każde ćwiczenie ma >= 1 krok
SELECT e.slug FROM public.exercises e
LEFT JOIN public.exercise_steps s ON s.exercise_id = e.id
GROUP BY e.id, e.slug HAVING COUNT(s.id) = 0;

-- Każde spotkanie z relatedExercises ma wpisy w meeting_exercises
SELECT m.slug, COUNT(me.exercise_id) AS linked
FROM public.meetings m LEFT JOIN public.meeting_exercises me ON me.meeting_id = m.id
GROUP BY m.id, m.slug ORDER BY linked;

-- Liczba tagów = 35 (suma wartości ze słownika)
SELECT axis, COUNT(*) FROM public.tags GROUP BY axis ORDER BY axis;
```

### 5.4 Zakres pominięty (do osobnych iteracji)

- Wersjonowanie konspektów (`exercises_versions`) — przyszły feature dla śledzenia zmian merytorycznych
- Tłumaczenia EN (`exercises_i18n`) — gdy aplikacja wejdzie na rynek międzynarodowy
- Custom konspekty trenerskie (`custom_exercises` per `trainer_id` lub `club_id`)
- Załączniki PDF/wideo do ćwiczeń (Storage bucket + tabela `exercise_attachments`)
- Statystyki użycia ćwiczeń (`exercise_usage_log`)

---

**Koniec dokumentu.** Wszystkie 9 ćwiczeń, 5 gier, 16 spotkań (1 demo + 15 ze sprintów) zostały zinwentaryzowane z pełną treścią. Schemat bazy gotowy do implementacji w osobnym kroku migracji.
