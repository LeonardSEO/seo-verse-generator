import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GeneratorState } from '../lib/types';

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
          onClick={handleNext}
          className="w-full"
        >
          Volgende
        </Button>
      </div>
    </div>
  );
}