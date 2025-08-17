-- Fix product_sections RLS policy
-- Run in Supabase SQL Editor

-- Drop existing JWT role-based policy
DROP POLICY IF EXISTS admin_all_product_sections ON product_sections;

-- Create email-based admin policy (replace with your admin email)
CREATE POLICY admin_all_product_sections ON product_sections 
  FOR ALL USING (auth.email() = 'your-admin@email.com');

-- Alternative: Temporarily disable RLS for immediate access
-- ALTER TABLE product_sections DISABLE ROW LEVEL SECURITY;

SELECT 'product_sections RLS policy updated!' as status;
