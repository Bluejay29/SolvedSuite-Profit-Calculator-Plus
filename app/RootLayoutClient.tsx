"use client";

import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase/client";
import Sidebar from "@/components/Sidebar";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Premium Champagne Loading Spinner on Navy Background
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-navy">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-champagne"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {user ? (
        <>
          {/* Vertical Sidebar - Visible only when logged in */}
          <aside className="w-64 border-r border-champagne/20 bg-navy hidden md:block shrink-0">
            <Sidebar />
          </aside>
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </>
      ) : (
        /* Logged Out View (Landing Page / Login) */
        <main className="flex-1">
          {children}
        </main>
      )}
    </div>
  );
}
