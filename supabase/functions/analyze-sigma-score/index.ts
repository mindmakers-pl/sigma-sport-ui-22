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

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
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
    
    // Try to parse JSON from AI response
    let interpretation;
    try {
      // Remove markdown code blocks if present
      const cleanedText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      interpretation = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', aiText);
      // Return raw text if JSON parsing fails
      interpretation = {
        overall_assessment: aiText,
        key_observations: [],
        recommendations: [],
        attention_areas: [],
        convergence_analysis: { notes: 'Raw text response, not structured' },
        contextual_factors: []
      };
    }

    return new Response(JSON.stringify({ interpretation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-sigma-score:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
