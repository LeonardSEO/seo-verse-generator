import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GeneratorState, ContentType } from '../lib/types';

interface ContentConfigurationProps {
  state: GeneratorState;
  updateState: (updates: Partial<GeneratorState>) => void;
}

const contentTypes: ContentType[] = [
  'Listicle',
  'Product reviews',
  'Informational',
  'History of',
  "Pro's and Con's",
  'Comparisons',
  'How to\'s',
  'Versus',
  'Best for articles',
  'Brand roundup'
];

export function ContentConfiguration({ state, updateState }: ContentConfigurationProps) {
  const { toast } = useToast();

  const validateAndProceed = () => {
    if (!state.businessInfo.name || !state.businessInfo.type || !state.businessInfo.description || !state.contentType) {
      toast({
        title: "Fout",
        description: "Vul alle verplichte velden in",
        variant: "destructive",
      });
      return false;
    }
    updateState({ currentStep: 'tone' });
    return true;
  };

  const handleInputChange = (field: keyof typeof state.businessInfo, value: string) => {
    updateState({
      businessInfo: {
        ...state.businessInfo,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Bedrijfsinformatie</h2>
        <p className="text-gray-600">
          Vul de informatie over uw bedrijf in om de content te personaliseren
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Bedrijfsnaam</Label>
          <Input
            id="businessName"
            value={state.businessInfo.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Uw bedrijfsnaam"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessType">Type Bedrijf</Label>
          <Input
            id="businessType"
            value={state.businessInfo.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            placeholder="Bijv. E-commerce, Dienstverlening, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessDescription">Bedrijfsomschrijving</Label>
          <Textarea
            id="businessDescription"
            value={state.businessInfo.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Beschrijf kort waar uw bedrijf zich mee bezig houdt"
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contentType">Type Content</Label>
          <Select
            value={state.contentType}
            onValueChange={(value) => updateState({ contentType: value })}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Selecteer type content" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {contentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          onClick={validateAndProceed}
          className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Volgende Stap
        </button>
      </div>
    </div>
  );
}