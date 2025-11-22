# Six Sigma Psychometric Interpretation Rules

## Overview
This document describes the rule-based decision tree for generating automatic interpretations of Six Sigma questionnaire results. The system analyzes competency scores, contextual modifiers, and response patterns to provide actionable insights for coaches and athletes.

## Core Algorithm Structure

### 1. Data Quality Validation (First Priority)
Before interpretation, validate response quality:

```
IF straight_lining_detected (all responses identical):
  → FLAG: "Odpowiedzi wyglądają na nieprzemyślane. Zwróć uwagę na rzetelność wypełniania."
  → SKIP further interpretation

IF reverse_question_inconsistency > threshold (e.g., >30% discrepancy):
  → FLAG: "Wykryto niespójności w odpowiedziach. Wyniki mogą być mało wiarygodne."
  → Mark results as "Niska wiarygodność"

IF flow_enjoyment_score <= 1 AND overall_hexagon_mean < 3.0:
  → FLAG: "Niski wynik Flow sugeruje wypalenie/demotywację. Skonsultuj się z zawodnikiem."
  → Mark entire result set as "Wymagana interwencja"
```

### 2. Competency Scoring & Interpretation
Each competency (Activation, Control, Reset, Focus, Confidence, Determination) is scored 1-5. 

**Score Interpretation Bands:**
- **4.5-5.0**: "Wysoki" - Silna kompetencja, obszar przewagi
- **3.5-4.4**: "Dobry" - Kompetencja rozwinięta, możliwe dalsze wzmocnienie
- **2.5-3.4**: "Średni" - Kompetencja rozwijająca się, wymaga treningu
- **1.5-2.4**: "Niski" - Kompetencja słabo rozwinięta, priorytet treningowy
- **1.0-1.4**: "Bardzo niski" - Kompetencja wymagająca natychmiastowej uwagi

### 3. Contextual Modifier Correction
Modifiers provide context explaining performance variance WITHOUT indicating skill deficiency.

**Modifier Impact Rules:**

```
FOR EACH competency WITH score < 3.0:
  
  IF sleep_score <= 2:
    → ADD context: "Niski wynik może wynikać z niewystarczającej regeneracji (sen)."
    → SUGGEST: "Zadbaj o 8-9h snu przed następnym pomiarem."
  
  IF stress_score <= 2:
    → ADD context: "Wysoki stres pozasportowy (szkoła/dom) wpływa na wynik."
    → SUGGEST: "Rozważ techniki zarządzania stresem (np. oddech rezonansowy)."
  
  IF health_score <= 2:
    → ADD context: "Kontuzja/ból wpływa na koncentrację i motywację."
    → SUGGEST: "Kontynuuj pracę regeneracyjną przed kolejnymi pomiarami."
  
  IF social_support_score <= 2:
    → ADD context: "Niskie poczucie wsparcia w zespole może obniżać pewność siebie."
    → SUGGEST: "Praca nad integracją zespołu może poprawić wyniki."
  
  IF nutrition_score <= 2:
    → ADD context: "Niedostateczne przygotowanie żywieniowe przed testem."
    → SUGGEST: "Zadbaj o odpowiednie odżywienie 2-3h przed pomiarem."
```

### 4. Competency-Specific Interpretation Logic

#### ACTIVATION (Energia i Gotowość)
```
IF activation_score >= 4.5:
  → "Doskonała kontrola poziomu energii. Zawodnik wie, jak się „nakręcić" przed startem."
  
ELSE IF activation_score < 2.5:
  IF sleep_score <= 2 OR health_score <= 2:
    → "Niski wynik może wynikać z fizycznego zmęczenia lub niedoboru regeneracji."
  ELSE:
    → "Zawodnik ma trudność z mobilizacją energii. Trening: wizualizacja dynamiczna, muzyka motywacyjna, rozgrzewka mentalna."
```

#### CONTROL (Stabilność Emocjonalna)
```
IF control_score >= 4.5:
  → "Wysoka stabilność emocjonalna. Zawodnik dobrze radzi sobie z presją."
  
ELSE IF control_score < 2.5:
  IF stress_score <= 2:
    → "Wysoki stres pozasportowy obniża kontrolę emocjonalną w sporcie."
  ELSE:
    → "Zawodnik ma trudność z opanowaniem emocji pod presją. Trening: oddech 4-7-8, techniki grounding, autorozmowa."
```

