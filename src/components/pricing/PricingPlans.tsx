import React from 'react';
import { Star, Zap, Users, Shield } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PricingPlan } from './PricingPlan';
import { ManageSubscriptionButton } from './ManageSubscriptionButton';

interface PricingPlansProps {
  handleCheckout: (priceId: string) => Promise<void>;
}

export const PricingPlans = ({ handleCheckout }: PricingPlansProps) => {
  const { data: subscription, isLoading } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleUpgrade = async (priceId: string) => {
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

      await handleCheckout(priceId);
    } catch (error) {
      console.error('Upgrade error:', error);
      toast({
        title: "Er is iets misgegaan",
        description: "Probeer het later opnieuw",
        variant: "destructive",
      });
    }
  };

  const basicFeatures = [
    '5.000 woorden per maand',
    'Keyword-analyse tools',
    'URL content verwerking',
    'Email support binnen 24 uur',
  ];

  const proFeatures = [
    'Onbeperkt aantal woorden',
    'Premium AI modellen',
    'Geavanceerde tone-of-voice analyse',
    'Prioriteit support',
    'Custom branding opties',
    'API toegang',
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {subscription?.level === 'pro' && (
        <div className="md:col-span-2 w-full flex justify-center mb-4">
          <ManageSubscriptionButton />
        </div>
      )}
      
      <PricingPlan
        title="Basic"
        description="Voor groeiende bedrijven"
        price="€5"
        interval="maand"
        features={basicFeatures}
        priceId="price_1QcutIIBuO6WDytxAQWHTsH2"
        isPopular={true}
        isCurrentPlan={subscription?.level === 'free'}
        onUpgrade={handleUpgrade}
        buttonText={subscription?.level === 'pro' ? 'Al Pro Gebruiker' : 'Start Gratis Proefperiode'}
        buttonDisabled={subscription?.level === 'pro'}
        highlightText="Meest Gekozen"
        statusBadge={subscription?.level === 'free' && (
          <div className="absolute -top-3 right-4 bg-green-600 text-white px-4 py-1 rounded-full text-sm flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            Huidig Plan
          </div>
        )}
      />

      <PricingPlan
        title="Pro"
        description="Voor serieuze content creators"
        price="€29,99"
        interval="maand"
        features={proFeatures}
        priceId="price_1Qcv0UIBuO6WDytxyZGkcKxA"
        isPopular={false}
        isCurrentPlan={subscription?.level === 'pro'}
        onUpgrade={handleUpgrade}
        buttonText={subscription?.level === 'pro' ? 'Actief Abonnement' : 'Upgrade naar Pro'}
        buttonDisabled={subscription?.level === 'pro'}
        highlightText="Premium Features"
        statusBadge={subscription?.level === 'pro' && (
          <div className="absolute -top-3 right-4 bg-green-600 text-white px-4 py-1 rounded-full text-sm flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            Huidig Plan
          </div>
        )}
      />
    </div>
  );
};