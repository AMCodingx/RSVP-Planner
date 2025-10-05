-- Create couples table
CREATE TABLE couples (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index to ensure one couple per auth user
CREATE UNIQUE INDEX idx_couples_auth_user_id ON couples(auth_user_id);

-- Create index for performance
CREATE INDEX idx_couples_created_at ON couples(created_at);

-- Add check constraint to limit maximum couples per wedding (max 2)
-- This will be enforced at the application level as well

-- Modify guests table: change invited_by to UUID and add FK to couples
ALTER TABLE guests 
ALTER COLUMN invited_by TYPE UUID USING NULL;

ALTER TABLE guests 
ADD CONSTRAINT fk_guests_invited_by_couples 
FOREIGN KEY (invited_by) REFERENCES couples(id) ON DELETE SET NULL;

-- Create index for invited_by foreign key
CREATE INDEX idx_guests_invited_by ON guests(invited_by);

-- Note: invited_by now references couples.id instead of being an enum
-- Migration script will handle the data conversion