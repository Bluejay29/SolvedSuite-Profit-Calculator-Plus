"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  materials: any[];
  materials_cost: number;
  labor_hours: number;
  labor_rate: number;
  labor_cost: number;
  overhead_percentage: number;
  overhead_cost: number;
  total_cost: number;
  selling_price: number;
  marketplace: string;
  marketplace_fee: number;
  profit: number;
  profit_margin: number;
  created_at: string;
  updated_at: string;
}

interface ProductManagerProps {
  onProductSaved?: (product: Product) => void;
  initialData?: Partial<Product>;
}

export default function ProductManager({ onProductSaved, initialData }: ProductManagerProps) {
  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    category: '',
    description: '',
    materials: [],
    materials_cost: 0,
    labor_hours: 0,
    labor_rate: 25,
    labor_cost: 0,
    overhead_percentage: 20,
    overhead_cost: 0,
    total_cost: 0,
    selling_price: 0,
    marketplace: 'none',
    marketplace_fee: 0,
    profit: 0,
    profit_margin: 0,
    ...initialData
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [showSaved, setShowSaved] = useState(false);

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
    calculateTotals();
  }, [
    product.materials_cost,
    product.labor_hours,
    product.labor_rate,
    product.overhead_percentage,
    product.selling_price,
    product.marketplace
  ]);

  useEffect(() => {
    loadSavedProducts();
  }, []);

  const calculateTotals = () => {
    const labor_cost = (product.labor_hours || 0) * (product.labor_rate || 0);
    const subtotal = (product.materials_cost || 0) + labor_cost;
    const overhead_cost = subtotal * ((product.overhead_percentage || 0) / 100);
    const total_cost = subtotal + overhead_cost;
    
    let marketplace_fee = 0;
    if (product.marketplace === 'etsy') {
      marketplace_fee = (product.selling_price || 0) * 0.065 + (product.selling_price || 0) * 0.03 + 0.20;
    } else if (product.marketplace === 'shopify') {
      marketplace_fee = (product.selling_price || 0) * 0.029 + 0.30;
    } else if (product.marketplace === 'amazon') {
      marketplace_fee = (product.selling_price || 0) * 0.15;
    }
    
    const profit = (product.selling_price || 0) - total_cost - marketplace_fee;
    const profit_margin = (product.selling_price || 0) > 0 ? (profit / (product.selling_price || 0)) * 100 : 0;

    setProduct(prev => ({
      ...prev,
      labor_cost,
      overhead_cost,
      total_cost,
      marketplace_fee,
      profit,
      profit_margin
    }));
  };

  const loadSavedProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('Products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const saveProduct = async () => {
    if (!product.name || !product.category) {
      alert('Please fill in product name and category');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to save products');
        return;
      }

      const productData = {
        user_id: user.id,
        name: product.name,
        category: product.category,
        description: product.description,
        materials: product.materials || [],
        materials_cost: product.materials_cost || 0,
        labor_hours: product.labor_hours || 0,
        labor_rate: product.labor_rate || 0,
        labor_cost: product.labor_cost || 0,
        overhead_percentage: product.overhead_percentage || 0,
        overhead_cost: product.overhead_cost || 0,
        total_cost: product.total_cost || 0,
        selling_price: product.selling_price || 0,
        marketplace: product.marketplace || 'none',
        marketplace_fee: product.marketplace_fee || 0,
        profit: product.profit || 0,
        profit_margin: product.profit_margin || 0,
        updated_at: new Date().toISOString(),
        ...(initialData?.id ? {} : { created_at: new Date().toISOString() })
      };

      let result;
      if (initialData?.id) {
        // Update existing product
        result = await supabase
          .from('Products')
          .update(productData)
          .eq('id', initialData.id);
      } else {
        // Create new product
        result = await supabase
          .from('Products')
          .insert([{ ...productData, id: undefined }]);
      }

      if (result.error) throw result.error;

      alert(`Product ${initialData?.id ? 'updated' : 'saved'} successfully!`);
      
      if (onProductSaved) {
        onProductSaved(productData as unknown as Product);
      }
      
      // Reset form if creating new product
      if (!initialData?.id) {
        setProduct({
          name: '',
          category: '',
          description: '',
          materials: [],
          materials_cost: 0,
          labor_hours: 0,
          labor_rate: 25,
          labor_cost: 0,
          overhead_percentage: 20,
          overhead_cost: 0,
          total_cost: 0,
          selling_price: 0,
          marketplace: 'none',
          marketplace_fee: 0,
          profit: 0,
          profit_margin: 0
        });
      }
      
      loadSavedProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const loadProduct = (productToLoad: Product) => {
    setProduct(productToLoad);
    setShowSaved(false);
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await supabase
        .from('Products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      
      setSavedProducts(savedProducts.filter(p => p.id !== productId));
      alert('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            {initialData?.id ? 'Edit Product' : 'Create New Product'}
          </h2>
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {showSaved ? 'Hide' : 'Show'} Saved Products ({savedProducts.length})
          </button>
        </div>

        {/* Saved Products */}
        {showSaved && (
          <div className="mb-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Saved Products</h3>
            {savedProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedProducts.map(savedProduct => (
                  <div key={savedProduct.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900">{savedProduct.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{savedProduct.category}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-blue-600">${savedProduct.selling_price.toFixed(2)}</span>
                      <span className={`text-sm font-medium ${savedProduct.profit_margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {savedProduct.profit_margin.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadProduct(savedProduct)}
                        className="flex-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteProduct(savedProduct.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No saved products yet</p>
            )}
          </div>
        )}

        {/* Product Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => setProduct({...product, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={product.category}
              onChange={(e) => setProduct({...product, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category...</option>
              {MATERIAL_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={product.description}
              onChange={(e) => setProduct({...product, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your product..."
            />
          </div>
        </div>

        {/* Cost Inputs */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materials Cost
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  value={product.materials_cost}
                  onChange={(e) => setProduct({...product, materials_cost: parseFloat(e.target.value) || 0})}
                  step="0.01"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Labor Hours
              </label>
              <input
                type="number"
                value={product.labor_hours}
                onChange={(e) => setProduct({...product, labor_hours: parseFloat(e.target.value) || 0})}
                step="0.25"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                  value={product.labor_rate}
                  onChange={(e) => setProduct({...product, labor_rate: parseFloat(e.target.value) || 0})}
                  step="0.01"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overhead %
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={product.overhead_percentage}
                  onChange={(e) => setProduct({...product, overhead_percentage: parseFloat(e.target.value) || 0})}
                  step="0.01"
                  className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg"
                />
                <span className="absolute right-3 top-3 text-gray-500">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  value={product.selling_price}
                  onChange={(e) => setProduct({...product, selling_price: parseFloat(e.target.value) || 0})}
                  step="0.01"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marketplace
              </label>
              <select
                value={product.marketplace}
                onChange={(e) => setProduct({...product, marketplace: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="none">No Marketplace</option>
                <option value="etsy">Etsy</option>
                <option value="shopify">Shopify</option>
                <option value="amazon">Amazon</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Cost Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Materials:</span>
                <span className="font-medium">${(product.materials_cost || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Labor:</span>
                <span className="font-medium">${(product.labor_cost || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Overhead:</span>
                <span className="font-medium">${(product.overhead_cost || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Marketplace Fee:</span>
                <span className="font-medium">${(product.marketplace_fee || 0).toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total Cost:</span>
                  <span className="text-blue-600">${((product.total_cost || 0) + (product.marketplace_fee || 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Profit Analysis</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Selling Price:</span>
                <span className="font-medium">${(product.selling_price || 0).toFixed(2)}</span>
              </div>
              <div className={`flex justify-between font-bold ${product.profit && product.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span>Net Profit:</span>
                <span>${(product.profit || 0).toFixed(2)}</span>
              </div>
              <div className={`flex justify-between font-bold ${product.profit_margin && product.profit_margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span>Profit Margin:</span>
                <span>{(product.profit_margin || 0).toFixed(1)}%</span>
              </div>
              <div className="mt-4 p-3 bg-white rounded">
                <p className="text-sm text-gray-600">
                  {product.profit_margin && product.profit_margin >= 30 
                    ? "✅ Excellent profit margin!" 
                    : product.profit_margin && product.profit_margin >= 20
                    ? "👍 Good profit margin"
                    : product.profit_margin && product.profit_margin >= 10
                    ? "⚠️ Consider raising price"
                    : "❌ Profit margin too low"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={saveProduct}
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {isSaving ? 'Saving...' : (initialData?.id ? 'Update Product' : 'Save Product')}
          </button>
          <button
            onClick={() => setProduct({
              name: '',
              category: '',
              description: '',
              materials: [],
              materials_cost: 0,
              labor_hours: 0,
              labor_rate: 25,
              labor_cost: 0,
              overhead_percentage: 20,
              overhead_cost: 0,
              total_cost: 0,
              selling_price: 0,
              marketplace: 'none',
              marketplace_fee: 0,
              profit: 0,
              profit_margin: 0
            })}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Reset Form
          </button>
        </div>
      </div>
    </div>
  );
}