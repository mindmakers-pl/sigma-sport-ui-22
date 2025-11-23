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
...
- For young athletes: strengthen confidence, provide learning value`;

    // Retry logic with exponential backoff
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    
    let lastError;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Gemini API attempt ${attempt + 1}/${maxRetries}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
        
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
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Gemini API error:', response.status, errorText);
          
          // Retry on 429 (rate limit) or 5xx errors
          if (response.status === 429 || response.status >= 500) {
            throw new Error(`Gemini API error: ${response.status} (retryable)`);
          }
          
          // Don't retry on 4xx errors (except 429)
          throw new Error(`Gemini API error: ${response.status} (non-retryable)`);
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
        
      } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt + 1} failed:`, error.message);
        
        // Don't retry on non-retryable errors
        if (error.message.includes('non-retryable')) {
          break;
        }
        
        // Don't retry on AbortError (timeout)
        if (error.name === 'AbortError') {
          console.error('Request timeout');
          break;
        }
        
        // Exponential backoff before retry
        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All retries failed
    throw lastError || new Error('All retry attempts failed');

  } catch (error) {
    console.error('Error in analyze-sigma-score:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
