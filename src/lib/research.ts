export async function researchKeyword(keyword: string): Promise<string> {
  try {
    const response = await fetch('https://api.openperplex.ai/v1/custom_search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENPERPLEX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_prompt: 'Je bent een SEO expert die keyword onderzoek doet. Geef een beknopte maar informatieve analyse van het keyword in het Nederlands.',
        user_prompt: `Analyseer het volgende keyword voor de Nederlandse markt: "${keyword}". 
          Geef informatie over:
          - Zoekintentie
          - Concurrentieniveau
          - Gerelateerde keywords
          - Suggesties voor content`,
        location: "nl",
        pro_mode: false,
        search_type: "general",
        return_images: false,
        return_sources: false,
        temperature: 0.2,
        top_p: 0.9,
        recency_filter: "anytime"
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.answer;
  } catch (error) {
    console.error('Error researching keyword:', error);
    throw new Error('Er is een fout opgetreden tijdens het keyword onderzoek');
  }
}