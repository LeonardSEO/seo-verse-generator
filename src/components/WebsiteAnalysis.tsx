import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GeneratorState } from '../lib/types';
import { useToast } from "@/components/ui/use-toast";

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
      // Here we'll later implement the actual website analysis
      // For now, we'll just simulate moving to the next step
      updateState({ currentStep: 'keyword' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Er is een fout opgetreden bij het analyseren van de website",
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
          {isAnalyzing ? "Bezig met analyseren..." : "Analyseer Website"}
        </Button>
      </div>
    </div>
  );
}