-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  craft_category TEXT NOT NULL,
  batch_size INTEGER,
  labor_hours NUMERIC,
  overhead_percentage NUMERIC,
  target_profit_margin NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials table
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  material_name TEXT NOT NULL,
  quantity_per_batch NUMERIC NOT NULL,
  unit_type TEXT NOT NULL,
  cost_per_unit NUMERIC NOT NULL,
  supplier_name TEXT,
  supplier_link TEXT,
  last_price_check TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price check history table
CREATE TABLE price_check_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE NOT NULL,
  check_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  found_better_price BOOLEAN DEFAULT FALSE,
  suggested_supplier TEXT,
  suggested_price NUMERIC,
  potential_savings NUMERIC,
  user_action TEXT CHECK (user_action IN ('accepted', 'rejected', 'pending')),
  notes TEXT
);

-- Calculations table
CREATE TABLE calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity_to_make INTEGER,
  total_material_cost NUMERIC,
  total_labor_cost NUMERIC,
  minimum_retail_price NUMERIC,
  marketplace_fees NUMERIC,
  net_profit NUMERIC,
  ai_suggestion JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_check_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Users can view their own products"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);

-- Materials policies
CREATE POLICY "Users can view materials for their products"
  ON materials FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products
    WHERE products.id = materials.product_id
    AND products.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert materials for their products"
  ON materials FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM products
    WHERE products.id = materials.product_id
    AND products.user_id = auth.uid()
  ));

CREATE POLICY "Users can update materials for their products"
  ON materials FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM products
    WHERE products.id = materials.product_id
    AND products.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete materials for their products"
  ON materials FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM products
    WHERE products.id = materials.product_id
    AND products.user_id = auth.uid()
  ));

-- Price check history policies
CREATE POLICY "Users can view price check history for their materials"
  ON price_check_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM materials
    JOIN products ON products.id = materials.product_id
    WHERE materials.id = price_check_history.material_id
    AND products.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert price check history for their materials"
  ON price_check_history FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM materials
    JOIN products ON products.id = materials.product_id
    WHERE materials.id = price_check_history.material_id
    AND products.user_id = auth.uid()
  ));

CREATE POLICY "Users can update price check history for their materials"
  ON price_check_history FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM materials
    JOIN products ON products.id = materials.product_id
    WHERE materials.id = price_check_history.material_id
    AND products.user_id = auth.uid()
  ));

-- Calculations policies
CREATE POLICY "Users can view their own calculations"
  ON calculations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calculations"
  ON calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calculations"
  ON calculations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calculations"
  ON calculations FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_materials_product_id ON materials(product_id);
CREATE INDEX idx_price_check_history_material_id ON price_check_history(material_id);
CREATE INDEX idx_calculations_user_id ON calculations(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
