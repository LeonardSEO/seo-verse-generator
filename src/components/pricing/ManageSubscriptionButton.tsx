import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const ManageSubscriptionButton = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleManageSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Login vereist",
          description: "Log eerst in om je abonnement te beheren",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      console.log('Creating portal session with session:', {
        accessToken: session.access_token,
        userId: session.user.id
      });
      
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (error) {
        console.error('Portal session error:', error);
        toast({
          title: "Er is iets misgegaan",
          description: "Kon geen verbinding maken met het klantportaal",
          variant: "destructive",
        });
        return;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast({
        title: "Er is iets misgegaan",
        description: "Kon geen verbinding maken met het klantportaal",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      variant="default" 
      onClick={handleManageSubscription}
      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
    >
      <Settings className="w-4 h-4" />
      Beheer je abonnement
    </Button>
  );
};