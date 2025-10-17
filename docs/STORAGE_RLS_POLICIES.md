# Supabase Storage RLS Policies for Admin Panel

## Issue
Admin panel image uploads fail with error:
```
StorageApiError: new row violates row-level security policy
```

## Root Cause
The 'images' storage bucket has RLS enabled but lacks policies allowing anonymous uploads.
Admin panel uses anon key without authentication.

## Required SQL Policies

Execute these policies in Supabase Dashboard → Storage → images bucket → Policies:

### 1. Allow Anonymous Upload
```sql
CREATE POLICY "Allow anon upload to images"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'images');
```

### 2. Allow Public Read Access
```sql
CREATE POLICY "Allow public read from images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'images');
```

### 3. Allow Update/Delete (Optional - for admin operations)
```sql
CREATE POLICY "Allow anon update images"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'images');

CREATE POLICY "Allow anon delete images"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'images');
```

## Implementation Steps

1. Open Supabase Dashboard: https://xbznaxiummganlidnmdd.supabase.co
2. Navigate to: Storage → Policies
3. Select 'images' bucket
4. Click "New Policy"
5. Execute each SQL policy above
6. Test upload in admin panel

## Security Note
These policies allow anonymous uploads. For production:
- Implement authentication in admin panel
- Replace `TO anon` with `TO authenticated`
- Add user_id validation in WITH CHECK clause
