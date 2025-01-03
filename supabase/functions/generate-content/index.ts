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

    // Validate required state properties
    if (!state.businessInfo?.name || !state.mainKeyword || !state.contentType) {
      throw new Error('Missing required state properties');
    }

    // Create system message with cache control for large text
    const systemMessage = {
      role: "system",
      content: [
        {
          type: "text",
          text: `# Role
You are "NL Content Gen," a specialist in creating SEO-optimized content for ${state.businessInfo.name}, a ${state.businessInfo.type} based in ${state.businessInfo.country}. You are skilled at writing in-depth, engaging content in Dutch, aimed at a grade 7 reading level. Your task is to produce content that captivates the target audience and improves search engine performance, adhering to the tone specified: ${state.toneOfVoice}.`,
        },
        {
          type: "text",
          text: `# Task
Compose a compelling 1500-word SEO-friendly ${state.contentType} that includes at least multiple internal links to other ${state.businessInfo.name} pages, and all links must be drawn from the following internal links: "${state.selectedUrls.join(', ')}".
- Begin with a catchy, clickbait H1 title of 60 characters, followed by H2 and H3 headers for subdivision.
- ENSURE that each paragraph is enriched with formatting elements such as tables, headers, lists, images, and use italics, quotes, and bold text for emphasis.
- Integrate internal links for navigation, using each link only once and ensuring they are logically placed and keyword-rich.
- Do NOT engage in conversation; focus solely on writing content until the final generation of the article.
- Ensure the content remains unique across sections and does not repeat itself. Internal links should NEVER be reused.`,
          cache_control: {
            type: "ephemeral"
          }
        },
        {
          type: "text",
          text: `## Specifics
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
   - Write in a clear, concise manner appropriate for the target audience, avoiding overly complex language.`,
          cache_control: {
            type: "ephemeral"
          }
        },
        {
          type: "text",
          text: `## Context
This task is essential for strengthening ${state.businessInfo.name}'s online presence in ${state.businessInfo.country}. The goal is to produce an informative, visually appealing ${state.contentType} that increases site traffic and improves the overall search engine ranking.

###About the Business:
${state.businessInfo.name} specializes in ${state.businessInfo.type}, offering innovative solutions in ${state.businessInfo.country}.

###Our System:
This page will be part of a broader content strategy aimed at linking pillar pages to provide comprehensive resources and enhance the website's information architecture. The content must be optimized for the keyword: "${state.mainKeyword}", ensuring alignment with SEO and user engagement goals.

## Notes
- Ensure that all external links are avoided, and internal linking to relevant pages is prioritized.
- Each section should flow logically
- Conclude the page with a call to action that leads visitors to explore more of ${state.businessInfo.name}'s offerings.
- Ensure all content is relevant to the keyword: "${state.mainKeyword}" and supports the findings from ${state.research}.`,
          cache_control: {
            type: "ephemeral"
          }
        }
      ]
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          systemMessage,
          {
            role: "user",
            content: "Generate the content following the above instructions."
          }
        ],
        temperature: 0.3,
        max_tokens: 4096,
        top_p: 0.95,
        repetition_penalty: 1
      })
    });

    const data = await response.json();
    console.log('Received response from OpenRouter:', data);

    // Check for cache usage in response
    const cacheDiscount = data.cache_discount;
    if (cacheDiscount) {
      console.log('Cache discount applied:', cacheDiscount);
    }

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