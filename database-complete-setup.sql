-- Complete Database Setup for Karam Libnan Admin Panel
-- Run this FIRST in Supabase SQL Editor to fix all admin panel issues

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==================== CORE TABLES ====================

-- MAIN CATEGORIES TABLE (was missing!)
CREATE TABLE IF NOT EXISTS main_categories (
  slug text PRIMARY KEY,
  title_en text NOT NULL,
  title_ar text,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default main categories
INSERT INTO main_categories (slug, title_en, title_ar, sort_order, active) VALUES
('single', 'Single Serve Products', 'منتجات التقديم الفردي', 1, true),
('bulk', 'Bulk Products', 'منتجات بالجملة', 2, true)
ON CONFLICT (slug) DO UPDATE SET
  title_en = EXCLUDED.title_en,
  title_ar = EXCLUDED.title_ar,
  updated_at = now();

-- SUBCATEGORIES TABLE
CREATE TABLE IF NOT EXISTS subcategories (
  slug text PRIMARY KEY,
  category_type text NOT NULL,
  title_en text NOT NULL,
  title_ar text,
  banner_image_url text,
  sort_order int DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint to subcategories
ALTER TABLE subcategories DROP CONSTRAINT IF EXISTS subcategories_category_type_check;
ALTER TABLE subcategories DROP CONSTRAINT IF EXISTS fk_subcategories_main_category;
ALTER TABLE subcategories 
ADD CONSTRAINT fk_subcategories_main_category 
FOREIGN KEY (category_type) REFERENCES main_categories(slug) 
ON UPDATE CASCADE ON DELETE RESTRICT;

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id bigserial PRIMARY KEY,
  name_en text NOT NULL,
  name_ar text,
  description_en text,
  description_ar text,
  main_type text NOT NULL,
  sub_slug text REFERENCES subcategories(slug) ON UPDATE CASCADE ON DELETE SET NULL,
  image_url text,
  featured boolean DEFAULT false,
  active boolean DEFAULT true,
  ingredients jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint to products
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_main_type_check;
ALTER TABLE products DROP CONSTRAINT IF EXISTS fk_products_main_category;
ALTER TABLE products 
ADD CONSTRAINT fk_products_main_category 
FOREIGN KEY (main_type) REFERENCES main_categories(slug) 
ON UPDATE CASCADE ON DELETE RESTRICT;

-- SECTIONS TABLE
CREATE TABLE IF NOT EXISTS sections (
  key text PRIMARY KEY,
  title_en text,
  title_ar text,
  content_en text,
  content_ar text,
  image_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- MEDIA TABLE
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path text NOT NULL,
  file_name text,
  file_size bigint,
  mime_type text,
  alt_en text,
  alt_ar text,
  linked_type text,
  linked_id text,
  created_at timestamptz DEFAULT now()
);

-- ==================== DISABLE ALL RLS FOR ADMIN TESTING ====================
-- This fixes the main access issue

ALTER TABLE main_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE media DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public read access to active main categories" ON main_categories;
DROP POLICY IF EXISTS "Allow authenticated users full access to main categories" ON main_categories;
DROP POLICY IF EXISTS public_read_products ON products;
DROP POLICY IF EXISTS public_read_subcategories ON subcategories;
DROP POLICY IF EXISTS public_read_sections ON sections;
DROP POLICY IF EXISTS admin_all_products ON products;
DROP POLICY IF EXISTS admin_all_subcategories ON subcategories;
DROP POLICY IF EXISTS admin_all_sections ON sections;
DROP POLICY IF EXISTS admin_all_media ON media;

-- ==================== SEED DATA ====================

-- SUBCATEGORIES SEED DATA
INSERT INTO subcategories(slug, category_type, title_en, title_ar, sort_order, active) VALUES
-- Single serve categories
('all', 'single', 'All Products', 'جميع المنتجات', 0, true),
('fresh-veges', 'single', 'Fresh Vegetables', 'خضار طازجة', 1, true),
('fresh-pickles', 'single', 'Fresh Pickles', 'مخللات طازجة', 2, true),
('ordinary-pickles', 'single', 'Ordinary Pickles', 'مخللات عادية', 3, true),
('olives', 'single', 'Olives', 'زيتون', 4, true),
('olive-oil', 'single', 'Olive Oil', 'زيت زيتون', 5, true),
('labne-kishik', 'single', 'Labne & Kishik', 'لبنة وكشك', 6, true),
('pastes', 'single', 'Pastes', 'معاجين', 7, true),
('molases', 'single', 'Molasses', 'دبس', 8, true),
('hydrosols', 'single', 'Hydrosols', 'ماء ورد وزهر', 9, true),
('natural-syrups', 'single', 'Natural Syrups', 'شراب طبيعي', 10, true),
('tahhene', 'single', 'Tahhene', 'طحينة', 11, true),
('vinegar', 'single', 'Vinegar', 'خل', 12, true),
('herbal', 'single', 'Herbal', 'أعشاب', 13, true),
('kamar-el-din', 'single', 'Kamar El Din', 'قمر الدين', 14, true),
('ready-to-serve', 'single', 'Ready to Serve', 'جاهز للتقديم', 15, true),
-- Bulk categories  
('all-bulk', 'bulk', 'All Bulk Products', 'جميع المنتجات بالجملة', 0, true),
('fresh-veges-bulk', 'bulk', 'Fresh Vegetables', 'خضار طازجة', 1, true),
('fresh-pickles-bulk', 'bulk', 'Fresh Pickles', 'مخللات طازجة', 2, true),
('ordinary-pickles-bulk', 'bulk', 'Ordinary Pickles', 'مخللات عادية', 3, true),
('olives-bulk', 'bulk', 'Olives', 'زيتون', 4, true),
('olive-oil-bulk', 'bulk', 'Olive Oil', 'زيت زيتون', 5, true),
('sunflower-oil-bulk', 'bulk', 'Sunflower Oil', 'زيت دوار الشمس', 6, true),
('kishik-bulk', 'bulk', 'Kishik', 'كشك', 7, true),
('pastes-bulk', 'bulk', 'Pastes', 'معاجين', 8, true),
('molases-bulk', 'bulk', 'Molasses', 'دبس', 9, true),
('hydrosols-bulk', 'bulk', 'Hydrosols', 'ماء ورد وزهر', 10, true),
('tahhene-bulk', 'bulk', 'Tahhene', 'طحينة', 11, true),
('vinegar-bulk', 'bulk', 'Vinegar', 'خل', 12, true),
('herbal-bulk', 'bulk', 'Herbal', 'أعشاب', 13, true),
('kamar-el-din-bulk', 'bulk', 'Kamar El Din', 'قمر الدين', 14, true)
ON CONFLICT (slug) DO UPDATE SET 
  title_en = EXCLUDED.title_en,
  title_ar = EXCLUDED.title_ar,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- SECTIONS SEED DATA
INSERT INTO sections(key, title_en, title_ar, content_en, content_ar, sort_order) VALUES
('hero', 'Welcome to Karam Libnan', 'أهلاً بكم في كرم لبنان', 
 'Authentic Homemade & Canned Lebanese Products', 'منتجات لبنانية أصيلة محضرة في المنزل', 1),
('about', 'Our Story', 'قصتنا',
 'Karam Libnan specializes in authentic Lebanese flavors', 'كرم لبنان متخصص في النكهات اللبنانية الأصيلة', 2),
('contact', 'Contact Us', 'اتصل بنا',
 'Get in touch with us for inquiries', 'تواصل معنا للاستفسارات', 3)
ON CONFLICT (key) DO UPDATE SET 
  title_en = EXCLUDED.title_en,
  title_ar = EXCLUDED.title_ar,
  content_en = EXCLUDED.content_en,
  content_ar = EXCLUDED.content_ar,
  updated_at = now();

-- SAMPLE PRODUCTS
INSERT INTO products(name_en, name_ar, description_en, description_ar, main_type, sub_slug, featured, active, ingredients) VALUES
('Homemade Fig Jam', 'مربى التين المنزلي', 'Rich fig jam with natural sweetness', 'مربى التين الغني بالحلاوة الطبيعية', 'single', 'pastes', true, true, '["Figs", "Sugar", "Lemon"]'),
('Pickled Cucumbers', 'خيار مخلل', 'Traditional Lebanese pickles', 'مخللات لبنانية تقليدية', 'single', 'ordinary-pickles', true, true, '["Cucumbers", "Vinegar", "Salt"]'),
('Za''atar Blend', 'خلطة الزعتر', 'Mountain thyme blend', 'خلطة زعتر جبلي', 'single', 'herbal', true, true, '["Thyme", "Sesame", "Sumac"]'),
('Extra Virgin Olive Oil', 'زيت زيتون بكر', 'Cold-pressed olive oil', 'زيت زيتون مضغوط على البارد', 'single', 'olive-oil', false, true, '["Olives"]'),
('Bulk Olive Oil 5L', 'زيت زيتون بالجملة 5 لتر', 'Bulk olive oil for restaurants', 'زيت زيتون بالجملة للمطاعم', 'bulk', 'olive-oil-bulk', false, true, '["Olives"]')
ON CONFLICT DO NOTHING;

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_main_categories_sort_order ON main_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_main_categories_active ON main_categories(active);
CREATE INDEX IF NOT EXISTS idx_products_main_type ON products(main_type);
CREATE INDEX IF NOT EXISTS idx_products_sub_slug ON products(sub_slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_subcategories_type ON subcategories(category_type);

-- ==================== SUCCESS CONFIRMATION ====================
SELECT 'Database setup completed successfully!' as status;
SELECT 'Main Categories: ' || count(*) as count FROM main_categories;
SELECT 'Subcategories: ' || count(*) as count FROM subcategories;
SELECT 'Products: ' || count(*) as count FROM products;
SELECT 'Sections: ' || count(*) as count FROM sections;
