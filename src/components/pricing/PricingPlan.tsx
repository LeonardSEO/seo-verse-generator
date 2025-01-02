import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface PricingPlanProps {
  title: string;
  description: string;
  price: string;
  interval: string;
  features: string[];
  priceId: string;
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  onUpgrade: (priceId: string) => Promise<void>;
  buttonText: string;
  buttonDisabled?: boolean;
  highlightText?: string;
  statusBadge?: React.ReactNode;
}

export const PricingPlan = ({
  title,
  description,
  price,
  interval,
  features,
  priceId,
  isPopular,
  isCurrentPlan,
  onUpgrade,
  buttonText,
  buttonDisabled,
  highlightText,
  statusBadge,
}: PricingPlanProps) => {
  return (
    <Card className={`relative ${isPopular ? 'bg-gradient-to-br from-purple-900/80 to-indigo-900/80 border-purple-500/50' : 'bg-gray-900/50 border-gray-800'} backdrop-blur-sm transform hover:scale-105 transition-all duration-300`}>
      {highlightText && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm">
          {highlightText}
        </div>
      )}
      {statusBadge}
      <CardHeader>
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-gray-400">/{interval}</span>
        </div>
        <div className={`${isPopular ? 'bg-purple-800/30' : 'bg-purple-900/30'} p-4 rounded-lg mb-6`}>
          <p className="text-sm text-purple-200">
            {description}
          </p>
        </div>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className={`w-full ${isPopular ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700' : 'bg-purple-600 hover:bg-purple-700'} text-white`}
          onClick={() => onUpgrade(priceId)}
          disabled={buttonDisabled}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};