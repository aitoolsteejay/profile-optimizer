const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapeResult {
  success: boolean;
  headline?: string;
  about?: string;
  role?: string;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'LinkedIn URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate LinkedIn URL format
    const linkedinUrlPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
    if (!linkedinUrlPattern.test(url.trim())) {
      return new Response(
        JSON.stringify({ success: false, error: 'Please provide a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Scraping service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scraping LinkedIn profile:', url);

    // Use Firecrawl to scrape the LinkedIn profile
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url.trim(),
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 3000, // Wait for dynamic content to load
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unable to fetch profile. LinkedIn may be blocking access or the profile is private.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const markdown = data.data?.markdown || data.markdown || '';
    console.log('Scraped content length:', markdown.length);

    if (!markdown || markdown.length < 100) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Could not extract profile content. The profile may be private or protected.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the markdown to extract headline and about section
    const result = parseLinkedInMarkdown(markdown);

    console.log('Parsed result:', { 
      hasHeadline: !!result.headline, 
      hasAbout: !!result.about,
      headlineLength: result.headline?.length || 0,
      aboutLength: result.about?.length || 0
    });

    return new Response(
      JSON.stringify({
        success: true,
        headline: result.headline || null,
        about: result.about || null,
        role: result.role || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error scraping LinkedIn:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to scrape profile. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function parseLinkedInMarkdown(markdown: string): { headline?: string; about?: string; role?: string } {
  const lines = markdown.split('\n').map(l => l.trim()).filter(l => l);
  
  let headline: string | undefined;
  let about: string | undefined;
  let role: string | undefined;

  // Common patterns in LinkedIn profile markdown:
  // - The headline is usually near the top after the name
  // - The about section often starts with "About" header or follows certain patterns
  
  // Look for headline patterns
  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    const line = lines[i];
    
    // Skip empty lines, navigation elements, and very short lines
    if (line.length < 10) continue;
    if (line.toLowerCase().includes('sign in') || line.toLowerCase().includes('join now')) continue;
    if (line.startsWith('#') || line.startsWith('*') || line.startsWith('-')) continue;
    
    // Headline is typically a descriptive line with | or @ symbols, or describes what someone does
    if (!headline && (
      line.includes('|') || 
      line.includes('@') ||
      line.toLowerCase().includes('helping') ||
      line.toLowerCase().includes('ceo') ||
      line.toLowerCase().includes('founder') ||
      line.toLowerCase().includes('director') ||
      line.toLowerCase().includes('manager') ||
      line.toLowerCase().includes('specialist') ||
      line.toLowerCase().includes('consultant')
    )) {
      // Make sure it's not too long (headlines are usually under 220 chars)
      if (line.length <= 220 && line.length >= 15) {
        headline = line.replace(/^#+\s*/, '').trim();
        
        // Try to extract role from headline
        const roleMatch = headline.match(/^([\w\s]+(?:CEO|CTO|CFO|COO|VP|Director|Manager|Lead|Head|Founder|Co-Founder)[\w\s]*)/i);
        if (roleMatch) {
          role = roleMatch[1].split(/[|@]/)[0].trim();
        }
      }
    }
  }

  // Look for About section
  const aboutIndex = lines.findIndex(l => 
    l.toLowerCase() === 'about' || 
    l.toLowerCase().startsWith('## about') ||
    l.toLowerCase().startsWith('### about')
  );
  
  if (aboutIndex !== -1 && aboutIndex < lines.length - 1) {
    const aboutLines: string[] = [];
    for (let i = aboutIndex + 1; i < Math.min(lines.length, aboutIndex + 20); i++) {
      const line = lines[i];
      
      // Stop if we hit another section header
      if (line.startsWith('#') || line.toLowerCase() === 'experience' || line.toLowerCase() === 'education') {
        break;
      }
      
      // Skip short lines that might be UI elements
      if (line.length < 10 && !line.match(/^\d/)) continue;
      
      aboutLines.push(line);
    }
    
    if (aboutLines.length > 0) {
      about = aboutLines.join('\n').trim();
      // Clean up any remaining markdown formatting
      about = about.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^#+\s*/gm, '');
    }
  }

  // Fallback: try to find about-like content by looking for longer paragraphs
  if (!about) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Look for longer text blocks that seem like personal descriptions
      if (line.length > 150 && (
        line.toLowerCase().includes('i help') ||
        line.toLowerCase().includes('i am') ||
        line.toLowerCase().includes("i'm") ||
        line.toLowerCase().includes('my mission') ||
        line.toLowerCase().includes('passionate about') ||
        line.toLowerCase().includes('years of experience')
      )) {
        about = line.replace(/\*\*/g, '').replace(/\*/g, '');
        break;
      }
    }
  }

  return { headline, about, role };
}
