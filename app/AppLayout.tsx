"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import Dashboard from '../components/Dashboard';
import MaterialCalculator from '../components/MaterialCalculator';
import ProfitCalculator from '../components/ProfitCalculator';
import ProductManager from '../components/ProductManager';
import PriceMonitor from '../components/PriceMonitor';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'calculator' | 'profit' | 'products' | 'monitor'>('dashboard');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [materialsCost, setMaterialsCost] = useState(0);

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        setCurrentView('dashboard'); // Reset to dashboard on logout
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleMaterialsCalculated = (cost: number) => {
    setMaterialsCost(cost);
    setCurrentView('profit');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="ml-2 text-xl font-bold text-gray-900">SolvedSuite</span>
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentView === 'dashboard'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('calculator')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentView === 'calculator'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Material Calculator
                </button>
                <button
                  onClick={() => setCurrentView('profit')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentView === 'profit'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Profit Calculator
                </button>
                <button
                  onClick={() => setCurrentView('products')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentView === 'products'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Products
                </button>
                <button
                  onClick={() => setCurrentView('monitor')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentView === 'monitor'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Price Monitor
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <div className="relative">
                <button
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleLogout}
                >
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left ${
                currentView === 'dashboard'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('calculator')}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left ${
                currentView === 'calculator'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Material Calculator
            </button>
            <button
              onClick={() => setCurrentView('profit')}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left ${
                currentView === 'profit'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Profit Calculator
            </button>
            <button
              onClick={() => setCurrentView('products')}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left ${
                currentView === 'products'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setCurrentView('monitor')}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left ${
                currentView === 'monitor'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Price Monitor
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'calculator' && (
          <MaterialCalculator 
            onMaterialsCalculated={handleMaterialsCalculated}
          />
        )}
        {currentView === 'profit' && (
          <ProfitCalculator 
            materialsCost={materialsCost}
            onSaveCalculation={(calculation) => {
              console.log('Profit calculation saved:', calculation);
            }}
          />
        )}
        {currentView === 'products' && (
          <ProductManager 
            onProductSaved={(product) => {
              console.log('Product saved:', product);
            }}
          />
        )}
        {currentView === 'monitor' && (
          <PriceMonitor />
        )}
      </main>

      {/* Quick Action Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => {
            if (currentView === 'calculator') {
              setCurrentView('profit');
            } else {
              setCurrentView('calculator');
            }
          }}
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all hover:scale-105"
          title={currentView === 'calculator' ? 'Go to Profit Calculator' : 'Go to Material Calculator'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {currentView === 'calculator' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}