import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/ui/navbar";
import { useToast } from "@/hooks/use-toast";
import { getToken, isAuthenticated } from "@/lib/auth";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PLAN_PRICES = {
  pro: {
    priceId: 'price_1234567890',
    name: 'Pro',
    price: 29,
    description: 'For professionals who need reliable AI assistance',
  },
  enterprise: {
    priceId: 'price_0987654321',
    name: 'Enterprise',
    price: 99,
    description: 'For teams and organizations',
  },
};

function SubscribeForm({ plan }: { plan: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?subscription_success=true`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const planInfo = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            Subscribe to {planInfo.name}
          </CardTitle>
          <div className="text-center">
            <div className="text-3xl font-bold">${planInfo.price}</div>
            <div className="text-gray-600">/month</div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!stripe || isSubmitting}
            >
              {isSubmitting ? 'Processing...' : `Subscribe for $${planInfo.price}/month`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Subscribe() {
  const [location, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [plan, setPlan] = useState("pro");
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated()) {
      setLocation("/");
      return;
    }

    // Get plan from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get('plan');
    if (planParam && PLAN_PRICES[planParam as keyof typeof PLAN_PRICES]) {
      setPlan(planParam);
    }

    // Create subscription
    const createSubscription = async () => {
      try {
        const token = getToken();
        const planInfo = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];
        
        const response = await fetch('/api/create-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            priceId: planInfo.priceId,
            plan: plan,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create subscription');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to initialize payment",
          variant: "destructive",
        });
        setLocation("/dashboard");
      }
    };

    createSubscription();
  }, [plan, setLocation, toast]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Setting up your subscription...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Subscription</h1>
          <p className="text-gray-600">Choose your payment method and complete your subscription</p>
        </div>
        
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <SubscribeForm plan={plan} />
        </Elements>
      </div>
    </div>
  );
}
