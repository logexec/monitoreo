/*
  # Add Trip Metadata and Personnel Tables

  1. New Tables
    - `trip_personnel`
      - Links personnel to trips with role assignments
      - Tracks assignment dates and status
    - `trip_costs`
      - Stores financial data for each trip
      - Includes fuel costs, tolls, personnel costs, etc.
    - `trip_metadata`
      - Additional trip information
      - Custom fields that don't fit in main trips table

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Create trip_personnel table
CREATE TABLE trip_personnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  personnel_id TEXT NOT NULL,
  role TEXT NOT NULL,
  assignment_date TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create trip_costs table
CREATE TABLE trip_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  fuel_cost DECIMAL(10,2),
  toll_cost DECIMAL(10,2),
  personnel_cost DECIMAL(10,2),
  other_costs DECIMAL(10,2),
  total_cost DECIMAL(10,2) GENERATED ALWAYS AS (
    COALESCE(fuel_cost, 0) + 
    COALESCE(toll_cost, 0) + 
    COALESCE(personnel_cost, 0) + 
    COALESCE(other_costs, 0)
  ) STORED,
  revenue DECIMAL(10,2),
  margin DECIMAL(10,2) GENERATED ALWAYS AS (
    COALESCE(revenue, 0) - (
      COALESCE(fuel_cost, 0) + 
      COALESCE(toll_cost, 0) + 
      COALESCE(personnel_cost, 0) + 
      COALESCE(other_costs, 0)
    )
  ) STORED,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create trip_metadata table
CREATE TABLE trip_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  estimated_duration INTERVAL,
  actual_duration INTERVAL,
  distance_km DECIMAL(10,2),
  cargo_type TEXT,
  cargo_weight DECIMAL(10,2),
  special_requirements TEXT,
  customer_reference TEXT,
  internal_notes TEXT,
  external_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE trip_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read trip_personnel"
  ON trip_personnel FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert trip_personnel"
  ON trip_personnel FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update trip_personnel"
  ON trip_personnel FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read trip_costs"
  ON trip_costs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert trip_costs"
  ON trip_costs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update trip_costs"
  ON trip_costs FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read trip_metadata"
  ON trip_metadata FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert trip_metadata"
  ON trip_metadata FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update trip_metadata"
  ON trip_metadata FOR UPDATE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX idx_trip_personnel_trip_id ON trip_personnel(trip_id);
CREATE INDEX idx_trip_costs_trip_id ON trip_costs(trip_id);
CREATE INDEX idx_trip_metadata_trip_id ON trip_metadata(trip_id);