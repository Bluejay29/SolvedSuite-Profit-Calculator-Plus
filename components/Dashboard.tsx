"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

interface Product {
  id: string;
  name: string;
  category: string;
  materials_cost: number;
  selling_price: number;
  profit_margin: number;
  created_at: string;
  last_updated: string;
}

interface Calculation {
  id: string;
  type: string;
  data: any;
  created_at: string;
}

interface SavingsData {
  total_saved: number;
  calculations_count: number;
  best_saving: number;
  monthly_trend: { month: string; saved: number }[];
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [savingsData, setSavingsData] = useState<SavingsData>({
    total_saved: 0,
    calculations_count: 0,
    best_saving: 0,
    monthly_trend: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'calculations'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('Products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Load calculations
      const { data: calculationsData, error: calculationsError } = await supabase
        .from('Calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (calculationsError) throw calculationsError;
      setCalculations(calculationsData || []);

      // Calculate savings
      calculateSavings(calculationsData || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSavings = (userCalculations: Calculation[]) => {
    let totalSaved = 0;
    let bestSaving = 0;
    const monthlySavings: { [key: string]: number } = {};

    userCalculations.forEach(calc => {
      if (calc.type === 'profit_calculation' && calc.data) {
        const data = calc.data;
        // Calculate potential savings from AI suggestions
        const estimatedSavings = (data.total_cost * 0.15); // Assume 15% savings from AI insights
        totalSaved += estimatedSavings;
        bestSaving = Math.max(bestSaving, estimatedSavings);

        // Group by month
        const month = new Date(calc.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        monthlySavings[month] = (monthlySavings[month] || 0) + estimatedSavings;
      }
    });

    // Convert monthly savings to array for chart
    const monthlyTrend = Object.entries(monthlySavings)
      .map(([month, saved]) => ({ month, saved }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months

    setSavingsData({
      total_saved: totalSaved,
      calculations_count: userCalculations.length,
      best_saving: bestSaving,
      monthly_trend: monthlyTrend
    });
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('Products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const deleteCalculation = async (calculationId: string) => {
    try {
      const { error } = await supabase
        .from('Calculations')
        .delete()
        .eq('id', calculationId);

      if (error) throw error;

      setCalculations(calculations.filter(c => c.id !== calculationId));
      loadDashboardData(); // Refresh savings data
    } catch (error) {
      console.error('Error deleting calculation:', error);
      alert('Failed to delete calculation');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome to Your Dashboard</h1>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('calculations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'calculations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              >
              Calculations ({calculations.length})
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Saved</p>
                    <p className="text-3xl font-bold">${savingsData.total_saved.toFixed(2)}</p>
                  </div>
                  <div className="bg-white/20 rounded-full p-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Calculations</p>
                    <p className="text-3xl font-bold">{savingsData.calculations_count}</p>
                  </div>
                  <div className="bg-white/20 rounded-full p-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Products</p>
                    <p className="text-3xl font-bold">{products.length}</p>
                  </div>
                  <div className="bg-white/20 rounded-full p-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Best Saving</p>
                    <p className="text-3xl font-bold">${savingsData.best_saving.toFixed(2)}</p>
                  </div>
                  <div className="bg-white/20 rounded-full p-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Trend */}
            {savingsData.monthly_trend.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Monthly Savings Trend</h3>
                <div className="h-40 flex items-end space-x-2">
                  {savingsData.monthly_trend.map((month, index) => {
                    const maxValue = Math.max(...savingsData.monthly_trend.map(m => m.saved));
                    const height = maxValue > 0 ? (month.saved / maxValue) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-blue-500 rounded-t"
                          style={{ height: `${height}%` }}
                        ></div>
                        <p className="text-xs mt-2 text-gray-600">{month.month}</p>
                        <p className="text-xs font-semibold text-gray-800">${month.saved.toFixed(0)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Products</h3>
                {products.length > 0 ? (
                  <div className="space-y-3">
                    {products.slice(0, 5).map(product => (
                      <div key={product.id} className="flex justify-between items-center p-3 bg-white rounded">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${product.selling_price.toFixed(2)}</p>
                          <p className={`text-sm ${product.profit_margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.profit_margin.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No products yet</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Calculations</h3>
                {calculations.length > 0 ? (
                  <div className="space-y-3">
                    {calculations.slice(0, 5).map(calc => (
                      <div key={calc.id} className="flex justify-between items-center p-3 bg-white rounded">
                        <div>
                          <p className="font-medium capitalize">{calc.type.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(calc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-600">
                            {calc.data?.total_cost ? `$${calc.data.total_cost.toFixed(2)}` : 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No calculations yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Your Products</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Add New Product
              </button>
            </div>
            
            {products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-3 border">Product Name</th>
                      <th className="text-left p-3 border">Category</th>
                      <th className="text-left p-3 border">Materials Cost</th>
                      <th className="text-left p-3 border">Selling Price</th>
                      <th className="text-left p-3 border">Profit Margin</th>
                      <th className="text-left p-3 border">Created</th>
                      <th className="text-left p-3 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="p-3 border font-medium">{product.name}</td>
                        <td className="p-3 border">{product.category}</td>
                        <td className="p-3 border">${product.materials_cost.toFixed(2)}</td>
                        <td className="p-3 border">${product.selling_price.toFixed(2)}</td>
                        <td className={`p-3 border font-semibold ${product.profit_margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.profit_margin.toFixed(1)}%
                        </td>
                        <td className="p-3 border text-sm text-gray-600">
                          {new Date(product.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3 border">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800">Edit</button>
                            <button 
                              onClick={() => deleteProduct(product.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-6 inline-block mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                <p className="text-gray-500 mb-4">Start by calculating your first product's materials and profit.</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Calculate First Product
                </button>
              </div>
            )}
          </div>
        )}

        {/* Calculations Tab */}
        {activeTab === 'calculations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Calculation History</h3>
              <div className="flex gap-2">
                <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                  Export CSV
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  New Calculation
                </button>
              </div>
            </div>
            
            {calculations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-3 border">Type</th>
                      <th className="text-left p-3 border">Date</th>
                      <th className="text-left p-3 border">Total Cost</th>
                      <th className="text-left p-3 border">Selling Price</th>
                      <th className="text-left p-3 border">Profit</th>
                      <th className="text-left p-3 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculations.map(calc => (
                      <tr key={calc.id} className="hover:bg-gray-50">
                        <td className="p-3 border capitalize">{calc.type.replace('_', ' ')}</td>
                        <td className="p-3 border text-sm text-gray-600">
                          {new Date(calc.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3 border">
                          ${calc.data?.total_cost ? calc.data.total_cost.toFixed(2) : 'N/A'}
                        </td>
                        <td className="p-3 border">
                          ${calc.data?.selling_price ? calc.data.selling_price.toFixed(2) : 'N/A'}
                        </td>
                        <td className={`p-3 border font-semibold ${calc.data?.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${calc.data?.profit ? calc.data.profit.toFixed(2) : 'N/A'}
                        </td>
                        <td className="p-3 border">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800">View</button>
                            <button 
                              onClick={() => deleteCalculation(calc.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-6 inline-block mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No calculations yet</h3>
                <p className="text-gray-500 mb-4">Start calculating your product costs and profits.</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Start Calculating
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}