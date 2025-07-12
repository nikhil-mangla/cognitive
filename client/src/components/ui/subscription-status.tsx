import { useQuery } from "@tanstack/react-query";
import { Badge } from "./badge";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { apiRequest } from "@/lib/queryClient";
import { getToken } from "@/lib/auth";

interface SubscriptionStatus {
  plan: string;
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export function SubscriptionStatus() {
  const { data: subscription, isLoading, error } = useQuery<SubscriptionStatus>({
    queryKey: ['/api/subscription/status'],
    queryFn: async () => {
      const token = getToken();
      const response = await fetch('/api/subscription/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }
      return response.json();
    },
  });

  const handleCancelSubscription = async () => {
    try {
      const token = getToken();
      await apiRequest("POST", "/api/subscription/cancel", {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      // Refresh the subscription status
      window.location.reload();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-600">Failed to load subscription status</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro':
        return 'bg-primary text-white';
      case 'enterprise':
        return 'bg-gray-900 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">Current Plan</CardTitle>
            <p className="text-sm text-gray-600">Manage your subscription and billing</p>
          </div>
          <Badge className={getPlanColor(subscription?.plan || 'free')}>
            {subscription?.plan?.charAt(0).toUpperCase() + subscription?.plan?.slice(1) || 'Free'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Status</span>
          <Badge className={getStatusColor(subscription?.status || 'active')}>
            {subscription?.status?.charAt(0).toUpperCase() + subscription?.status?.slice(1) || 'Active'}
          </Badge>
        </div>
        
        {subscription?.currentPeriodEnd && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Next billing date</span>
            <span className="text-sm font-medium">
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </span>
          </div>
        )}
        
        {subscription?.cancelAtPeriodEnd && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              Your subscription will be canceled at the end of the current period.
            </p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 pt-4">
          {subscription?.plan !== 'free' && !subscription?.cancelAtPeriodEnd && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelSubscription}
            >
              Cancel Subscription
            </Button>
          )}
          
          <Button size="sm">
            Upgrade Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
