import { Check } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface PricingCardProps {
  plan: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  onSelect: () => void;
  buttonText?: string;
}

export function PricingCard({
  plan,
  price,
  description,
  features,
  isPopular,
  onSelect,
  buttonText = "Choose Plan"
}: PricingCardProps) {
  return (
    <Card className={`relative ${isPopular ? 'border-2 border-primary shadow-lg' : 'border border-gray-200'}`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      
      <CardHeader className="pb-8">
        <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{plan}</CardTitle>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="text-4xl font-bold text-gray-900">${price}</div>
        <div className="text-gray-600">/month</div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button
          className={`w-full ${isPopular ? 'bg-primary text-white hover:bg-primary/90' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
          onClick={onSelect}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
