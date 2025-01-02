import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { keyword } = await req.json()
    
    if (!keyword) {
      return new Response(
        JSON.stringify({ error: 'Keyword is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = Deno.env.get('OPENPERPLEX_API_KEY')
    if (!apiKey) {
      console.error('OpenPerplex API key not configured')
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch('https://api.openperplex.ai/v1/custom_search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        user_prompt: `Find highly specific generalised data about the Dutch keyword '${keyword}'. Do not name the source, webshops or brand other than the keyword!`,
        system_prompt: 'You are a helpful assistant that provides concise and precise information about the keyword. Focus on providing factual, market-relevant information.',
        location: 'nl',
        pro_mode: true,
        search_type: 'general',
        return_sources: false,
        return_images: false,
        recency_filter: 'year',
        temperature: 0.2,
        top_p: 0.9
      }),
    })

    const data = await response.json()
    console.log('OpenPerplex response:', data)

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! Status: ${response.status}`)
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})