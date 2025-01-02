import { useState } from 'react';
import { GeneratorState } from '../lib/types';
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from './LoadingSpinner';
import { researchKeyword } from '../lib/research';
import { findSitemapUrl, extractUrlsFromSitemap } from '../lib/sitemap';
import { supabase } from "@/integrations/supabase/client";

interface ContentGenerationProps {
  state: GeneratorState;
  updateState: (updates: Partial<GeneratorState>) => void;
}

interface AdminSettings {
  settings: {
    defaultModel: string;
  };
}

export function ContentGeneration({ state, updateState }: ContentGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!state.mainKeyword || !state.websiteUrl) {
      toast({
        title: "Fout",
        description: "Voer eerst een keyword en website URL in",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // First analyze the website and get sitemap URLs
      const sitemapUrl = await findSitemapUrl(state.websiteUrl);
      let urls: string[] = [];
      
      if (sitemapUrl) {
        urls = await extractUrlsFromSitemap(sitemapUrl);
        updateState({ selectedUrls: urls });
      }

      // Then perform keyword research
      const research = await researchKeyword(state.mainKeyword);
      updateState({ research });

      // Finally generate content using OpenRouter
      const { data: adminSettings } = await supabase
        .from('admin_settings')
        .select('settings')
        .single();

      const settings = (adminSettings?.settings as AdminSettings['settings']) || { defaultModel: 'gpt-4' };

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { 
          state: {
            ...state,
            selectedUrls: urls,
            research
          },
          model: settings.defaultModel
        }
      });

      if (error) throw error;

      updateState({ 
        generatedContent: data.content,
        selectedUrls: urls
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Content Generatie</h2>
        <p className="text-gray-600">
          Genereer uw content op basis van de ingevoerde informatie
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? <LoadingSpinner /> : "Genereer Content"}
        </button>

        {state.generatedContent && (
          <div className="mt-6 p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Gegenereerde Content</h3>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: state.generatedContent }} />
          </div>
        )}
      </div>
    </div>
  );
}