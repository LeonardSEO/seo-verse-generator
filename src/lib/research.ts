import { supabase } from "../integrations/supabase/client";

export async function researchKeyword(keyword: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('research-keyword', {
      method: 'POST',
      body: { keyword }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message);
    }

    if (!data.llm_response) {
      throw new Error('Invalid response format from OpenPerplex API');
    }

    return data.llm_response;
  } catch (error) {
    console.error('Error researching keyword:', error);
    throw new Error('Er is een fout opgetreden tijdens het keyword onderzoek');
  }
}