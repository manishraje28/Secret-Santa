-- =====================================================
-- MIGRATION: Add short_code to existing events table
-- Run this if you already have an events table without short_code
-- =====================================================

-- First, create the function to generate short codes
CREATE OR REPLACE FUNCTION generate_short_code(length INT DEFAULT 8)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add short_code column to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS short_code TEXT UNIQUE;

-- Generate short codes for existing events that don't have one
UPDATE events 
SET short_code = generate_short_code(8) 
WHERE short_code IS NULL;

-- Make short_code NOT NULL and add default
ALTER TABLE events 
ALTER COLUMN short_code SET NOT NULL,
ALTER COLUMN short_code SET DEFAULT generate_short_code(8);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_events_short_code ON events(short_code);
