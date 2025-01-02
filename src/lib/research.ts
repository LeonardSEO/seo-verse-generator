export async function researchKeyword(keyword: string): Promise<string> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENPERPLEX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'Je bent een SEO expert die keyword onderzoek doet. Geef een beknopte maar informatieve analyse van het keyword in het Nederlands.'
          },
          {
            role: 'user',
            content: `Analyseer het volgende keyword voor de Nederlandse markt: "${keyword}". 
            Geef informatie over:
            - Zoekintentie
            - Concurrentieniveau
            - Gerelateerde keywords
            - Suggesties voor content`
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error researching keyword:', error);
    throw new Error('Er is een fout opgetreden tijdens het keyword onderzoek');
  }
}