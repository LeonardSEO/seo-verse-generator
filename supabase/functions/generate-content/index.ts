import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
const OPENPERPLEX_API_KEY = Deno.env.get('OPENPERPLEX_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, model = "anthropic/claude-3-sonnet", useOpenPerplex = false } = await req.json();

    if (useOpenPerplex) {
      // Use OpenPerplex API
      const response = await fetch('https://api.openperplex.com/api/v1/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENPERPLEX_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          max_tokens: 2000,
          temperature: 0.3,
        }),
      });

      const data = await response.json();
      return new Response(JSON.stringify({ 
        content: data.choices[0].text,
        provider: 'openperplex'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Use OpenRouter API
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://app.vepando.com",
          "X-Title": "Vepando Content Generator",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "Je bent een Nederlandse content schrijver die gespecialiseerd is in het schrijven van SEO-vriendelijke content. Je schrijft in een natuurlijke, menselijke toon."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          cache_control: { type: "ephemeral" }
        })
      });

      const data = await response.json();
      return new Response(JSON.stringify({
        content: data.choices[0].message.content,
        provider: 'openrouter',
        model
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});