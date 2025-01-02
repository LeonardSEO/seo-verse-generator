import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LoadingSpinner from '@/components/LoadingSpinner';
import { Upload, ArrowLeft } from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      
      setFullName(session.user.user_metadata?.full_name || '');
      setAvatarUrl(session.user.user_metadata?.avatar_url || null);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setSaving(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Niet ingelogd');

      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({
        title: "Avatar geüpload!",
        description: "Je profielfoto is succesvol bijgewerkt.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het uploaden van je avatar.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Niet ingelogd');
      }

      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Account Instellingen</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Profiel</CardTitle>
            <CardDescription>
              Beheer je profielinformatie
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {fullName?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={uploadAvatar}
                  className="hidden"
                  id="avatar-upload"
                  disabled={saving}
                />
                <Label
                  htmlFor="avatar-upload"
                  className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Avatar
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Naam</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Je naam"
              />
              <p className="text-sm text-gray-500">
                Deze naam wordt gebruikt voor je profiel
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
