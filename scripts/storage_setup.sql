-- Supabase Storage Setup for Avatars (ULTRA-SAFE / PERMISSIVE VERSION)
-- Run this in the Supabase SQL Editor

-- NOTE: 
-- 1. Go to Supabase Dashboard -> Storage.
-- 2. Delete the 'avatars' bucket if it exists.
-- 3. Create a NEW bucket named 'avatars'.
-- 4. Set 'Public' to ON during creation.
-- 5. Run THIS script in the SQL Editor.

-- 1. First, delete any lingering policies to avoid conflicts
-- (If these fail, it's fine, just continue)
DO $$ 
BEGIN 
    DELETE FROM storage.policies WHERE bucket_id = 'avatars';
EXCEPTION WHEN OTHERS THEN 
    NULL;
END $$;

-- 2. Allow ALL operations for EVERYONE (Public & Authenticated)
-- This is highly permissive to ensure it works.
CREATE POLICY "Allow All for Everyone" 
ON storage.objects FOR ALL 
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Optional: If you still get errors, try running this to bypass RLS for this bucket specifically (some Supabase versions):
-- UPDATE storage.buckets SET public = true WHERE id = 'avatars';
