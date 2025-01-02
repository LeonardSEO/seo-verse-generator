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
          placeholder="Voer hier de keyword research prompt in..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Tone Analysis Prompt</Label>
        <Textarea
          value={prompts.toneAnalysis}
          onChange={(e) => onChange('toneAnalysis', e.target.value)}
          placeholder="Voer hier de tone analysis prompt in..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Content Generation Prompt</Label>
        <Textarea
          value={prompts.contentGeneration}
          onChange={(e) => onChange('contentGeneration', e.target.value)}
          placeholder="Voer hier de content generation prompt in..."
          rows={4}
        />
      </div>
    </div>
  );
}