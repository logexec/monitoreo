/*
  # Add Update Categories

  1. Changes
    - Create enum type for update categories
    - Add category column to trip_updates table
    - Remove status column from trip_updates (since we track status in trips table)
    - Add image_url column for attachments
  
  2. Security
    - Maintain existing RLS policies
*/

-- Create enum for update categories
CREATE TYPE update_category AS ENUM (
  'SEGUIMIENTO',
  'ACCIDENTE',
  'AVERIA',
  'ROBO_ASALTO',
  'PERDIDA_CONTACTO'
);

-- Update trip_updates table
ALTER TABLE trip_updates 
  DROP COLUMN status,
  ADD COLUMN category update_category NOT NULL,
  ADD COLUMN image_url TEXT;

-- Drop trip_attachments table since we're storing image_url directly in updates
DROP TABLE IF EXISTS trip_attachments;

-- Create storage bucket for trip update images
INSERT INTO storage.buckets (id, name)
VALUES ('trip-updates', 'trip-updates')
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'trip-updates');

-- Allow authenticated users to read images
CREATE POLICY "Allow authenticated users to read images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'trip-updates');