import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GeneratorState } from '../lib/types';
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { findSitemapUrl } from '../lib/sitemap';

interface WebsiteAnalysisProps {
  state: GeneratorState;
  updateState: (updates: Partial<GeneratorState>) => void;
}

export function WebsiteAnalysis({ state, updateState }: WebsiteAnalysisProps) {
  const [urlInput, setUrlInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const isValidUrl = (url: string) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      toast({
        title: "Fout",
        description: "Voer eerst een website URL in",
        variant: "destructive",
      });
      return;
    }

    if (!isValidUrl(urlInput)) {
      toast({
        title: "Fout",
        description: "Voer een geldige URL in (bijvoorbeeld: https://voorbeeld.nl)",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    try {
      const validUrl = urlInput.startsWith('http') ? urlInput : `https://${urlInput}`;
      const sitemapUrl = await findSitemapUrl(validUrl);
      
      if (!sitemapUrl) {
        toast({
          title: "Waarschuwing",
          description: "Geen sitemap gevonden voor deze website. De analyse zal beperkt zijn.",
          variant: "default",
        });
      }

      updateState({ 
        selectedUrls: [validUrl],
        websiteUrl: validUrl,
        currentStep: 'keyword'
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het valideren van de website",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Website Analyse</h2>
        <p className="text-gray-600">
          Voer de URL in van de website die je wilt analyseren
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Voer de URL in van je website. Bijvoorbeeld: https://voorbeeld.nl
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <Input
          placeholder="https://www.voorbeeld.nl"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="font-mono text-sm"
        />

        <Button
          onClick={handleUrlSubmit}
          className="w-full"
          disabled={isValidating}
        >
          {isValidating ? "Website Valideren..." : "Website URL Toevoegen"}
        </Button>

        {state.selectedUrls.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Geselecteerde website</h3>
            <div className="text-sm text-gray-600 py-1 truncate">
              {state.selectedUrls[0]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}