#### RESET (Regeneracja po błędach)
```
IF reset_score >= 4.5:
  → "Zawodnik szybko wraca do gry po błędach. Nie „zapętla się" w negatywnych myślach."
  
ELSE IF reset_score < 2.5:
  → "Trudność z przezwyciężaniem błędów. Trening: mental reset routine (2 głębokie oddechy + wzrok na punkt odniesienia), praca nad self-compassion."
```

#### FOCUS (Koncentracja)
```
IF focus_score >= 4.5:
  → "Silna koncentracja. Zawodnik ignoruje rozpraszacze i trzyma uwagę na zadaniu."
  
ELSE IF focus_score < 2.5:
  → "Trudność z utrzymaniem koncentracji. Trening: mindfulness, ćwiczenia okulomotoryczne, praca z cue words."
```

#### CONFIDENCE (Pewność Siebie)
```
IF confidence_score >= 4.5:
  → "Wysoka pewność siebie. Zawodnik wierzy w swoje umiejętności."
  
ELSE IF confidence_score < 2.5:
  IF social_support_score <= 2:
    → "Niskie wsparcie społeczne może osłabiać pewność siebie."
  ELSE:
    → "Zawodnik potrzebuje budowania pewności siebie. Trening: dziennik sukcesów, pozytywna autorozmowa, wizualizacja perfekcyjnej wykonania."
```

#### DETERMINATION (Wytrwałość)
```
IF determination_score >= 4.5:
  → "Wysoka wytrwałość. Zawodnik nie odpuszcza, nawet gdy jest trudno."
  
ELSE IF determination_score < 2.5:
  IF flow_score <= 2:
    → "Niski Flow sugeruje wypalenie lub utratę motywacji. Rozważ zmianę celów lub rozmowę motywacyjną."
  ELSE:
    → "Zawodnik łatwo się zniechęca. Trening: ustalanie małych celów, monitoring postępów, praca nad growth mindset."
```

### 5. Pattern Recognition - Cross-Competency Insights

**High Activation + Low Control:**
```
→ "Zawodnik ma dużo energii, ale słabą kontrolę nad emocjami. Priorytet: nauka technik uspokajających (oddech, grounding)."
```

**Low Activation + High Determination:**
```
→ "Zawodnik jest wytrwały, ale brakuje mu energii startowej. Priorytet: trening mobilizacji przedstartowej."
```

**Low Focus + Low Reset:**
```
→ "Problemy z koncentracją i regeneracją po błędach. Sugeruje trudność z zarządzaniem uwagą pod presją. Priorytet: trening mental reset routine."
```

**Low Confidence + Low Determination:**
```
→ "Niska pewność siebie i wytrwałość. Zawodnik potrzebuje wsparcia motywacyjnego i budowania małych sukcesów."
```

**All scores < 2.5 AND Flow <= 2:**
```
→ "ALERT: Objawy wypalenia lub głębokiej demotywacji. Zalecana rozmowa z zawodnikiem i ewentualna konsultacja ze specjalistą."
```

### 6. Strength-Based Feedback (Always Include)

```
strongest_competency = MAX(all_competency_scores)

→ "Twój największy atut to [competency_name]. Wykorzystuj to jako fundament do budowania innych kompetencji."
```

### 7. Priority Recommendation Logic

```
weakest_competency = MIN(all_competency_scores WHERE score < 3.0)

IF weakest_competency EXISTS:
  → "Najbardziej potrzebujesz treningu w obszarze: [competency_name]."
  → Provide 2-3 specific training techniques for that competency
ELSE:
  → "Wszystkie kompetencje na dobrym poziomie. Kontynuuj trening dla utrzymania formy."
```

## Implementation Notes

### Rule Priority Order:
1. Data quality validation (straight-lining, reverse inconsistency)
2. Contextual modifier correction (sleep, stress, health, social, nutrition, flow)
3. Individual competency interpretation with thresholds
4. Cross-competency pattern recognition
5. Strength-based feedback
6. Priority recommendation

### Output Format:
- **Dla Zawodnika:** Child-friendly language, focus on actionable tips, avoid clinical terminology
- **Dla Trenera:** Include technical details, validation flags, suggested interventions

### Future Extensions:
- Longitudinal trend analysis (comparing T0 → T-final)
- Goal-outcome mapping (linking competency scores to performance outcomes in games)
- Personalized training program generation based on weakest competencies
