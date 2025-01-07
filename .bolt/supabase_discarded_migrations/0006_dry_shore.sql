/*
  # Update Trip ID System

  1. Changes
    - Add sequence for auto-generating trip IDs
    - Add new system_trip_id column
    - Preserve original ID as external_trip_id
    - Update triggers for auto-generating IDs

  2. Data Migration
    - Safely handle column renaming
    - Add new system_trip_id with sequential numbers
*/

-- Create sequence for trip IDs starting at 1000
CREATE SEQUENCE IF NOT EXISTS trip_id_seq START WITH 1000;

-- Safely handle column renaming and addition
DO $$ 
BEGIN
    -- Check if the old column exists and new one doesn't
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'trips' 
        AND column_name = 'trip_id'
    ) AND NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'trips' 
        AND column_name = 'external_trip_id'
    ) THEN
        -- Rename the column
        ALTER TABLE trips RENAME COLUMN trip_id TO external_trip_id;
    END IF;

    -- Add system_trip_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'trips' 
        AND column_name = 'system_trip_id'
    ) THEN
        ALTER TABLE trips ADD COLUMN system_trip_id TEXT;
    END IF;
END $$;

-- Create function to generate formatted trip ID
CREATE OR REPLACE FUNCTION generate_trip_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.system_trip_id := LPAD(nextval('trip_id_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate trip ID
DROP TRIGGER IF EXISTS set_trip_id ON trips;
CREATE TRIGGER set_trip_id
  BEFORE INSERT ON trips
  FOR EACH ROW
  EXECUTE FUNCTION generate_trip_id();

-- Update existing records with sequential IDs
WITH numbered_trips AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) + 999 as row_num
  FROM trips
  WHERE system_trip_id IS NULL
)
UPDATE trips t
SET system_trip_id = LPAD(nt.row_num::TEXT, 4, '0')
FROM numbered_trips nt
WHERE t.id = nt.id;

-- Set system_trip_id as NOT NULL after updating existing records
ALTER TABLE trips
  ALTER COLUMN system_trip_id SET NOT NULL;