import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GeneratorState } from '../lib/types';
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from './LoadingSpinner';
import { researchKeyword } from '../lib/research';

interface KeywordAnalysisProps {
  state: GeneratorState;
  updateState: (updates: Partial<GeneratorState>) => void;
}

export function KeywordAnalysis({ state, updateState }: KeywordAnalysisProps) {
  const [isResearching, setIsResearching] = useState(false);
  const { toast } = useToast();

  const handleResearch = async () => {
    if (!state.mainKeyword) {
      toast({
        title: "Fout",
        description: "Voer eerst een keyword in",
        variant: "destructive",
      });
      return;
    }

    setIsResearching(true);
    try {
      const research = await researchKeyword(state.mainKeyword);
      updateState({ 
        research,
        currentStep: 'business'
      });
      
      toast({
        title: "Success",
        description: "Keyword onderzoek succesvol afgerond",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden tijdens het keyword onderzoek",
        variant: "destructive",
      });
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Keyword Analyse</h2>
        <p className="text-gray-600">
          Voer uw belangrijkste keyword in voor analyse
        </p>
      </div>

      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Bijvoorbeeld: SEO optimalisatie"
          value={state.mainKeyword}
          onChange={(e) => updateState({ mainKeyword: e.target.value })}
          className="w-full"
        />

        <Button
          onClick={handleResearch}
          disabled={isResearching}
          className="w-full"
        >
          {isResearching ? <LoadingSpinner /> : "Analyseer Keyword"}
        </Button>

        {state.research && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Onderzoeksresultaten</h3>
            <div className="text-sm text-gray-600 whitespace-pre-wrap">
              {state.research}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}