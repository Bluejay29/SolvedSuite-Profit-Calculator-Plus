'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignUpForm';
import Sidebar from '../components/Sidebar'; 

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-champagne"></div>
      </div>
    );
  }

  // If logged in, show the Dashboard with the Sidebar
  if (user) {
    return (
      <div className="flex min-h-screen bg-navy">
        <aside className="w-64 border-r border-champagne/20 hidden md:block">
          <Sidebar />
        </aside>
        <main className="flex-1 p-8 text-pearl">
           {/* Your Dashboard content would go here */}
           <h1 className="font-playfair text-3xl text-champagne">Welcome to the Profit Hub</h1>
        </main>
      </div>
    );
  }

  // If not logged in, show the Premium Login Screen
  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-navy border border-champagne/20 rounded-2xl shadow-2xl p-8">
          {/* Premium Header */}
          <div className="text-center mb-10">
            <h1 className="font-playfair text-4xl text-champagne mb-2">SolvedSuite</h1>
            <p className="font-inter text-pearl/60 uppercase tracking-widest text-xs">Maker's Profit Hub</p>
          </div>

          {/* Auth Toggle - Pearl & Sage style */}
          <div className="flex mb-8 border-b border-pearl/10">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-center font-medium transition-all ${
                isLogin ? 'text-champagne border-b-2 border-champagne' : 'text-pearl/40 hover:text-pearl'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-center font-medium transition-all ${
                !isLogin ? 'text-champagne border-b-2 border-champagne' : 'text-pearl/40 hover:text-pearl'
              }`}
            >
              Join the Hub
            </button>
          </div>

          {/* Forms */}
          <div className="premium-form-container">
            {isLogin ? <LoginForm /> : <SignupForm />}
          </div>

          {/* Benefits - Styled in Sage and Pearl */}
          <div className="mt-10 pt-6 border-t border-pearl/10">
            <h3 className="font-playfair text-sage mb-4">Why the Profit Hub?</h3>
            <ul className="space-y-3 text-sm text-pearl/80 font-inter">
              <li className="flex items-center">
                <span className="text-sage mr-2">✓</span> Save $500-1,600/month with AI insights
              </li>
              <li className="flex items-center">
                <span className="text-sage mr-2">✓</span> Marketplace fee optimization
              </li>
              <li className="flex items-center">
                <span className="text-sage mr-2">✓</span> Professional profit tracking
              </li>
            </ul>
          </div>
        </div>
        
        <p className="mt-8 text-center text-pearl/40 text-xs tracking-widest uppercase">
          Free to start • $29/month after trial
        </p>
      </div>
    </div>
  );
}
