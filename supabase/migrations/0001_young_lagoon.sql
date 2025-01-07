/*
  # Trip Monitoring System Schema

  1. New Tables
    - `trips`
      - Core trip information including driver details, route, and vehicle info
    - `trip_updates`
      - Status updates and monitoring logs for each trip
    - `trip_attachments`
      - Images and files attached to trip updates

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create enum for trip status
CREATE TYPE trip_status AS ENUM (
  'SCHEDULED',
  'IN_TRANSIT',
  'DELAYED',
  'DELIVERED',
  'CANCELLED'
);

-- Create trips table
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  driver_name TEXT NOT NULL,
  driver_phone TEXT,
  origin TEXT,
  destination TEXT NOT NULL,
  project TEXT NOT NULL,
  plate_number TEXT NOT NULL,
  property_type TEXT NOT NULL,
  shift TEXT NOT NULL,
  gps_provider TEXT,
  current_status trip_status DEFAULT 'SCHEDULED',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create trip updates table
CREATE TABLE trip_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  status trip_status NOT NULL,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create trip attachments table
CREATE TABLE trip_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_update_id UUID REFERENCES trip_updates(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all users to read trips"
  ON trips FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all users to insert trips"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow all users to update trips"
  ON trips FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow all users to read updates"
  ON trip_updates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all users to insert updates"
  ON trip_updates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow all users to read attachments"
  ON trip_attachments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all users to insert attachments"
  ON trip_attachments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_trips_delivery_date ON trips(delivery_date);
CREATE INDEX idx_trips_current_status ON trips(current_status);
CREATE INDEX idx_trip_updates_trip_id ON trip_updates(trip_id);