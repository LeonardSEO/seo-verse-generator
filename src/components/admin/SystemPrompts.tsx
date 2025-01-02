import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { SystemPrompts as SystemPromptsType } from '../types/admin';

interface SystemPromptsProps {
  prompts: SystemPromptsType;
  onChange: (field: keyof SystemPromptsType, value: string) => void;
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
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Tone Analysis Prompt</Label>
        <Textarea
          value={prompts.toneAnalysis}
          onChange={(e) => onChange('toneAnalysis', e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Content Generation Prompt</Label>
        <Textarea
          value={prompts.contentGeneration}
          onChange={(e) => onChange('contentGeneration', e.target.value)}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
}