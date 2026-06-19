import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Valid tones for validation
const VALID_TONES = ['bold', 'professional', 'casual', 'analytical', 'direct', 'persuasive', 'minimal', 'confident'];

// Input limits based on LinkedIn restrictions
const LIMITS = {
  headline: 220,
  aboutSection: 2600,
  role: 200,
  targetIcp: 200,
  maxTones: 8,
};

// Rate limiting: requests per IP per hour
const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const kv = await Deno.openKv();
    const key = ['rate_limit', 'optimize_profile', ip];
    const result = await kv.get<number>(key);
    const currentCount = result.value || 0;
    
    if (currentCount >= RATE_LIMIT) {
      return { allowed: false, remaining: 0 };
    }
    
    await kv.set(key, currentCount + 1, { expireIn: RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - currentCount - 1 };
  } catch (error) {
    console.error('Rate limit check failed, allowing request:', error);
    return { allowed: true, remaining: RATE_LIMIT };
  }
}

function validateInputs(data: Record<string, unknown>): { valid: boolean; error?: string } {
  const { headline, aboutSection, role, targetIcp, tones } = data;
  
  // Check required fields
  if (!headline || typeof headline !== 'string' || headline.trim().length === 0) {
    return { valid: false, error: 'Headline is required' };
  }
  if (!aboutSection || typeof aboutSection !== 'string' || aboutSection.trim().length === 0) {
    return { valid: false, error: 'About section is required' };
  }
  
  // Check length limits
  if (headline.length > LIMITS.headline) {
    return { valid: false, error: `Headline must be ${LIMITS.headline} characters or less` };
  }
  if (aboutSection.length > LIMITS.aboutSection) {
    return { valid: false, error: `About section must be ${LIMITS.aboutSection} characters or less` };
  }
  if (role && typeof role === 'string' && role.length > LIMITS.role) {
    return { valid: false, error: `Role must be ${LIMITS.role} characters or less` };
  }
  if (targetIcp && typeof targetIcp === 'string' && targetIcp.length > LIMITS.targetIcp) {
    return { valid: false, error: `Target ICP must be ${LIMITS.targetIcp} characters or less` };
  }
  
  // Validate tones
  if (tones) {
    const tonesArray = Array.isArray(tones) ? tones : [tones];
    if (tonesArray.length > LIMITS.maxTones) {
      return { valid: false, error: `Maximum ${LIMITS.maxTones} tones allowed` };
    }
    for (const tone of tonesArray) {
      if (typeof tone !== 'string' || !VALID_TONES.includes(tone.toLowerCase())) {
        return { valid: false, error: `Invalid tone: ${tone}. Valid options: ${VALID_TONES.join(', ')}` };
      }
    }
  }
  
  return { valid: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    // Check rate limit
    const { allowed, remaining } = await checkRateLimit(ip);
    if (!allowed) {
      console.log(`Rate limit exceeded for IP: ${ip}`);
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
        status: 429,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '0',
          'Retry-After': '3600',
        },
      });
    }

    const body = await req.json();
    
    // Validate inputs
    const validation = validateInputs(body);
    if (!validation.valid) {
      console.log('Input validation failed:', validation.error);
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { headline, aboutSection, role, targetIcp, tones } = body;
    
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Processing profile optimization request:', { role, targetIcp, tones, ip: ip.substring(0, 10) + '...' });

    const toneGuidance: Record<string, string> = {
      bold: "Use strong verbs, direct language, and confident assertions. Be punchy and assertive.",
      professional: "Use neutral, credible language. Be polished and trustworthy.",
      casual: "Use lighter, conversational language. Be approachable and friendly.",
      analytical: "Use data-driven language. Be precise and logical.",
      direct: "Be straightforward and to the point. No fluff.",
      persuasive: "Use compelling language that motivates action. Be influential.",
      minimal: "Use concise, stripped-down language. Every word must earn its place.",
      confident: "Project certainty and expertise. Be authoritative without arrogance.",
    };

    // Build combined tone guidance
    const selectedTones = Array.isArray(tones) ? tones : [tones || 'bold'];
    const toneInstructions = selectedTones
      .map((t: string) => toneGuidance[t] || '')
      .filter(Boolean)
      .join(' ');

    const systemPrompt = `You are a LinkedIn positioning expert who helps professionals optimize their profiles for maximum authority and inbound leads.

Your task is to analyze the provided LinkedIn headline and about section, then generate optimized versions.

CRITICAL RULES:
- Do NOT invent metrics or social proof that wasn't provided
- If no social proof exists, phrase carefully without false claims
- Keep the about section between 120 and 150 words, 3 short paragraphs
- Make content skimmable and professional
- Ensure clear ICP, problem, and outcome are present
- Never use the word "founder" unless it appears in the original content

TONE INSTRUCTIONS: ${toneInstructions}

When multiple tones are specified, blend them intelligently. If tones conflict, prioritize clarity over creativity.

Respond in valid JSON format with this exact structure:
{
  "headlines": {
    "authority": "Role + ICP + credibility/outcome formula",
    "problemSolver": "Problem + who it's for + mechanism formula", 
    "socialProof": "Trusted by X + what you do + result formula (only if proof provided, otherwise rephrase)"
  },
  "aboutSection": "Optimized about section (120 to 150 words, 3 paragraphs)",
  "positioningAngles": {
    "authority": "One sharp positioning one liner",
    "problemSolver": "One sharp positioning one liner",
    "socialProof": "One sharp positioning one liner"
  }
}`;

    const userPrompt = `Analyze and optimize this LinkedIn profile:

CURRENT HEADLINE: ${headline.trim()}

CURRENT ABOUT SECTION:
${aboutSection.trim()}

ROLE: ${(role || '').trim()}
TARGET ICP: ${(targetIcp || '').trim()}

Generate optimized headlines (3 variants), an optimized about section, and positioning angles. Apply the following tones: ${selectedTones.join(', ')}.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.7 },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

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
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': String(remaining),
      },
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
