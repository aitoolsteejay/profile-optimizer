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
    const { headline, aboutSection, role, targetIcp, tone } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing profile optimization request:', { role, targetIcp, tone });

    const toneGuidance = {
      bold: "Use strong verbs, direct language, and confident assertions. Be punchy and assertive.",
      professional: "Use neutral, credible language. Be polished and trustworthy.",
      casual: "Use lighter, conversational language. Be approachable and friendly."
    };

    const systemPrompt = `You are a LinkedIn positioning expert who helps founders optimize their profiles for maximum authority and inbound leads.

Your task is to analyze the provided LinkedIn headline and about section, then generate optimized versions.

CRITICAL RULES:
- Do NOT invent metrics or social proof that wasn't provided
- If no social proof exists, phrase carefully without false claims
- Keep the about section between 120-150 words, 3 short paragraphs
- Make content skimmable and founder-friendly
- Ensure clear ICP, problem, and outcome are present

TONE: ${toneGuidance[tone as keyof typeof toneGuidance] || toneGuidance.bold}

Respond in valid JSON format with this exact structure:
{
  "headlines": {
    "authority": "Role + ICP + credibility/outcome formula",
    "problemSolver": "Problem + who it's for + mechanism formula", 
    "socialProof": "Trusted by X + what you do + result formula (only if proof provided, otherwise rephrase)"
  },
  "aboutSection": "Optimized about section (120-150 words, 3 paragraphs)",
  "positioningAngles": {
    "authority": "One sharp positioning one-liner",
    "problemSolver": "One sharp positioning one-liner",
    "socialProof": "One sharp positioning one-liner"
  }
}`;

    const userPrompt = `Analyze and optimize this LinkedIn profile:

CURRENT HEADLINE: ${headline}

CURRENT ABOUT SECTION:
${aboutSection}

ROLE: ${role}
TARGET ICP: ${targetIcp}

Generate optimized headlines (3 variants), an optimized about section, and positioning angles. Remember to adapt to the ${tone} tone.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from AI');
    }

    console.log('AI response received, parsing...');

    // Parse JSON from the response (handle markdown code blocks)
    let parsed;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsed = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response');
    }

    console.log('Successfully parsed AI response');

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in optimize-profile function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
