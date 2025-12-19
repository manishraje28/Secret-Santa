-- =====================================================
-- SECRET SANTA DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- EVENTS TABLE
-- =====================================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'Secret Santa Event',
  admin_token UUID NOT NULL DEFAULT uuid_generate_v4(),
  locked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_events_created_at ON events(created_at DESC);

-- =====================================================
-- PARTICIPANTS TABLE
-- =====================================================
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate names within same event
  UNIQUE(event_id, name)
);

-- Index for faster lookups
CREATE INDEX idx_participants_event_id ON participants(event_id);

-- =====================================================
-- ASSIGNMENTS TABLE
-- =====================================================
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  giver_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Each giver can only have one assignment per event
  UNIQUE(event_id, giver_id),
  -- Each receiver can only be assigned once per event
  UNIQUE(event_id, receiver_id),
  -- Prevent self-assignment
  CHECK (giver_id != receiver_id)
);

-- Index for faster lookups
CREATE INDEX idx_assignments_event_id ON assignments(event_id);
CREATE INDEX idx_assignments_giver_id ON assignments(giver_id);

-- =====================================================
-- WISHLISTS TABLE
-- =====================================================
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_wishlists_participant_id ON wishlists(participant_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Events: Anyone can read, but we control writes via server
CREATE POLICY "Events are viewable by everyone" 
  ON events FOR SELECT 
  USING (true);

CREATE POLICY "Events can be inserted by anyone" 
  ON events FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Events can be updated by anyone" 
  ON events FOR UPDATE 
  USING (true);

-- Participants: Viewable by everyone in the event
CREATE POLICY "Participants are viewable by everyone" 
  ON participants FOR SELECT 
  USING (true);

CREATE POLICY "Participants can be inserted" 
  ON participants FOR INSERT 
  WITH CHECK (true);

-- Assignments: Only viewable (we'll filter in application code)
CREATE POLICY "Assignments are viewable" 
  ON assignments FOR SELECT 
  USING (true);

CREATE POLICY "Assignments can be inserted" 
  ON assignments FOR INSERT 
  WITH CHECK (true);

-- Wishlists: Viewable and insertable
CREATE POLICY "Wishlists are viewable" 
  ON wishlists FOR SELECT 
  USING (true);

CREATE POLICY "Wishlists can be inserted" 
  ON wishlists FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Wishlists can be deleted" 
  ON wishlists FOR DELETE 
  USING (true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for events table
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
