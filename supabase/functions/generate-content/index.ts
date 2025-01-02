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
    console.log('Received request:', { prompt, model, useOpenPerplex });

    if (!OPENROUTER_API_KEY || !OPENPERPLEX_API_KEY) {
      console.error('Missing API keys:', { 
        hasOpenRouter: !!OPENROUTER_API_KEY, 
        hasOpenPerplex: !!OPENPERPLEX_API_KEY 
      });
      throw new Error('API keys not configured');
    }

    if (useOpenPerplex) {
      console.log('Using OpenPerplex API');
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

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenPerplex API error:', error);
        throw new Error(`OpenPerplex API error: ${error}`);
      }

      const data = await response.json();
      console.log('OpenPerplex response received');
      return new Response(JSON.stringify({ 
        content: data.choices[0].text,
        provider: 'openperplex'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.log('Using OpenRouter API with model:', model);
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

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenRouter API error:', error);
        throw new Error(`OpenRouter API error: ${error}`);
      }

      const data = await response.json();
      console.log('OpenRouter response received');
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
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});