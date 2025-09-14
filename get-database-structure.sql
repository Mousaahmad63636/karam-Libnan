-- HOW TO GET COMPLETE DATABASE STRUCTURE FROM SUPABASE
-- Run these queries in Supabase SQL Editor to see your full database structure

-- ===== 1. LIST ALL TABLES =====
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ===== 2. GET TABLE STRUCTURES =====
-- Run this for each table you find above
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'your_table_name_here'  -- Replace with actual table name
ORDER BY ordinal_position;

-- ===== 3. GET ALL FOREIGN KEYS =====
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';

-- ===== 4. GET ALL INDEXES =====
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ===== 5. CHECK ROW LEVEL SECURITY POLICIES =====
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- ===== 6. GET COMPLETE TABLE DEFINITION =====
-- This gives you a complete CREATE TABLE statement
SELECT 
  'CREATE TABLE ' || table_name || ' (' ||
  string_agg(
    column_name || ' ' || 
    data_type ||
    CASE 
      WHEN character_maximum_length IS NOT NULL 
      THEN '(' || character_maximum_length || ')'
      ELSE ''
    END ||
    CASE 
      WHEN is_nullable = 'NO' THEN ' NOT NULL'
      ELSE ''
    END ||
    CASE 
      WHEN column_default IS NOT NULL 
      THEN ' DEFAULT ' || column_default
      ELSE ''
    END,
    ', '
  ) || ');' AS create_statement
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products'  -- Change this to each table
GROUP BY table_name;

-- ===== 7. COUNT RECORDS IN ALL TABLES =====
-- Use this to verify your data exists
SELECT 'main_categories' as table_name, count(*) as record_count FROM main_categories
UNION ALL
SELECT 'subcategories' as table_name, count(*) as record_count FROM subcategories  
UNION ALL
SELECT 'products' as table_name, count(*) as record_count FROM products
UNION ALL
SELECT 'sections' as table_name, count(*) as record_count FROM sections
UNION ALL
SELECT 'media' as table_name, count(*) as record_count FROM media;

-- ===== QUICK DIAGNOSIS QUERIES =====

-- Check if main_categories table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'main_categories'
);

-- Check if you have any data
SELECT 
  (SELECT count(*) FROM products) as products_count,
  (SELECT count(*) FROM subcategories) as subcategories_count;

-- Check RLS status  
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('products', 'subcategories', 'main_categories', 'sections');
