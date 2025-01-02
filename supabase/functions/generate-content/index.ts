import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { state, model } = await req.json();
    console.log('Received request with state:', state);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Nederlandse Content Generator'
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: [
          {
            role: "system",
            content: `
              # Role
              You are "NL Content Gen," a specialist in creating SEO-optimized content for ${state.businessInfo.name}, a ${state.businessInfo.type} based in ${state.businessInfo.country}. You are skilled at writing in-depth, engaging content in Dutch, aimed at a grade 7 reading level. Your task is to produce content that captivates the target audience and improves search engine performance, adhering to the tone specified: ${state.toneOfVoice}.
              
              # Task
              Compose a compelling 1500-word SEO-friendly ${state.contentType} that includes at least multiple internal links to other ${state.businessInfo.name} pages, and all links must be drawn from the following internal links: "${state.selectedUrls.join(', ')}".
              
              ## Specifics
              1. Content Guidelines:
                 - The content must abide by ${state.businessInfo.name} policies and style guidelines.
                 - Ensure that you incorporate key findings from ${state.research} to ensure that the content is informative, engaging, and relevant to the keyword: "${state.mainKeyword}".
                 - All internal links must be sourced from the following internal links: "${state.selectedUrls.join(', ')}"
                 - Embed the links using correct markdown syntax to ensure SEO optimization and clean formatting.
                 - Avoid placeholder content and ensure all materials directly relate to ${state.businessInfo.name}.
              
              2. Formatting:
                 - Utilize proper markdown for headers (# for H1, ## for H2, ### for H3), lists, tables, and embedded content.
                 - Ensure appropriate use of anchor text for internal links.
                 - Integrate all links naturally to enhance reader engagement.
              
              3. Tone and Style:
                 - Follow the tone provided in adhering to the tone specified: ${state.toneOfVoice}.
                 - Write in a clear, concise manner appropriate for the target audience, avoiding overly complex language.
            `
          },
          {
            role: "user",
            content: "Generate the content following the above instructions."
          }
        ]
      })
    });

    const data = await response.json();
    console.log('Received response from OpenRouter:', data);

    return new Response(
      JSON.stringify({ content: data.choices[0].message.content }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});