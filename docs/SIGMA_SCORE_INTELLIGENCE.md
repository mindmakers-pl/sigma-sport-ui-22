# Sigma Score Intelligence - AI Integration Architecture

## Overview

Sigma Score Intelligence integrates AI-powered interpretation of complete measurement session data to provide actionable insights for athletes and coaches. The system analyzes questionnaire responses, cognitive game performance, HRV data, and athlete feedback to generate holistic performance assessments.

---

## Architecture

### 1. Data Collection Flow

```
Measurement Session
├── Six Sigma Questionnaire (36 questions + 6 modifiers)
├── Cognitive Games
│   ├── Sigma Focus (Stroop Test) → Kontrola + Fokus
│   ├── Sigma Scan (Schulte Table) → Aktywacja + Pewność  
│   └── Sigma Memo (N-2 Back) → Determinacja + Reset
├── HRV Baseline (rMSSD + HR)
└── Sigma Feedback (2 open-ended questions)
```

### 2. AI Integration Options

#### Option A: Lovable AI (Gemini)
- **Pros**: Free monthly credits, built-in caching, no setup
- **Cons**: Token costs after free tier
- **Implementation**: Uses `LOVABLE_API_KEY` auto-provisioned

#### Option B: Own Gemini Corporate API (RECOMMENDED)
- **Pros**: Your own quota, cost control
- **Cons**: Requires secret management
- **Implementation**: Edge function with your `GEMINI_API_KEY`

#### Option C: Claude API
- **Pros**: Excellent reasoning for psychoeducational framing
- **Cons**: Requires separate Claude API plan (not Claude Pro subscription)
- **Implementation**: Edge function with `ANTHROPIC_API_KEY`

---

## Implementation: Own Gemini API

### Step 1: Add Secret

Store your Gemini API key securely:
```
Settings → Cloud → Secrets → Add Secret
Name: GEMINI_API_KEY
Value: [your_corporate_gemini_key]
```

### Step 2: Edge Function

