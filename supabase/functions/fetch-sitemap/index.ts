import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  url: string;
  type: 'find' | 'extract';
  keyword?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, type, keyword } = await req.json() as RequestBody;

    if (type === 'find') {
      // Remove trailing slash if present
      const baseUrl = url.replace(/\/$/, '');
      
      // Common sitemap locations
      const sitemapLocations = [
        '/sitemap.xml',
        '/sitemap_index.xml',
        '/sitemap/',
        '/robots.txt'
      ];

      for (const location of sitemapLocations) {
        const response = await fetch(`${baseUrl}${location}`);
        if (response.ok) {
          const content = await response.text();
          
          // If it's robots.txt, try to find sitemap URL
          if (location === '/robots.txt') {
            const sitemapMatch = content.match(/Sitemap: (.*)/i);
            if (sitemapMatch && sitemapMatch[1]) {
              return new Response(
                JSON.stringify({ sitemapUrl: sitemapMatch[1] }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }
          
          // For direct sitemap hits
          if (content.includes('<?xml') && 
              (content.includes('<sitemap>') || content.includes('<url>'))) {
            return new Response(
              JSON.stringify({ sitemapUrl: `${baseUrl}${location}` }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      }
      
      return new Response(
        JSON.stringify({ sitemapUrl: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (type === 'extract') {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch sitemap');
      
      const xmlText = await response.text();
      let urls: string[] = [];
      
      // Extract URLs using regex
      const urlMatches = xmlText.match(/<loc>(.*?)<\/loc>/g);
      
      if (urlMatches) {
        urlMatches.forEach(match => {
          const extractedUrl = match.replace(/<\/?loc>/g, '');
          urls.push(extractedUrl);
        });
      }

      // If we have a keyword and more than 8 URLs, use AI to select the best ones
      if (keyword && urls.length > 8) {
        const openrouterKey = Deno.env.get('OPENROUTER_API_KEY');
        if (!openrouterKey) {
          throw new Error('OpenRouter API key not configured');
        }

        // Initialize Supabase client to get the default free model
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log('Fetching admin settings...');
        const { data: adminSettings, error: settingsError } = await supabase
          .from('admin_settings')
          .select('settings')
          .single();

        if (settingsError) {
          console.error('Error fetching admin settings:', settingsError);
          throw new Error('Failed to fetch admin settings');
        }

        const settings = adminSettings.settings as { defaultFreeModel: string };
        const model = settings.defaultFreeModel;

        if (!model) {
          console.error('No default free model configured');
          throw new Error('No default model configured');
        }

        console.log('Using model:', model);
        console.log('Making request to OpenRouter API...');

        const urlsList = urls.join('\n');
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openrouterKey}`,
            "HTTP-Referer": "https://lovable.ai",
            "X-Title": "Lovable AI",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "system",
                content: "You are a URL analyzer that selects the most relevant URLs based on a given keyword. Return ONLY the URLs, one per line, no explanations or additional text. Always return exactly 8 URLs."
              },
              {
                role: "user",
                content: `Given the keyword "${keyword}", analyze these URLs and select the 8 most relevant ones that would provide the best content for this topic. Consider URL structure, relevance to the keyword, and potential content depth. Here are the URLs:\n\n${urlsList}`
              }
            ]
          })
        });

        const data = await response.json();
        const selectedUrls = data.choices[0].message.content
          .trim()
          .split('\n')
          .filter(Boolean)
          .slice(0, 8);

        console.log('Selected URLs:', selectedUrls);
        urls = selectedUrls;
      } else if (urls.length > 8) {
        // If no keyword provided or AI selection failed, take first 8 URLs
        urls = urls.slice(0, 8);
      }
      
      return new Response(
        JSON.stringify({ urls }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid type specified');
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});