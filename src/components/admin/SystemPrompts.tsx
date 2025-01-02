import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SystemPromptsProps {
  prompts: {
    keywordResearch: string;
    toneAnalysis: string;
    contentGeneration: string;
  };
  onChange: (field: keyof typeof prompts, value: string) => void;
}

export function SystemPrompts({ prompts, onChange }: SystemPromptsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">System Prompts</h2>
      
      <div className="space-y-2">
        <Label>Keyword Research Prompt</Label>
        <Textarea
          value={prompts.keywordResearch}
          onChange={(e) => onChange('keywordResearch', e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Tone Analysis Prompt</Label>
        <Textarea
          value={prompts.toneAnalysis}
          onChange={(e) => onChange('toneAnalysis', e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Content Generation Prompt</Label>
        <Textarea
          value={prompts.contentGeneration}
          onChange={(e) => onChange('contentGeneration', e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
}