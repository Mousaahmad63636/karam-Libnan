-- COMPLETE WORKING KARAM LIBNAN DATABASE SCHEMA 
-- Fixed version with main_categories table included
-- Run this in Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ===== MAIN CATEGORIES TABLE (MISSING FROM ORIGINAL) =====
CREATE TABLE IF NOT EXISTS main_categories (
  slug text PRIMARY KEY,
  title_en text NOT NULL,
  title_ar text,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ===== SUBCATEGORIES TABLE =====
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

-- ===== PRODUCTS TABLE =====
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

-- ===== SECTIONS TABLE =====
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

-- ===== MEDIA TABLE =====
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

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_main_categories_sort_order ON main_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_main_categories_active ON main_categories(active);
CREATE INDEX IF NOT EXISTS idx_products_main_type ON products(main_type);
CREATE INDEX IF NOT EXISTS idx_products_sub_slug ON products(sub_slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_subcategories_type ON subcategories(category_type);
CREATE INDEX IF NOT EXISTS idx_subcategories_active ON subcategories(active) WHERE active = true;

-- ===== ROW LEVEL SECURITY =====
ALTER TABLE main_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS public_read_main_categories ON main_categories;
DROP POLICY IF EXISTS admin_all_main_categories ON main_categories;
DROP POLICY IF EXISTS public_read_products ON products;
DROP POLICY IF EXISTS public_read_subcategories ON subcategories;
DROP POLICY IF EXISTS public_read_sections ON sections;
DROP POLICY IF EXISTS admin_all_products ON products;
DROP POLICY IF EXISTS admin_all_subcategories ON subcategories;
DROP POLICY IF EXISTS admin_all_sections ON sections;
DROP POLICY IF EXISTS admin_all_media ON media;

-- ===== PUBLIC POLICIES (NO AUTH REQUIRED) =====
CREATE POLICY public_read_main_categories ON main_categories 
  FOR SELECT USING (true);

CREATE POLICY public_read_products ON products 
  FOR SELECT USING (true);

CREATE POLICY public_read_subcategories ON subcategories 
  FOR SELECT USING (true);

CREATE POLICY public_read_sections ON sections 
  FOR SELECT USING (true);

-- ===== ADMIN POLICIES (ALLOW ALL OPERATIONS) =====
CREATE POLICY admin_all_main_categories ON main_categories 
  FOR ALL USING (true);

CREATE POLICY admin_all_products ON products 
  FOR ALL USING (true);

CREATE POLICY admin_all_subcategories ON subcategories 
  FOR ALL USING (true);

CREATE POLICY admin_all_sections ON sections 
  FOR ALL USING (true);

CREATE POLICY admin_all_media ON media 
  FOR ALL USING (true);

-- ===== TRIGGERS FOR updated_at =====
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_main_categories_updated ON main_categories;
DROP TRIGGER IF EXISTS trg_products_updated ON products;
DROP TRIGGER IF EXISTS trg_sections_updated ON sections;
DROP TRIGGER IF EXISTS trg_subcategories_updated ON subcategories;

CREATE TRIGGER trg_main_categories_updated BEFORE UPDATE ON main_categories 
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products 
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_sections_updated BEFORE UPDATE ON sections 
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_subcategories_updated BEFORE UPDATE ON subcategories 
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ===== SEED DATA =====

-- Main categories
INSERT INTO main_categories (slug, title_en, title_ar, sort_order, active) VALUES
('single', 'Single Serve Products', 'منتجات التقديم الفردي', 1, true),
('bulk', 'Bulk Products', 'منتجات بالجملة', 2, true)
ON CONFLICT (slug) DO UPDATE SET 
  title_en = EXCLUDED.title_en,
  title_ar = EXCLUDED.title_ar,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Single serve subcategories
INSERT INTO subcategories(slug, category_type, title_en, title_ar, sort_order, active) VALUES
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
('ready-to-serve', 'single', 'Ready to Serve', 'جاهز للتقديم', 15, true)
ON CONFLICT (slug) DO UPDATE SET 
  title_en = EXCLUDED.title_en,
  title_ar = EXCLUDED.title_ar,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Bulk subcategories  
INSERT INTO subcategories(slug, category_type, title_en, title_ar, sort_order, active) VALUES
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

-- Website sections
INSERT INTO sections(key, title_en, title_ar, content_en, content_ar, sort_order) VALUES
('hero', 'Welcome to Karam Libnan', 'أهلاً بكم في كرم لبنان', 
 'Authentic Homemade & Canned Lebanese Products', 'منتجات لبنانية أصيلة محضرة في المنزل ومعلبة', 1),
('about', 'Our Story', 'قصتنا',
 'Family tradition of authentic Lebanese flavors', 'تقليد عائلي من النكهات اللبنانية الأصيلة', 2),
('contact', 'Contact Us', 'اتصل بنا',
 'Get in touch for inquiries and orders', 'تواصل معنا للاستفسارات والطلبات', 3)
ON CONFLICT (key) DO UPDATE SET 
  title_en = EXCLUDED.title_en,
  title_ar = EXCLUDED.title_ar,
  content_en = EXCLUDED.content_en,
  content_ar = EXCLUDED.content_ar,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Sample products
INSERT INTO products(name_en, name_ar, description_en, description_ar, main_type, sub_slug, featured, active) VALUES
('Homemade Fig Jam', 'مربى التين المنزلي', 'Rich, slow-cooked fig jam', 'مربى التين الغني المطبوخ ببطء', 'single', 'pastes', true, true),
('Pickled Cucumbers', 'خيار مخلل', 'Traditional Lebanese pickles', 'مخللات لبنانية تقليدية', 'single', 'ordinary-pickles', true, true),
('Za''atar Blend', 'خلطة الزعتر', 'Mountain thyme blend', 'خلطة زعتر جبلي', 'single', 'herbal', true, true),
('Extra Virgin Olive Oil', 'زيت زيتون بكر', 'Cold-pressed olive oil', 'زيت زيتون مضغوط على البارد', 'single', 'olive-oil', false, true),
('Bulk Fresh Cucumbers', 'خيار طازج بالجملة', 'Fresh cucumbers for food service', 'خيار طازج للخدمات الغذائية', 'bulk', 'fresh-veges-bulk', false, true)
ON CONFLICT DO NOTHING;

-- SUCCESS MESSAGE
SELECT 'Fixed database schema applied successfully!' as message;
SELECT 'Main categories:', count(*) as count FROM main_categories;
SELECT 'Subcategories:', count(*) as count FROM subcategories;  
SELECT 'Products:', count(*) as count FROM products;
SELECT 'Sections:', count(*) as count FROM sections;
