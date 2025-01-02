import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ModelList } from './admin/ModelList';
import { AddModelForm } from './admin/AddModelForm';
import { SystemPrompts } from './admin/SystemPrompts';
import type { Settings as AdminSettings, Model } from './types/admin';

const defaultSettings: AdminSettings = {
  models: [],
  systemPrompts: {
    keywordResearch: '',
    toneAnalysis: '',
    contentGeneration: ''
  },
  defaultFreeModel: '',
  defaultPremiumModel: ''
};

export default function AdminDashboard() {
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
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
        const settingsData = data.settings as AdminSettings;
        setSettings(settingsData);
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
          settings: settings as any,
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

  const handleAddModel = (newModel: Model) => {
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
  };

  const handleRemoveModel = (modelId: string) => {
    setSettings(prev => ({
      ...prev,
      models: prev.models.filter(model => model.id !== modelId),
      defaultFreeModel: prev.defaultFreeModel === modelId ? '' : prev.defaultFreeModel,
      defaultPremiumModel: prev.defaultPremiumModel === modelId ? '' : prev.defaultPremiumModel
    }));
  };

  const handleSetDefaultFreeModel = (modelId: string) => {
    setSettings(prev => ({
      ...prev,
      defaultFreeModel: modelId
    }));
  };

  const handleSetDefaultPremiumModel = (modelId: string) => {
    setSettings(prev => ({
      ...prev,
      defaultPremiumModel: modelId
    }));
  };

  const handlePromptChange = (field: keyof typeof settings.systemPrompts, value: string) => {
    setSettings(prev => ({
      ...prev,
      systemPrompts: {
        ...prev.systemPrompts,
        [field]: value
      }
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
            <ModelList
              models={settings.models}
              defaultFreeModel={settings.defaultFreeModel}
              defaultPremiumModel={settings.defaultPremiumModel}
              onSetDefaultFreeModel={handleSetDefaultFreeModel}
              onSetDefaultPremiumModel={handleSetDefaultPremiumModel}
              onRemoveModel={handleRemoveModel}
            />

            <AddModelForm onAddModel={handleAddModel} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <SystemPrompts
            prompts={settings.systemPrompts}
            onChange={handlePromptChange}
          />
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
