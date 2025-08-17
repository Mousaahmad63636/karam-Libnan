-- Disable Row Level Security for All Tables
-- Single admin setup - no RLS needed
-- Run in Supabase SQL Editor

-- Disable RLS for all main tables
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories DISABLE ROW LEVEL SECURITY;
ALTER TABLE sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE media DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_sections DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies (cleanup)
DROP POLICY IF EXISTS public_read_products ON products;
DROP POLICY IF EXISTS public_read_subcategories ON subcategories;
DROP POLICY IF EXISTS public_read_sections ON sections;
DROP POLICY IF EXISTS public_read_product_sections ON product_sections;

DROP POLICY IF EXISTS admin_all_products ON products;
DROP POLICY IF EXISTS admin_all_subcategories ON subcategories;
DROP POLICY IF EXISTS admin_all_sections ON sections;
DROP POLICY IF EXISTS admin_all_media ON media;
DROP POLICY IF EXISTS admin_all_audit ON audit_logs;
DROP POLICY IF EXISTS admin_all_product_sections ON product_sections;

-- Confirm status
SELECT 'All RLS policies disabled - Admin panel has full access!' as status;

-- Optional: Re-enable public read access if needed for frontend
-- You can uncomment these if your frontend needs to read data without authentication:

-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE product_sections ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY public_read_products ON products FOR SELECT USING (active = true);
-- CREATE POLICY public_read_subcategories ON subcategories FOR SELECT USING (active = true);
-- CREATE POLICY public_read_sections ON sections FOR SELECT USING (true);
-- CREATE POLICY public_read_product_sections ON product_sections FOR SELECT USING (true);
