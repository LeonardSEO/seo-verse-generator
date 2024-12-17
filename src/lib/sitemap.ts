export async function findSitemapUrl(websiteUrl: string): Promise<string | null> {
  try {
    // Remove trailing slash if present
    const baseUrl = websiteUrl.replace(/\/$/, '');
    
    // Common sitemap locations
    const sitemapLocations = [
      '/sitemap.xml',
      '/sitemap_index.xml',
      '/sitemap/',
      '/robots.txt'
    ];

    for (const location of sitemapLocations) {
      const response = await fetch(`${baseUrl}${location}`);
      if (response.ok) {
        const content = await response.text();
        
        // If it's robots.txt, try to find sitemap URL
        if (location === '/robots.txt') {
          const sitemapMatch = content.match(/Sitemap: (.*)/i);
          if (sitemapMatch && sitemapMatch[1]) {
            return sitemapMatch[1];
          }
        }
        
        // For direct sitemap hits
        if (content.includes('<?xml') && 
            (content.includes('<sitemap>') || content.includes('<url>'))) {
          return `${baseUrl}${location}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding sitemap:', error);
    return null;
  }
}

export async function extractUrlsFromSitemap(sitemapUrl: string): Promise<string[]> {
  try {
    const response = await fetch(sitemapUrl);
    if (!response.ok) throw new Error('Failed to fetch sitemap');
    
    const xmlText = await response.text();
    const urls: string[] = [];
    
    // Extract URLs using regex
    const urlMatches = xmlText.match(/<loc>(.*?)<\/loc>/g);
    
    if (urlMatches) {
      urlMatches.forEach(match => {
        const url = match.replace(/<\/?loc>/g, '');
        urls.push(url);
      });
    }
    
    return urls;
  } catch (error) {
    console.error('Error extracting URLs:', error);
    return [];
  }
}