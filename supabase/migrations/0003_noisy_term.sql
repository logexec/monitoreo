/*
  # Update storage bucket configuration

  1. Changes
    - Ensure storage bucket exists and is public
    - Update existing policies or create if missing
*/

-- Create or update storage bucket for trip update images
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-updates', 'trip-updates', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public to read images" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN
END $$;

-- Create new policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow authenticated users to upload images'
    ) THEN
        CREATE POLICY "Allow authenticated users to upload images"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'trip-updates');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow public to read images'
    ) THEN
        CREATE POLICY "Allow public to read images"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'trip-updates');
    END IF;
END $$;