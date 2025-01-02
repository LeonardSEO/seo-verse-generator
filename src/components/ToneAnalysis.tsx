import { useState } from 'react';
import { GeneratorState } from '../lib/types';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from './LoadingSpinner';
import { supabase } from "@/integrations/supabase/client";

interface ToneAnalysisProps {
  state: GeneratorState;
  updateState: (updates: Partial<GeneratorState>) => void;
}

export function ToneAnalysis({ state, updateState }: ToneAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sampleContent, setSampleContent] = useState('');
  const { toast } = useToast();

  const analyzeTone = async () => {
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
      toast({
        title: "Success",
        description: "Tone of voice succesvol geanalyseerd",
      });
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
          <Label htmlFor="sampleContent">Voorbeeldtekst (optioneel)</Label>
          <Textarea
            id="sampleContent"
            value={sampleContent}
            onChange={(e) => setSampleContent(e.target.value)}
            placeholder="Plak hier een stuk tekst van je website of een ander voorbeeld van je gewenste schrijfstijl"
            className="min-h-[100px]"
          />
          <Button 
            onClick={analyzeTone}
            disabled={isAnalyzing || !sampleContent}
            variant="secondary"
            className="w-full"
          >
            {isAnalyzing ? <LoadingSpinner /> : "Analyseer Schrijfstijl"}
          </Button>
        </div>

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