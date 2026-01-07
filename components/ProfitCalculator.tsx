"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

interface ProfitCalculation {
  materials_cost: number;
  labor_hours: number;
  labor_rate: number;
  labor_cost: number;
  overhead_percentage: number;
  overhead_cost: number;
  total_cost: number;
  selling_price: number;
  profit: number;
  profit_margin: number;
  marketplace_fees: {
    etsy: number;
    shopify: number;
    amazon: number;
  };
}

const MARKETPLACE_FEES = {
  etsy: {
    listing: 0.20,
    transaction: 0.065, // 6.5%
    offsite_ads: 0.15, // 15% if offsite ads enabled
    payment_processing: 0.03 // 3%
  },
  shopify: {
    basic_plan: 39, // monthly fee
    transaction: 0.029, // 2.9%
    payment_processing: 0.30 // per transaction
  },
  amazon: {
    referral: {
      'handmade': 0.15, // 15% for handmade
      'jewelry': 0.20, // 20% for jewelry
      'default': 0.15 // 15% default
    },
    fulfillment: {
      fba: 3.49, // minimum FBA fee
      fbm: 0 // seller fulfilled
    },
    closing: 0.0175 // 1.75% closing fee for media
  }
};

export default function ProfitCalculator({
  materialsCost,
  onSaveCalculation
}: {
  materialsCost: number;
  onSaveCalculation?: (calculation: ProfitCalculation) => void;
}) {
  const [calculation, setCalculation] = useState<ProfitCalculation>({
    materials_cost: materialsCost || 0,
    labor_hours: 0,
    labor_rate: 25, // $25/hour default
    labor_cost: 0,
    overhead_percentage: 20, // 20% default
    overhead_cost: 0,
    total_cost: 0,
    selling_price: 0,
    profit: 0,
    profit_margin: 0,
    marketplace_fees: {
      etsy: 0,
      shopify: 0,
      amazon: 0
    }
  });

  const [selectedMarketplace, setSelectedMarketplace] = useState<'etsy' | 'shopify' | 'amazon' | 'none'>('none');
  const [productCategory, setProductCategory] = useState<'handmade' | 'jewelry' | 'default'>('default');

  useEffect(() => {
    if (materialsCost !== calculation.materials_cost) {
      setCalculation(prev => ({
        ...prev,
        materials_cost: materialsCost
      }));
    }
  }, [materialsCost, calculation.materials_cost]);

  useEffect(() => {
    calculateProfit();
  }, [
    calculation.materials_cost,
    calculation.labor_hours,
    calculation.labor_rate,
    calculation.overhead_percentage,
    calculation.selling_price,
    selectedMarketplace,
    productCategory
  ]);

  const calculateProfit = () => {
    const labor_cost = calculation.labor_hours * calculation.labor_rate;
    const subtotal = calculation.materials_cost + labor_cost;
    const overhead_cost = subtotal * (calculation.overhead_percentage / 100);
    const total_cost = subtotal + overhead_cost;
    
    let marketplace_fee = 0;
    
    if (selectedMarketplace === 'etsy') {
      const transaction_fee = calculation.selling_price * MARKETPLACE_FEES.etsy.transaction;
      const payment_fee = calculation.selling_price * MARKETPLACE_FEES.etsy.payment_processing;
      marketplace_fee = MARKETPLACE_FEES.etsy.listing + transaction_fee + payment_fee + (calculation.selling_price * MARKETPLACE_FEES.etsy.offsite_ads);
    } else if (selectedMarketplace === 'shopify') {
      const transaction_fee = calculation.selling_price * MARKETPLACE_FEES.shopify.transaction;
      marketplace_fee = transaction_fee + MARKETPLACE_FEES.shopify.payment_processing;
    } else if (selectedMarketplace === 'amazon') {
      const referral_rate = MARKETPLACE_FEES.amazon.referral[productCategory];
      const referral_fee = calculation.selling_price * referral_rate;
      marketplace_fee = referral_fee + MARKETPLACE_FEES.amazon.fulfillment.fbm + (calculation.selling_price * MARKETPLACE_FEES.amazon.closing);
    }
    
    const profit = calculation.selling_price - total_cost - marketplace_fee;
    const profit_margin = calculation.selling_price > 0 ? (profit / calculation.selling_price) * 100 : 0;

    setCalculation(prev => ({
      ...prev,
      labor_cost,
      overhead_cost,
      total_cost,
      profit,
      profit_margin,
      marketplace_fees: {
        etsy: selectedMarketplace === 'etsy' ? marketplace_fee : calculateEtsyFee(calculation.selling_price),
        shopify: selectedMarketplace === 'shopify' ? marketplace_fee : calculateShopifyFee(calculation.selling_price),
        amazon: selectedMarketplace === 'amazon' ? marketplace_fee : calculateAmazonFee(calculation.selling_price, productCategory)
      }
    }));
  };

  const calculateEtsyFee = (price: number) => {
    if (price <= 0) return 0;
    return MARKETPLACE_FEES.etsy.listing + 
           (price * MARKETPLACE_FEES.etsy.transaction) + 
           (price * MARKETPLACE_FEES.etsy.payment_processing) +
           (price * MARKETPLACE_FEES.etsy.offsite_ads);
  };

  const calculateShopifyFee = (price: number) => {
    if (price <= 0) return 0;
    return (price * MARKETPLACE_FEES.shopify.transaction) + MARKETPLACE_FEES.shopify.payment_processing;
  };

  const calculateAmazonFee = (price: number, category: 'handmade' | 'jewelry' | 'default') => {
    if (price <= 0) return 0;
    const referral_rate = MARKETPLACE_FEES.amazon.referral[category];
    return (price * referral_rate) + MARKETPLACE_FEES.amazon.fulfillment.fbm + (price * MARKETPLACE_FEES.amazon.closing);
  };

  const updateCalculation = (updates: Partial<ProfitCalculation>) => {
    setCalculation(prev => ({ ...prev, ...updates }));
  };

  const calculateOptimalPrice = () => {
    const target_margin = 50; // 50% profit margin target
    const base_cost = calculation.materials_cost + calculation.labor_cost + calculation.overhead_cost;
    
    let optimal_price = base_cost / (1 - (target_margin / 100));
    
    // Add marketplace fee adjustment
    if (selectedMarketplace !== 'none') {
      let fee_percentage = 0;
      if (selectedMarketplace === 'etsy') fee_percentage = 0.065 + 0.03 + 0.15;
      if (selectedMarketplace === 'shopify') fee_percentage = 0.029;
      if (selectedMarketplace === 'amazon') fee_percentage = MARKETPLACE_FEES.amazon.referral[productCategory] + 0.0175;
      
      optimal_price = base_cost / (1 - (target_margin / 100) - fee_percentage);
    }
    
    // Round to nearest 0.99
    optimal_price = Math.ceil(optimal_price) - 0.01;
    
    setCalculation(prev => ({ ...prev, selling_price: optimal_price }));
  };

  const saveProfitCalculation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to save calculations');
        return;
      }

      const calculationData = {
        user_id: user.id,
        type: 'profit_calculation',
        data: calculation,
        marketplace: selectedMarketplace,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('Calculations')
        .insert([calculationData]);

      if (error) throw error;

      alert('Profit calculation saved successfully!');
      if (onSaveCalculation) onSaveCalculation(calculation);
    } catch (error) {
      console.error('Error saving calculation:', error);
      alert('Failed to save calculation');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Profit Calculator</h2>
        
        {/* Cost Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Materials Cost
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                value={calculation.materials_cost}
                onChange={(e) => updateCalculation({ materials_cost: parseFloat(e.target.value) || 0 })}
                step="0.01"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Labor Hours
            </label>
            <input
              type="number"
              value={calculation.labor_hours}
              onChange={(e) => updateCalculation({ labor_hours: parseFloat(e.target.value) || 0 })}
              step="0.25"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Labor Rate ($/hour)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                value={calculation.labor_rate}
                onChange={(e) => updateCalculation({ labor_rate: parseFloat(e.target.value) || 0 })}
                step="0.01"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overhead Percentage
            </label>
            <div className="relative">
              <input
                type="number"
                value={calculation.overhead_percentage}
                onChange={(e) => updateCalculation({ overhead_percentage: parseFloat(e.target.value) || 0 })}
                step="0.01"
                className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-3 text-gray-500">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selling Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                value={calculation.selling_price}
                onChange={(e) => updateCalculation({ selling_price: parseFloat(e.target.value) || 0 })}
                step="0.01"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={calculateOptimalPrice}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Calculate Optimal Price
            </button>
          </div>
        </div>

        {/* Marketplace Selection */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Marketplace Fees</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Marketplace
              </label>
              <select
                value={selectedMarketplace}
                onChange={(e) => setSelectedMarketplace(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">No Marketplace</option>
                <option value="etsy">Etsy</option>
                <option value="shopify">Shopify</option>
                <option value="amazon">Amazon</option>
              </select>
            </div>

            {selectedMarketplace === 'amazon' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Category
                </label>
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="default">Default (15%)</option>
                  <option value="handmade">Handmade (15%)</option>
                  <option value="jewelry">Jewelry (20%)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cost Breakdown */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Materials Cost:</span>
                <span className="font-medium">${calculation.materials_cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Labor Cost:</span>
                <span className="font-medium">${calculation.labor_cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Overhead Cost:</span>
                <span className="font-medium">${calculation.overhead_cost.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Cost:</span>
                  <span className="font-bold text-blue-600">${calculation.total_cost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profit Analysis */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Profit Analysis</h3>
            <div className="space-y-3">
              {selectedMarketplace !== 'none' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Marketplace Fee:</span>
                  <span className="font-medium">
                    ${selectedMarketplace === 'etsy' ? calculation.marketplace_fees.etsy.toFixed(2) :
                      selectedMarketplace === 'shopify' ? calculation.marketplace_fees.shopify.toFixed(2) :
                      calculation.marketplace_fees.amazon.toFixed(2)}
                  </span>
                </div>
              )}
              <div className={`flex justify-between ${calculation.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span className="font-semibold">Net Profit:</span>
                <span className="font-bold">${calculation.profit.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between ${calculation.profit_margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span className="font-semibold">Profit Margin:</span>
                <span className="font-bold">{calculation.profit_margin.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Marketplace Fee Comparison */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Marketplace Fee Comparison</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border-2 ${selectedMarketplace === 'etsy' ? 'border-blue-500 bg-blue-100' : 'border-gray-200'}`}>
              <h4 className="font-medium mb-2">Etsy</h4>
              <p className="text-2xl font-bold text-blue-600">${calculation.marketplace_fees.etsy.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">6.5% + fees</p>
            </div>
            <div className={`p-4 rounded-lg border-2 ${selectedMarketplace === 'shopify' ? 'border-blue-500 bg-blue-100' : 'border-gray-200'}`}>
              <h4 className="font-medium mb-2">Shopify</h4>
              <p className="text-2xl font-bold text-blue-600">${calculation.marketplace_fees.shopify.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">2.9% + $0.30</p>
            </div>
            <div className={`p-4 rounded-lg border-2 ${selectedMarketplace === 'amazon' ? 'border-blue-500 bg-blue-100' : 'border-gray-200'}`}>
              <h4 className="font-medium mb-2">Amazon</h4>
              <p className="text-2xl font-bold text-blue-600">${calculation.marketplace_fees.amazon.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">15% + fees</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={saveProfitCalculation}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Save Calculation
          </button>
        </div>
      </div>
    </div>
  );
}