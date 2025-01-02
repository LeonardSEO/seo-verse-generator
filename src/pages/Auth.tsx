import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/pricing');
      }
    };
    checkUser();

    // Listen for auth state changes and handle errors
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        navigate('/pricing');
      }
      
      if (event === 'SIGNED_OUT') {
        toast({
          title: "Uitgelogd",
          description: "Je bent succesvol uitgelogd.",
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-4">
      <div className="max-w-md mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="h-8 w-8 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="bg-white rounded-xl shadow-xl p-8">
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
            localization={{
              variables: {
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Wachtwoord',
                  email_input_placeholder: 'Jouw email',
                  password_input_placeholder: 'Jouw wachtwoord',
                  button_label: 'Registreren',
                  loading_button_label: 'Registreren...',
                  social_provider_text: 'Inloggen met {{provider}}',
                  link_text: 'Heb je nog geen account? Registreer',
                },
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Wachtwoord',
                  email_input_placeholder: 'Jouw email',
                  password_input_placeholder: 'Jouw wachtwoord',
                  button_label: 'Inloggen',
                  loading_button_label: 'Inloggen...',
                  social_provider_text: 'Inloggen met {{provider}}',
                  link_text: 'Al een account? Login',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}