**File: `supabase/functions/analyze-sigma-score/index.ts`**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionData } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const systemPrompt = `You are a sports psychology expert analyzing mental performance data for young athletes (10-18 years).

# Your Role
Analyze integrated session data (questionnaires, cognitive tests, HRV, feedback) to provide actionable insights using psychoeducational framing that strengthens athlete confidence.

# Six Sigma Framework
Six competencies measured via questionnaire:
- Aktywacja (Activation): Energy regulation, arousal control
- Kontrola (Control): Emotional stability, impulse control
- Reset: Error recovery, emotional regulation after mistakes
- Fokus (Focus): Sustained attention, distraction resistance
- Pewność (Confidence): Self-efficacy, belief in abilities
- Determinacja (Determination): Grit, persistence through adversity

Each competency measured via triangulation:
- Thoughts (cognitive self-assessment)
- Body (somatic/physiological responses)
- Behavior (observable actions)

# Executive Trinity Mapping
Cognitive games feed competencies via weighted algorithm:
- **Sigma Focus (Stroop Test)**: 
  - Accuracy → Kontrola (0.7 weight)
  - RT difference (easy vs hard) → Fokus (0.5 weight)
- **Sigma Scan (Schulte Table)**: 
  - Completion time → Aktywacja (0.8 weight)
  - Error pattern → Pewność (0.5 weight)
- **Sigma Memo (N-2 Back)**: 
  - Recovery speed after error → Reset (0.9 weight)
  - Score consistency → Determinacja (0.6 weight)

# Contextual Modifiers (Six Sigma Mood)
Six environmental/state factors explain variance without skill deficiency:
- Sleep quality
- Out-of-sport stress (school/home)
- Health status (injuries/pain)
- Social support (team connection)
- Nutrition/fuel
- Flow/enjoyment (burnout indicator)

Low modifier scores contextualize performance drops (e.g., low sleep + low Aktywacja = fatigue, not inability).

# Interpretation Rules
1. **Data Quality First**: Check for straight-lining, reverse-question inconsistency
2. **Contextual Modifiers**: Low competency + low modifier = contextual, not skill deficit
3. **Convergence Check**: Compare questionnaire self-assessment vs cognitive game performance
4. **Athlete Feedback**: Integrate athlete's self-reflection on performance attribution
5. **Psychoeducational Framing**: Acknowledge what athlete reported, explain scientifically, provide actionable learning

# Output Structure
Return JSON with:
- overall_assessment: 2-3 sentence summary for athlete (psychoeducational tone)
- key_observations: Array of {competency, finding, evidence, interpretation}
- recommendations: Actionable training tips (concrete, behavioral)
- attention_areas: Areas requiring coach follow-up
- convergence_analysis: Comparison of questionnaire vs cognitive performance
- contextual_factors: Interpretation of modifier influences

# Constraints
- Use "Mindmakers" brand voice: energetic, performance-oriented, coaching tone
- Avoid clinical language (therapy, diagnosis, disorder, treatment)
- Focus on actionable training tips, not emotional support
- For young athletes: strengthen confidence, provide learning value`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n# Session Data to Analyze:\n${JSON.stringify(sessionData, null, 2)}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const aiText = result.candidates[0].content.parts[0].text;
    
    // Parse JSON from AI response (assuming AI returns valid JSON)
    const interpretation = JSON.parse(aiText);

    return new Response(JSON.stringify({ interpretation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-sigma-score:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### Step 3: Frontend Integration

**File: `src/pages/SessionDetail.tsx`**

Add new "Sigma Score" tab that calls edge function:

```typescript
const generateSigmaScore = async () => {
  setIsGenerating(true);
  
  const sessionData = {
    athlete: {
      id: athleteId,
      age: 13,
      sport: "Swimming"
    },
    questionnaire: {
      six_sigma_scores: session.six_sigma_scores,
      mood_modifiers: session.mood_modifiers
    },
    cognitive: {
      focus: session.focus_results,
      scan: session.scan_results,
      memo: session.memo_results
    },
    hrv: {
      rMSSD: session.hrv_rmssd,
      HR: session.hrv_hr
    },
    feedback: session.sigma_feedback
  };

  try {
    const { data, error } = await supabase.functions.invoke('analyze-sigma-score', {
      body: { sessionData }
    });
    
    if (error) throw error;
    setSigmaInterpretation(data.interpretation);
  } catch (error) {
    console.error('Failed to generate Sigma Score:', error);
    toast.error('Nie udało się wygenerować interpretacji');
  } finally {
    setIsGenerating(false);
  }
};
```

---

## Input Data Structure

```typescript
interface SessionDataForAI {
  athlete: {
    id: string;
    age: number;
    sport: string;
  };
  questionnaire: {
    six_sigma_scores: {
      aktywacja: number;
      kontrola: number;
      reset: number;
      fokus: number;
      pewnosc: number;
      determinacja: number;
    };
    mood_modifiers: {
      sleep: number;
      stress: number;
      health: number;
      social_support: number;
      nutrition: number;
      flow: number;
    };
  };
  cognitive: {
    focus?: {
      median_rt_ms: number;
      accuracy_pct: number;
      congruent_rt_ms: number;
      incongruent_rt_ms: number;
      interference_cost_ms: number;
    };
    scan?: {
      max_number_reached: number;
      completion_time_sec: number;
      error_count: number;
    };
    memo?: {
      score: number;
      recovery_speed_ms: number;
      consistency_score: number;
    };
  };
  hrv?: {
    rMSSD: number;
    HR: number;
  };
  feedback?: {
    question1_answer: string;
    question2_answer: string;
  };
}
```

---

## Expected AI Output

```typescript
interface SigmaScoreInterpretation {
  overall_assessment: string; // 2-3 sentences for athlete
  key_observations: Array<{
    competency: string;
    finding: string;
    evidence: string;
    interpretation: string;
  }>;
  recommendations: Array<{
    competency: string;
    action: string;
    why: string;
  }>;
  attention_areas: string[]; // For coach follow-up
  convergence_analysis: {
    questionnaire_vs_cognitive: string;
    alignment_score: "high" | "medium" | "low";
    notes: string;
  };
  contextual_factors: {
    modifier: string;
    impact: string;
    recommendation: string;
  }[];
}
```

---

## Development vs Production

### Development (localStorage)
- Call edge function with mock data from localStorage
- Test interpretation algorithm with real session structures
- Refine system prompt based on output quality
- **Token usage**: Only when you test (low frequency)

### Production (Cloud database)
- Persistence logic changes from `localStorage.setItem()` to `supabase.from().insert()`
- Edge function receives real sessionId, fetches data from DB
- All interpretation stored in `session_interpretations` table

---

## Cost Optimization

### Gemini API Pricing (Corporate)
- **Input**: ~$0.075 per 1M tokens
- **Output**: ~$0.30 per 1M tokens

### Estimated Token Usage per Session
- System prompt: ~1200 tokens
- Session data: ~800 tokens
- AI output: ~1000 tokens
- **Total per analysis**: ~3000 tokens = ~$0.0015 (less than 0.2 cents)

### Lovable AI Pricing
- **1000 free tokens/month**
- Your single call = 3000 tokens = 3x free tier
- If testing 10 sessions = 30,000 tokens = $30 credits consumed

**Verdict**: Own Gemini API is dramatically cheaper for your use case.

---

## When to Enable Cloud

**Enable Cloud when:**
1. ✅ You've tested Sigma Score interpretation with localStorage data
2. ✅ You've validated AI output quality and refined system prompt
3. ✅ You want to deploy to production with persistent data
4. ✅ You need multi-trainer access, athlete authentication, or data export

**What changes with Cloud:**
- **Persistence**: `localStorage` → `supabase.from().insert()`
- **Authentication**: Mock trainer/athlete → real Supabase Auth
- **Edge functions**: Already work with localhost development (no change)

---

## SessionWizard Refactoring

### Current Problems
1. ❌ Broken return navigation (can't abort mid-session)
2. ❌ Inconsistent theming (games dark, questionnaires white)
3. ❌ Unclear button logic after completion
4. ❌ No coherent flow between components

### Refactoring Strategy
**Option A: Fix Now (Before Cloud)**
- Pros: Clean architecture for Cloud migration
- Cons: Rework localStorage logic, then rework again for DB

**Option B: Fix After Cloud**
- Pros: Single refactor with final persistence logic
- Cons: Must work around broken UX until then

**Recommendation**: Fix critical UX blockers now (return navigation, theming), defer complete architectural redesign until after Cloud migration.

---

## Next Steps

1. **Save your Gemini API key** as secret in Cloud settings
2. **Create edge function** `analyze-sigma-score` with your API
3. **Test with localStorage data** - call edge function from SessionDetail
4. **Refine system prompt** based on output quality
5. **Enable Cloud** when ready for production persistence
6. **Migrate localStorage → DB** and update SessionWizard architecture

---

## References

- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Six Sigma Interpretation Rules](./SIX_SIGMA_INTERPRETATION_RULES.md)
- [Data Science Architecture](./DATA_SCIENCE_ARCHITECTURE.md)
