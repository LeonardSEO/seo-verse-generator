import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Check, Star, Zap, Clock, Users, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

      const response = await fetch('/functions/v1/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priceId }),
      });

      const { url, error } = await response.json();
      
      if (error) {
        toast({
          title: "Fout",
          description: error,
          variant: "destructive",
        });
        return;
      }

      if (url) {
        window.location.href = url;
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
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
            Transformeer Je Content met AI
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-4">
            Al meer dan <span className="font-bold text-purple-300">1,000+ tevreden gebruikers</span> vertrouwen op onze AI voor hun content
          </p>
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-400">
            <Shield className="h-4 w-4" />
            <span>7 dagen gratis uitproberen</span>
            <Clock className="h-4 w-4" />
            <span>Direct toegang</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <Card className="relative bg-gray-900/50 border-gray-800 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm">
              Meest Gekozen
            </div>
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
                onClick={() => handleCheckout('price_1QcutIIBuO6WDytxAQWHTsH2')}
              >
                Start Gratis Proefperiode
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="relative bg-gradient-to-br from-purple-900/80 to-indigo-900/80 border-purple-500/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm flex items-center">
              <Star className="h-4 w-4 mr-1" />
              Premium Features
            </div>
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
                onClick={() => handleCheckout('price_1Qcv0UIBuO6WDytxyZGkcKxA')}
              >
                Upgrade naar Pro
              </Button>
              <p className="text-xs text-center text-purple-300">
                <Users className="h-4 w-4 inline mr-1" />
                Sluit je aan bij 500+ Pro gebruikers
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Trust Signals */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">Vertrouwd door toonaangevende bedrijven</p>
          <div className="flex justify-center items-center space-x-8 opacity-50 hover:opacity-75 transition-opacity">
            {/* Hier kunnen logo's van bekende merken komen */}
            <div className="text-gray-500">TechCorp</div>
            <div className="text-gray-500">InnovateCo</div>
            <div className="text-gray-500">FutureTech</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;