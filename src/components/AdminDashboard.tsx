import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Json } from "@/integrations/supabase/types";

type AdminSettings = Database['public']['Tables']['admin_settings']['Row'];

interface Settings {
  defaultModel: string;
  systemPrompts: {
    keywordResearch: string;
    toneAnalysis: string;
    contentGeneration: string;
  };
}

export default function AdminDashboard() {
  const [settings, setSettings] = useState<Settings>({
    defaultModel: 'gpt-4o-mini',
    systemPrompts: {
      keywordResearch: '',
      toneAnalysis: '',
      contentGeneration: ''
    }
  });
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
      
      // Safely type cast the JSON data
      if (data?.settings && typeof data.settings === 'object') {
        const settingsData = data.settings as unknown as Settings;
        if (
          'defaultModel' in settingsData && 
          'systemPrompts' in settingsData && 
          typeof settingsData.systemPrompts === 'object'
        ) {
          setSettings(settingsData);
        }
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
          settings: settings as unknown as Json,
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="space-y-8 bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">AI Model Instellingen</h2>
          
          <div className="space-y-2">
            <Label>Standaard Model</Label>
            <Select
              value={settings.defaultModel}
              onValueChange={(value) => setSettings(prev => ({ ...prev, defaultModel: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecteer een model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o-mini">GPT-4 Mini (Snel & Goedkoop)</SelectItem>
                <SelectItem value="gpt-4o">GPT-4 (Krachtig)</SelectItem>
              </SelectContent>
            </Select>
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