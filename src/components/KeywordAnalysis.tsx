import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GeneratorState } from '../lib/types';
import { ArrowLeft } from 'lucide-react';

interface KeywordAnalysisProps {
  state: GeneratorState;
  updateState: (updates: Partial<GeneratorState>) => void;
}

export function KeywordAnalysis({ state, updateState }: KeywordAnalysisProps) {
  const handleNext = () => {
    if (!state.mainKeyword) {
      return;
    }
    updateState({ currentStep: 'business' });
  };

  const handleBack = () => {
    updateState({ currentStep: 'website' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && state.mainKeyword) {
      e.preventDefault();
      handleNext();
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
          <h2 className="text-2xl font-semibold">Keyword Analyse</h2>
          <p className="text-gray-600">
            Voer uw belangrijkste keyword in voor analyse
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Bijvoorbeeld: SEO optimalisatie"
          value={state.mainKeyword}
          onChange={(e) => updateState({ mainKeyword: e.target.value })}
          onKeyPress={handleKeyPress}
          className="w-full"
        />

        <Button
          onClick={handleNext}
          className="w-full"
        >
          Volgende
        </Button>
      </div>
    </div>
  );
}