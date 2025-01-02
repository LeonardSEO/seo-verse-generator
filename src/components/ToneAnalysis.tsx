import { GeneratorState } from '../lib/types';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface ToneAnalysisProps {
  state: GeneratorState;
  updateState: (updates: Partial<GeneratorState>) => void;
}

export function ToneAnalysis({ state, updateState }: ToneAnalysisProps) {
  const { toast } = useToast();

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

        <button
          onClick={handleNext}
          className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Volgende Stap
        </button>
      </div>
    </div>
  );
}