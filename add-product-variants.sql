-- Add variants field to products table
-- Run this in Supabase SQL Editor

-- Add variants column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '[]'::jsonb;

-- Update existing products to have empty variants array if null
UPDATE products SET variants = '[]'::jsonb WHERE variants IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN products.variants IS 'Product variants like "large", "small", "500ml", "1L" etc.';
