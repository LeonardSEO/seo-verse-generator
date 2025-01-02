import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  url: string;
  type: 'find' | 'extract';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, type } = await req.json() as RequestBody

    if (type === 'find') {
      // Remove trailing slash if present
      const baseUrl = url.replace(/\/$/, '')
      
      // Common sitemap locations
      const sitemapLocations = [
        '/sitemap.xml',
        '/sitemap_index.xml',
        '/sitemap/',
        '/robots.txt'
      ]

      for (const location of sitemapLocations) {
        const response = await fetch(`${baseUrl}${location}`)
        if (response.ok) {
          const content = await response.text()
          
          // If it's robots.txt, try to find sitemap URL
          if (location === '/robots.txt') {
            const sitemapMatch = content.match(/Sitemap: (.*)/i)
            if (sitemapMatch && sitemapMatch[1]) {
              return new Response(
                JSON.stringify({ sitemapUrl: sitemapMatch[1] }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }
          }
          
          // For direct sitemap hits
          if (content.includes('<?xml') && 
              (content.includes('<sitemap>') || content.includes('<url>'))) {
            return new Response(
              JSON.stringify({ sitemapUrl: `${baseUrl}${location}` }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }
      }
      
      return new Response(
        JSON.stringify({ sitemapUrl: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (type === 'extract') {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch sitemap')
      
      const xmlText = await response.text()
      const urls: string[] = []
      
      // Extract URLs using regex
      const urlMatches = xmlText.match(/<loc>(.*?)<\/loc>/g)
      
      if (urlMatches) {
        urlMatches.forEach(match => {
          const extractedUrl = match.replace(/<\/?loc>/g, '')
          urls.push(extractedUrl)
        })
      }
      
      return new Response(
        JSON.stringify({ urls }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid type specified')
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})