"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { aiClient } from '../lib/ai-client';

interface Material {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  supplier?: string;
  total_cost: number;
}

interface CategoryData {
  materials: Material[];
  ai_suggestions: string[];
  market_price_range: {
    min: number;
    max: number;
    average: number;
  };
}

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

const COMMON_MATERIALS = {
  'Jewelry Making': ['Silver wire', 'Gold beads', 'Clasps', 'Jump rings', 'Gemstones', 'Findings'],
  'Candles & Soap': ['Wax', 'Fragrance oils', 'Wicks', 'Colorants', 'Molds', 'Base oils'],
  'Woodworking': ['Wood boards', 'Screws', 'Glue', 'Stain', 'Varnish', 'Hardware'],
  'Textiles & Sewing': ['Fabric', 'Thread', 'Zippers', 'Buttons', 'Interfacing', 'Elastic'],
  'Paper Crafts': ['Cardstock', 'Pattern paper', 'Adhesives', 'Embellishments', 'Ink', 'Tools'],
  'Pottery & Ceramics': ['Clay', 'Glazes', 'Kiln supplies', 'Tools', 'Molds', 'Slip'],
  'Glass Art': ['Glass sheets', 'Frit', 'Stringers', 'Molds', 'Kiln supplies', 'Tools'],
  'Leatherworking': ['Leather hides', 'Thread', 'Tools', 'Hardware', 'Dyes', 'Finish'],
  'Painting & Art Supplies': ['Canvas', 'Paints', 'Brushes', 'Mediums', 'Varnish', 'Easels'],
  'Food & Baking': ['Flour', 'Sugar', 'Eggs', 'Flavorings', 'Decorations', 'Packaging'],
  'Other': []
};

interface MaterialCalculatorProps {
  onMaterialsCalculated?: (totalCost: number) => void;
}

