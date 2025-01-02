import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

interface Model {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  isFree: boolean;
}

interface Settings {
  models: Model[];
  systemPrompts: {
    keywordResearch: string;
    toneAnalysis: string;
    contentGeneration: string;
  };
}

export default function AdminDashboard() {
  const [settings, setSettings] = useState<Settings>({
    models: [],
    systemPrompts: {
      keywordResearch: '',
      toneAnalysis: '',
      contentGeneration: ''
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newModel, setNewModel] = useState<Model>({
    id: '',
    name: '',
    description: '',
    isDefault: false,
    isFree: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .single();

      if (error) throw error;
      
      if (data?.settings) {
        setSettings(data.settings as Settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Kon de instellingen niet laden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({ 
          id: 1, 
          settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Instellingen opgeslagen",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Kon de instellingen niet opslaan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddModel = () => {
    if (!newModel.id || !newModel.name) {
      toast({
        title: "Error",
        description: "Model ID en naam zijn verplicht",
        variant: "destructive",
      });
      return;
    }

    setSettings(prev => ({
      ...prev,
      models: [...prev.models, newModel]
    }));

    setNewModel({
      id: '',
      name: '',
      description: '',
      isDefault: false,
      isFree: true
    });
  };

  const handleSetDefaultModel = (modelId: string) => {
    setSettings(prev => ({
      ...prev,
      models: prev.models.map(model => ({
        ...model,
        isDefault: model.id === modelId
      }))
    }));
  };

  const handleRemoveModel = (modelId: string) => {
    setSettings(prev => ({
      ...prev,
      models: prev.models.filter(model => model.id !== modelId)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            AI Model Instellingen
          </h2>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Beschikbare Modellen</h3>
              <div className="space-y-4">
                {settings.models.map((model) => (
                  <div key={model.id} className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <RadioGroup
                          value={settings.models.find(m => m.isDefault)?.id}
                          onValueChange={handleSetDefaultModel}
                        >
                          <RadioGroupItem value={model.id} id={`default-${model.id}`} />
                        </RadioGroup>
                        <div>
                          <p className="font-medium">{model.name}</p>
                          <p className="text-sm text-gray-600">{model.id}</p>
                          <p className="text-sm text-gray-500">{model.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {model.isFree && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Gratis</span>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveModel(model.id)}
                      >
                        Verwijder
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Nieuw Model Toevoegen</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="modelId">Model ID</Label>
                  <Input
                    id="modelId"
                    value={newModel.id}
                    onChange={(e) => setNewModel(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="bijv. google/gemini-2.0-flash-thinking-exp:free"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="modelName">Naam</Label>
                  <Input
                    id="modelName"
                    value={newModel.name}
                    onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="bijv. Gemini 2.0 Flash"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="modelDescription">Beschrijving</Label>
                  <Input
                    id="modelDescription"
                    value={newModel.description}
                    onChange={(e) => setNewModel(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="bijv. Snelle, gratis versie"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFree"
                    checked={newModel.isFree}
                    onCheckedChange={(checked) => 
                      setNewModel(prev => ({ ...prev, isFree: checked as boolean }))
                    }
                  />
                  <label
                    htmlFor="isFree"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Gratis model
                  </label>
                </div>
                <Button onClick={handleAddModel}>
                  Model Toevoegen
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">System Prompts</h2>
          
          <div className="space-y-2">
            <Label>Keyword Research Prompt</Label>
            <Textarea
              value={settings.systemPrompts.keywordResearch}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                systemPrompts: {
                  ...prev.systemPrompts,
                  keywordResearch: e.target.value
                }
              }))}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Tone Analysis Prompt</Label>
            <Textarea
              value={settings.systemPrompts.toneAnalysis}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                systemPrompts: {
                  ...prev.systemPrompts,
                  toneAnalysis: e.target.value
                }
              }))}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Content Generation Prompt</Label>
            <Textarea
              value={settings.systemPrompts.contentGeneration}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                systemPrompts: {
                  ...prev.systemPrompts,
                  contentGeneration: e.target.value
                }
              }))}
              rows={4}
            />
          </div>
        </div>

        <Button 
          onClick={saveSettings} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Opslaan..." : "Instellingen Opslaan"}
        </Button>
      </div>
    </div>
  );
}