-- Check what hero section content exists in database
-- Run this in Supabase SQL Editor to see current content

SELECT key, title_en, title_ar, body_en, body_ar, image_url 
FROM sections 
WHERE key = 'hero';