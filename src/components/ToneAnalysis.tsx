import { useState } from 'react';
import { GeneratorState } from '../lib/types';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from './LoadingSpinner';
import { Lock } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface ToneAnalysisProps {
  state: GeneratorState;
  updateState: (updates: Partial<GeneratorState>) => void;
  isPremium: boolean;
}

export function ToneAnalysis({ state, updateState, isPremium }: ToneAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sampleContent, setSampleContent] = useState('');
  const { toast } = useToast();

  const analyzeTone = async () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Deze functie is alleen beschikbaar voor premium gebruikers",
        variant: "destructive",
      });
      return;
    }

    if (!sampleContent) {
      toast({
        title: "Fout",
        description: "Voer eerst wat voorbeeldtekst in",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-tone', {
        body: { content: sampleContent }
      });

      if (error) throw error;

      updateState({ toneOfVoice: data.tone });
    } catch (error) {
      console.error('Error analyzing tone:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden tijdens de analyse",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = () => {
    if (!state.toneOfVoice) {
      toast({
        title: "Fout",
        description: "Vul eerst een tone of voice in",
        variant: "destructive",
      });
      return;
    }
    updateState({ currentStep: 'content' });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Tone of Voice</h2>
        <p className="text-gray-600">
          Beschrijf de gewenste schrijfstijl voor uw content
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="toneOfVoice">Schrijfstijl</Label>
          <Textarea
            id="toneOfVoice"
            value={state.toneOfVoice}
            onChange={(e) => updateState({ toneOfVoice: e.target.value })}
            placeholder="Bijvoorbeeld: Professioneel en zakelijk, maar toegankelijk en vriendelijk"
            className="min-h-[100px]"
          />
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-700">
              Premium Feature
            </h3>
          </div>

          <div className={`space-y-3 ${isPremium ? '' : 'opacity-50'}`}>
            <Label htmlFor="sampleContent">Voorbeeldtekst analyseren</Label>
            <Textarea
              id="sampleContent"
              value={sampleContent}
              onChange={(e) => setSampleContent(e.target.value)}
              placeholder={isPremium ? "Plak hier een stuk tekst van je website of een ander voorbeeld van je gewenste schrijfstijl" : "Alleen beschikbaar voor premium gebruikers"}
              className="min-h-[100px]"
              disabled={!isPremium}
            />
            <Button 
              onClick={analyzeTone}
              disabled={isAnalyzing || !isPremium}
              variant="secondary"
              className="w-full"
            >
              {isAnalyzing ? <LoadingSpinner /> : "Analyseer Schrijfstijl"}
            </Button>
            {!isPremium && (
              <p className="text-sm text-gray-500">
                Upgrade naar premium om automatisch je tone of voice te laten analyseren
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={handleNext}
          className="w-full"
        >
          Volgende Stap
        </Button>
      </div>
    </div>
  );
}