-- Add special tags field to products table
-- Run this in Supabase SQL Editor

-- Add tags column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb;

-- Update the constraint check if it exists (to maintain consistency)
-- This is optional but good practice
COMMENT ON COLUMN products.tags IS 'Special tags like "organic", "fresh", "premium" etc.';

-- Update existing products to have empty tags array if null
UPDATE products SET tags = '[]'::jsonb WHERE tags IS NULL;
