import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AccessibilityIssue {
  id: string;
  title: string;
  description: string;
  wcagCriteria: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  severity: 'critical' | 'moderate' | 'minor';
  element?: string;
  aiSuggestion?: string;
  codeSnippet?: string;
  fixedCodeSnippet?: string;
}

// Input validation: check URL is safe (prevent SSRF)
function isValidUrl(urlString: string): { valid: boolean; error?: string } {
  try {
    const url = new URL(urlString);
    
    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
    }
    
    const hostname = url.hostname.toLowerCase();
    
    // Block localhost and common internal hostnames
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '[::1]' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      return { valid: false, error: 'Internal addresses are not allowed' };
    }
    
    // Block private IP ranges (basic check)
    const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Pattern);
    if (match) {
      const [, a, b, c] = match.map(Number);
      if (
        a === 10 || // 10.0.0.0/8
        (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
        (a === 192 && b === 168) || // 192.168.0.0/16
        a === 127 || // 127.0.0.0/8
        a === 0 // 0.0.0.0/8
      ) {
        return { valid: false, error: 'Private IP addresses are not allowed' };
      }
    }
    
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

// Validate HTML content size
function validateHtmlContent(content: string): { valid: boolean; error?: string } {
  const maxSizeBytes = 5 * 1024 * 1024; // 5MB limit
  const contentSize = new Blob([content]).size;
  
  if (contentSize > maxSizeBytes) {
    return { valid: false, error: 'HTML content exceeds 5MB limit' };
  }
  
  return { valid: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // === Authentication Check ===
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`Authenticated user: ${userId}`);

    // === Input Validation ===
    const { url, htmlContent } = await req.json();
    
    if (!url && !htmlContent) {
      return new Response(
        JSON.stringify({ error: 'URL or HTML content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL if provided
    if (url) {
      const urlValidation = isValidUrl(url);
      if (!urlValidation.valid) {
        return new Response(
          JSON.stringify({ error: urlValidation.error }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate HTML content if provided
    if (htmlContent) {
      const htmlValidation = validateHtmlContent(htmlContent);
      if (!htmlValidation.valid) {
        return new Response(
          JSON.stringify({ error: htmlValidation.error }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch HTML content if URL is provided
    let contentToAnalyze = htmlContent;
    if (url && !htmlContent) {
      try {
        console.log(`Fetching content from URL for user ${userId}`);
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; AccessibilityChecker/1.0)'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          return new Response(
            JSON.stringify({ error: 'Unable to fetch the provided URL' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        contentToAnalyze = await response.text();
        
        // Validate fetched content size
        const fetchedValidation = validateHtmlContent(contentToAnalyze);
        if (!fetchedValidation.valid) {
          return new Response(
            JSON.stringify({ error: 'Fetched content exceeds size limit' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`Fetched ${contentToAnalyze.length} characters from URL`);
      } catch (fetchError: unknown) {
        console.error('Error fetching URL:', fetchError);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          return new Response(
            JSON.stringify({ error: 'Request timeout - URL took too long to respond' }),
            { status: 408, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return new Response(
          JSON.stringify({ error: 'Unable to fetch the provided URL' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Truncate content if too long for AI processing
    const maxLength = 15000;
    const truncatedContent = contentToAnalyze.length > maxLength 
      ? contentToAnalyze.substring(0, maxLength) + '...[truncated]'
      : contentToAnalyze;

    console.log('Calling AI for accessibility analysis...');

    const systemPrompt = `You are an expert web accessibility auditor. Analyze the provided HTML content for WCAG 2.1 accessibility issues.

For each issue found, provide:
1. A clear title describing the issue
2. A detailed description of why it's a problem
3. The specific WCAG criterion violated (e.g., "1.1.1 Non-text Content")
4. The WCAG level (A, AA, or AAA)
5. Severity (critical, moderate, or minor)
6. The problematic HTML element if applicable
7. A clear AI-powered suggestion for fixing the issue
8. The original code snippet if applicable
9. A corrected code snippet showing the fix

Focus on these common accessibility issues:
- Missing or empty alt text on images
- Low color contrast
- Improper heading structure (skipped levels, missing h1)
- Missing ARIA labels on interactive elements
- Keyboard navigation issues
- Missing form labels
- Missing skip links
- Missing lang attribute
- Empty links or buttons
- Tables without proper headers

Return your analysis as a JSON object with this exact structure:
{
  "issues": [
    {
      "id": "unique-id",
      "title": "Issue Title",
      "description": "Detailed description",
      "wcagCriteria": "X.X.X Criterion Name",
      "wcagLevel": "A" | "AA" | "AAA",
      "severity": "critical" | "moderate" | "minor",
      "element": "<element>...</element>",
      "aiSuggestion": "How to fix this issue",
      "codeSnippet": "Original problematic code",
      "fixedCodeSnippet": "Corrected code"
    }
  ],
  "score": 0-100,
  "summary": {
    "critical": number,
    "moderate": number,
    "minor": number,
    "total": number
  }
}

Be thorough but realistic. Not every page has issues. If the HTML is well-structured and accessible, reflect that in a high score.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this HTML content for accessibility issues:\n\n${truncatedContent}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Service is busy. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable.' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'Analysis service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Analysis failed - no response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI response received, parsing...');

    // Parse the JSON from the AI response
    let analysisResult;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysisResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response');
      // Return a fallback response
      analysisResult = {
        issues: [],
        score: 85,
        summary: { critical: 0, moderate: 0, minor: 0, total: 0 }
      };
    }

    // Ensure all issues have unique IDs
    if (analysisResult.issues) {
      analysisResult.issues = analysisResult.issues.map((issue: any, index: number) => ({
        ...issue,
        id: issue.id || `issue-${Date.now()}-${index}`
      }));
    }

    // Add userId to response for client-side saving
    analysisResult.userId = userId;

    console.log(`Analysis complete for user ${userId}. Found ${analysisResult.issues?.length || 0} issues, score: ${analysisResult.score}`);

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in analyze-accessibility function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
