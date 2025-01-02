import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      
      // Load user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setFullName(profile.username || '');
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Niet ingelogd');
      }

      const { error } = await supabase
        .from('profiles')
        .update({ username: fullName })
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Opgeslagen!",
        description: "Je profiel is bijgewerkt.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het opslaan van je profiel.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Account Instellingen</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Profiel</CardTitle>
            <CardDescription>
              Beheer je profielinformatie
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Naam</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Je naam"
              />
              <p className="text-sm text-gray-500">
                Deze naam wordt gebruikt voor je profiel avatar
              </p>
            </div>
            
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="w-full"
            >
              {saving ? <LoadingSpinner /> : "Opslaan"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}