"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { aiClient } from '../lib/ai-client';

interface Material {
  name: string;
  category: string;
  current_price: number;
  target_price: number;
  supplier?: string;
  last_checked: string;
  price_history: { date: string; price: number }[];
}

interface PriceAlert {
  id: string;
  material_name: string;
  type: 'price_drop' | 'price_increase' | 'target_reached';
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function PriceMonitor() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({
    name: '',
    category: '',
    current_price: 0,
    target_price: 0,
    supplier: ''
  });

  const MATERIAL_CATEGORIES = [
    'Jewelry Making',
    'Candles & Soap', 
    'Woodworking',
    'Textiles & Sewing',
    'Paper Crafts',
    'Pottery & Ceramics',
    'Glass Art',
    'Leatherworking',
    'Painting & Art Supplies',
    'Food & Baking',
    'Other'
  ];

  useEffect(() => {
    loadMonitoredMaterials();
    loadAlerts();
  }, []);

  const loadMonitoredMaterials = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('Materials')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to Material format
      const transformedMaterials = (data || []).map(item => ({
        name: item.name,
        category: item.category,
        current_price: item.price_per_unit,
        target_price: item.target_price || 0,
        supplier: item.supplier,
        last_checked: item.updated_at,
        price_history: item.price_history || []
      }));

