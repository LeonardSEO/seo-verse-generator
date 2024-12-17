import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GeneratorState } from '../lib/types';
import { useToast } from "@/components/ui/use-toast";
import { findSitemapUrl, extractUrlsFromSitemap } from '../lib/sitemap';
import LoadingSpinner from './LoadingSpinner';

interface WebsiteAnalysisProps {
  state: GeneratorState;
  updateState: (updates: Partial<GeneratorState>) => void;
}

export function WebsiteAnalysis({ state, updateState }: WebsiteAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!state.websiteUrl) {
      toast({
        title: "Fout",
        description: "Voer eerst een website URL in",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      let url = state.websiteUrl.trim();
      if (!url.startsWith('http')) {
        url = `https://${url}`;
      }

      const sitemapUrl = await findSitemapUrl(url);
      
      if (!sitemapUrl) {
        throw new Error('Kon geen sitemap vinden. De website heeft er mogelijk geen of deze is beveiligd.');
      }

      const urls = await extractUrlsFromSitemap(sitemapUrl);
      
      if (urls.length === 0) {
        throw new Error('Geen geldige URLs gevonden in de sitemap.');
      }

      updateState({ 
        selectedUrls: urls,
        currentStep: 'keyword'
      });
      
      toast({
        title: "Success",
        description: `${urls.length} URLs gevonden in de sitemap`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden bij het analyseren van de website",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Website Analyse</h2>
        <p className="text-gray-600">
          Voer de URL van uw website in om te beginnen met de analyse
        </p>
      </div>

      <div className="space-y-4">
        <Input
          type="url"
          placeholder="https://www.voorbeeld.nl"
          value={state.websiteUrl}
          onChange={(e) => updateState({ websiteUrl: e.target.value })}
          className="w-full"
        />

        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? <LoadingSpinner /> : "Analyseer Website"}
        </Button>

        {state.selectedUrls.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Gevonden URLs ({state.selectedUrls.length})</h3>
            <div className="max-h-40 overflow-y-auto">
              {state.selectedUrls.map((url, index) => (
                <div key={index} className="text-sm text-gray-600 py-1 truncate">
                  {url}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}