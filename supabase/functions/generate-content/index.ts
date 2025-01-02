import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  state: {
    businessInfo: {
      name: string;
      type: string;
      country: string;
      description: string;
    };
    mainKeyword: string;
    research: string;
    selectedUrls: string[];
    toneOfVoice: string;
    contentType: string;
  };
  model: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { state, model } = await req.json() as RequestBody

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Nederlandse Content Generator'
      },
      body: JSON.stringify({
        model: model,
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
              
              ## Context
              This task is essential for strengthening ${state.businessInfo.name}'s online presence in ${state.businessInfo.country}. The goal is to produce an informative, visually appealing ${state.contentType} that increases site traffic and improves the overall search engine ranking.
              
              ###About the Business:
              ${state.businessInfo.name} specializes in ${state.businessInfo.type}, offering innovative solutions in ${state.businessInfo.country}.
              
              ###Our System:
              This page will be part of a broader content strategy aimed at linking pillar pages to provide comprehensive resources and enhance the website's information architecture. The content must be optimized for the keyword: "${state.mainKeyword}", ensuring alignment with SEO and user engagement goals.
              
              ## Notes
              - Ensure that all external links are avoided, and internal linking to relevant pages is prioritized.
              - Each section should flow logically
              - Conclude the page with a call to action that leads visitors to explore more of ${state.businessInfo.name}'s offerings.
              - Ensure all content is relevant to the keyword: "${state.mainKeyword}" and supports the findings from ${state.research}.
            `
          },
          {
            role: "user",
            content: "Generate the content following the above instructions."
          }
        ]
      })
    })

    const data = await response.json()
    const generatedContent = data.choices[0].message.content

    return new Response(
      JSON.stringify({ content: generatedContent }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})