      setMaterials(transformedMaterials);
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('Price_Check_History')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_alert', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const transformedAlerts = (data || []).map(item => ({
        id: item.id,
        material_name: item.material_name,
        type: item.alert_type || 'price_change',
        message: item.notes || 'Price change detected',
        created_at: item.created_at,
        is_read: item.is_read || false
      }));

      setAlerts(transformedAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const addMaterialToMonitor = async () => {
    if (!newMaterial.name || !newMaterial.category || !newMaterial.current_price) {
      alert('Please fill in material name, category, and current price');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const materialData = {
        user_id: user.id,
        name: newMaterial.name,
        category: newMaterial.category,
        price_per_unit: newMaterial.current_price,
        target_price: newMaterial.target_price,
        supplier: newMaterial.supplier,
        unit: 'piece',
        price_history: [{
          date: new Date().toISOString(),
          price: newMaterial.current_price
        }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('Materials')
        .insert([materialData]);

      if (error) throw error;

      // Reset form
      setNewMaterial({
        name: '',
        category: '',
        current_price: 0,
        target_price: 0,
        supplier: ''
      });

      // Reload materials
      loadMonitoredMaterials();
    } catch (error) {
      console.error('Error adding material:', error);
      alert('Failed to add material');
    }
  };

  const checkPrices = async () => {
    setIsMonitoring(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      for (const material of materials) {
        try {
          // Get AI price analysis
          const prompt = `Find current market price for "${material.name}" in ${material.category} category. 
          Include typical suppliers and price ranges. Return JSON with:
          {
            "current_price": 0.00,
            "price_range": {"min": 0.00, "max": 0.00},
            "suppliers": ["supplier1", "supplier2"],
            "notes": "market conditions"
          }`;

          const aiResult = await aiClient.monitorPrices(prompt);
          const analysis = JSON.parse(aiResult);

          // Create price check record
          const checkRecord = {
            user_id: user.id,
            material_name: material.name,
            previous_price: material.current_price,
            new_price: analysis.current_price,
            price_difference: analysis.current_price - material.current_price,
            price_source: 'ai_analysis',
            notes: analysis.notes,
            is_alert: Math.abs(analysis.current_price - material.current_price) > (material.current_price * 0.1),
            created_at: new Date().toISOString()
          };

          await supabase
            .from('Price_Check_History')
            .insert([checkRecord]);

          // Update material if significant change
          if (Math.abs(analysis.current_price - material.current_price) > (material.current_price * 0.05)) {
            await supabase
              .from('Materials')
              .update({
                price_per_unit: analysis.current_price,
                price_history: [...material.price_history, {
                  date: new Date().toISOString(),
                  price: analysis.current_price
                }],
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id)
              .eq('name', material.name);
          }
        } catch (error) {
          console.error(`Error checking price for ${material.name}:`, error);
        }
      }

      // Reload data
      loadMonitoredMaterials();
      loadAlerts();
      
      alert('Price monitoring completed! Check alerts for any significant changes.');
    } catch (error) {
      console.error('Error during price monitoring:', error);
      alert('Failed to complete price monitoring');
    } finally {
      setIsMonitoring(false);
    }
  };

  const removeMaterial = async (materialName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('Materials')
        .delete()
        .eq('user_id', user.id)
        .eq('name', materialName);

      if (error) throw error;

      setMaterials(materials.filter(m => m.name !== materialName));
    } catch (error) {
      console.error('Error removing material:', error);
      alert('Failed to remove material');
    }
  };

  const markAlertAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('Price_Check_History')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(alerts.map(a => a.id === alertId ? { ...a, is_read: true } : a));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const getPriceChangePercentage = (material: Material) => {
    if (material.price_history.length < 2) return 0;
    const latest = material.price_history[material.price_history.length - 1].price;
    const previous = material.price_history[0].price;
    return ((latest - previous) / previous) * 100;
  };

  if (isLoading) {
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
        <h2 className="text-3xl font-bold text-gray-900 mb-6">AI Price Monitor</h2>
        
        {/* Add Material Form */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Add Material to Monitor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Material name"
              value={newMaterial.name}
              onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <select
              value={newMaterial.category}
              onChange={(e) => setNewMaterial({...newMaterial, category: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select category...</option>
              {MATERIAL_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                placeholder="Current price"
                value={newMaterial.current_price}
                onChange={(e) => setNewMaterial({...newMaterial, current_price: parseFloat(e.target.value) || 0})}
                step="0.01"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                placeholder="Target price (optional)"
                value={newMaterial.target_price}
                onChange={(e) => setNewMaterial({...newMaterial, target_price: parseFloat(e.target.value) || 0})}
                step="0.01"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <input
              type="text"
              placeholder="Supplier (optional)"
              value={newMaterial.supplier}
              onChange={(e) => setNewMaterial({...newMaterial, supplier: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={addMaterialToMonitor}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Material
            </button>
          </div>
        </div>

        {/* Monitor Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-gray-600">Monitor {materials.length} materials with AI-powered price tracking</p>
          </div>
          <button
            onClick={checkPrices}
            disabled={isMonitoring || materials.length === 0}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {isMonitoring ? 'Monitoring...' : 'Check All Prices Now'}
          </button>
        </div>

        {/* Monitored Materials */}
        {materials.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Monitored Materials</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 border">Material</th>
                    <th className="text-left p-3 border">Category</th>
                    <th className="text-left p-3 border">Current Price</th>
                    <th className="text-left p-3 border">Target Price</th>
                    <th className="text-left p-3 border">Price Change</th>
                    <th className="text-left p-3 border">Last Checked</th>
                    <th className="text-left p-3 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((material, index) => {
                    const changePercent = getPriceChangePercentage(material);
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-3 border font-medium">{material.name}</td>
                        <td className="p-3 border">{material.category}</td>
                        <td className="p-3 border">${material.current_price.toFixed(2)}</td>
                        <td className="p-3 border">
                          {material.target_price > 0 ? `$${material.target_price.toFixed(2)}` : 'Not set'}
                        </td>
                        <td className={`p-3 border font-semibold ${changePercent >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
                        </td>
                        <td className="p-3 border text-sm text-gray-600">
                          {new Date(material.last_checked).toLocaleDateString()}
                        </td>
                        <td className="p-3 border">
                          <button
                            onClick={() => removeMaterial(material.name)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Price Alerts</h3>
            <div className="space-y-3">
              {alerts.slice(0, 10).map(alert => (
                <div 
                  key={alert.id} 
                  className={`p-4 rounded-lg border ${
                    alert.is_read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{alert.material_name}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.type === 'price_drop' ? 'bg-green-100 text-green-800' :
                          alert.type === 'price_increase' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{alert.message}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!alert.is_read && (
                      <button
                        onClick={() => markAlertAsRead(alert.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {materials.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-6 inline-block mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No materials being monitored</h3>
            <p className="text-gray-500 mb-4">Add materials above to start tracking their prices with AI.</p>
          </div>
        )}
      </div>
    </div>
  );
}