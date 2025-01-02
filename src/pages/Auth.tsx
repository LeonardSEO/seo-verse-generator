import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();

    // Listen for auth state changes and errors
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        navigate('/');
      }
      
      // Handle auth errors
      if (event === 'USER_DELETED' || event === 'SIGNED_OUT') {
        toast({
          title: "Uitgelogd",
          description: "Je bent succesvol uitgelogd.",
        });
      }
    });

    // Listen for auth errors
    const errorListener = supabase.auth.onError((error) => {
      if (error.message.includes('user_already_exists')) {
        toast({
          title: "Account bestaat al",
          description: "Dit e-mailadres is al geregistreerd. Probeer in te loggen.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Fout",
          description: "Er is iets misgegaan. Probeer het opnieuw.",
          variant: "destructive",
        });
      }
    });

    return () => {
      subscription.unsubscribe();
      errorListener.unsubscribe();
    };
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-primary">Login om door te gaan</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#4F46E5',
                  brandAccent: '#4338CA',
                }
              }
            }
          }}
          providers={['github']}
          view="sign_in"
          showLinks={true}
          redirectTo={window.location.origin}
          socialLayout="horizontal"
        />
      </div>
    </div>
  );
}