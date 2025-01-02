import { useState, useEffect } from 'react';
import { GeneratorState } from '../lib/types';
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from './LoadingSpinner';
import { researchKeyword } from '../lib/research';
import { findSitemapUrl, extractUrlsFromSitemap } from '../lib/sitemap';
import { supabase } from "@/integrations/supabase/client";
import { Copy, CheckCheck, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';

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
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCopy = async () => {
    if (state.generatedContent) {
      await navigator.clipboard.writeText(state.generatedContent);
      setIsCopied(true);
      toast({
        title: "Gekopieerd!",
        description: "De content is naar je klembord gekopieerd.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleBack = () => {
    updateState({ currentStep: 'tone' });
  };

  const handleGenerate = async () => {
    // Double check authentication before generating
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Niet ingelogd",
        description: "Je moet ingelogd zijn om content te genereren.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

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

      // Final authentication check before making the expensive API call
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        throw new Error("Authenticatie verlopen. Log opnieuw in.");
      }

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

      const content = data.content;
      updateState({ 
        generatedContent: content,
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
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Content Generatie</h2>
          <p className="text-gray-600">
            Genereer uw content op basis van de ingevoerde informatie
          </p>
        </div>
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
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Gegenereerde Content</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                {isCopied ? (
                  <>
                    <CheckCheck className="h-4 w-4" />
                    Gekopieerd
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Kopieer
                  </>
                )}
              </Button>
            </div>
            <div className="prose prose-lg max-w-none p-6 bg-white rounded-lg shadow-sm border">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {state.generatedContent}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}