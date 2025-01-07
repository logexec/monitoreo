/*
  # Add VIAJE_CARGADO to update_category enum

  1. Changes
    - Add new value 'VIAJE_CARGADO' to update_category enum
*/

-- Add new enum value safely
ALTER TYPE update_category ADD VALUE IF NOT EXISTS 'VIAJE_CARGADO';