import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    console.log('Analyzing tone for content:', content);

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch admin settings to get the default free model
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
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://app.vepando.com",
        "X-Title": "Vepando Content Generator",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "Je bent een expert in het analyseren van schrijfstijlen en tone of voice. Analyseer de gegeven tekst en beschrijf de tone of voice in detail. Focus op aspecten zoals formaliteit, emotie, autoriteit en toegankelijkheid."
          },
          {
            role: "user",
            content: `Analyseer de volgende tekst en beschrijf de tone of voice: "${content}"`
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data = await response.json();
    console.log('OpenRouter response:', JSON.stringify(data, null, 2));
    
    return new Response(JSON.stringify({
      tone: data.choices[0].message.content
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-tone function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});