import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Check, Star, Zap, Clock, Users, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PricingHeader } from '@/components/pricing/PricingHeader';
import { PricingPlans } from '@/components/pricing/PricingPlans';
import { TrustSignals } from '@/components/pricing/TrustSignals';

const PricingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCheckout = async (priceId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Login vereist",
          description: "Log eerst in om een abonnement af te sluiten",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });

      if (error) {
        console.error('Checkout error:', error);
        toast({
          title: "Fout",
          description: error.message || "Er is iets misgegaan",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Er is iets misgegaan",
        description: "Probeer het later opnieuw",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <PricingHeader />
        <PricingPlans handleCheckout={handleCheckout} />
        <TrustSignals />
      </div>
    </div>
  );
};

export default PricingPage;