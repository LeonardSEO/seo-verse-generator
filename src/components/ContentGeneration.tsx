import { useState } from 'react';
import { GeneratorState } from '../lib/types';
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from './LoadingSpinner';

interface ContentGenerationProps {
  state: GeneratorState;
  updateState: (updates: Partial<GeneratorState>) => void;
}

export function ContentGeneration({ state, updateState }: ContentGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // TODO: Implement content generation logic
      toast({
        title: "Success",
        description: "Content is gegenereerd",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden tijdens het genereren van content",
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