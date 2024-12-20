import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GeneratorState } from '../lib/types';
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from './LoadingSpinner';
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WebsiteAnalysisProps {
  state: GeneratorState;
  updateState: (updates: Partial<GeneratorState>) => void;
}

export function WebsiteAnalysis({ state, updateState }: WebsiteAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const { toast } = useToast();

  const handleUrlsSubmit = () => {
    if (!urlInput.trim()) {
      toast({
        title: "Fout",
        description: "Voer eerst een of meerdere URLs in",
        variant: "destructive",
      });
      return;
    }

    // Split URLs by newline and filter out empty lines
    const urls = urlInput
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urls.length === 0) {
      toast({
        title: "Fout",
        description: "Geen geldige URLs gevonden",
        variant: "destructive",
      });
      return;
    }

    // Validate URLs
    const validUrls = urls.filter(url => {
      try {
        new URL(url.startsWith('http') ? url : `https://${url}`);
        return true;
      } catch {
        return false;
      }
    });

    if (validUrls.length === 0) {
      toast({
        title: "Fout",
        description: "Geen geldige URLs gevonden. Zorg dat elke URL op een nieuwe regel staat.",
        variant: "destructive",
      });
      return;
    }

    updateState({ 
      selectedUrls: validUrls,
      websiteUrl: validUrls[0], // Set the first URL as main website URL
      currentStep: 'keyword'
    });
    
    toast({
      title: "Success",
      description: `${validUrls.length} URLs toegevoegd`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Website Analyse</h2>
        <p className="text-gray-600">
          Voer de URLs in die je wilt analyseren (één URL per regel)
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Voer de URLs in die je wilt analyseren. Plaats elke URL op een nieuwe regel.
          Bijvoorbeeld:
          https://voorbeeld.nl/pagina-1
          https://voorbeeld.nl/pagina-2
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <Textarea
          placeholder="https://www.voorbeeld.nl/pagina-1&#10;https://www.voorbeeld.nl/pagina-2"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="min-h-[200px] font-mono text-sm"
        />

        <Button
          onClick={handleUrlsSubmit}
          disabled={isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? <LoadingSpinner /> : "URLs Verwerken"}
        </Button>

        {state.selectedUrls.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Toegevoegde URLs ({state.selectedUrls.length})</h3>
            <div className="max-h-40 overflow-y-auto">
              {state.selectedUrls.map((url, index) => (
                <div key={index} className="text-sm text-gray-600 py-1 truncate">
                  {url}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}