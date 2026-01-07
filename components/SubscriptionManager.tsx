"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

interface SubscriptionManagerProps {
  onSubscriptionChange?: (isActive: boolean) => void;
  children?: React.ReactNode;
  featureName?: string;
}

export default function SubscriptionManager({ 
  onSubscriptionChange, 
  children, 
  featureName 
}: SubscriptionManagerProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkSubscription();
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('Subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking subscription:', error);
      }

      setSubscription(data);
      setIsLoading(false);
      
      if (onSubscriptionChange) {
        onSubscriptionChange(!!data);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      if (!user) {
        alert('Please log in first');
        return;
      }

      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          price_id: 'price_1SmgQV8tAAbl1qwa396rV6bP', // $29/month price ID
        }),
      });

      const { session_url, error } = await response.json();
      
      if (error) {
        alert('Error creating checkout session: ' + error);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = session_url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to create checkout session');
    }
  };

  const handleManageSubscription = async () => {
    try {
      if (!subscription) return;

      // Create Stripe billing portal session
      const response = await fetch('/api/create-billing-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: subscription.stripe_customer_id,
        }),
      });

      const { portal_url, error } = await response.json();
      
      if (error) {
        alert('Error creating billing portal session: ' + error);
        return;
      }

      // Redirect to Stripe Billing Portal
      window.location.href = portal_url;
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      alert('Failed to create billing portal session');
    }
  };

  const isFeatureAvailable = (feature: string) => {
    if (!user) return false; // Must be logged in
    
    // Free features available to everyone
    const freeFeatures = [
      'basic_calculator',
      'dashboard_overview',
      'save_1_product',
      '1_calculation'
    ];

    // Premium features require subscription
    const premiumFeatures = [
      'unlimited_products',
      'unlimited_calculations',
      'ai_insights',
      'marketplace_analysis',
      'savings_tracking',
      'data_export',
      'price_monitoring'
    ];

    if (freeFeatures.includes(feature)) {
      return true;
    }

    if (premiumFeatures.includes(feature)) {
      return !!subscription;
    }

    // Default to requiring subscription for unknown features
    return !!subscription;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // User not logged in
  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-yellow-800">Please log in to access this feature</span>
        </div>
      </div>
    );
  }

  // Feature requires subscription but user doesn't have one
  if (featureName && !isFeatureAvailable(featureName)) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100 4h2a1 1 0 100 2 2 2 0 01-2-2H4a1 1 0 01-1-1V5z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Unlock Premium Features</h2>
          <p className="text-blue-100 mb-6">
            Get unlimited calculations, AI insights, and advanced analytics to grow your handmade business.
          </p>
          
          <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-6">
            <div className="text-3xl font-bold mb-2">$29<span className="text-lg font-normal">/month</span></div>
            <div className="text-sm text-blue-100 mb-4">Save $500-1,600/month with our AI insights</div>
            <div className="space-y-2 text-left text-sm">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Unlimited product calculations
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                AI-powered price optimization
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Marketplace fee calculator
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Savings tracking & analytics
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleSubscribe}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => setShowPaywall(false)}
              className="bg-white/20 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User has access - render children
  return <>{children}</>;
}

// Hook to check subscription status in components
export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('Subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking subscription:', error);
        }

        setSubscription(data);
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, []);

  return { subscription, isLoading };
}