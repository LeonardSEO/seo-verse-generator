export async function researchKeyword(keyword: string): Promise<string> {
  try {
    const response = await fetch('https://44c57909-d9e2-41cb-9244-9cd4a443cb41.app.bhs.ai.cloud.ovh.net/custom_search', {
      method: 'POST',
      headers: {
        'X-API-Key': `${import.meta.env.VITE_OPENPERPLEX_API_KEY}`,
        'Content-Type': 'application/json',
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
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenPerplex response:', data);

    if (!data.llm_response) {
      throw new Error('Invalid response format from OpenPerplex API');
    }

    return data.llm_response;
  } catch (error) {
    console.error('Error researching keyword:', error);
    throw new Error('Er is een fout opgetreden tijdens het keyword onderzoek');
  }
}