export default function MaterialCalculator({ onMaterialsCalculated }: MaterialCalculatorProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [marketPriceRange, setMarketPriceRange] = useState<{min: number, max: number, average: number} | null>(null);
  const [totalMaterialsCost, setTotalMaterialsCost] = useState(0);
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({
    name: '',
    quantity: 1,
    unit: 'piece',
    cost_per_unit: 0,
    supplier: ''
  });

  useEffect(() => {
    calculateTotalCost();
  }, [materials]);

  const calculateTotalCost = () => {
    const total = materials.reduce((sum, material) => sum + material.total_cost, 0);
    setTotalMaterialsCost(total);
  };

  const addMaterial = () => {
    if (!newMaterial.name || !newMaterial.cost_per_unit) {
      alert('Please fill in material name and cost per unit');
      return;
    }

    const material: Material = {
      id: Date.now().toString(),
      name: newMaterial.name,
      category: selectedCategory,
      quantity: newMaterial.quantity || 1,
      unit: newMaterial.unit || 'piece',
      cost_per_unit: newMaterial.cost_per_unit || 0,
      supplier: newMaterial.supplier,
      total_cost: (newMaterial.quantity || 1) * (newMaterial.cost_per_unit || 0)
    };

    setMaterials([...materials, material]);
    setNewMaterial({
      name: '',
      quantity: 1,
      unit: 'piece',
      cost_per_unit: 0,
      supplier: ''
    });
  };

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials(materials.map(m => {
      if (m.id === id) {
        const updated = { ...m, ...updates };
        updated.total_cost = updated.quantity * updated.cost_per_unit;
        return updated;
      }
      return m;
    }));
  };

  const getAIPriceAnalysis = async () => {
    if (materials.length === 0) {
      alert('Please add at least one material first');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const materialList = materials.map(m => 
        `${m.name}: ${m.quantity} ${m.unit} at $${m.cost_per_unit}/${m.unit} = $${m.total_cost}`
      ).join('\n');

      const prompt = `As a pricing expert for handmade ${selectedCategory} products, analyze these material costs:

Materials:
${materialList}

Total materials cost: $${totalMaterialsCost}

Please provide:
1. 3 specific suggestions to reduce material costs
2. Estimated market price range for products using these materials
3. Competitive analysis insights

Format as JSON:
{
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "price_range": {"min": 0, "max": 0, "average": 0},
  "insights": ["insight1", "insight2"]
}`;

      const result = await aiClient.getCompetitivePricing(prompt);
      const analysis = JSON.parse(result);
      
      setAiSuggestions(analysis.suggestions);
      setMarketPriceRange(analysis.price_range);
    } catch (error) {
      console.error('Error getting AI analysis:', error);
      alert('Failed to get AI analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveCalculation = async () => {
    if (!selectedCategory || materials.length === 0) {
      alert('Please select a category and add materials');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to save calculations');
        return;
      }

      const calculation = {
        user_id: user.id,
        category: selectedCategory,
        materials: materials,
        total_cost: totalMaterialsCost,
        ai_suggestions: aiSuggestions,
        price_range: marketPriceRange,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('Calculations')
        .insert([calculation]);

      if (error) throw error;

      alert('Calculation saved successfully!');
      
      // Notify parent component if callback exists
      if (onMaterialsCalculated) {
        onMaterialsCalculated(totalMaterialsCost);
      }
    } catch (error) {
      console.error('Error saving calculation:', error);
      alert('Failed to save calculation');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">AI Material Calculator</h2>
        
        {/* Category Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a category...</option>
            {MATERIAL_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Material Suggestions */}
        {selectedCategory && COMMON_MATERIALS[selectedCategory as keyof typeof COMMON_MATERIALS] && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Common materials for {selectedCategory}:</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_MATERIALS[selectedCategory as keyof typeof COMMON_MATERIALS].map(material => (
                <button
                  key={material}
                  onClick={() => setNewMaterial({...newMaterial, name: material})}
                  className="px-3 py-1 bg-white border border-blue-200 rounded-full text-sm text-blue-700 hover:bg-blue-100"
                >
                  {material}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add Material Form */}
        {selectedCategory && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Add Material</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Material name"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={newMaterial.quantity}
                onChange={(e) => setNewMaterial({...newMaterial, quantity: parseFloat(e.target.value) || 1})}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={newMaterial.unit}
                onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="piece">Piece</option>
                <option value="gram">Gram</option>
                <option value="kg">Kilogram</option>
                <option value="oz">Ounce</option>
                <option value="lb">Pound</option>
                <option value="inch">Inch</option>
                <option value="foot">Foot</option>
                <option value="yard">Yard</option>
                <option value="ml">Milliliter</option>
                <option value="liter">Liter</option>
              </select>
              <input
                type="number"
                placeholder="Cost per unit"
                value={newMaterial.cost_per_unit}
                onChange={(e) => setNewMaterial({...newMaterial, cost_per_unit: parseFloat(e.target.value) || 0})}
                step="0.01"
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Supplier (optional)"
                value={newMaterial.supplier}
                onChange={(e) => setNewMaterial({...newMaterial, supplier: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={addMaterial}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Material
              </button>
            </div>
          </div>
        )}

        {/* Materials List */}
        {materials.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Materials List</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 border">Material</th>
                    <th className="text-left p-3 border">Category</th>
                    <th className="text-left p-3 border">Quantity</th>
                    <th className="text-left p-3 border">Unit</th>
                    <th className="text-left p-3 border">Cost/Unit</th>
                    <th className="text-left p-3 border">Total Cost</th>
                    <th className="text-left p-3 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((material) => (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="p-3 border">{material.name}</td>
                      <td className="p-3 border">{material.category}</td>
                      <td className="p-3 border">
                        <input
                          type="number"
                          value={material.quantity}
                          onChange={(e) => updateMaterial(material.id, { quantity: parseFloat(e.target.value) || 1 })}
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="p-3 border">{material.unit}</td>
                      <td className="p-3 border">
                        <input
                          type="number"
                          value={material.cost_per_unit}
                          onChange={(e) => updateMaterial(material.id, { cost_per_unit: parseFloat(e.target.value) || 0 })}
                          step="0.01"
                          className="w-24 px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="p-3 border font-semibold">${material.total_cost.toFixed(2)}</td>
                      <td className="p-3 border">
                        <button
                          onClick={() => removeMaterial(material.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan={5} className="p-3 border text-right">Total:</td>
                    <td className="p-3 border text-blue-600">${totalMaterialsCost.toFixed(2)}</td>
                    <td className="p-3 border"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI Analysis Section */}
        {materials.length > 0 && (
          <div className="mb-8">
            <div className="flex gap-4 mb-6">
              <button
                onClick={getAIPriceAnalysis}
                disabled={isAnalyzing}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {isAnalyzing ? 'Analyzing...' : 'Get AI Price Analysis'}
              </button>
              <button
                onClick={saveCalculation}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Calculation
              </button>
            </div>

            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-green-900 mb-3">💡 AI Suggestions:</h4>
                <ul className="space-y-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span className="text-green-800">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Market Price Range */}
            {marketPriceRange && (
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-3">📊 Market Price Analysis:</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-blue-700">Min Price</p>
                    <p className="text-2xl font-bold text-blue-900">${marketPriceRange.min.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Average</p>
                    <p className="text-2xl font-bold text-blue-900">${marketPriceRange.average.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Max Price</p>
                    <p className="text-2xl font-bold text-blue-900">${marketPriceRange.max.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}