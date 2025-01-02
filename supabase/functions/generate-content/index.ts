import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { state, model } = await req.json()
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://contentai.app",
        "X-Title": "ContentAI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model || "google/gemini-2.0-flash-thinking-exp:free",
        messages: [
          {
            role: "system",
            content: state.systemPrompts?.contentGeneration || "You are a helpful content generation assistant."
          },
          {
            role: "user",
            content: `Generate content for the keyword: ${state.mainKeyword}\n\nTone analysis: ${state.toneAnalysis}\n\nKeyword research: ${state.research}`
          }
        ],
        temperature: 0.7,
        top_p: 1,
        repetition_penalty: 1
      })
    });

    const data = await response.json()
    
    return new Response(
      JSON.stringify({ content: data.choices[0].message.content }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})