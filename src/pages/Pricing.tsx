import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Check } from 'lucide-react';
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
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Kies je Plan
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Verbeter je content met AI. Start met een gratis proefperiode van 7 dagen.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <h3 className="text-2xl font-bold text-white">Basic</h3>
              <p className="text-gray-400">Voor kleine bedrijven</p>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-4xl font-bold">€5</span>
                <span className="text-gray-400">/maand</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>5.000 woorden per maand</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Basis AI model</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Email support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-white text-gray-900 hover:bg-gray-200"
                onClick={() => handleCheckout('price_1QcutIIBuO6WDytxAQWHTsH2')}
              >
                Start Basic Plan
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="bg-gradient-to-br from-indigo-600/50 to-purple-600/50 border-indigo-500/50 backdrop-blur-sm">
            <CardHeader>
              <h3 className="text-2xl font-bold text-white">Pro</h3>
              <p className="text-gray-200">Voor groeiende bedrijven</p>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-4xl font-bold">€29,99</span>
                <span className="text-gray-200">/maand</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-2" />
                  <span>Onbeperkt aantal woorden</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-2" />
                  <span>Geavanceerd AI model</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-2" />
                  <span>Prioriteit support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-2" />
                  <span>Custom branding</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-white text-gray-900 hover:bg-gray-200"
                onClick={() => handleCheckout('price_1Qcv0UIBuO6WDytxyZGkcKxA')}
              >
                Start Pro Plan
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;