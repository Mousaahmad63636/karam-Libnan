-- Add Arabic versions of ingredients, variants, and tags fields
-- Run this in Supabase SQL Editor

-- Add Arabic columns for bilingual product support
ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients_ar jsonb DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants_ar jsonb DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags_ar jsonb DEFAULT '[]'::jsonb;

-- Update existing products to have empty arrays for Arabic fields if null
UPDATE products SET 
  ingredients_ar = '[]'::jsonb,
  variants_ar = '[]'::jsonb,
  tags_ar = '[]'::jsonb
WHERE ingredients_ar IS NULL OR variants_ar IS NULL OR tags_ar IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN products.ingredients_ar IS 'Product ingredients in Arabic - array of strings';
COMMENT ON COLUMN products.variants_ar IS 'Product variants in Arabic like sizes, volumes etc.';
COMMENT ON COLUMN products.tags_ar IS 'Special tags in Arabic like "عضوي", "طازج", "مميز" etc.';
