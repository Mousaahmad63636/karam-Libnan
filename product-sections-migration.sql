-- Product Sections Migration
-- Adds many-to-many relationship between products and display sections

-- Create junction table for product-section relationships
CREATE TABLE IF NOT EXISTS product_sections (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL REFERENCES sections(key) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, section_key)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_sections_product_id ON product_sections(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sections_section_key ON product_sections(section_key);

-- Add RLS policy for product_sections
ALTER TABLE product_sections ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY public_read_product_sections ON product_sections 
  FOR SELECT USING (true);

-- Admin policy  
CREATE POLICY admin_all_product_sections ON product_sections 
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Add display sections for product showcase
INSERT INTO sections(key, title_en, title_ar, content_en, content_ar, sort_order) VALUES
('featured', 'Featured Products', 'منتجات مميزة', 'Our handpicked selection of finest products', 'مجموعتنا المختارة من أفضل المنتجات', 1),
('bestsellers', 'Best Sellers', 'الأكثر مبيعاً', 'Most popular products among our customers', 'المنتجات الأكثر شعبية بين عملائنا', 2),
('new-arrivals', 'New Arrivals', 'وصل حديثاً', 'Latest additions to our product family', 'أحدث الإضافات لعائلة منتجاتنا', 3),
('seasonal', 'Seasonal Specials', 'المواسم الخاصة', 'Limited time seasonal offerings', 'عروض موسمية لفترة محدودة', 4)
ON CONFLICT (key) DO UPDATE SET 
  title_en = EXCLUDED.title_en,
  title_ar = EXCLUDED.title_ar,
  content_en = EXCLUDED.content_en,
  content_ar = EXCLUDED.content_ar,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Success message
SELECT 'Product sections migration completed successfully!' AS message;
