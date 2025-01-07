/*
  # Add INICIO_RUTA to update_category enum

  1. Changes
    - Add 'INICIO_RUTA' as a new value to the update_category enum type
*/

-- Add new enum value safely
ALTER TYPE update_category ADD VALUE IF NOT EXISTS 'INICIO_RUTA';