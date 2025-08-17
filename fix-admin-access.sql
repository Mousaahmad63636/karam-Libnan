-- EMERGENCY ADMIN ACCESS FIX
-- Run this in Supabase SQL Editor to regain admin access

-- Option 1: Temporarily disable RLS (IMMEDIATE ACCESS)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories DISABLE ROW LEVEL SECURITY; 
ALTER TABLE sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE media DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_sections DISABLE ROW LEVEL SECURITY;

-- Option 2: Create email-based admin policy (SAFER)
-- Replace 'your-admin@email.com' with your actual admin email
DROP POLICY IF EXISTS admin_all_products ON products;
DROP POLICY IF EXISTS admin_all_subcategories ON subcategories;
DROP POLICY IF EXISTS admin_all_sections ON sections;
DROP POLICY IF EXISTS admin_all_media ON media;
DROP POLICY IF EXISTS admin_all_audit ON audit_logs;
DROP POLICY IF EXISTS admin_all_product_sections ON product_sections;

CREATE POLICY admin_all_products ON products 
  FOR ALL USING (auth.email() = 'your-admin@email.com');
  
CREATE POLICY admin_all_subcategories ON subcategories 
  FOR ALL USING (auth.email() = 'your-admin@email.com');
  
CREATE POLICY admin_all_sections ON sections 
  FOR ALL USING (auth.email() = 'your-admin@email.com');
  
CREATE POLICY admin_all_media ON media 
  FOR ALL USING (auth.email() = 'your-admin@email.com');
  
CREATE POLICY admin_all_audit ON audit_logs 
  FOR ALL USING (auth.email() = 'your-admin@email.com');
  
CREATE POLICY admin_all_product_sections ON product_sections 
  FOR ALL USING (auth.email() = 'your-admin@email.com');

-- Re-enable RLS if using Option 2
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sections ENABLE ROW LEVEL SECURITY;

SELECT 'Admin access restored!' as status;
