-- Add sort_order column to products table
-- Products with lower sort_order values appear first
-- Default value 999 for existing/new products without explicit ordering

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 999;

-- Create index for better performance on sorting
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON public.products(sort_order);

-- Optional: Update some example products with custom sort order
-- UPDATE public.products SET sort_order = 1 WHERE id = 123;
-- UPDATE public.products SET sort_order = 2 WHERE id = 456;

COMMENT ON COLUMN public.products.sort_order IS 'Display order for products. Lower numbers appear first. Default: 999';
