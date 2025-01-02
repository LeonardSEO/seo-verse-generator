import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { GeneratorState } from '../lib/types';
import { WebsiteAnalysis } from './WebsiteAnalysis';
import { KeywordAnalysis } from './KeywordAnalysis';
import { ContentConfiguration } from './ContentConfiguration';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

export default function AIGenerator() {
  const [state, setState] = useState<GeneratorState>({
    websiteUrl: '',
    selectedUrls: [],
    mainKeyword: '',
    research: '',
    businessInfo: {
      name: '',
      type: '',
      country: 'Netherlands',
      description: ''
    },
    contentType: '',
    toneOfVoice: '',
    currentStep: 'website',
    generatedContent: ''
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  const steps = ['Website Analysis', 'Keyword Analysis', 'Business Info', 'Tone of Voice', 'Content Generation'] as const;

  const stepMap: Record<GeneratorState['currentStep'], number> = {
    'website': 0,
    'keyword': 1,
    'business': 2,
    'tone': 3,
    'content': 4
  };

  const currentStep = stepMap[state.currentStep];

  const updateState = async (updates: Partial<GeneratorState>) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    // If trying to proceed beyond website analysis without auth
    if (!session && updates.currentStep && updates.currentStep !== 'website') {
      toast({
        title: "Login vereist",
        description: "Log in om deze functie te gebruiken",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Nederlandse Content Generator
            </h1>
          </div>

          <div className="flex justify-between mb-8">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`flex flex-col items-center ${
                  index <= currentStep ? 'text-primary' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    index <= currentStep
                      ? 'bg-primary text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-sm font-medium">{step}</span>
              </div>
            ))}
          </div>

          <div className="h-1 bg-gray-200 rounded-full">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg rounded-xl p-8 shadow-xl animate-fadeIn border border-white/30">
          {state.currentStep === 'website' && (
            <WebsiteAnalysis state={state} updateState={updateState} />
          )}
          {state.currentStep === 'keyword' && (
            <KeywordAnalysis state={state} updateState={updateState} />
          )}
          {state.currentStep === 'business' && (
            <ContentConfiguration state={state} updateState={updateState} />
          )}
        </div>
      </div>
    </div>
  );
}