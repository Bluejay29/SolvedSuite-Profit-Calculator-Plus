'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data.user) {
        setMessage('Success! Please check your email for the confirmation link.');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-navy p-2">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="font-playfair text-3xl font-bold text-champagne">
            Join the Hub
          </h2>
          <p className="mt-2 text-sm text-pearl/60 uppercase tracking-widest font-inter">
            Start Your 7-Day Free Trial
          </p>
        </div>
        
        <form className="mt-8 space-y-5" onSubmit={handleSignUp}>
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm font-inter">
              {error}
            </div>
          )}
          
          {message && (
            <div className="bg-sage/10 border border-sage/50 text-sage px-4 py-3 rounded-lg text-sm font-inter">
              {message}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-pearl/50 uppercase tracking-widest mb-1 ml-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-navy border border-pearl/10 placeholder-pearl/20 text-pearl rounded-lg focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-all sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-pearl/50 uppercase tracking-widest mb-1 ml-1">
                Create Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-navy border border-pearl/10 placeholder-pearl/20 text-pearl rounded-lg focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-all sm:text-sm"
                placeholder="••••••••"
              />
              <p className="mt-2 text-[10px] text-pearl/30 uppercase tracking-tighter">
                Must be at least 6 characters
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-navy bg-sage hover:bg-sage/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg"
            >
              {loading ? 'Creating Account...' : 'Initialize My Trial'}
            </button>
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-pearl/40 uppercase tracking-widest">
              Already a member?{' '}
              <a href="/login" className="font-bold text-sage hover:text-pearl transition-colors">
                Sign In
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
