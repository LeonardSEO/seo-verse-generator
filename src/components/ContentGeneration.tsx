import { useState, useEffect } from 'react';
import { GeneratorState } from '../lib/types';
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from './LoadingSpinner';
import { researchKeyword } from '../lib/research';
import { findSitemapUrl, extractUrlsFromSitemap } from '../lib/sitemap';
import { supabase } from "@/integrations/supabase/client";
import { Copy, CheckCheck, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';
import { Label } from "@/components/ui/label";

interface ContentGenerationProps {
  state: GeneratorState;
  updateState: (updates: Partial<GeneratorState>) => void;
}

interface Model {
  id: string;
  name: string;
  description: string;
  isFree: boolean;
}

interface AdminSettings {
  settings: {
    models: Model[];
    defaultFreeModel: string;
    defaultPremiumModel: string;
  };
}

export function ContentGeneration({ state, updateState }: ContentGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isPremium, setIsPremium] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadModels();
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .single();

    setIsPremium(!!subscription);
  };

  const loadModels = async () => {
    try {
      const { data: adminSettings } = await supabase
        .from('admin_settings')
        .select('settings')
        .single();

      if (adminSettings?.settings) {
        const settings = (adminSettings.settings as AdminSettings['settings']);
        setModels(settings.models || []);
        
        // Set default model based on subscription status
        const defaultModel = isPremium ? settings.defaultPremiumModel : settings.defaultFreeModel;
        setSelectedModel(defaultModel);
      }
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

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

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
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

    if (!selectedModel) {
      toast({
        title: "Fout",
        description: "Selecteer eerst een model",
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

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { 
          state: {
            ...state,
            selectedUrls: urls,
            research
          },
          model: selectedModel
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

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">Selecteer een AI Model</h3>
        <div className="space-y-4">
          <RadioGroup
            value={selectedModel}
            onValueChange={handleModelChange}
            className="gap-4"
          >
            {models.map((model) => {
              const isDisabled = !model.isFree && !isPremium;
              return (
                <div
                  key={model.id}
                  className={`flex items-start space-x-3 p-4 rounded-lg border ${
                    isDisabled ? 'opacity-50 bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <RadioGroupItem
                    value={model.id}
                    id={model.id}
                    disabled={isDisabled}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={model.id}
                      className={`block font-medium ${
                        isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      {model.name}
                      {!model.isFree && (
                        <span className="ml-2 text-sm text-primary">Premium</span>
                      )}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {model.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </RadioGroup>
          {!isPremium && (
            <p className="text-sm text-gray-500 italic">
              Premium modellen zijn alleen beschikbaar voor premium gebruikers.{' '}
              <a href="/settings" className="text-primary hover:underline">
                Upgrade nu
              </a>
            </p>
          )}
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
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-4xl font-bold mb-6" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-3xl font-semibold mb-4" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-2xl font-semibold mb-3" {...props} />,
                  a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-800 underline" {...props} />,
                }}
              >
                {state.generatedContent}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}