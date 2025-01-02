import { supabase } from "@/integrations/supabase/client";

export async function findSitemapUrl(websiteUrl: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-sitemap', {
      body: { url: websiteUrl, type: 'find' }
    });

    if (error) throw error;
    return data.sitemapUrl;
  } catch (error) {
    console.error('Error finding sitemap:', error);
    return null;
  }
}

export async function extractUrlsFromSitemap(sitemapUrl: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-sitemap', {
      body: { url: sitemapUrl, type: 'extract' }
    });

    if (error) throw error;
    return data.urls || [];
  } catch (error) {
    console.error('Error extracting URLs:', error);
    return [];
  }
}