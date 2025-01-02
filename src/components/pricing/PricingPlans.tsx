import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Check, Star, Zap, Users, Shield } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface PricingPlansProps {
  handleCheckout: (priceId: string) => Promise<void>;
}

export const PricingPlans = ({ handleCheckout }: PricingPlansProps) => {
  const { data: subscription, isLoading } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleUpgrade = async (priceId: string) => {
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
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {/* Basic Plan */}
      <Card className="relative bg-gray-900/50 border-gray-800 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm">
          Meest Gekozen
        </div>
        {subscription?.level === 'free' && (
          <div className="absolute -top-3 right-4 bg-green-600 text-white px-4 py-1 rounded-full text-sm flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            Huidig Plan
          </div>
        )}
        <CardHeader>
          <h3 className="text-2xl font-bold text-white">Basic</h3>
          <p className="text-gray-400">Voor groeiende bedrijven</p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <span className="text-4xl font-bold">€5</span>
            <span className="text-gray-400">/maand</span>
          </div>
          <div className="bg-purple-900/30 p-4 rounded-lg mb-6">
            <p className="text-sm text-purple-200">
              Ontdek de kracht van AI-contentgeneratie. Perfect voor beginners die willen groeien met professionele content.
            </p>
          </div>
          <ul className="space-y-3">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>5.000 woorden per maand</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Keyword-analyse tools</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>URL content verwerking</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Email support binnen 24 uur</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => handleUpgrade('price_1QcutIIBuO6WDytxAQWHTsH2')}
            disabled={subscription?.level === 'pro'}
          >
            {subscription?.level === 'pro' ? 'Al Pro Gebruiker' : 'Start Gratis Proefperiode'}
          </Button>
        </CardFooter>
      </Card>

      {/* Pro Plan */}
      <Card className="relative bg-gradient-to-br from-purple-900/80 to-indigo-900/80 border-purple-500/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm flex items-center">
          <Star className="h-4 w-4 mr-1" />
          Premium Features
        </div>
        {subscription?.level === 'pro' && (
          <div className="absolute -top-3 right-4 bg-green-600 text-white px-4 py-1 rounded-full text-sm flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            Huidig Plan
          </div>
        )}
        <CardHeader>
          <h3 className="text-2xl font-bold text-white flex items-center">
            Pro
            <Zap className="h-5 w-5 ml-2 text-yellow-400" />
          </h3>
          <p className="text-purple-200">Voor serieuze content creators</p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <span className="text-4xl font-bold">€29,99</span>
            <span className="text-purple-200">/maand</span>
          </div>
          <div className="bg-purple-800/30 p-4 rounded-lg mb-6">
            <p className="text-sm text-purple-100">
              Verleg de grenzen van contentcreatie met ongelimiteerde mogelijkheden en toegang tot de krachtigste AI-modellen.
            </p>
          </div>
          <ul className="space-y-3">
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-400 mr-2" />
              <span className="font-semibold">Onbeperkt aantal woorden</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-400 mr-2" />
              <span>Premium AI modellen</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-400 mr-2" />
              <span>Geavanceerde tone-of-voice analyse</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-400 mr-2" />
              <span>Prioriteit support</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-400 mr-2" />
              <span>Custom branding opties</span>
            </li>
            <li className="flex items-center">
              <Check className="h-5 w-5 text-green-400 mr-2" />
              <span>API toegang</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            onClick={() => handleUpgrade('price_1Qcv0UIBuO6WDytxyZGkcKxA')}
            disabled={subscription?.level === 'pro'}
          >
            {subscription?.level === 'pro' ? 'Actief Abonnement' : 'Upgrade naar Pro'}
          </Button>
          <p className="text-xs text-center text-purple-300">
            <Users className="h-4 w-4 inline mr-1" />
            Sluit je aan bij 500+ Pro gebruikers
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
