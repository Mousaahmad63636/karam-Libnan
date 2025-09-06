-- Main Categories Migration for Karam Libnan
-- Run this in Supabase SQL Editor

-- Step 1: Create main_categories table
CREATE TABLE IF NOT EXISTS main_categories (
  slug text PRIMARY KEY,
  title_en text NOT NULL,
  title_ar text,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 2: Insert default main categories
INSERT INTO main_categories (slug, title_en, title_ar, sort_order, active) VALUES
('single', 'Single Serve Products', 'منتجات التقديم الفردي', 1, true),
('bulk', 'Bulk Products', 'منتجات بالجملة', 2, true)
ON CONFLICT (slug) DO NOTHING;

-- Step 3: Drop existing constraints on subcategories and products
ALTER TABLE subcategories DROP CONSTRAINT IF EXISTS subcategories_category_type_check;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_main_type_check;

-- Step 4: Add foreign key constraint to subcategories table
ALTER TABLE subcategories 
ADD CONSTRAINT fk_subcategories_main_category 
FOREIGN KEY (category_type) REFERENCES main_categories(slug) 
ON UPDATE CASCADE ON DELETE RESTRICT;

-- Step 5: Add foreign key constraint to products table  
ALTER TABLE products 
ADD CONSTRAINT fk_products_main_category 
FOREIGN KEY (main_type) REFERENCES main_categories(slug) 
ON UPDATE CASCADE ON DELETE RESTRICT;

-- Step 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_main_categories_sort_order ON main_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_main_categories_active ON main_categories(active);

-- Step 7: Enable RLS and create policies
ALTER TABLE main_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active main categories
CREATE POLICY "Allow public read access to active main categories" 
ON main_categories FOR SELECT 
USING (active = true);

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated users full access to main categories" 
ON main_categories FOR ALL 
USING (auth.role() = 'authenticated');

-- Step 8: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_main_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_main_categories_updated_at ON main_categories;
CREATE TRIGGER trigger_update_main_categories_updated_at
  BEFORE UPDATE ON main_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_main_categories_updated_at();
